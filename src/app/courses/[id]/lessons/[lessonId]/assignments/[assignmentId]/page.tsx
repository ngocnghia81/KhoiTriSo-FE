'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { safeJsonParse, isSuccessfulResponse, extractResult, extractMessage } from '@/utils/apiHelpers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeftIcon,
  ClockIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { Loader2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface Assignment {
  id: number;
  lessonId: number;
  title: string;
  description: string;
  maxScore: number;
  timeLimit?: number;
  maxAttempts: number;
  dueDate?: string;
  isPublished: boolean;
  passingScore?: number;
  userAttempts?: Array<{
    id: number;
    score?: number;
    isCompleted: boolean;
    startedAt: string;
  }>;
}

interface Question {
  id: number;
  questionContent: string;
  questionImage?: string;
  defaultPoints: number;
  questionType: number; // 0: Trắc nghiệm, 1: Đúng/Sai, 2: Tự luận điền đáp án, 3: GroupTitle
  options: Array<{
    id: number;
    optionText: string;
  }>;
}

interface AssignmentResult {
  id: number;
  score: number;
  maxScore: number;
  isCompleted: boolean;
  submittedAt: string;
  attempts: Array<{
    id: number;
    score: number;
    submittedAt: string;
    answers: Array<{
      questionId: number;
      selectedOptionId: number;
      isCorrect: boolean;
      points: number;
    }>;
  }>;
}

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const courseId = params?.id ? parseInt(params.id as string) : null;
  const lessonId = params?.lessonId ? parseInt(params.lessonId as string) : null;
  const assignmentId = params?.assignmentId ? parseInt(params.assignmentId as string) : null;

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [results, setResults] = useState<AssignmentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  // answers: { [questionId]: number | string | { [optionId]: boolean } }
  // - number: selectedOptionId cho type 0 (trắc nghiệm)
  // - string: answerText cho type 2 (tự luận)
  // - { [optionId]: boolean }: cho type 1 (đúng/sai), mỗi option có true/false
  const [answers, setAnswers] = useState<{ [questionId: number]: number | string | { [optionId: number]: boolean } }>({});
  const [showResults, setShowResults] = useState(false);
  const [currentAttempt, setCurrentAttempt] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [activeQuestionId, setActiveQuestionId] = useState<number | null>(null);

  // Load MathJax for MathML rendering
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const w = window as any;
    if (!w.MathJax) {
      w.MathJax = {
        loader: { load: ['input/mml', 'output/chtml'] },
        options: {
          renderActions: { addMenu: [0, '', ''] },
          skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
          ignoreHtmlClass: 'tex2jax_ignore',
          processHtmlClass: 'tex2jax_process',
        },
        chtml: { scale: 1, displayAlign: 'center' },
        startup: {
          ready: () => {
            if (w.MathJax && w.MathJax.startup) {
              w.MathJax.startup.defaultReady && w.MathJax.startup.defaultReady();
            }
          },
        },
      };
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/mml-chtml.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  // Typeset whenever content changes
  useEffect(() => {
    const w = window as any;
    if (w && w.MathJax && typeof w.MathJax.typesetPromise === 'function') {
      w.MathJax.typesetPromise?.();
    }
  }, [assignment, questions, answers, showResults, currentAttempt]);

  // Function to render content with proper HTML/MathML formatting
  const renderContent = (content: string) => {
    if (!content) return '';
    
    // Tạo một div tạm để parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    
    // Xử lý LaTeX text formatting commands
    doc.body.innerHTML = doc.body.innerHTML
      .replace(/\\textbf\{([^}]+)\}/g, '<strong>$1</strong>')
      .replace(/\\textit\{([^}]+)\}/g, '<em>$1</em>')
      .replace(/\\texttt\{([^}]+)\}/g, '<code>$1</code>')
      .replace(/\\underline\{([^}]+)\}/g, '<u>$1</u>');
    
    // Đảm bảo MathML có namespace đúng
    doc.querySelectorAll('math').forEach(math => {
      if (!math.getAttribute('xmlns')) {
        math.setAttribute('xmlns', 'http://www.w3.org/1998/Math/MathML');
      }
    });
    
    return doc.body.innerHTML;
  };

  useEffect(() => {
    if (!assignmentId) return;
    fetchAssignment();
    fetchQuestions();
    fetchResults(false); // Không tự động show results khi load trang
  }, [assignmentId]);

  useEffect(() => {
    if (timerActive && timeRemaining !== null && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            setTimerActive(false);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timerActive, timeRemaining, assignmentId]);

  const fetchAssignment = async () => {
    if (!assignmentId) return;
    try {
      const response = await authenticatedFetch(`/api/assignments/${assignmentId}`);
      const result = await safeJsonParse(response);

      if (isSuccessfulResponse(result)) {
        const data = extractResult(result);
        setAssignment({
          id: data.Id || data.id,
          lessonId: data.LessonId || data.lessonId,
          title: data.Title || data.title,
          description: data.Description || data.description,
          maxScore: data.MaxScore || data.maxScore || 0,
          timeLimit: data.TimeLimit || data.timeLimit,
          maxAttempts: data.MaxAttempts || data.maxAttempts || 1,
          dueDate: data.DueDate || data.dueDate,
          isPublished: data.IsPublished ?? data.isPublished ?? false,
          passingScore: data.PassingScore || data.passingScore,
          userAttempts: (data.UserAttempts || data.userAttempts || []).map((ua: any) => ({
            id: ua.Id || ua.id,
            score: ua.Score || ua.score,
            isCompleted: ua.IsCompleted ?? ua.isCompleted ?? false,
            startedAt: ua.StartedAt || ua.startedAt,
          })),
        });
      } else {
        toast.error(extractMessage(result) || 'Không thể tải bài tập');
      }
    } catch (err) {
      console.error('Error fetching assignment:', err);
      toast.error('Có lỗi xảy ra khi tải bài tập');
    }
  };

  const fetchQuestions = async () => {
    if (!assignmentId) return;
    try {
      const response = await authenticatedFetch(`/api/assignments/${assignmentId}/questions`);
      const result = await safeJsonParse(response);

      if (isSuccessfulResponse(result)) {
        const data = extractResult(result);
        let questionsArray = [];
        
        if (Array.isArray(data)) {
          questionsArray = data;
        } else if (data?.Items || data?.items) {
          questionsArray = data.Items || data.items;
        }

        const transformedQuestions = questionsArray.map((q: any) => ({
          id: q.Id || q.id,
          questionContent: q.QuestionContent || q.questionContent,
          questionImage: q.QuestionImage || q.questionImage,
          defaultPoints: q.DefaultPoints || q.defaultPoints || 0,
          questionType: q.QuestionType ?? q.questionType ?? 0,
          options: (q.Options || q.options || []).map((opt: any) => ({
            id: opt.Id || opt.id,
            optionText: opt.OptionText || opt.optionText,
          })),
        }));

        setQuestions(transformedQuestions);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
    }
  };

  const fetchResults = async (autoShow = false) => {
    if (!assignmentId) return;
    try {
      const response = await authenticatedFetch(`/api/assignments/${assignmentId}/results`);
      const result = await safeJsonParse(response);

      if (isSuccessfulResponse(result)) {
        const data = extractResult(result);
        if (data) {
          setResults({
            id: data.Id || data.id,
            score: data.Score || data.score || 0,
            maxScore: data.MaxScore || data.maxScore || 0,
            isCompleted: data.IsCompleted ?? data.isCompleted ?? false,
            submittedAt: data.LastAttemptAt || data.lastAttemptAt || data.SubmittedAt || data.submittedAt || '',
            attempts: (data.Attempts || data.attempts || []).map((a: any) => ({
              id: a.Id || a.id,
              score: a.Score || a.score || 0,
              submittedAt: a.CompletedAt || a.completedAt || a.StartedAt || a.startedAt || a.SubmittedAt || a.submittedAt || '',
              answers: (a.Answers || a.answers || []).map((ans: any) => ({
                questionId: ans.QuestionId || ans.questionId,
                selectedOptionId: ans.OptionId || ans.SelectedOptionId || ans.selectedOptionId || ans.optionId,
                optionId: ans.OptionId || ans.optionId, // Giữ cả optionId để tương thích
                selectedOptionIds: ans.SelectedOptionIds || ans.selectedOptionIds,
                answerText: ans.AnswerText || ans.answerText || '',
                isCorrect: ans.IsCorrect ?? ans.isCorrect ?? false,
                points: ans.PointsEarned || ans.PointsEarned || ans.Points || ans.points || 0,
              })),
            })),
          });
          // Set currentAttempt nếu có attempts
          if (data.Attempts && data.Attempts.length > 0) {
            // Nếu chưa có currentAttempt hoặc currentAttempt không trong danh sách, set attempt đầu tiên
            if (!currentAttempt || !data.Attempts.find((a: any) => (a.Id || a.id) === currentAttempt.id)) {
              setCurrentAttempt(data.Attempts[0]);
            }
            // Chỉ tự động show results nếu autoShow = true
            if (autoShow) {
              setShowResults(true);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error fetching results:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: number, optionId: number, questionType: number) => {
    if (questionType === 1) {
      // Đúng/Sai: mỗi option có thể chọn Đúng hoặc Sai
      // Không xử lý ở đây, sẽ xử lý riêng trong handleTrueFalseChange
      return;
    }
    // Chọn 1 đáp án (trắc nghiệm - type 0)
    // Kiểm tra optionId phải là số hợp lệ (bao gồm cả 0)
    if (isNaN(optionId)) {
      console.warn('Invalid optionId:', optionId);
      return;
    }
    setAnswers(prev => {
      console.log('handleAnswerChange - Before update:', { questionId, optionId, prevAnswers: prev, currentValue: prev[questionId] });
      const newAnswers = { ...prev, [questionId]: optionId };
      console.log('handleAnswerChange - After update:', { questionId, optionId, newAnswers, newValue: newAnswers[questionId] });
      // Force re-render bằng cách tạo object mới
      return { ...newAnswers };
    });
  };

  const handleTrueFalseChange = (questionId: number, optionId: number, isTrue: boolean) => {
    // Đúng/Sai: lưu trạng thái cho từng option
    setAnswers(prev => {
      const current = prev[questionId];
      const optionAnswers = (typeof current === 'object' && current !== null && !Array.isArray(current)) 
        ? current as { [optionId: number]: boolean }
        : {};
      return {
        ...prev,
        [questionId]: {
          ...optionAnswers,
          [optionId]: isTrue,
        },
      };
    });
  };

  const handleTextAnswerChange = (questionId: number, text: string) => {
    // Tự luận điền đáp án
    setAnswers(prev => ({ ...prev, [questionId]: text }));
  };

  const formatAnswersForSubmission = () => {
    console.log('formatAnswersForSubmission - answers:', answers);
    return Object.entries(answers).flatMap(([questionId, optionIdOrTextOrObject]) => {
      const qId = parseInt(questionId);
      const question = questions.find(q => q.id === qId);
      if (!question || question.questionType === 3) {
        console.log('Bỏ qua question:', { questionId: qId, question, questionType: question?.questionType });
        return []; // Bỏ qua GroupTitle
      }
      
      console.log('Processing question:', { questionId: qId, questionType: question.questionType, answer: optionIdOrTextOrObject });
      
      if (question.questionType === 2) {
        // Tự luận điền đáp án
        const answerText = typeof optionIdOrTextOrObject === 'string' ? optionIdOrTextOrObject : '';
        if (!answerText.trim()) return [];
        return [{
          QuestionId: qId,
          AnswerText: answerText,
        }];
      } else if (question.questionType === 1) {
        // Đúng/Sai: mỗi option là một answer riêng
        if (typeof optionIdOrTextOrObject === 'object' && optionIdOrTextOrObject !== null) {
          const optionAnswers = optionIdOrTextOrObject as { [optionId: number]: boolean };
          return Object.entries(optionAnswers).map(([optId, isTrue]) => ({
            QuestionId: qId,
            OptionId: parseInt(optId),
            AnswerText: isTrue ? 'true' : 'false',
          }));
        }
        return [];
      }else if (question.questionType === 0) {
        // Trắc nghiệm: chọn 1 đáp án - FIX LỖI Ở ĐÂY
        console.log('Trắc nghiệm - raw answer:', optionIdOrTextOrObject);
        
        let optionId: number | undefined;
        
        // Xử lý nhiều kiểu dữ liệu có thể có
        if (typeof optionIdOrTextOrObject === 'number') {
          optionId = optionIdOrTextOrObject;
        } else if (typeof optionIdOrTextOrObject === 'string') {
          // Nếu là string, thử parse thành number
          const parsed = parseInt(optionIdOrTextOrObject);
          if (!isNaN(parsed)) optionId = parsed;
        }
        
        console.log('Trắc nghiệm - processed optionId:', optionId);
        
        // Kiểm tra optionId có hợp lệ và tồn tại trong danh sách options không
        if (optionId !== undefined && !isNaN(optionId) && question.options.some(opt => opt.id === optionId)) {
          console.log('Trắc nghiệm - valid answer:', { QuestionId: qId, OptionId: optionId });
          return [{
            QuestionId: qId,
            OptionId: optionId,
            AnswerText: '',
          }];
        } else {
          console.warn('Trắc nghiệm - invalid optionId:', { 
            questionId: qId, 
            optionId, 
            availableOptions: question.options.map(opt => opt.id),
            rawAnswer: optionIdOrTextOrObject 
          });
          return [];
        }
      } else {
        console.warn('Unknown question type:', { questionId: qId, questionType: question.questionType });
        return [];
      }
    });
  };

  const handleAutoSubmit = async () => {
    if (submitting) return;
    try {
      setSubmitting(true);
      const formattedAnswers = formatAnswersForSubmission();
      
      const response = await authenticatedFetch(`/api/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Answers: formattedAnswers,
        }),
      });

      const result = await safeJsonParse(response);
      if (isSuccessfulResponse(result)) {
        toast.info('Hết thời gian! Bài làm đã được tự động nộp');
        setTimerActive(false);
        await fetchResults(true); // Tự động show results sau khi nộp
      } else {
        toast.error(extractMessage(result) || 'Không thể nộp bài');
      }
    } catch (err) {
      console.error('Error auto-submitting assignment:', err);
      toast.error('Có lỗi xảy ra khi nộp bài');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (isAuto = false) => {
    console.log('handleSubmit called', { assignment, assignmentId, answers, isAuto });
    if (!assignment || !assignmentId) {
      console.log('Early return: missing assignment or assignmentId');
      return;
    }
    
    // Lọc bỏ GroupTitle và kiểm tra có câu trả lời không
    const validAnswers = Object.entries(answers).filter(([questionId, answer]) => {
      const question = questions.find(q => q.id === parseInt(questionId));
      if (!question || question.questionType === 3) return false;
      
      // Kiểm tra có đáp án hợp lệ
      if (question.questionType === 2) {
        return typeof answer === 'string' && answer.trim().length > 0;
      } else if (question.questionType === 1) {
        return typeof answer === 'object' && answer !== null && !Array.isArray(answer) && Object.keys(answer).length > 0;
      } else {
        return typeof answer === 'number';
      }
    });

    if (!isAuto && validAnswers.length === 0) {
      console.log('Early return: no valid answers');
      toast.error('Vui lòng chọn ít nhất một đáp án');
      return;
    }

    console.log('Submitting assignment with answers:', validAnswers);
    console.log('All answers state:', answers);
    console.log('Questions:', questions.map(q => ({ id: q.id, type: q.questionType })));
    
    const formattedAnswers = formatAnswersForSubmission();
    
    console.log('Final formatted answers to send:', formattedAnswers);
    
    if (formattedAnswers.length === 0 && !isAuto) {
      toast.error('Vui lòng chọn ít nhất một đáp án');
      return;
    }
    
    try {
      setSubmitting(true);
      const response = await authenticatedFetch(`/api/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Answers: formattedAnswers,
        }),
      });

      const result = await safeJsonParse(response);
      if (isSuccessfulResponse(result)) {
        if (isAuto) {
          toast.info('Hết thời gian! Bài làm đã được tự động nộp');
        } else {
          toast.success('Đã nộp bài thành công');
        }
        setTimerActive(false);
        await fetchResults(true); // Tự động show results sau khi nộp
      } else {
        toast.error(extractMessage(result) || 'Không thể nộp bài');
      }
    } catch (err) {
      console.error('Error submitting assignment:', err);
      toast.error('Có lỗi xảy ra khi nộp bài');
    } finally {
      setSubmitting(false);
    }
  };

  const startTimer = () => {
    if (!assignment?.timeLimit) {
      setHasStarted(true);
      return;
    }
    setTimeRemaining(assignment.timeLimit * 60);
    setTimerActive(true);
    setHasStarted(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: vi });
    } catch {
      return dateString;
    }
  };

  const stripHtml = (html: string | undefined | null): string => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').trim();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Đang tải bài tập...</p>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy bài tập</h2>
            <p className="text-gray-600 mb-6">Bài tập không tồn tại hoặc bạn không có quyền truy cập</p>
            <Button asChild>
              <Link href={`/courses/${courseId}/lessons/${lessonId}`}>Quay lại bài học</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const attemptCount = assignment.userAttempts?.length || 0;
  const canDo = attemptCount < assignment.maxAttempts;
  const isOverdue = assignment.dueDate ? new Date(assignment.dueDate) < new Date() : false;

  const handleRetry = async () => {
    // Reset tất cả state liên quan đến kết quả và bài làm
    setShowResults(false);
    setCurrentAttempt(null);
    setResults(null);
    setAnswers({});
    setHasStarted(false);
    setTimerActive(false);
    setTimeRemaining(null);
    setSubmitting(false);
    // Fetch lại dữ liệu
    await fetchAssignment();
    await fetchQuestions();
    await fetchResults(false); // Không tự động show results
  };

  // Show results if available
  if (showResults && currentAttempt && results) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              asChild
            >
              <Link href={`/courses/${courseId}/lessons/${lessonId}`}>
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Quay lại bài học
              </Link>
            </Button>
            {canDo && (
              <Button
                onClick={handleRetry}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Làm lại
              </Button>
            )}
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl mb-2">{assignment.title}</CardTitle>
              {assignment.description && (
                <p className="text-gray-600 mb-4">{stripHtml(assignment.description)}</p>
              )}
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Điểm số</div>
                  <div className={`text-3xl font-bold ${(currentAttempt?.score || 0) >= (assignment.passingScore || 0) ? 'text-green-600' : 'text-red-600'}`}>
                    {currentAttempt?.score || 0}/{results.maxScore}
                  </div>
                </div>
                {assignment.passingScore && (
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Điểm đạt</div>
                    <div className="text-2xl font-bold">{assignment.passingScore}</div>
                  </div>
                )}
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Số lần làm</div>
                  <div className="text-2xl font-bold">{attemptCount}/{assignment.maxAttempts}</div>
                </div>
                {currentAttempt?.submittedAt && (
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Nộp lúc</div>
                    <div className="text-sm">{formatDate(currentAttempt.submittedAt)}</div>
                  </div>
                )}
                {results.attempts && results.attempts.length > 0 && (
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Lần làm hiện tại</div>
                    <div className="text-2xl font-bold">
                      Lần {results.attempts.length - results.attempts.findIndex((a: any) => a.id === (currentAttempt?.id || results.attempts[0]?.id))}
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Kết quả chi tiết</CardTitle>
                {results.attempts && results.attempts.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Label className="text-sm text-gray-600">Chọn lần làm:</Label>
                    <Select
                      value={currentAttempt?.id?.toString() || (results.attempts[0]?.id?.toString() || '')}
                      onValueChange={(value) => {
                        const attempt = results.attempts.find((a: any) => a.id.toString() === value);
                        if (attempt) {
                          setCurrentAttempt(attempt);
                        }
                      }}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Chọn lần làm" />
                      </SelectTrigger>
                      <SelectContent>
                        {results.attempts.map((attempt: any, index: number) => (
                          <SelectItem key={attempt.id} value={attempt.id.toString()}>
                            Lần {results.attempts.length - index} - {attempt.score}/{results.maxScore} điểm
                            {attempt.submittedAt && ` (${formatDate(attempt.submittedAt)})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {(() => {
                  let questionNumber = 0; // Đếm số câu hỏi thực sự (không tính GroupTitle)
                  return questions.map((question, index) => {
                    // Type 3: GroupTitle - chỉ hiển thị tiêu đề
                    if (question.questionType === 3) {
                      return (
                        <div key={question.id} className="border-b pb-6 last:border-0">
                          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
                            <h3 
                              className="text-xl font-bold text-blue-900 prose prose-lg max-w-none"
                              dangerouslySetInnerHTML={{ __html: renderContent(question.questionContent) }}
                            />
                          </div>
                        </div>
                      );
                    }

                    // Đúng/Sai có thể có nhiều answers (mỗi option một answer)
                    questionNumber++; // Tăng số câu hỏi
                    // So sánh questionId (có thể là number hoặc string)
                    const questionAnswers = currentAttempt.answers?.filter((a: any) => {
                      const answerQuestionId = typeof a.questionId === 'string' ? parseInt(a.questionId) : a.questionId;
                      return answerQuestionId === question.id;
                    }) || [];
                    const isTextAnswer = question.questionType === 2;
                    const isTrueFalse = question.questionType === 1;
                    
                    // Debug log
                    if (question.questionType === 0 && questionAnswers.length === 0) {
                      console.log('No answers found for multiple choice question:', {
                        questionId: question.id,
                        questionType: question.questionType,
                        allAnswers: currentAttempt.answers,
                        filteredAnswers: questionAnswers
                      });
                    }
                    
                    // Tính điểm tổng cho câu hỏi (PointsEarned)
                    const totalPointsEarned = questionAnswers.reduce((sum: number, a: any) => {
                      return sum + (a.points || a.PointsEarned || a.pointsEarned || 0);
                    }, 0);
                    const isFullyCorrect = questionAnswers.length > 0 && questionAnswers.every((a: any) => a.isCorrect);
                    
                    // Với type 2 (tự luận), lấy answer đầu tiên
                    const textAnswer = questionAnswers.find((a: any) => a.answerText) || questionAnswers[0];
                    const isCorrect = textAnswer?.isCorrect ?? false;
                    const answerText = textAnswer?.answerText || '';
                    // Lấy selectedOptionId từ answer (có thể là selectedOptionId hoặc optionId)
                    const selectedOptionIds = questionAnswers
                      .map((a: any) => a.selectedOptionId || a.optionId)
                      .filter((id: any) => id !== undefined && id !== null);

                    return (
                      <div key={question.id} className="border-b pb-6 last:border-0">
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-900">
                              Câu {questionNumber}:
                            </span>
                          <Badge variant={isFullyCorrect ? "default" : "destructive"} className={isFullyCorrect ? "bg-green-600" : ""}>
                            {isFullyCorrect ? 'Đúng' : 'Sai'} ({totalPointsEarned.toFixed(2)}/{question.defaultPoints} điểm)
                          </Badge>
                          {question.questionType === 1 && (
                            <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-300">
                              Đúng/Sai
                            </Badge>
                          )}
                          {question.questionType === 2 && (
                            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-300">
                              Tự luận
                            </Badge>
                          )}
                        </div>
                        <div
                          className="text-gray-700 mb-4 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: renderContent(question.questionContent) }}
                        />
                        {question.questionImage && (
                          <div className="mb-4">
                            <img
                              src={question.questionImage}
                              alt="Question image"
                              className="max-w-full h-auto rounded-lg"
                            />
                          </div>
                        )}
                      </div>

                      {/* Hiển thị tất cả options với đánh dấu đáp án đúng và đáp án học viên chọn */}
                      {question.options.length > 0 && question.questionType !== 2 && (
                            <div>
                          <p className="text-sm font-medium mb-2">Các đáp án:</p>
                          <div className="space-y-2">
                            {question.options.map((option, optIndex) => {
                              const isCorrectOption = (option as any).isCorrect ?? false;
                              
                              // Tìm answer tương ứng với option này
                              let userAnswer: any = null;
                              if (question.questionType === 1) {
                                // TrueFalse: tìm answer có OptionId trùng
                                userAnswer = questionAnswers.find((a: any) => 
                                  (a.optionId || a.selectedOptionId) === option.id
                                );
                              } else {
                                // MultipleChoice: chỉ có 1 answer
                                userAnswer = questionAnswers.find((a: any) => 
                                  (a.optionId || a.selectedOptionId) === option.id
                                );
                              }
                              
                              const isSelected = userAnswer != null;
                              
                              // Với TrueFalse: so sánh option.isCorrect với bool từ answerText
                              let userAnswerIsCorrect = false;
                              if (question.questionType === 1 && isSelected) {
                                const answerText = userAnswer?.answerText || '';
                                let userBoolValue: boolean | null = null;
                                if (answerText === 'true' || answerText === 'True') {
                                  userBoolValue = true;
                                } else if (answerText === 'false' || answerText === 'False') {
                                  userBoolValue = false;
                                }
                                // So khớp: option.isCorrect == userBoolValue
                                if (userBoolValue !== null) {
                                  userAnswerIsCorrect = isCorrectOption === userBoolValue;
                              } else {
                                  userAnswerIsCorrect = userAnswer?.isCorrect ?? false;
                                }
                              } else {
                                // MultipleChoice: dùng isCorrect từ answer
                                userAnswerIsCorrect = userAnswer?.isCorrect ?? false;
                              }
                              
                              // Xác định màu sắc và icon
                              let bgColor = 'bg-gray-50';
                              let borderColor = 'border-gray-200';
                              let textColor = 'text-gray-900';
                              let icon = null;
                              
                              if (isSelected && isCorrectOption && userAnswerIsCorrect) {
                                // Học viên chọn đúng
                                bgColor = 'bg-green-50';
                                borderColor = 'border-green-300';
                                textColor = 'text-green-800';
                                icon = <CheckCircleIcon className="h-5 w-5 text-green-600" />;
                              } else if (isSelected && !userAnswerIsCorrect) {
                                // Học viên chọn sai (không khớp với đáp án đúng)
                                bgColor = 'bg-red-50';
                                borderColor = 'border-red-300';
                                textColor = 'text-red-800';
                                icon = <XCircleIcon className="h-5 w-5 text-red-600" />;
                              } else if (isCorrectOption && !isSelected) {
                                // Đáp án đúng nhưng học viên không chọn
                                bgColor = 'bg-yellow-50';
                                borderColor = 'border-yellow-300';
                                textColor = 'text-yellow-800';
                                icon = <CheckCircleIcon className="h-5 w-5 text-yellow-600" />;
                              } else if (isSelected) {
                                // Học viên chọn nhưng chưa biết đúng/sai
                                bgColor = 'bg-blue-50';
                                borderColor = 'border-blue-300';
                                textColor = 'text-blue-800';
                              }
                            
                            return (
                                <div
                                  key={option.id}
                                  className={`p-3 rounded border-2 ${bgColor} ${borderColor} ${textColor}`}
                                >
                                  <div className="flex items-start gap-2">
                                    {icon && <div className="mt-0.5">{icon}</div>}
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium">
                                          {String.fromCharCode(65 + optIndex)}.
                                      </span>
                                        {isCorrectOption && (
                                          <Badge variant="outline" className="bg-green-100 text-green-700 text-xs">
                                            Đáp án đúng
                                          </Badge>
                                        )}
                                        {isSelected && (
                                          <Badge variant="outline" className="bg-blue-100 text-blue-700 text-xs">
                                            Bạn đã chọn
                                          </Badge>
                                        )}
                                    </div>
                                      <div 
                                        className="text-sm prose prose-sm max-w-none" 
                                        dangerouslySetInnerHTML={{ __html: renderContent(option.optionText) }} 
                                      />
                                      {question.questionType === 1 && isSelected && userAnswer?.answerText && (
                                        <div className="mt-1 text-xs text-gray-600">
                                          Giá trị: {userAnswer.answerText}
                                  </div>
                                      )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                            </div>
                          )}

                      {isTextAnswer ? (
                        // Type 2: Hiển thị đáp án text
                        <div className={`p-4 rounded-lg border-2 ${
                          isFullyCorrect
                            ? 'border-green-500 bg-green-50'
                            : 'border-red-500 bg-red-50'
                        }`}>
                          <div className="space-y-2">
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Đáp án của bạn:</Label>
                              <p className={`mt-1 font-medium ${isFullyCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                {answerText || '(Chưa trả lời)'}
                              </p>
                            </div>
                            {question.options.length > 0 && (
                              <div>
                                <Label className="text-sm font-medium text-gray-700">Đáp án đúng:</Label>
                                <div className="mt-1 space-y-1">
                                  {question.options.filter((opt: any) => opt.isCorrect).map((option) => {
                                    const optionText = option.optionText || '';
                                    // Split bởi "|" nếu có
                                    const answers = optionText.split('|').map((a: string) => a.trim()).filter((a: string) => a.length > 0);

                            return (
                                      <div key={option.id} className="space-y-1">
                                        {answers.length > 0 ? (
                                          answers.map((answer: string, answerIndex: number) => (
                                            <div key={answerIndex} className="flex items-start gap-2 p-2 bg-white border border-green-300 rounded">
                                              <span className="text-sm font-medium text-green-700">•</span>
                                              <span className="flex-1 text-sm prose prose-sm max-w-none text-green-800" dangerouslySetInnerHTML={{ __html: renderContent(answer) }} />
                                </div>
                                          ))
                                        ) : (
                                          <div className="flex items-start gap-2 p-2 bg-white border border-green-300 rounded">
                                            <span className="text-sm font-medium text-green-700">•</span>
                                            <span className="flex-1 text-sm prose prose-sm max-w-none text-green-800" dangerouslySetInnerHTML={{ __html: renderContent(optionText) }} />
                                          </div>
                                        )}
                              </div>
                            );
                          })}
                                </div>
                        </div>
                      )}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                  });
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show assignment form
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          asChild
          className="mb-4"
        >
          <Link href={`/courses/${courseId}/lessons/${lessonId}`}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Quay lại bài học
          </Link>
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{assignment.title}</CardTitle>
                {assignment.description && (
                  <div
                    className="text-gray-600 mb-4 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: assignment.description }}
                  />
                )}
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <Badge variant="outline">
                    Điểm tối đa: {assignment.maxScore}
                  </Badge>
                  {assignment.passingScore && (
                    <Badge variant="outline">
                      Điểm đạt: {assignment.passingScore}
                    </Badge>
                  )}
                  {assignment.timeLimit && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <ClockIcon className="h-4 w-4" />
                      {assignment.timeLimit} phút
                    </Badge>
                  )}
                  <Badge variant="outline">
                    Số lần làm: {attemptCount}/{assignment.maxAttempts}
                  </Badge>
                  {assignment.dueDate && (
                    <span className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                      Hạn nộp: {formatDate(assignment.dueDate)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {!canDo ? (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6 text-center">
              <p className="text-orange-800 font-medium mb-4">
                Bạn đã hết lượt làm bài (Đã làm {attemptCount}/{assignment.maxAttempts} lần)
              </p>
              {results && results.attempts.length > 0 && (
                <Button
                  onClick={() => {
                    setShowResults(true);
                    setCurrentAttempt(results.attempts[0]);
                  }}
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  Xem kết quả
                </Button>
              )}
            </CardContent>
          </Card>
        ) : questions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Bài tập chưa có câu hỏi</p>
            </CardContent>
          </Card>
        ) : !hasStarted ? (
          <Card>
            <CardContent className="py-12 text-center">
              <DocumentTextIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sẵn sàng làm bài</h3>
              <p className="text-gray-600 mb-6">
                {assignment.timeLimit 
                  ? `Bạn có ${assignment.timeLimit} phút để hoàn thành bài tập này.`
                  : 'Bạn có thể làm bài bất cứ lúc nào.'}
              </p>
              <div className="space-y-2 mb-6 text-sm text-gray-600">
                <p>• Tổng số câu hỏi: {questions.length}</p>
                <p>• Điểm tối đa: {assignment.maxScore}</p>
                {assignment.passingScore && (
                  <p>• Điểm đạt: {assignment.passingScore}</p>
                )}
                {assignment.timeLimit && (
                  <p className="font-medium text-orange-600">
                    ⏱️ Thời gian: {assignment.timeLimit} phút
                  </p>
                )}
              </div>
              <div className="flex flex-col items-center gap-4">
                <Button 
                  onClick={startTimer} 
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6"
                >
                  Bắt đầu làm bài
                </Button>
                {results && results.attempts && results.attempts.length > 0 && (
                  <div className="flex flex-col items-center gap-2 w-full max-w-md">
                    <p className="text-sm text-gray-600">Hoặc xem kết quả các lần làm trước:</p>
                    {results.attempts.length === 1 ? (
                      <Button
                        onClick={() => {
                          setShowResults(true);
                          setCurrentAttempt(results.attempts[0]);
                        }}
                        variant="outline"
                        className="w-full"
                      >
                        Xem kết quả lần 1
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 w-full">
                        <Label className="text-sm text-gray-600 whitespace-nowrap">Chọn lần làm:</Label>
                        <Select
                          value={currentAttempt?.id?.toString() || (results.attempts[0]?.id?.toString() || '')}
                          onValueChange={(value) => {
                            const attempt = results.attempts.find((a: any) => a.id.toString() === value);
                            if (attempt) {
                              setCurrentAttempt(attempt);
                              setShowResults(true);
                            }
                          }}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Chọn lần làm" />
                          </SelectTrigger>
                          <SelectContent>
                            {results.attempts.map((attempt: any, index: number) => (
                              <SelectItem key={attempt.id} value={attempt.id.toString()}>
                                Lần {results.attempts.length - index} - {attempt.score}/{results.maxScore} điểm
                                {attempt.submittedAt && ` (${formatDate(attempt.submittedAt)})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Sticky Progress Bar */}
            <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-md mb-6 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between gap-4">
                  {/* Timer */}
                  {timeRemaining !== null && timerActive && (
                    <div className="flex items-center gap-3">
                      <ClockIcon className={`h-5 w-5 ${timeRemaining < 300 ? 'text-red-600' : 'text-blue-600'}`} />
                      <div>
                        <div className="text-xs text-gray-600">Thời gian</div>
                        <div className={`text-xl font-bold ${timeRemaining < 300 ? 'text-red-600 animate-pulse' : 'text-blue-600'}`}>
                          {formatTime(timeRemaining)}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Progress Grid */}
                  <div className="flex-1 flex items-center gap-2 overflow-x-auto pb-2">
                    <div className="text-xs text-gray-600 whitespace-nowrap mr-2">Tiến độ:</div>
                    <div className="flex gap-1.5 flex-wrap">
                      {questions
                        .filter(q => q.questionType !== 3)
                        .map((question, idx) => {
                          const questionAnswer = answers[question.id];
                          const questionType = question.questionType ?? 0;
                          let status: 'answered' | 'unanswered' = 'unanswered';
                          
                          if (questionType === 2) {
                            // Tự luận: kiểm tra có text không rỗng
                            status = typeof questionAnswer === 'string' && questionAnswer.trim().length > 0 ? 'answered' : 'unanswered';
                          } else if (questionType === 1) {
                            // Đúng/Sai: kiểm tra có object với ít nhất 1 option
                            if (typeof questionAnswer === 'object' && questionAnswer !== null && !Array.isArray(questionAnswer)) {
                              const optionAnswers = questionAnswer as { [optionId: number]: boolean };
                              status = Object.keys(optionAnswers).length > 0 ? 'answered' : 'unanswered';
                            }
                          } else if (questionType === 0) {
                            // Trắc nghiệm: kiểm tra có number (bao gồm cả 0)
                            // Kiểm tra cả undefined và null
                            if (questionAnswer !== undefined && questionAnswer !== null) {
                              const answerValue = questionAnswer;
                              // Kiểm tra nếu là number (bao gồm cả 0)
                              if (typeof answerValue === 'number') {
                                status = 'answered';
                              } else {
                                status = 'unanswered';
                              }
                            } else {
                              status = 'unanswered';
                            }
                          }
                          
                          const isActive = activeQuestionId === question.id;
                          
                          // Create a unique key that includes the answer value to force re-render
                          const answerKey = questionAnswer !== undefined && questionAnswer !== null 
                            ? (typeof questionAnswer === 'number' ? questionAnswer : 
                               typeof questionAnswer === 'string' ? questionAnswer.substring(0, 20) : 
                               JSON.stringify(questionAnswer).substring(0, 20))
                            : 'none';
                          
                          return (
                            <button
                              key={`progress-${question.id}-${answerKey}-${status}`}
                              type="button"
                              onClick={() => {
                                const element = document.getElementById(`question-${question.id}`);
                                if (element) {
                                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  setActiveQuestionId(question.id);
                                  setTimeout(() => setActiveQuestionId(null), 2000);
                                }
                              }}
                              className={`min-w-[32px] h-8 px-2 rounded text-xs font-semibold transition-all ${
                                isActive
                                  ? 'ring-2 ring-blue-500 ring-offset-2 scale-110'
                                  : status === 'answered'
                                  ? 'bg-green-500 text-white hover:bg-green-600'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                              title={`Câu ${idx + 1}${status === 'answered' ? ' - Đã trả lời' : ' - Chưa trả lời'}`}
                            >
                              {idx + 1}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                  
                  {timeRemaining !== null && timerActive && timeRemaining < 300 && (
                    <Badge variant="destructive" className="text-sm px-3 py-1 whitespace-nowrap">
                      Sắp hết thời gian!
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Làm bài tập</CardTitle>
              </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                <div className="space-y-8">
                  {(() => {
                    let questionNumber = 0; // Đếm số câu hỏi thực sự (không tính GroupTitle)
                    return questions.map((question, index) => {
                      // Type 3: GroupTitle - chỉ hiển thị tiêu đề
                      if (question.questionType === 3) {
                        return (
                          <div key={question.id} className="border-b pb-6 last:border-0">
                            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
                              <h3 
                                className="text-xl font-bold text-blue-900 prose prose-lg max-w-none"
                                dangerouslySetInnerHTML={{ __html: renderContent(question.questionContent) }}
                              />
                            </div>
                          </div>
                        );
                      }

                      // Type 0, 1, 2: Câu hỏi có đáp án
                      questionNumber++; // Tăng số câu hỏi
                      const isTextAnswer = question.questionType === 2;
                      const selectedAnswer = answers[question.id];

                      return (
                        <div key={question.id} id={`question-${question.id}`} className="border-b pb-6 last:border-0 scroll-mt-24">
                          <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-gray-900">
                                Câu {questionNumber}:
                              </span>
                            <Badge variant="outline" className="text-xs">
                              {question.defaultPoints} điểm
                            </Badge>
                            {question.questionType === 1 && (
                              <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-300">
                                Đúng/Sai
                              </Badge>
                            )}
                            {question.questionType === 2 && (
                              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-300">
                                Tự luận
                              </Badge>
                            )}
                          </div>
                          <div
                            className="text-gray-700 mb-4 prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: renderContent(question.questionContent) }}
                          />
                          {question.questionImage && (
                            <div className="mb-4">
                              <img
                                src={question.questionImage}
                                alt="Question image"
                                className="max-w-full h-auto rounded-lg"
                              />
                            </div>
                          )}
                        </div>

                        {isTextAnswer ? (
                          // Type 2: Text input - tự luận điền đáp án
                          <div className="space-y-2">
                            <Label htmlFor={`q${question.id}-text`} className="text-sm font-medium text-gray-700">
                              Nhập đáp án của bạn:
                            </Label>
                            <Input
                              id={`q${question.id}-text`}
                              type="text"
                              value={typeof selectedAnswer === 'string' ? selectedAnswer : ''}
                              onChange={(e) => handleTextAnswerChange(question.id, e.target.value)}
                              placeholder="Nhập đáp án..."
                              className="w-full"
                            />
                          </div>
                        ) : question.questionType === 1 ? (
                          // Type 1: Đúng/Sai - mỗi ý (a, b, c, d) có 2 nút Đúng/Sai riêng
                          <div className="space-y-4">
                            {question.options.map((option) => {
                              const optionAnswers = typeof selectedAnswer === 'object' && selectedAnswer !== null && !Array.isArray(selectedAnswer)
                                ? selectedAnswer as { [optionId: number]: boolean }
                                : {};
                              const isTrueSelected = optionAnswers[option.id] === true;
                              const isFalseSelected = optionAnswers[option.id] === false;
                              
                              return (
                                <div key={option.id} className="border border-gray-200 rounded-lg p-4">
                                  <div className="mb-3 prose prose-sm max-w-none">
                                    <span dangerouslySetInnerHTML={{ __html: renderContent(option.optionText) }} />
                                  </div>
                                  <div className="flex gap-3">
                                    <Button
                                      type="button"
                                      variant={isTrueSelected ? "default" : "outline"}
                                      onClick={() => handleTrueFalseChange(question.id, option.id, true)}
                                      className={`flex-1 h-12 text-base font-semibold ${
                                        isTrueSelected 
                                          ? 'bg-green-600 hover:bg-green-700 text-white border-green-600'
                                          : 'border-green-500 text-green-700 hover:bg-green-50'
                                      }`}
                                    >
                                      ✓ Đúng
                                    </Button>
                                    <Button
                                      type="button"
                                      variant={isFalseSelected ? "default" : "outline"}
                                      onClick={() => handleTrueFalseChange(question.id, option.id, false)}
                                      className={`flex-1 h-12 text-base font-semibold ${
                                        isFalseSelected 
                                          ? 'bg-red-600 hover:bg-red-700 text-white border-red-600'
                                          : 'border-red-500 text-red-700 hover:bg-red-50'
                                      }`}
                                    >
                                      ✗ Sai
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          // Type 0: Radio buttons - trắc nghiệm
                          <RadioGroup
                            value={typeof selectedAnswer === 'number' ? selectedAnswer.toString() : typeof selectedAnswer === 'string' ? selectedAnswer : ''}
                            onValueChange={(value) => {
                              if (!value || value === '') {
                                console.warn('Empty value from RadioGroup');
                                return;
                              }
                              console.log('RadioGroup onValueChange - raw value:', value, 'question:', { id: question.id, type: question.questionType });
                              const optionId = parseInt(value, 10);
                              console.log('RadioGroup onValueChange:', { questionId: question.id, questionType: question.questionType, value, optionId, isNaN: isNaN(optionId) });
                              // Kiểm tra optionId phải là số hợp lệ (bao gồm cả 0)
                              if (!isNaN(optionId) && isFinite(optionId)) {
                                console.log('Calling handleAnswerChange with:', { questionId: question.id, optionId, questionType: question.questionType });
                                handleAnswerChange(question.id, optionId, question.questionType);
                              } else {
                                console.warn('Invalid optionId from RadioGroup:', { value, optionId, parsed: parseInt(value, 10) });
                              }
                            }}
                          >
                            <div className="space-y-2">
                              {question.options.map((option) => {
                                const optionIdStr = String(option.id ?? '');
                                return (
                                <div key={option.id} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 border border-gray-200">
                                  <RadioGroupItem 
                                      value={optionIdStr}
                                    id={`q${question.id}-opt${option.id}`}
                                    name={`question-${question.id}`}
                                  />
                                  <Label
                                    htmlFor={`q${question.id}-opt${option.id}`}
                                    className="flex-1 cursor-pointer text-gray-700 prose prose-sm max-w-none"
                                  >
                                    <span dangerouslySetInnerHTML={{ __html: renderContent(option.optionText) }} />
                                  </Label>
                                </div>
                                );
                              })}
                            </div>
                          </RadioGroup>
                        )}
                      </div>
                    );
                    });
                  })()}
                </div>

                <Separator className="my-6" />

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Đã trả lời: {Object.keys(answers).filter(key => {
                      const qId = parseInt(key);
                      const question = questions.find(q => q.id === qId);
                      if (!question) return false;
                      // Không đếm GroupTitle
                      if (question.questionType === 3) return false;
                      const answer = answers[qId];
                      if (question.questionType === 2) {
                        // Type 2: Tự luận - phải có text
                        return typeof answer === 'string' && answer.trim().length > 0;
                      } else if (question.questionType === 1) {
                        // Type 1: Đúng/Sai - phải có ít nhất 1 option được chọn
                        if (typeof answer === 'object' && answer !== null && !Array.isArray(answer)) {
                          const optionAnswers = answer as { [optionId: number]: boolean };
                          return Object.keys(optionAnswers).length > 0;
                        }
                        return false;
                      } else {
                        // Type 0: Trắc nghiệm - phải có selected option
                        return typeof answer === 'number';
                      }
                    }).length}/{questions.filter(q => q.questionType !== 3).length} câu
                  </div>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang nộp...
                      </>
                    ) : (
                      'Nộp bài'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          </>
        )}
      </div>
    </div>
  );
}


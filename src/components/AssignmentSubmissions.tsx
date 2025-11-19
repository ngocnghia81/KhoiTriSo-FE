'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Eye, CheckCircle2, XCircle, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useAssignmentSubmissions,
  useGradeAssignment,
  AssignmentGradingRequest
} from '@/hooks/useAssignments';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { API_URLS } from '@/lib/api-config';

interface AssignmentSubmissionsProps {
  assignmentId: number;
}

interface GradingModalProps {
  submission: any;
  questions: any[];
  onClose: () => void;
  onSave: (data: AssignmentGradingRequest) => Promise<void>;
  loading?: boolean;
}

function GradingModal({ submission, questions, onClose, onSave, loading }: GradingModalProps) {

  // Helper: render raw HTML/MathML safely
  const renderHTML = (html?: string) => ({ __html: (html ?? '').trim() });

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
            if (w.MathJax && w.MathJax.startup && w.MathJax.startup.defaultReady) {
              w.MathJax.startup.defaultReady();
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
  }, [questions, submission]);


  const handleSubmit = async () => {
    // Backend sẽ tự động chấm tất cả câu hỏi bằng CalculateAndSaveScore
    // Frontend chỉ cần gửi AttemptId
    const gradingData: AssignmentGradingRequest = {
      AttemptId: submission.Id ?? submission.id
    };

    await onSave(gradingData);
  };

  const getAnswerForQuestion = (questionId: number) => {
    return submission.Answers?.find((a: any) => (a.QuestionId ?? a.questionId) === questionId);
  };

  const getAnswersForQuestion = (questionId: number) => {
    return submission.Answers?.filter((a: any) => (a.QuestionId ?? a.questionId) === questionId) || [];
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-6 border w-full max-w-4xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Chấm điểm bài nộp
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        <div className="space-y-4 mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Lần làm:</span> {submission.AttemptNumber ?? submission.attemptNumber ?? 'N/A'}
            </div>
            <div>
              <span className="font-medium">Thời gian:</span>{' '}
              {submission.TimeSpent ? `${Math.floor((submission.TimeSpent as number) / 60)} phút` : 'N/A'}
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {questions
            .filter((q: any) => {
              const questionType = q.QuestionType ?? q.questionType;
              return questionType !== 3 && questionType !== null && questionType !== undefined;
            })
            .map((q: any, index: number) => {
            const questionId = q.Id ?? q.id;
            const questionType = q.QuestionType ?? q.questionType ?? 0;
            const answer = getAnswerForQuestion(questionId);
            const maxPoints = q.DefaultPoints ?? q.defaultPoints ?? 1;
            const options = q.Options ?? q.options ?? q.QuestionOptions ?? [];

            return (
              <Card key={questionId} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      <span dangerouslySetInnerHTML={renderHTML(`Câu ${index + 1}: ${q.QuestionContent ?? q.questionContent ?? ''}`)} />
                    </CardTitle>
                    <Badge variant="outline">
                      Tối đa: {maxPoints} điểm
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Hiển thị tất cả options với đánh dấu đáp án đúng và đáp án học viên chọn */}
                  {options.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Các đáp án:</p>
                      <div className="space-y-2">
                        {options.map((opt: any, optIndex: number) => {
                          const optionId = opt.Id ?? opt.id ?? optIndex;
                          const optionText = opt.OptionText ?? opt.optionText ?? opt.OptionContent ?? opt.optionContent ?? '';
                          const isCorrect = opt.IsCorrect ?? opt.isCorrect ?? false;
                          
                          // Tìm answer tương ứng với option này
                          let userAnswer: any = null;
                          if (questionType === 1) {
                            // TrueFalse: tìm answer có OptionId trùng
                            userAnswer = getAnswersForQuestion(questionId).find((a: any) => 
                              (a.OptionId ?? a.optionId) === optionId
                            );
                          } else {
                            // MultipleChoice: chỉ có 1 answer
                            const ans = getAnswerForQuestion(questionId);
                            if (ans && (ans.OptionId ?? ans.optionId) === optionId) {
                              userAnswer = ans;
                            }
                          }
                          
                          const isSelected = userAnswer != null;
                          
                          // Với TrueFalse: so sánh option.isCorrect với bool từ answerText
                          let userAnswerIsCorrect = false;
                          let userBoolValue: boolean | null = null;
                          if (questionType === 1 && isSelected) {
                            const answerText = userAnswer?.AnswerText ?? userAnswer?.answerText ?? '';
                            if (answerText === 'true' || answerText === 'True') {
                              userBoolValue = true;
                            } else if (answerText === 'false' || answerText === 'False') {
                              userBoolValue = false;
                            }
                            // So khớp: option.isCorrect == userBoolValue
                            if (userBoolValue !== null) {
                              userAnswerIsCorrect = isCorrect === userBoolValue;
                            } else {
                              userAnswerIsCorrect = userAnswer?.IsCorrect ?? userAnswer?.isCorrect ?? false;
                            }
                          } else {
                            // MultipleChoice: dùng isCorrect từ answer
                            userAnswerIsCorrect = userAnswer?.IsCorrect ?? userAnswer?.isCorrect ?? false;
                          }
                          
                          // Xác định màu sắc và icon
                          let bgColor = 'bg-gray-50';
                          let borderColor = 'border-gray-200';
                          let textColor = 'text-gray-900';
                          let icon = null;
                          
                          if (questionType === 1) {
                            // TrueFalse: logic riêng
                            if (isSelected && userAnswerIsCorrect) {
                              // Học viên chọn đúng (isCorrect === userBoolValue)
                              bgColor = 'bg-green-50';
                              borderColor = 'border-green-300';
                              textColor = 'text-green-800';
                              icon = <CheckCircle2 className="w-4 h-4 text-green-600" />;
                            } else if (isSelected && !userAnswerIsCorrect) {
                              // Học viên chọn sai (isCorrect !== userBoolValue)
                              bgColor = 'bg-red-50';
                              borderColor = 'border-red-300';
                              textColor = 'text-red-800';
                              icon = <XCircle className="w-4 h-4 text-red-600" />;
                            } else if (!isSelected) {
                              // Học viên chưa chọn
                              bgColor = 'bg-gray-50';
                              borderColor = 'border-gray-200';
                              textColor = 'text-gray-700';
                            }
                          } else {
                            // MultipleChoice: logic cũ
                            if (isSelected && isCorrect && userAnswerIsCorrect) {
                              // Học viên chọn đúng
                              bgColor = 'bg-green-50';
                              borderColor = 'border-green-300';
                              textColor = 'text-green-800';
                              icon = <CheckCircle2 className="w-4 h-4 text-green-600" />;
                            } else if (isSelected && !isCorrect) {
                              // Học viên chọn sai
                              bgColor = 'bg-red-50';
                              borderColor = 'border-red-300';
                              textColor = 'text-red-800';
                              icon = <XCircle className="w-4 h-4 text-red-600" />;
                            } else if (isCorrect && !isSelected) {
                              // Đáp án đúng nhưng học viên không chọn
                              bgColor = 'bg-yellow-50';
                              borderColor = 'border-yellow-300';
                              textColor = 'text-yellow-800';
                              icon = <CheckCircle2 className="w-4 h-4 text-yellow-600" />;
                            } else if (isSelected) {
                              // Học viên chọn nhưng chưa biết đúng/sai
                              bgColor = 'bg-blue-50';
                              borderColor = 'border-blue-300';
                              textColor = 'text-blue-800';
                              icon = <Clock className="w-4 h-4 text-blue-600" />;
                            }
                          }
                          
                          return (
                            <div
                              key={optIndex}
                              className={`p-3 rounded border-2 ${bgColor} ${borderColor} ${textColor}`}
                            >
                              <div className="flex items-start gap-2">
                                {icon && <div className="mt-0.5">{icon}</div>}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium">
                                      {String.fromCharCode(65 + optIndex)}.
                                    </span>
                                    {questionType === 1 && (
                                      <Badge variant="outline" className={`text-xs ${
                                        isCorrect 
                                          ? 'bg-green-100 text-green-700 border-green-300' 
                                          : 'bg-red-100 text-red-700 border-red-300'
                                      }`}>
                                        {isCorrect ? 'Đúng' : 'Sai'}
                                      </Badge>
                                    )}
                                    {questionType !== 1 && isCorrect && (
                                      <Badge variant="outline" className="bg-green-100 text-green-700 text-xs">
                                        Đáp án đúng
                                      </Badge>
                                    )}
                                    {isSelected && (
                                      <Badge variant="outline" className="bg-blue-100 text-blue-700 text-xs">
                                        Học viên chọn
                                      </Badge>
                                    )}
                                  </div>
                                  <div 
                                    className="text-sm option-math" 
                                    dangerouslySetInnerHTML={renderHTML(optionText)} 
                                  />
                                  {questionType === 1 && isSelected && userBoolValue !== null && (
                                    <div className="mt-2 flex items-center gap-2">
                                      <span className="text-xs font-medium text-gray-700">Học sinh chọn:</span>
                                      <Badge variant="outline" className={`text-xs ${
                                        userBoolValue 
                                          ? 'bg-green-100 text-green-700 border-green-300' 
                                          : 'bg-red-100 text-red-700 border-red-300'
                                      }`}>
                                        {userBoolValue ? 'Đúng' : 'Sai'}
                                      </Badge>
                                      {userAnswerIsCorrect ? (
                                        <Badge variant="outline" className="bg-green-100 text-green-700 text-xs">
                                          ✓ Đúng
                                        </Badge>
                                      ) : (
                                        <Badge variant="outline" className="bg-red-100 text-red-700 text-xs">
                                          ✗ Sai
                                        </Badge>
                                      )}
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

                  {/* Hiển thị câu trả lời tự luận */}
                  {questionType === 2 && answer && (
                    <div>
                      <p className="text-sm font-medium mb-2">Đáp án của học sinh:</p>
                      <div className={`p-3 rounded border-2 ${
                        (answer.IsCorrect ?? answer.isCorrect) 
                          ? 'bg-green-50 border-green-300' 
                          : 'bg-red-50 border-red-300'
                      }`}>
                        <div 
                          className="text-sm" 
                          dangerouslySetInnerHTML={renderHTML(answer.AnswerText ?? answer.answerText ?? 'Không có câu trả lời')} 
                        />
                        {answer.IsCorrect !== undefined && (
                          <div className="mt-2">
                            {(answer.IsCorrect ?? answer.isCorrect) ? (
                              <Badge className="bg-green-100 text-green-700">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Đúng
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-700">
                                <XCircle className="w-3 h-3 mr-1" />
                                Sai
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Hiển thị đáp án đúng cho tự luận */}
                      {options.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium mb-2">Đáp án đúng:</p>
                          <div className="p-3 bg-green-50 rounded border border-green-200">
                            {options.map((opt: any, optIndex: number) => {
                              const optionText = opt.OptionText ?? opt.optionText ?? opt.OptionContent ?? opt.optionContent ?? '';
                              const isCorrect = opt.IsCorrect ?? opt.isCorrect ?? false;
                              if (!isCorrect) return null;
                              
                              // Split bởi "|" nếu có
                              const answers = optionText.split('|').map((a: string) => a.trim()).filter((a: string) => a.length > 0);
                              
                              return (
                                <div key={optIndex} className="space-y-1">
                                  {answers.length > 0 ? (
                                    answers.map((answer: string, answerIndex: number) => (
                                      <div key={answerIndex} className="flex items-start gap-2 p-2 bg-white border border-green-300 rounded">
                                        <span className="text-sm font-medium text-green-700">•</span>
                                        <span className="flex-1 text-sm option-math text-green-800" dangerouslySetInnerHTML={renderHTML(answer)} />
                                      </div>
                                    ))
                                  ) : (
                                    <div className="flex items-start gap-2 p-2 bg-white border border-green-300 rounded">
                                      <span className="text-sm font-medium text-green-700">•</span>
                                      <span className="flex-1 text-sm option-math text-green-800" dangerouslySetInnerHTML={renderHTML(optionText)} />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Hiển thị điểm số */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                      Điểm số
                      </label>
                    <div className="p-2 bg-gray-100 rounded border text-sm font-semibold">
                      {(() => {
                        let totalPointsEarned = 0;
                        if (questionType === 1) {
                          // TrueFalse: tổng điểm từ tất cả answers
                          const answers = getAnswersForQuestion(questionId);
                          totalPointsEarned = answers.reduce((sum: number, a: any) => {
                            return sum + (a.PointsEarned ?? a.pointsEarned ?? 0);
                          }, 0);
                        } else {
                          // MultipleChoice hoặc ShortAnswer: điểm từ 1 answer
                          totalPointsEarned = answer?.PointsEarned ?? answer?.pointsEarned ?? 0;
                        }
                        return `${totalPointsEarned.toFixed(2)} / ${maxPoints}`;
                      })()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>


        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Đang lưu...' : 'Lưu điểm'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AssignmentSubmissions({ assignmentId }: AssignmentSubmissionsProps) {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const { data, loading, error, refetch } = useAssignmentSubmissions(assignmentId, 1, 50);
  const { gradeAssignment, loading: grading } = useGradeAssignment();
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [pendingData, setPendingData] = useState<any>(null);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'graded'>('all');

  const submissions = data?.Items || data?.items || data?.Result || [];
  const pendingSubmissions = pendingData?.Items || pendingData?.items || pendingData?.Result || [];

  const fetchPendingSubmissions = async () => {
    try {
      setPendingLoading(true);
      const response = await authenticatedFetch(`${API_URLS.ASSIGNMENTS_BY_ID_BASE}/${assignmentId}/submissions/pending-grading?page=1&pageSize=50`);
      const result = await response.json();
      if (response.ok && result.Result) {
        setPendingData(result.Result);
      }
    } catch (err) {
      console.error('Error fetching pending submissions:', err);
    } finally {
      setPendingLoading(false);
    }
  };

  React.useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingSubmissions();
    }
  }, [activeTab, assignmentId, authenticatedFetch]);

  const gradedSubmissions = submissions.filter((s: any) => {
    const score = s.Score || s.score;
    return score !== null && score !== undefined;
  });

  const allPendingSubmissions = pendingSubmissions.filter((s: any) => {
    const score = s.Score || s.score;
    return score === null || score === undefined;
  });

  const [expandedUsers, setExpandedUsers] = useState<Set<number>>(new Set());

  // Group submissions by userId
  const groupedByUser = useMemo(() => {
    const grouped = new Map<number, any[]>();
    submissions.forEach((submission: any) => {
      const userId = submission.UserId || submission.userId;
      if (userId) {
        if (!grouped.has(userId)) {
          grouped.set(userId, []);
        }
        grouped.get(userId)!.push(submission);
      }
    });
    return grouped;
  }, [submissions]);

  // Group pending submissions by userId
  const groupedPendingByUser = useMemo(() => {
    const grouped = new Map<number, any[]>();
    pendingSubmissions.forEach((submission: any) => {
      const userId = submission.UserId || submission.userId;
      if (userId) {
        if (!grouped.has(userId)) {
          grouped.set(userId, []);
        }
        grouped.get(userId)!.push(submission);
      }
    });
    return grouped;
  }, [pendingSubmissions]);

  // Group graded submissions by userId
  const groupedGradedByUser = useMemo(() => {
    const grouped = new Map<number, any[]>();
    gradedSubmissions.forEach((submission: any) => {
      const userId = submission.UserId || submission.userId;
      if (userId) {
        if (!grouped.has(userId)) {
          grouped.set(userId, []);
        }
        grouped.get(userId)!.push(submission);
      }
    });
    return grouped;
  }, [gradedSubmissions]);

  const toggleUserExpansion = (userId: number) => {
    setExpandedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleGrade = async (submission: any) => {
    // Fetch questions for this submission
    try {
      const response = await authenticatedFetch(`${API_URLS.ASSIGNMENTS_BY_ID_BASE}/${assignmentId}/questions`);
      const result = await response.json();
      if (response.ok && result.Result) {
        const allQuestions = Array.isArray(result.Result) ? result.Result : [];
        // Filter out GroupTitle (QuestionType = 3) khi hiển thị để chấm
        const actualQuestions = allQuestions.filter((q: any) => {
          const questionType = q.QuestionType ?? q.questionType;
          return questionType !== 3 && questionType !== null && questionType !== undefined;
        });
        setQuestions(actualQuestions);
        setSelectedSubmission(submission);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      alert('Không thể tải câu hỏi để chấm điểm');
    }
  };

  const handleSaveGrade = async (gradingData: AssignmentGradingRequest) => {
    const result = await gradeAssignment(assignmentId, gradingData);
    if (result.success) {
      setSelectedSubmission(null);
      refetch();
    } else {
      alert(result.error || 'Chấm điểm thất bại');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getScoreColor = (score?: number, maxScore?: number) => {
    if (!score || !maxScore) return 'text-gray-600';
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">Đang tải bài nộp...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-red-600">Lỗi: {error}</p>
        </CardContent>
      </Card>
    );
  }

  const renderSubmissionsTable = (groupedMap: Map<number, any[]>, showGraded: boolean = true) => {
    if (groupedMap.size === 0) {
      return (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">
              {showGraded ? 'Chưa có bài nộp đã chấm.' : 'Chưa có bài nộp chưa chấm.'}
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Thông tin học sinh</TableHead>
                <TableHead>Số lần làm</TableHead>
                <TableHead>Điểm cao nhất</TableHead>
                <TableHead>Điểm trung bình</TableHead>
                <TableHead>Đã chấm</TableHead>
                <TableHead>Chưa chấm</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from(groupedMap.entries()).map(([userId, userSubmissions]) => {
                const sortedSubmissions = [...userSubmissions].sort((a, b) => {
                  const attemptA = a.AttemptNumber || a.attemptNumber || 0;
                  const attemptB = b.AttemptNumber || b.attemptNumber || 0;
                  return attemptB - attemptA; // Mới nhất trước
                });

                const maxScore = sortedSubmissions[0]?.MaxScore || sortedSubmissions[0]?.maxScore || 100;
                const scores = sortedSubmissions
                  .map((s: any) => s.Score || s.score)
                  .filter((s: any) => s !== null && s !== undefined) as number[];
                
                const bestScore = scores.length > 0 ? Math.max(...scores) : null;
                const avgScore = scores.length > 0 
                  ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
                  : null;
                
                const gradedCount = sortedSubmissions.filter((s: any) => {
                  const score = s.Score || s.score;
                  return score !== null && score !== undefined;
                }).length;
                
                const pendingCount = sortedSubmissions.filter((s: any) => {
                  const score = s.Score || s.score;
                  return score === null || score === undefined;
                }).length;

                const isExpanded = expandedUsers.has(userId);

                return (
                  <React.Fragment key={userId}>
                    <TableRow className="bg-gray-50">
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleUserExpansion(userId)}
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {(() => {
                            const firstSubmission = sortedSubmissions[0];
                            const userFullName = firstSubmission?.UserFullName ?? firstSubmission?.userFullName;
                            const userAvatar = firstSubmission?.UserAvatar ?? firstSubmission?.userAvatar;
                            const userName = firstSubmission?.UserName ?? firstSubmission?.userName;
                            const displayName = userFullName || userName || `Học sinh #${userId}`;
                            const initials = userFullName 
                              ? userFullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                              : userName 
                                ? userName.charAt(0).toUpperCase()
                                : userId.toString();
                            
                            return (
                              <>
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={userAvatar || '/images/default-avatar.svg'} alt={displayName} />
                                  <AvatarFallback className="bg-blue-500 text-white text-xs">
                                    {initials}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                  <span className="font-medium text-sm">
                                    {displayName}
                                  </span>
                                  {userName && userFullName && (
                                    <span className="text-xs text-gray-500">
                                      @{userName}
                                    </span>
                                  )}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{sortedSubmissions.length}</span>
                      </TableCell>
                      <TableCell>
                        {bestScore !== null ? (
                          <span className={`font-medium ${getScoreColor(bestScore, maxScore)}`}>
                            {bestScore}/{maxScore}
                          </span>
                        ) : (
                          <span className="text-gray-400">Chưa có</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {avgScore !== null ? (
                          <span className="text-sm">{avgScore}/{maxScore}</span>
                        ) : (
                          <span className="text-gray-400">Chưa có</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{gradedCount}</Badge>
                      </TableCell>
                      <TableCell>
                        {pendingCount > 0 ? (
                          <Badge variant="outline" className="bg-yellow-50">{pendingCount}</Badge>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {pendingCount > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const firstPending = sortedSubmissions.find((s: any) => {
                                const score = s.Score || s.score;
                                return score === null || score === undefined;
                              });
                              if (firstPending) {
                                handleGrade(firstPending);
                              }
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Chấm điểm
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                    {isExpanded && sortedSubmissions.map((submission: any) => {
                      const attemptId = submission.Id || submission.id;
                      const score = submission.Score || submission.score;
                      const isCompleted = submission.IsCompleted || submission.isCompleted;
                      const isGraded = score !== null && score !== undefined;

                      return (
                        <TableRow key={attemptId} className="bg-white">
                          <TableCell></TableCell>
                          <TableCell className="pl-8">
                            <span className="text-sm text-gray-600">
                              Lần {submission.AttemptNumber || submission.attemptNumber || 1}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(submission.StartedAt || submission.startedAt)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {submission.CompletedAt || submission.completedAt 
                              ? formatDate(submission.CompletedAt || submission.completedAt)
                              : <span className="text-gray-400">Chưa hoàn thành</span>}
                          </TableCell>
                          <TableCell>
                            <span className={`font-medium ${getScoreColor(score, maxScore)}`}>
                              {score !== null && score !== undefined 
                                ? `${score}/${maxScore}` 
                                : 'Chưa chấm'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {isCompleted ? (
                                <Badge className="bg-green-100 text-green-700">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Hoàn thành
                                </Badge>
                              ) : (
                                <Badge variant="outline">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Đang làm
                                </Badge>
                              )}
                              {isGraded && (
                                <Badge variant="secondary">Đã chấm</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {isCompleted && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleGrade(submission)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                {isGraded ? 'Xem/Sửa' : 'Chấm điểm'}
                              </Button>
                            )}
                          </TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Bài nộp của học sinh</h2>
        <p className="text-sm text-gray-600 mt-1">
          Tổng số học sinh: {groupedByUser.size} | 
          Tổng số bài nộp: {submissions.length} | 
          Đã chấm: {gradedSubmissions.length} | 
          Chưa chấm: {allPendingSubmissions.length}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="all">Tất cả ({groupedByUser.size})</TabsTrigger>
          <TabsTrigger value="pending">Chưa chấm ({groupedPendingByUser.size})</TabsTrigger>
          <TabsTrigger value="graded">Đã chấm ({groupedGradedByUser.size})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Đang tải bài nộp...</p>
            </div>
          ) : error ? (
            <Card>
              <CardContent className="py-6">
                <p className="text-red-600">Lỗi: {error}</p>
              </CardContent>
            </Card>
          ) : (
            renderSubmissionsTable(groupedByUser)
          )}
        </TabsContent>

        <TabsContent value="pending">
          {pendingLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Đang tải bài nộp chưa chấm...</p>
            </div>
          ) : (
            renderSubmissionsTable(groupedPendingByUser, false)
          )}
        </TabsContent>

        <TabsContent value="graded">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Đang tải bài nộp đã chấm...</p>
            </div>
          ) : (
            renderSubmissionsTable(groupedGradedByUser, true)
          )}
        </TabsContent>
      </Tabs>


      {selectedSubmission && questions.length > 0 && (
        <GradingModal
          submission={selectedSubmission}
          questions={questions}
          onClose={() => setSelectedSubmission(null)}
          onSave={handleSaveGrade}
          loading={grading}
        />
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useClientOnly } from '@/hooks/useClientOnly';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ClockIcon,
  DocumentTextIcon,
  TrophyIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PaperAirplaneIcon,
  BookmarkIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

interface AssignmentQuestion {
  id: number;
  content: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  points: number;
  image?: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  timeLimit: number; // in minutes
  totalQuestions: number;
  maxScore: number;
  maxAttempts: number;
  questions: AssignmentQuestion[];
  course: {
    title: string;
    slug: string;
  };
}

// Mock data - sẽ được thay thế bằng API call
const mockAssignment: Assignment = {
  id: 'toan-dao-ham',
  title: 'Bài tập: Đạo hàm hàm số',
  description: 'Bài tập trắc nghiệm về đạo hàm hàm số - Toán lớp 12',
  timeLimit: 30,
  totalQuestions: 15,
  maxScore: 10,
  maxAttempts: 3,
  course: {
    title: 'Toán lớp 12',
    slug: 'toan-lop-12'
  },
  questions: [
    {
      id: 1,
      content: 'Tìm đạo hàm của hàm số y = 3x² + 2x - 5',
      options: [
        { id: 'A', text: "y' = 6x + 2", isCorrect: true },
        { id: 'B', text: "y' = 3x + 2", isCorrect: false },
        { id: 'C', text: "y' = 6x - 5", isCorrect: false },
        { id: 'D', text: "y' = 6x + 2 - 5", isCorrect: false },
      ],
      points: 0.67
    },
    {
      id: 2,
      content: 'Cho hàm số y = x³ - 3x² + 2x + 1. Tìm y\'(1):',
      options: [
        { id: 'A', text: '0', isCorrect: true },
        { id: 'B', text: '2', isCorrect: false },
        { id: 'C', text: '-2', isCorrect: false },
        { id: 'D', text: '1', isCorrect: false },
      ],
      points: 0.67
    },
    {
      id: 3,
      content: 'Đạo hàm của hàm số y = √x là:',
      options: [
        { id: 'A', text: "y' = 1/(2√x)", isCorrect: true },
        { id: 'B', text: "y' = 1/√x", isCorrect: false },
        { id: 'C', text: "y' = 2√x", isCorrect: false },
        { id: 'D', text: "y' = √x/2", isCorrect: false },
      ],
      points: 0.67
    },
    {
      id: 4,
      content: 'Cho đồ thị hàm số y = f(x) như hình vẽ. Tại điểm nào đạo hàm f\'(x) = 0?',
      image: '/images/course/course-1/math-graph.png',
      options: [
        { id: 'A', text: 'x = -1', isCorrect: false },
        { id: 'B', text: 'x = 0', isCorrect: false },
        { id: 'C', text: 'x = 1', isCorrect: true },
        { id: 'D', text: 'x = 2', isCorrect: false },
      ],
      points: 0.67
    },
    {
      id: 5,
      content: 'Tìm đạo hàm của hàm số y = sin(2x + 1):',
      options: [
        { id: 'A', text: "y' = cos(2x + 1)", isCorrect: false },
        { id: 'B', text: "y' = 2cos(2x + 1)", isCorrect: true },
        { id: 'C', text: "y' = -sin(2x + 1)", isCorrect: false },
        { id: 'D', text: "y' = 2sin(2x + 1)", isCorrect: false },
      ],
      points: 0.67
    }
  ]
};

export default function AssignmentPage({ params: _params }: { params: { slug: string } }) {
  const isClient = useClientOnly();
  const [assignment] = useState<Assignment>(mockAssignment);
  const [timeLeft, setTimeLeft] = useState(assignment.timeLimit * 60); // Convert to seconds
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [currentQuestion] = useState(1);
  const [showWarning, setShowWarning] = useState(false);

  // Timer effect
  useEffect(() => {
    if (isSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        if (prev <= 300 && !showWarning) { // 5 minutes warning
          setShowWarning(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, showWarning]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: number, optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleSubmit = () => {
    // Only use confirm on client-side to avoid hydration issues
    if (isClient && !confirm('Bạn có chắc chắn muốn nộp bài? Bạn sẽ không thể chỉnh sửa sau khi nộp.')) {
      return;
    }
    setIsSubmitted(true);
    setShowResult(true);
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    let totalPoints = 0;

    assignment.questions.forEach(question => {
      const userAnswer = answers[question.id];
      const correctOption = question.options.find(opt => opt.isCorrect);
      
      if (userAnswer === correctOption?.id) {
        correctAnswers++;
        totalPoints += question.points;
      }
    });

    return {
      correctAnswers,
      wrongAnswers: assignment.questions.length - correctAnswers,
      score: Math.round(totalPoints * 10) / 10,
      percentage: Math.round((correctAnswers / assignment.questions.length) * 100)
    };
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const getProgressPercentage = () => {
    return (getAnsweredCount() / assignment.totalQuestions) * 100;
  };

  if (showResult) {
    const result = calculateScore();
    const timeSpent = (assignment.timeLimit * 60) - timeLeft;
    const timeSpentMinutes = Math.floor(timeSpent / 60);
    const timeSpentSeconds = timeSpent % 60;

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li><Link href="/" className="hover:text-blue-600">Trang chủ</Link></li>
              <li>/</li>
              <li><Link href="/courses" className="hover:text-blue-600">Khóa học</Link></li>
              <li>/</li>
              <li><Link href={`/courses/${assignment.course.slug}`} className="hover:text-blue-600">{assignment.course.title}</Link></li>
              <li>/</li>
              <li className="text-gray-900">Kết quả bài tập</li>
            </ol>
          </nav>

          {/* Result Card */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="h-12 w-12 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Hoàn thành bài tập!</h1>
              <p className="text-gray-600">Bạn đã hoàn thành bài tập &quot;{assignment.title}&quot;</p>
            </div>

            {/* Score Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="text-center">
                <div className="w-32 h-32 border-8 border-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div>
                    <div className="text-3xl font-bold text-green-600">{result.score}</div>
                    <div className="text-sm text-gray-600">/ {assignment.maxScore} điểm</div>
                  </div>
                </div>
                <p className="text-lg font-semibold text-gray-900">Điểm số của bạn</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Số câu đúng:</span>
                  <span className="font-semibold text-green-600">{result.correctAnswers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Số câu sai:</span>
                  <span className="font-semibold text-red-600">{result.wrongAnswers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Thời gian làm bài:</span>
                  <span className="font-semibold text-blue-600">
                    {timeSpentMinutes}:{timeSpentSeconds.toString().padStart(2, '0')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tỷ lệ đúng:</span>
                  <span className="font-semibold text-purple-600">{result.percentage}%</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => window.location.reload()}
              >
                Làm lại (còn 2 lần)
              </button>
              <Link
                href={`/courses/${assignment.course.slug}`}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-center"
              >
                Quay về khóa học
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Assignment Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-4">
            <ol className="flex items-center space-x-2 text-sm text-blue-200">
              <li><Link href="/" className="hover:text-white">Trang chủ</Link></li>
              <li>/</li>
              <li><Link href="/courses" className="hover:text-white">Khóa học</Link></li>
              <li>/</li>
              <li><Link href={`/courses/${assignment.course.slug}`} className="hover:text-white">{assignment.course.title}</Link></li>
              <li>/</li>
              <li className="text-white">Bài tập</li>
            </ol>
          </nav>

          <h1 className="text-3xl font-bold mb-4">{assignment.title}</h1>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-5 w-5" />
              <span>Thời gian: <strong>{assignment.timeLimit} phút</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <DocumentTextIcon className="h-5 w-5" />
              <span>Số câu: <strong>{assignment.totalQuestions} câu</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <TrophyIcon className="h-5 w-5" />
              <span>Điểm tối đa: <strong>{assignment.maxScore} điểm</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <ArrowPathIcon className="h-5 w-5" />
              <span>Số lần làm: <strong>{assignment.maxAttempts} lần</strong></span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Instructions */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hướng dẫn làm bài</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Đọc kỹ đề bài trước khi chọn đáp án</li>
                <li>• Mỗi câu hỏi chỉ có 1 đáp án đúng</li>
                <li>• Bạn có thể quay lại câu trước đó để sửa đáp án</li>
                <li>• Nhấn &quot;Nộp bài&quot; khi hoàn thành tất cả câu hỏi</li>
                <li>• Kết quả sẽ được hiển thị ngay sau khi nộp bài</li>
              </ul>
            </div>

            {/* Questions */}
            <div className="space-y-6">
              {assignment.questions.map((question, index) => (
                <div key={question.id} className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                    <span className="bg-blue-600 text-white px-4 py-2 rounded-full font-semibold">
                      Câu {question.id}
                    </span>
                    <span className="text-gray-500 text-sm">({question.points} điểm)</span>
                  </div>

                  <div className="mb-6">
                    <p className="text-lg text-gray-900 mb-4">{question.content}</p>
                    {question.image && (
                      <div className="mb-4 text-center">
                        <Image
                          src={question.image}
                          alt="Question illustration"
                          width={400}
                          height={300}
                          className="mx-auto rounded-lg shadow-sm"
                          quality={100}
                          unoptimized={true}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {question.options.map((option) => (
                      <label
                        key={option.id}
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          answers[question.id] === option.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option.id}
                          checked={answers[question.id] === option.id}
                          onChange={() => handleAnswerChange(question.id, option.id)}
                          className="mr-4"
                        />
                        <span className="flex-1 text-gray-900">
                          <strong>{option.id}.</strong> {option.text}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    // Save progress to localStorage
                    localStorage.setItem('assignment_progress', JSON.stringify(answers));
                    alert('Đã lưu tiến độ làm bài!');
                  }}
                  className="flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <BookmarkIcon className="h-5 w-5 mr-2" />
                  Lưu bài làm
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex items-center justify-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                  Nộp bài
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Timer */}
            <div className={`bg-white rounded-2xl shadow-sm p-6 ${showWarning ? 'ring-2 ring-red-500' : ''}`}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thời gian còn lại</h3>
              <div className="text-center">
                <div className={`w-24 h-24 border-6 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  showWarning ? 'border-red-500 text-red-500' : 'border-blue-500 text-blue-500'
                }`}>
                  <span className="text-xl font-bold">{formatTime(timeLeft)}</span>
                </div>
                {showWarning && (
                  <div className="flex items-center justify-center text-red-500 text-sm">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                    Sắp hết thời gian!
                  </div>
                )}
              </div>
            </div>

            {/* Progress */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tiến độ làm bài</h3>
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Đã làm: <strong>{getAnsweredCount()}</strong>/{assignment.totalQuestions}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage()}%` }}
                  ></div>
                </div>
              </div>

              {/* Question Navigation */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Danh sách câu hỏi</h4>
                <div className="grid grid-cols-5 gap-2">
                  {assignment.questions.map((question) => (
                    <button
                      key={question.id}
                      onClick={() => {
                        const element = document.querySelector(`[data-question="${question.id}"]`);
                        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                      className={`w-10 h-10 rounded-lg text-sm font-semibold transition-colors ${
                        answers[question.id]
                          ? 'bg-green-500 text-white'
                          : currentQuestion === question.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {question.id}
                    </button>
                  ))}
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                    <span className="text-gray-600">Đã trả lời</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-600 rounded mr-2"></div>
                    <span className="text-gray-600">Câu hiện tại</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                    <span className="text-gray-600">Chưa trả lời</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mẹo làm bài</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>💡 Đọc kỹ đề bài trước khi chọn đáp án</li>
                <li>💡 Loại trừ các đáp án sai rõ ràng</li>
                <li>💡 Kiểm tra lại các phép tính</li>
                <li>💡 Quản lý thời gian hợp lý</li>
              </ul>
            </div>

            {/* Help */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cần hỗ trợ?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Nếu gặp khó khăn kỹ thuật, hãy liên hệ với chúng tôi:
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ExclamationCircleIcon className="h-4 w-4 mr-2" />
                Liên hệ hỗ trợ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

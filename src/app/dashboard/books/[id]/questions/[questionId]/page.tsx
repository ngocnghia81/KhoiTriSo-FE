'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Edit,
  Trash2,
  FileQuestion,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { bookApiService, BookQuestion } from '@/services/bookApi';

const questionTypeLabels: Record<number, string> = {
  1: 'Trắc nghiệm',
  2: 'Đúng/Sai',
  3: 'Tự luận',
  4: 'Điền khuyết'
};

const difficultyConfig: Record<number, { label: string; color: string; icon: any }> = {
  1: { label: 'Dễ', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  2: { label: 'Trung bình', color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
  3: { label: 'Khó', color: 'bg-red-100 text-red-700', icon: AlertCircle }
};

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params?.id ? parseInt(params.id as string) : null;
  const questionId = params?.questionId ? parseInt(params.questionId as string) : null;

  const [question, setQuestion] = useState<BookQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bookId && questionId) {
      fetchQuestion();
    }
  }, [bookId, questionId]);

  const fetchQuestion = async () => {
    if (!bookId || !questionId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch all questions and find the specific one
      const questions = await bookApiService.getBookQuestions(bookId, 1, 1000);
      const foundQuestion = questions.find(q => q.id === questionId);

      if (foundQuestion) {
        setQuestion(foundQuestion);
      } else {
        setError('Không tìm thấy câu hỏi');
      }
    } catch (err: any) {
      console.error('Error fetching question:', err);
      setError(err.message || 'Không thể tải thông tin câu hỏi');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!question || !confirm(`Bạn có chắc chắn muốn xóa câu hỏi này?`)) return;

    try {
      // Add delete API call here
      alert('Chức năng xóa sẽ được triển khai sau');
      // router.push(`/dashboard/books/${bookId}/questions`);
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Không thể xóa câu hỏi!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md">
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Lỗi</h2>
              <p className="text-gray-600 mb-6">{error || 'Không tìm thấy câu hỏi'}</p>
              <Button onClick={() => router.push(`/dashboard/books/${bookId}`)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const DifficultyIcon = difficultyConfig[question.difficulty]?.icon || AlertCircle;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 -left-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"
          animate={{ y: [0, -50, 0], x: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 -right-20 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"
          animate={{ y: [0, 50, 0], x: [0, -30, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            onClick={() => router.push(`/dashboard/books/questions`)}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách câu hỏi
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                <FileQuestion className="w-10 h-10 text-blue-600" />
                Chi tiết Câu hỏi
              </h1>
              <p className="text-gray-600 mt-2">ID: #{question.id}</p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/dashboard/books/${bookId}/questions/${questionId}/edit`)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Sửa
              </Button>
              <Button
                variant="outline"
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700 hover:border-red-300"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Xóa
              </Button>
            </div>
          </div>
        </div>

        {/* Question Info */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Thông tin câu hỏi</CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-sm">
                  {questionTypeLabels[question.questionType] || 'Không xác định'}
                </Badge>
                <Badge className={`${difficultyConfig[question.difficulty]?.color || 'bg-gray-100 text-gray-700'} flex items-center gap-1`}>
                  <DifficultyIcon className="w-3 h-3" />
                  {difficultyConfig[question.difficulty]?.label || 'N/A'}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Question Text */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Câu hỏi</h3>
              <p className="text-lg text-gray-900">{question.question}</p>
            </div>

            <Separator />

            {/* Options (if multiple choice) */}
            {question.options && question.options.length > 0 && (
              <>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Các lựa chọn</h3>
                  <div className="space-y-2">
                    {question.options.map((option, index) => {
                      const optionText = option.OptionText || option.optionText || '';
                      const isCorrect = option.IsCorrect || option.isCorrect || false;
                      
                      return (
                        <div
                          key={option.Id || option.id || index}
                          className={`p-3 rounded-lg border-2 ${
                            isCorrect
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">
                              {String.fromCharCode(65 + index)}.
                            </span>
                            <span className="text-gray-900">{optionText}</span>
                            {isCorrect && (
                              <CheckCircle2 className="w-4 h-4 text-green-600 ml-auto" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Correct Answer */}
            {question.correctAnswer && (
              <>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Đáp án đúng</h3>
                  <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                    <p className="text-green-900 font-medium flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      {question.correctAnswer}
                    </p>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Explanation */}
            {question.explanation && (
              <>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Giải thích</h3>
                  <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <p className="text-blue-900">{question.explanation}</p>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Metadata */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Sách</h3>
                <p className="text-gray-900">Book #{question.bookId}</p>
              </div>
              {question.chapterId && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Chương</h3>
                  <p className="text-gray-900">Chapter #{question.chapterId}</p>
                </div>
              )}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Thứ tự</h3>
                <p className="text-gray-900">{question.orderIndex}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-end">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/books/questions`)}
          >
            Đóng
          </Button>
          <Button
            onClick={() => router.push(`/dashboard/books/${bookId}/questions/${questionId}/edit`)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Edit className="w-4 h-4 mr-2" />
            Chỉnh sửa câu hỏi
          </Button>
        </div>
      </div>
    </div>
  );
}

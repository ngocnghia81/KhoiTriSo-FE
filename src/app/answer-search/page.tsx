'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, FileQuestion, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Helper function to map question data (similar to mapBookQuestion in bookApi.ts)
function mapQuestion(question: any): any {
  const chapterId = question.chapterId || question.ChapterId;
  
  // Map options để đảm bảo các field được map đúng
  const rawOptions = question.options || question.Options || [];
  const mappedOptions = Array.isArray(rawOptions) 
    ? rawOptions.map((opt: any) => ({
        Id: opt.Id || opt.id,
        id: opt.id || opt.Id,
        QuestionId: opt.QuestionId || opt.questionId,
        questionId: opt.questionId || opt.QuestionId,
        OptionText: opt.OptionText || opt.optionText,
        optionText: opt.optionText || opt.OptionText,
        IsCorrect: opt.IsCorrect !== undefined ? opt.IsCorrect : (opt.isCorrect !== undefined ? opt.isCorrect : false),
        isCorrect: opt.isCorrect !== undefined ? opt.isCorrect : (opt.IsCorrect !== undefined ? opt.IsCorrect : false),
        PointsValue: opt.PointsValue || opt.pointsValue,
        pointsValue: opt.pointsValue || opt.PointsValue,
        OrderIndex: opt.OrderIndex || opt.orderIndex,
        orderIndex: opt.orderIndex || opt.OrderIndex,
        CreatedAt: opt.CreatedAt || opt.createdAt,
        createdAt: opt.createdAt || opt.CreatedAt,
        UpdatedAt: opt.UpdatedAt || opt.updatedAt,
        updatedAt: opt.updatedAt || opt.UpdatedAt
      }))
    : [];
  
  return {
    id: question.id || question.Id,
    bookId: question.bookId || question.BookId || question.ContextId,
    chapterId: chapterId,
    question: question.question || question.Question || question.QuestionContent,
    QuestionContent: question.QuestionContent || question.question || question.Question,
    questionContent: question.QuestionContent || question.questionContent || question.question || question.Question,
    questionType: question.questionType || question.QuestionType || 1,
    QuestionType: question.QuestionType || question.questionType || 1,
    options: mappedOptions,
    correctAnswer: question.correctAnswer || question.CorrectAnswer,
    explanation: question.explanation || question.Explanation || question.ExplanationContent,
    explanationContent: question.explanationContent || question.ExplanationContent || question.explanation || question.Explanation,
    ExplanationContent: question.ExplanationContent || question.explanationContent || question.explanation || question.Explanation,
    videoUrl: question.videoUrl || question.VideoUrl,
    VideoUrl: question.VideoUrl || question.videoUrl,
    difficulty: question.difficulty || question.Difficulty || question.DifficultyLevel || 1,
    DifficultyLevel: question.DifficultyLevel || question.difficulty || question.Difficulty || 1,
    orderIndex: question.orderIndex || question.OrderIndex || 0,
    OrderIndex: question.OrderIndex || question.orderIndex || 0
  };
}

export default function AnswerSearchPage() {
  const router = useRouter();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [questionId, setQuestionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const searchQuestion = async () => {
    if (!questionId.trim()) {
      setError('Vui lòng nhập ID câu hỏi');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setQuestion(null);

      const id = parseInt(questionId.trim());
      if (isNaN(id)) {
        setError('ID câu hỏi phải là số');
        setLoading(false);
        return;
      }

      // Sử dụng API endpoint để lấy câu hỏi theo ID
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/books/questions/${id}`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError('Không tìm thấy câu hỏi với ID này');
        } else {
          setError('Có lỗi xảy ra khi tìm kiếm');
        }
        setLoading(false);
        return;
      }

      const data = await response.json();
      
      if (data.Result) {
        // Map question để đảm bảo các field được map đúng (giống như mapBookQuestion)
        const mappedQuestion = mapQuestion(data.Result);
        setQuestion(mappedQuestion);
      } else if (data.Result === null) {
        setError(data.Message || 'Không tìm thấy câu hỏi');
      } else {
        setError('Dữ liệu không hợp lệ');
      }
    } catch (err: any) {
      console.error('Error searching question:', err);
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchQuestion();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Tìm đáp án bằng ID
          </h1>
          <p className="text-gray-600">
            Nhập ID câu hỏi để xem đáp án và lời giải
          </p>
        </div>

        {/* Search Box */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Nhập ID câu hỏi (ví dụ: 123)"
                  value={questionId}
                  onChange={(e) => setQuestionId(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="text-lg"
                />
              </div>
              <Button
                onClick={searchQuestion}
                disabled={loading}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang tìm...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Tìm kiếm
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Question Result */}
        {question && (
          <Card className="bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <FileQuestion className="w-6 h-6 text-blue-600" />
                  Câu hỏi ID: {question.id || question.Id}
                </CardTitle>
                <Badge className="bg-blue-100 text-blue-700">
                  {question.questionType === 0 ? 'Trắc nghiệm' :
                   question.questionType === 1 ? 'Đúng/Sai' :
                   question.questionType === 2 ? 'Tự luận' : 'Câu hỏi'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Question Content */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Nội dung câu hỏi:</h3>
                <div 
                  className="prose prose-lg max-w-none p-4 bg-gray-50 rounded-lg border border-gray-200"
                  dangerouslySetInnerHTML={{ 
                    __html: question.questionContent || question.QuestionContent || question.question || '' 
                  }}
                />
              </div>

              {/* Options */}
              {question.options && question.options.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Các phương án:</h3>
                  <div className="space-y-3">
                    {question.options.map((option: any, optIndex: number) => {
                      const isCorrect = option.isCorrect || option.IsCorrect;
                      
                      return (
                        <div 
                          key={optIndex}
                          className={`flex items-start gap-3 p-4 rounded-lg border-2 ${
                            isCorrect
                              ? 'bg-green-50 border-green-300' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            {isCorrect ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <span className="font-medium text-gray-700 mr-2">
                              {String.fromCharCode(65 + optIndex)}.
                            </span>
                            <span className={`${isCorrect ? 'text-green-800 font-medium' : 'text-gray-700'}`}>
                              {option.optionText || option.OptionText || option.optionContent || option.OptionContent || ''}
                            </span>
                            {isCorrect && (
                              <Badge className="ml-2 bg-green-600 text-white text-xs">
                                Đáp án đúng
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Explanation */}
              {(question.explanationContent || question.ExplanationContent) && (
                <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                  <p className="text-sm font-semibold text-blue-900 mb-2">Giải thích:</p>
                  <div 
                    className="text-blue-800 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: question.explanationContent || question.ExplanationContent || question.explanation || question.Explanation || '' 
                    }}
                  />
                </div>
              )}

              {/* No options for essay */}
              {(!question.options || question.options.length === 0) && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800">
                    Đây là câu hỏi tự luận, không có đáp án cố định.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


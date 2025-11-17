'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { isSuccessfulResponse, extractMessage, extractResult } from '@/utils/apiHelpers';
import { LatexEditor, LatexRenderer } from '@/components/LatexRenderer';
import { bookApiService, BookChapter } from '@/services/bookApi';

interface QuestionOption {
  optionText: string;
  isCorrect: boolean;
  orderIndex: number;
}

export default function CreateQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const bookId = parseInt(params?.id as string);
  
  const [loading, setLoading] = useState(false);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [chapters, setChapters] = useState<BookChapter[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<string>('none');
  const [questionContent, setQuestionContent] = useState('');
  const [questionType, setQuestionType] = useState<number>(1);
  const [difficultyLevel, setDifficultyLevel] = useState<number>(0);
  const [defaultPoints, setDefaultPoints] = useState<number>(0.25);
  const [explanationContent, setExplanationContent] = useState('');
  const [options, setOptions] = useState<QuestionOption[]>([]);
  
  const { authenticatedFetch } = useAuthenticatedFetch();

  // Load chapters
  useEffect(() => {
    const loadChapters = async () => {
      if (!bookId) return;
      
      try {
        setLoadingChapters(true);
        const chaptersData = await bookApiService.getBookChapters(bookId);
        setChapters(chaptersData);
      } catch (err) {
        console.error('Error loading chapters:', err);
      } finally {
        setLoadingChapters(false);
      }
    };

    loadChapters();
  }, [bookId]);

  const addOption = () => {
    setOptions([...options, {
      optionText: '',
      isCorrect: false,
      orderIndex: options.length
    }]);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, field: 'optionText' | 'isCorrect', value: string | boolean) => {
    const newOptions = [...options];
    newOptions[index] = {
      ...newOptions[index],
      [field]: value
    };
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!questionContent.trim()) {
      setError('Vui lòng nhập nội dung câu hỏi');
      return;
    }

    if (questionType === 1 && options.length < 2) {
      setError('Câu hỏi trắc nghiệm cần ít nhất 2 đáp án');
      return;
    }

    if (questionType === 1 && !options.some(opt => opt.isCorrect)) {
      setError('Vui lòng chọn ít nhất một đáp án đúng');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const requestBody = {
        QuestionContent: questionContent,
        QuestionType: questionType,
        DifficultyLevel: difficultyLevel,
        DefaultPoints: defaultPoints,
        Points: [defaultPoints], // Add Points as an array with default points
        ExplanationContent: explanationContent || '',
        QuestionImage: '',
        VideoUrl: '',
        TimeLimit: 0,
        SubjectType: '',
        OrderIndex: 0,
        ChapterId: selectedChapterId && selectedChapterId !== 'none' ? parseInt(selectedChapterId) : 0,
        Options: options.map((option, index) => ({
          OptionText: option.optionText,
          IsCorrect: option.isCorrect,
          PointsValue: 0,
          OrderIndex: index
        }))
      };

      console.log('Creating question with data:', requestBody);

      const response = await authenticatedFetch(`/api/books/${bookId}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();

      if (isSuccessfulResponse(result)) {
        console.log('Question created successfully:', extractResult(result));
        router.push(`/instructor/books/${bookId}/questions`);
      } else {
        setError(extractMessage(result));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo câu hỏi';
      setError(errorMessage);
      console.error('Error creating question:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tạo câu hỏi mới</h1>
              <p className="text-sm text-gray-600">Sách ID: {bookId}</p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm">
            {error}
          </div>
        )}

        {/* Preview Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Xem trước câu hỏi</CardTitle>
          </CardHeader>
          <CardContent>
            {questionContent ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Nội dung câu hỏi:</p>
                  <div className="p-4 bg-gray-50 rounded-lg border-2 border-blue-200">
                    <LatexRenderer content={questionContent} />
                  </div>
                </div>
                
                {options.length > 0 && questionType === 1 && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Các đáp án:</p>
                    <div className="space-y-2">
                      {options.map((option, index) => (
                        <div key={index} className={`p-3 rounded-lg border-2 ${
                          option.isCorrect ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200'
                        }`}>
                          {String.fromCharCode(65 + index)}. <LatexRenderer content={option.optionText} />
                          {option.isCorrect && <span className="ml-2 text-green-600">✓ Đúng</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {explanationContent && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Giải thích:</p>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <LatexRenderer content={explanationContent} />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-center italic">Nhập nội dung để xem trước...</p>
            )}
          </CardContent>
        </Card>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Thông tin câu hỏi</CardTitle>
              <CardDescription>Điền thông tin để tạo câu hỏi mới</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Question Content with LaTeX Support */}
              <div className="space-y-2">
                <Label htmlFor="questionContent">
                  Nội dung câu hỏi <span className="text-red-500">*</span>
                </Label>
                <div className="space-y-2">
                  <LatexEditor
                    value={questionContent}
                    onChange={setQuestionContent}
                    placeholder="Nhập nội dung câu hỏi... Sử dụng $x^2 + y^2 = z^2$ cho LaTeX"
                    rows={4}
                  />
                  <p className="text-xs text-gray-500">
                    💡 Hỗ trợ LaTeX: Sử dụng $...$ cho inline và $$...$$ cho block math
                  </p>
                </div>
              </div>

              {/* Chapter Selection */}
              <div className="space-y-2">
                <Label htmlFor="chapterId">Chương (tùy chọn)</Label>
                <Select
                  value={selectedChapterId}
                  onValueChange={setSelectedChapterId}
                  disabled={loadingChapters}
                >
                  <SelectTrigger id="chapterId">
                    <SelectValue placeholder={loadingChapters ? 'Đang tải...' : 'Chọn chương'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không chọn chương</SelectItem>
                    {chapters.map((chapter) => (
                      <SelectItem key={chapter.id} value={chapter.id.toString()}>
                        Chương {chapter.orderIndex}: {chapter.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {chapters.length === 0 && !loadingChapters && (
                  <p className="text-xs text-gray-500">
                    Sách này chưa có chương nào. Câu hỏi sẽ không gán vào chương cụ thể.
                  </p>
                )}
              </div>

              {/* Question Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="questionType">Loại câu hỏi</Label>
                  <Select
                    value={questionType.toString()}
                    onValueChange={(value) => setQuestionType(parseInt(value))}
                  >
                    <SelectTrigger id="questionType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Trắc nghiệm</SelectItem>
                      <SelectItem value="2">Đúng/Sai</SelectItem>
                      <SelectItem value="3">Tự luận</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficultyLevel">Độ khó</Label>
                  <Select
                    value={difficultyLevel.toString()}
                    onValueChange={(value) => setDifficultyLevel(parseInt(value))}
                  >
                    <SelectTrigger id="difficultyLevel">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Dễ</SelectItem>
                      <SelectItem value="1">Trung bình</SelectItem>
                      <SelectItem value="2">Khó</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Default Points */}
              <div className="space-y-2">
                <Label htmlFor="defaultPoints">Điểm mặc định</Label>
                <Input
                  id="defaultPoints"
                  type="number"
                  step="0.25"
                  min="0"
                  max="1"
                  value={defaultPoints}
                  onChange={(e) => setDefaultPoints(parseFloat(e.target.value))}
                  placeholder="0.25"
                />
              </div>

              {/* Explanation with LaTeX Support */}
              <div className="space-y-2">
                <Label htmlFor="explanationContent">Giải thích</Label>
                <LatexEditor
                  value={explanationContent}
                  onChange={setExplanationContent}
                  placeholder="Nhập giải thích cho câu hỏi (không bắt buộc)..."
                  rows={3}
                />
              </div>

              {/* Options for Multiple Choice */}
              {questionType === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Các đáp án <span className="text-red-500">*</span></Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addOption}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Thêm đáp án
                    </Button>
                  </div>

                  {options.length === 0 && (
                    <div className="text-center py-6 text-gray-500 text-sm border-2 border-dashed border-gray-300 rounded-lg">
                        Chưa có đáp án nào. Nhấn &quot;Thêm đáp án&quot; để bắt đầu.
                    </div>
                  )}

                  <div className="space-y-3">
                    {options.map((option, index) => (
                      <div key={index} className="p-3 border border-gray-200 rounded-lg space-y-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-700 w-8">
                            {String.fromCharCode(65 + index)}.
                          </span>
                          <div className="flex-1">
                            <Input
                              value={option.optionText}
                              onChange={(e) => updateOption(index, 'optionText', e.target.value)}
                              placeholder="Nhập nội dung đáp án... (hỗ trợ LaTeX: $x^2$)"
                              className="w-full"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={option.isCorrect}
                              onChange={(e) => updateOption(index, 'isCorrect', e.target.checked)}
                              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-600">Đúng</span>
                          </div>
                          {options.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOption(index)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        {option.optionText && (
                          <div className="ml-11 pl-1 border-l-2 border-blue-200">
                            <p className="text-xs text-gray-500 mb-1">Preview:</p>
                            <div className="text-sm text-gray-700">
                              {String.fromCharCode(65 + index)}. <LatexRenderer content={option.optionText} />
                              {option.isCorrect && <span className="ml-2 text-green-600">✓</span>}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <>
                      <span className="mr-2">Đang tạo...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Tạo câu hỏi
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}


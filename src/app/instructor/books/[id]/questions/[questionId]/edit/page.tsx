'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  FileQuestion,
  AlertCircle,
  GripVertical
} from 'lucide-react';
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
import { bookApiService, BookQuestion, QuestionOption } from '@/services/bookApi';
import { Checkbox } from '@/components/ui/checkbox';

interface OptionForm {
  id?: number;
  text: string;
  isCorrect: boolean;
  pointsValue: number;
  orderIndex: number;
}

export default function EditQuestionPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params?.id ? parseInt(params.id as string) : null;
  const questionId = params?.questionId ? parseInt(params.questionId as string) : null;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState('1');
  const [difficulty, setDifficulty] = useState('1');
  const [explanation, setExplanation] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [orderIndex, setOrderIndex] = useState('0');
  const [chapterId, setChapterId] = useState('');
  const [options, setOptions] = useState<OptionForm[]>([]);

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

      const questions = await bookApiService.getBookQuestions(bookId, 1, 1000);
      const question = questions.find(q => q.id === questionId);

      if (question) {
        setQuestionText(question.question);
        setQuestionType(question.questionType.toString());
        setDifficulty(question.difficulty.toString());
        setExplanation(question.explanation || '');
        setCorrectAnswer(question.correctAnswer || '');
        setOrderIndex(question.orderIndex.toString());
        setChapterId(question.chapterId?.toString() || '');

        // Map options
        if (question.options && question.options.length > 0) {
          const mappedOptions = question.options.map((opt, idx) => ({
            id: opt.Id || opt.id,
            text: opt.OptionText || opt.optionText || '',
            isCorrect: opt.IsCorrect || opt.isCorrect || false,
            pointsValue: opt.PointsValue || opt.pointsValue || 0,
            orderIndex: opt.OrderIndex || opt.orderIndex || idx
          }));
          setOptions(mappedOptions);
        }
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

  const handleAddOption = () => {
    setOptions([
      ...options,
      {
        text: '',
        isCorrect: false,
        pointsValue: 0,
        orderIndex: options.length
      }
    ]);
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, field: keyof OptionForm, value: any) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!questionText.trim()) {
      alert('Vui lòng nhập câu hỏi!');
      return;
    }

    // Validate options for multiple choice
    if (questionType === '1' && options.length < 2) {
      alert('Câu hỏi trắc nghiệm phải có ít nhất 2 lựa chọn!');
      return;
    }

    if (questionType === '1' && !options.some(opt => opt.isCorrect)) {
      alert('Vui lòng chọn ít nhất một đáp án đúng!');
      return;
    }

    try {
      setSaving(true);

      // Prepare request body
      const requestBody = {
        id: questionId,
        bookId,
        chapterId: chapterId ? parseInt(chapterId) : null,
        question: questionText,
        questionType: parseInt(questionType),
        difficulty: parseInt(difficulty),
        explanation: explanation || null,
        correctAnswer: correctAnswer || null,
        orderIndex: parseInt(orderIndex),
        options: questionType === '1' ? options.map((opt, idx) => ({
          id: opt.id,
          optionText: opt.text,
          isCorrect: opt.isCorrect,
          pointsValue: opt.pointsValue,
          orderIndex: idx
        })) : []
      };

      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      if (!token) {
        alert('Vui lòng đăng nhập!');
        router.push('/auth/login');
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/questions/${questionId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(requestBody)
        }
      );

      const result = await response.json();

      if (response.ok && (result.success || result.Success)) {
        alert('Cập nhật câu hỏi thành công!');
        router.push(`/instructor/books/${bookId}/questions/${questionId}`);
      } else {
        throw new Error(result.message || result.Message || 'Không thể cập nhật câu hỏi');
      }
    } catch (err: any) {
      console.error('Error updating question:', err);
      alert(err.message || 'Có lỗi xảy ra khi cập nhật câu hỏi');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md">
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Lỗi</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button onClick={() => router.push(`/instructor/books/questions`)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
            onClick={() => router.push(`/instructor/books/${bookId}/questions/${questionId}`)}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại chi tiết câu hỏi
          </Button>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
            <FileQuestion className="w-10 h-10 text-blue-600" />
            Chỉnh sửa Câu hỏi
          </h1>
          <p className="text-gray-600 mt-2">ID: #{questionId}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md mb-6">
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
              <CardDescription>Nội dung và cấu hình câu hỏi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Question Text */}
              <div className="grid gap-2">
                <Label htmlFor="question">
                  Câu hỏi <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="question"
                  placeholder="Nhập nội dung câu hỏi..."
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Question Type */}
                <div className="grid gap-2">
                  <Label htmlFor="questionType">Loại câu hỏi</Label>
                  <Select value={questionType} onValueChange={setQuestionType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Trắc nghiệm</SelectItem>
                      <SelectItem value="2">Đúng/Sai</SelectItem>
                      <SelectItem value="3">Tự luận</SelectItem>
                      <SelectItem value="4">Điền khuyết</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Difficulty */}
                <div className="grid gap-2">
                  <Label htmlFor="difficulty">Độ khó</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Dễ</SelectItem>
                      <SelectItem value="2">Trung bình</SelectItem>
                      <SelectItem value="3">Khó</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Order Index */}
                <div className="grid gap-2">
                  <Label htmlFor="orderIndex">Thứ tự</Label>
                  <Input
                    id="orderIndex"
                    type="number"
                    value={orderIndex}
                    onChange={(e) => setOrderIndex(e.target.value)}
                    min="0"
                  />
                </div>
              </div>

              {/* Explanation */}
              <div className="grid gap-2">
                <Label htmlFor="explanation">Giải thích</Label>
                <Textarea
                  id="explanation"
                  placeholder="Giải thích đáp án (tùy chọn)..."
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Correct Answer (for non-multiple choice) */}
              {questionType !== '1' && (
                <div className="grid gap-2">
                  <Label htmlFor="correctAnswer">Đáp án đúng</Label>
                  <Input
                    id="correctAnswer"
                    placeholder="Nhập đáp án đúng..."
                    value={correctAnswer}
                    onChange={(e) => setCorrectAnswer(e.target.value)}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Options (for multiple choice) */}
          {questionType === '1' && (
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Các lựa chọn</CardTitle>
                    <CardDescription>Thêm các đáp án cho câu hỏi trắc nghiệm</CardDescription>
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddOption}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm lựa chọn
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {options.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileQuestion className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">Chưa có lựa chọn nào</p>
                    <p className="text-xs mt-1">Nhấn "Thêm lựa chọn" để bắt đầu</p>
                  </div>
                ) : (
                  options.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border-2 border-gray-200"
                    >
                      <div className="flex items-center gap-2 pt-2">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-700 min-w-[24px]">
                          {String.fromCharCode(65 + index)}.
                        </span>
                      </div>

                      <div className="flex-1 space-y-3">
                        <Input
                          placeholder="Nhập nội dung lựa chọn..."
                          value={option.text}
                          onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                          required
                        />

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`correct-${index}`}
                              checked={option.isCorrect}
                              onCheckedChange={(checked: boolean) =>
                                handleOptionChange(index, 'isCorrect', checked)
                              }
                            />
                            <Label htmlFor={`correct-${index}`} className="text-sm cursor-pointer">
                              Đáp án đúng
                            </Label>
                          </div>

                          <div className="flex items-center gap-2">
                            <Label htmlFor={`points-${index}`} className="text-sm">
                              Điểm:
                            </Label>
                            <Input
                              id={`points-${index}`}
                              type="number"
                              value={option.pointsValue}
                              onChange={(e) =>
                                handleOptionChange(index, 'pointsValue', parseInt(e.target.value) || 0)
                              }
                              className="w-20"
                              min="0"
                            />
                          </div>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveOption(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/instructor/books/${bookId}/questions/${questionId}`)}
              disabled={saving}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Lưu thay đổi
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

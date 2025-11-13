'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, CheckCircle2, XCircle, BookOpen, FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  useAssignmentQuestions,
  useCreateAssignmentQuestion,
  useDeleteAssignmentQuestion,
  CreateQuestionRequest
} from '@/hooks/useAssignments';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImportQuestionsFromBook } from '@/components/ImportQuestionsFromBook';
import { ImportQuestionsFromWord } from '@/components/ImportQuestionsFromWord';

interface AssignmentQuestionManagerProps {
  assignmentId: number;
}

const questionTypeLabels: Record<number, string> = {
  0: 'Trắc nghiệm',
  1: 'Đúng/Sai',
  2: 'Tự luận ngắn',
  3: 'Tiêu đề'
};

const difficultyConfig: Record<number, { label: string; color: string }> = {
  0: { label: 'Dễ', color: 'bg-green-100 text-green-700' },
  1: { label: 'Dễ', color: 'bg-green-100 text-green-700' },
  2: { label: 'Trung bình', color: 'bg-yellow-100 text-yellow-700' },
  3: { label: 'Khó', color: 'bg-red-100 text-red-700' }
};

interface QuestionOption {
  OptionText: string;
  IsCorrect: boolean;
  PointsValue?: number;
  OrderIndex?: number;
}

export function AssignmentQuestionManager({ assignmentId }: AssignmentQuestionManagerProps) {
  const { questions, loading, error, refetch } = useAssignmentQuestions(assignmentId);
  const { createQuestion, loading: creating } = useCreateAssignmentQuestion();
  const { deleteQuestion, loading: deleting } = useDeleteAssignmentQuestion();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showImportWordModal, setShowImportWordModal] = useState(false);
  const [formData, setFormData] = useState<CreateQuestionRequest>({
    QuestionContent: '',
    QuestionType: 1,
    DifficultyLevel: 1,
    DefaultPoints: 1,
    ExplanationContent: '',
    Options: []
  });

  const handleDelete = async (questionId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) return;
    
    const result = await deleteQuestion(assignmentId, questionId);
    if (result.success) {
      refetch();
    } else {
      alert(result.error || 'Xóa câu hỏi thất bại');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createQuestion(assignmentId, formData);
    if (result.success) {
      setShowCreateForm(false);
      setFormData({
        QuestionContent: '',
        QuestionType: 1,
        DifficultyLevel: 1,
        DefaultPoints: 1,
        ExplanationContent: '',
        Options: []
      });
      refetch();
    } else {
      alert(result.error || 'Tạo câu hỏi thất bại');
    }
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      Options: [...(prev.Options || []), {
        OptionText: '',
        IsCorrect: false,
        PointsValue: 0,
        OrderIndex: (prev.Options?.length || 0)
      }]
    }));
  };

  const removeOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      Options: prev.Options?.filter((_, i) => i !== index) || []
    }));
  };

  // Helper: render raw HTML/MathML safely (content is trusted from backend)
  const renderHTML = (html?: string) => ({ __html: (html || '').trim() });
  const cleanOption = (s?: string) => {
    const raw = (s || '').replace(/<!---->/g, '').trim();
    return raw.replace(/^\s*[A-Da-d]\s*[:\.]\s*/, '');
  };

  // Trigger MathJax typesetting when questions load/change
  useEffect(() => {
    const w = window as any;
    if (w && w.MathJax && typeof w.MathJax.typesetPromise === 'function') {
      w.MathJax.typesetPromise?.();
    }
  }, [questions]);

  const updateOption = (index: number, field: keyof QuestionOption, value: any) => {
    setFormData(prev => ({
      ...prev,
      Options: prev.Options?.map((opt, i) => 
        i === index ? { ...opt, [field]: value } : opt
      ) || []
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Quản lý câu hỏi</h2>
          <p className="text-sm text-gray-600 mt-1">
            Tổng số câu hỏi: {questions.length}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowImportWordModal(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FileUp className="w-4 h-4" />
            Import từ Word
          </Button>
          <Button
            onClick={() => setShowImportModal(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Import từ sách
          </Button>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Thêm câu hỏi
          </Button>
        </div>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Tạo câu hỏi mới</CardTitle>
            <CardDescription>Thêm câu hỏi mới vào bài tập này</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nội dung câu hỏi *
                </label>
                <Textarea
                  value={formData.QuestionContent}
                  onChange={(e) => setFormData(prev => ({ ...prev, QuestionContent: e.target.value }))}
                  placeholder="Nhập nội dung câu hỏi..."
                  required
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Loại câu hỏi *
                  </label>
                  <Select
                    value={formData.QuestionType.toString()}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, QuestionType: parseInt(value) }))}
                  >
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

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Độ khó *
                  </label>
                  <Select
                    value={formData.DifficultyLevel.toString()}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, DifficultyLevel: parseInt(value) }))}
                  >
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

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Điểm số *
                  </label>
                  <Input
                    type="number"
                    value={formData.DefaultPoints}
                    onChange={(e) => setFormData(prev => ({ ...prev, DefaultPoints: parseFloat(e.target.value) || 0 }))}
                    min="0"
                    step="0.1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Giải thích
                </label>
                <Textarea
                  value={formData.ExplanationContent || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, ExplanationContent: e.target.value }))}
                  placeholder="Giải thích đáp án..."
                  rows={2}
                />
              </div>

              {(formData.QuestionType === 1 || formData.QuestionType === 4) && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">
                      Đáp án
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addOption}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Thêm đáp án
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.Options?.map((option, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 border rounded">
                        <span className="text-sm font-medium w-6">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <Input
                          value={option.OptionText}
                          onChange={(e) => updateOption(index, 'OptionText', e.target.value)}
                          placeholder="Nội dung đáp án..."
                          className="flex-1"
                        />
                        <label className="flex items-center gap-1 text-sm">
                          <input
                            type="checkbox"
                            checked={option.IsCorrect}
                            onChange={(e) => updateOption(index, 'IsCorrect', e.target.checked)}
                            className="w-4 h-4"
                          />
                          Đúng
                        </label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(index)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating ? 'Đang tạo...' : 'Tạo câu hỏi'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Đang tải câu hỏi...</p>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-6">
            <p className="text-red-600">Lỗi: {error}</p>
          </CardContent>
        </Card>
      ) : questions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Chưa có câu hỏi nào. Hãy thêm câu hỏi đầu tiên.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <style>{`
            /* Force block equations inline inside options */
            .option-math .mjx-display { display: inline !important; margin: 0 !important; }
            .option-math .mjx-chtml { line-height: 1.2; }
          `}</style>
          {questions.map((q: any, index: number) => {
            const questionId = q.Id || q.id;
            const questionContent = q.QuestionContent || q.questionContent || q.question || '';
            const questionType = q.QuestionType || q.questionType || 1;
            const difficulty = q.DifficultyLevel !== undefined ? q.DifficultyLevel : (q.difficultyLevel || 1);
            const options = q.Options || q.options || q.QuestionOptions || [];
            
            return (
              <Card key={questionId || index}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-500">
                          Câu {index + 1}
                        </span>
                        <Badge className={difficultyConfig[difficulty]?.color || difficultyConfig[1].color}>
                          {difficultyConfig[difficulty]?.label || 'Dễ'}
                        </Badge>
                        <Badge variant="outline">
                          {questionTypeLabels[questionType] || 'Trắc nghiệm'}
                        </Badge>
                        <Badge variant="secondary">
                          {q.DefaultPoints || q.defaultPoints || 1} điểm
                        </Badge>
                      </div>
                      <CardTitle className="text-base mt-2">
                        <span dangerouslySetInnerHTML={renderHTML(questionContent)} />
                      </CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(questionId)}
                      disabled={deleting}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                {(options.length > 0) && (
                  <CardContent>
                    <div className="space-y-2">
                      {options.map((opt: any, optIndex: number) => (
                        <div
                          key={optIndex}
                          className={`flex items-center gap-2 p-2 rounded ${
                            opt.IsCorrect || opt.isCorrect
                              ? 'bg-green-50 border border-green-200'
                              : 'bg-gray-50'
                          }`}
                        >
                          <span className="text-sm font-medium w-6">
                            {String.fromCharCode(65 + optIndex)}.
                          </span>
                          <span className="flex-1 text-sm option-math" dangerouslySetInnerHTML={renderHTML(
                            cleanOption(opt.OptionText || opt.optionText || opt.OptionContent || opt.optionContent || '')
                          )} />
                          {(opt.IsCorrect || opt.isCorrect) && (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                      ))}
                    </div>
                    {q.ExplanationContent || q.explanationContent ? (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm font-medium text-blue-900 mb-1">Giải thích:</p>
                        <div className="text-sm text-blue-800" dangerouslySetInnerHTML={renderHTML(q.ExplanationContent || q.explanationContent)} />
                      </div>
                    ) : null}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {showImportModal && (
        <ImportQuestionsFromBook
          assignmentId={assignmentId}
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            setShowImportModal(false);
            refetch();
          }}
        />
      )}

      {showImportWordModal && (
        <ImportQuestionsFromWord
          assignmentId={assignmentId}
          onClose={() => setShowImportWordModal(false)}
          onImported={() => {
            setShowImportWordModal(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}

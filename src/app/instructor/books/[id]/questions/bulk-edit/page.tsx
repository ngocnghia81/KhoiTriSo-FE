'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  DocumentTextIcon,
  CalculatorIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useBookQuestions, useCreateBulkBookQuestions } from '@/hooks/useBooks';
import { BookQuestionDto } from '@/types/book';
import { LatexEditor, LatexRenderer } from '@/components/LatexRenderer';

interface BulkEditQuestionsPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface QuestionFormData {
  id?: number;
  questionText: string;
  questionType: number;
  difficultyLevel: number;
  defaultPoints: number;
  explanationContent: string;
  isActive: boolean;
  options: QuestionOptionData[];
}

interface QuestionOptionData {
  id?: number;
  questionId?: number;
  optionText: string;
  isCorrect: boolean;
  orderIndex: number;
}

export default function BulkEditQuestionsPage({ params }: BulkEditQuestionsPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const bookId = parseInt(resolvedParams.id);
  
  const [questions, setQuestions] = useState<QuestionFormData[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const { data: existingQuestions, loading, refetch } = useBookQuestions(bookId, 1, 100);
  const { createBulkQuestions, loading: createLoading } = useCreateBulkBookQuestions();

  // Initialize with existing questions or empty template
  useEffect(() => {
    if (existingQuestions?.items) {
      const formattedQuestions = existingQuestions.items.map(q => ({
        id: q.id,
        questionText: q.questionText,
        questionType: q.questionType,
        difficultyLevel: q.difficultyLevel,
        defaultPoints: q.defaultPoints || 0.25,
        explanationContent: q.explanationContent || '',
        isActive: q.isActive,
        options: (q.options || []).map(opt => ({
          id: opt.id,
          questionId: opt.questionId,
          optionText: opt.optionText,
          isCorrect: opt.isCorrect,
          orderIndex: opt.orderIndex
        }))
      }));
      setQuestions(formattedQuestions);
    } else if (questions.length === 0) {
      // Add initial empty question
      addNewQuestion();
    }
  }, [existingQuestions]);

  const addNewQuestion = () => {
    const newQuestion: QuestionFormData = {
      questionText: '',
      questionType: 1,
      difficultyLevel: 0,
      defaultPoints: 0.25,
      explanationContent: '',
      isActive: true,
      options: []
    };
    setQuestions([...questions, newQuestion]);
    setCurrentQuestionIndex(questions.length);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, i) => i !== index);
      setQuestions(newQuestions);
      if (currentQuestionIndex >= newQuestions.length) {
        setCurrentQuestionIndex(newQuestions.length - 1);
      }
    }
  };

  const updateCurrentQuestion = (field: keyof QuestionFormData, value: any) => {
    const newQuestions = [...questions];
    newQuestions[currentQuestionIndex] = {
      ...newQuestions[currentQuestionIndex],
      [field]: value
    };
    setQuestions(newQuestions);
  };

  const addOption = () => {
    const newOptions = [...questions[currentQuestionIndex].options];
    newOptions.push({
      optionText: '',
      isCorrect: false,
      orderIndex: newOptions.length
    });
    updateCurrentQuestion('options', newOptions);
  };

  const removeOption = (optionIndex: number) => {
    const newOptions = questions[currentQuestionIndex].options.filter((_, i) => i !== optionIndex);
    updateCurrentQuestion('options', newOptions);
  };

  const updateOption = (optionIndex: number, field: keyof QuestionOptionData, value: any) => {
    const newOptions = [...questions[currentQuestionIndex].options];
    newOptions[optionIndex] = {
      ...newOptions[optionIndex],
      [field]: value
    };
    updateCurrentQuestion('options', newOptions);
  };

  const saveAllQuestions = async () => {
    setSaving(true);
    try {
      // Filter out empty questions and prepare data
      const validQuestions = questions
        .filter(question => question.questionText.trim())
        .map((question, index) => ({
          QuestionContent: question.questionText,
          QuestionType: question.questionType,
          DifficultyLevel: question.difficultyLevel,
          DefaultPoints: question.defaultPoints,
          Points: [question.defaultPoints], // Add Points as required
          ExplanationContent: question.explanationContent,
          QuestionImage: '',
          VideoUrl: '',
          TimeLimit: 0,
          SubjectType: '',
          OrderIndex: index,
          ChapterId: 0,
          Options: question.options.map((option, optIndex) => ({
            OptionText: option.optionText,
            IsCorrect: option.isCorrect,
            PointsValue: 0,
            OrderIndex: optIndex
          }))
        }));

      if (validQuestions.length === 0) {
        alert('Vui lòng nhập ít nhất một câu hỏi có nội dung!');
        return;
      }

      console.log('Sending bulk questions data:', {
        bookId,
        questionsCount: validQuestions.length,
        data: validQuestions
      });

      const result = await createBulkQuestions(bookId, validQuestions);
      
      if (result) {
        console.log('Bulk questions created successfully:', result);
        await refetch();
        router.push(`/instructor/books/${bookId}/questions`);
      } else {
        alert('Có lỗi xảy ra khi lưu câu hỏi. Vui lòng thử lại!');
      }
    } catch (error) {
      console.error('Error saving questions:', error);
      alert('Có lỗi xảy ra khi lưu câu hỏi. Vui lòng thử lại!');
    } finally {
      setSaving(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex] || questions[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Soạn nhiều câu hỏi</h1>
              <p className="text-sm text-gray-600">Sách ID: {bookId}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                showPreview 
                  ? 'text-blue-600 bg-blue-50 border border-blue-200' 
                  : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              {showPreview ? 'Ẩn xem trước' : 'Hiện xem trước'}
            </button>
            
            <button
              onClick={addNewQuestion}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Thêm câu hỏi
            </button>
            
            <button
              onClick={saveAllQuestions}
              disabled={saving || questions.length === 0}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Đang lưu...' : 'Lưu tất cả'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Question Editor */}
        <div className={`${showPreview ? 'w-1/2' : 'w-full'} bg-white border-r border-gray-200 flex flex-col`}>
          {/* Question Navigation */}
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="p-1 rounded text-gray-600 hover:text-gray-900 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                
                <span className="text-sm font-medium text-gray-700">
                  Câu {currentQuestionIndex + 1} / {questions.length}
                </span>
                
                <button
                  onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                  disabled={currentQuestionIndex === questions.length - 1}
                  className="p-1 rounded text-gray-600 hover:text-gray-900 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Nhập điểm:</span>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  max="1"
                  value={currentQuestion?.defaultPoints || 0.25}
                  onChange={(e) => updateCurrentQuestion('defaultPoints', parseFloat(e.target.value))}
                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                
                <span className="text-sm text-gray-500">
                  {currentQuestion?.questionType === 1 ? 'Trắc nghiệm' : 'Tự luận'}
                </span>
                
                {questions.length > 1 && (
                  <button
                    onClick={() => removeQuestion(currentQuestionIndex)}
                    className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                    title="Xóa câu hỏi"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Question Editor */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Question Content */}
              <LatexEditor
                value={currentQuestion?.questionText || ''}
                onChange={(value) => updateCurrentQuestion('questionText', value)}
                placeholder="Nhập nội dung câu hỏi... (Hỗ trợ LaTeX: $x^2 + y^2 = z^2$)"
                rows={4}
              />

              {/* Question Settings */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại câu hỏi
                  </label>
                  <select
                    value={currentQuestion?.questionType || 1}
                    onChange={(e) => updateCurrentQuestion('questionType', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={1}>Trắc nghiệm</option>
                    <option value={2}>Tự luận</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Độ khó
                  </label>
                  <select
                    value={currentQuestion?.difficultyLevel || 0}
                    onChange={(e) => updateCurrentQuestion('difficultyLevel', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={0}>Dễ</option>
                    <option value={1}>Trung bình</option>
                    <option value={2}>Khó</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={currentQuestion?.isActive || true}
                      onChange={(e) => updateCurrentQuestion('isActive', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-900">
                      Hoạt động
                    </label>
                  </div>
                </div>
              </div>

              {/* Explanation */}
              <LatexEditor
                value={currentQuestion?.explanationContent || ''}
                onChange={(value) => updateCurrentQuestion('explanationContent', value)}
                placeholder="Nhập giải thích cho câu hỏi..."
                rows={2}
              />

              {/* Options for Multiple Choice */}
              {currentQuestion?.questionType === 1 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Các lựa chọn *
                    </label>
                    <button
                      type="button"
                      onClick={addOption}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                    >
                      <PlusIcon className="h-3 w-3 mr-1" />
                      Thêm đáp án
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {(currentQuestion?.options || []).map((option, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 w-6">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <input
                          type="text"
                          value={option.optionText || ''}
                          onChange={(e) => updateOption(index, 'optionText', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Nhập nội dung đáp án..."
                        />
                        <input
                          type="checkbox"
                          checked={option.isCorrect || false}
                          onChange={(e) => updateOption(index, 'isCorrect', e.target.checked)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span className="text-xs text-gray-500">Đúng</span>
                        {(currentQuestion?.options || []).length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeOption(index)}
                            className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                            title="Xóa đáp án"
                          >
                            <TrashIcon className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {(!currentQuestion?.options || currentQuestion.options.length === 0) && (
                    <div className="text-center py-6 text-gray-500 text-sm border-2 border-dashed border-gray-300 rounded-lg">
                      Chưa có đáp án nào. Nhấn "Thêm đáp án" để bắt đầu.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Question Preview */}
        {showPreview && (
          <div className="w-1/2 bg-white overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Xem trước câu hỏi</h2>
              
              <div className="space-y-6">
                {questions.map((question, index) => (
                  <div key={index} className={`p-4 border rounded-lg ${
                    index === currentQuestionIndex ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">Câu {index + 1}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          question.difficultyLevel === 0 ? 'bg-green-100 text-green-800' :
                          question.difficultyLevel === 1 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {question.difficultyLevel === 0 ? 'Dễ' :
                           question.difficultyLevel === 1 ? 'Trung bình' : 'Khó'}
                        </span>
                        <span className="text-xs text-gray-500">{question.defaultPoints} điểm</span>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <LatexRenderer content={question.questionText || 'Chưa có nội dung câu hỏi'} />
                    </div>
                    
                    {question.questionType === 1 && question.options && question.options.length > 0 && (
                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className={`text-sm p-2 rounded ${
                            option.isCorrect ? 'bg-green-50 text-green-800' : 'bg-gray-50 text-gray-700'
                          }`}>
                            {String.fromCharCode(65 + optIndex)}. <LatexRenderer content={option.optionText || ''} />
                            {option.isCorrect && <span className="ml-2 text-green-600">✓</span>}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {question.explanationContent && (
                      <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-600">
                        <strong>Giải thích:</strong> <LatexRenderer content={question.explanationContent || ''} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

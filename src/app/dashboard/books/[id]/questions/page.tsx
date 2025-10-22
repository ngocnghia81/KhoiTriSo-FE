'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  QuestionMarkCircleIcon,
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { useBookQuestions, useUpdateBookQuestion, useDeleteBookQuestion, useCreateBookQuestion } from '@/hooks/useBooks';
import { BookQuestionDto } from '@/types/book';

interface BookQuestionsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function BookQuestionsPage({ params }: BookQuestionsPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const bookId = parseInt(resolvedParams.id);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [editingQuestion, setEditingQuestion] = useState<BookQuestionDto | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<BookQuestionDto | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);

  const { data: questionsData, loading, error, refetch } = useBookQuestions(bookId, page, pageSize);
  const { updateQuestion, loading: updateLoading } = useUpdateBookQuestion();
  const { deleteQuestion, loading: deleteLoading } = useDeleteBookQuestion();
  const { createQuestion, loading: createLoading } = useCreateBookQuestion();

  const questions = questionsData?.items || [];
  const totalQuestions = questionsData?.total || 0;

  const handleUpdateQuestion = async (question: BookQuestionDto) => {
    const result = await updateQuestion(bookId, question.id, {
      QuestionContent: question.questionText,
      QuestionType: question.questionType,
      DifficultyLevel: question.difficultyLevel,
      DefaultPoints: question.defaultPoints || 0.25,
      ExplanationContent: question.explanationContent || '',
      QuestionImage: '',
      VideoUrl: '',
      TimeLimit: 0,
      SubjectType: '',
      OrderIndex: question.orderIndex,
      ChapterId: question.chapterId || 0,
      Options: (question.options || []).map(option => ({
        OptionText: option.optionText,
        IsCorrect: option.isCorrect,
        PointsValue: 0,
        OrderIndex: option.orderIndex
      }))
    });
    
    if (result) {
      setEditingQuestion(null);
      refetch();
    }
  };

  const handleDeleteQuestion = async (question: BookQuestionDto) => {
    const result = await deleteQuestion(question.id);
    if (result) {
      setShowDeleteModal(null);
      refetch();
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleImportFile = async () => {
    if (!importFile) return;
    
    setImportLoading(true);
    try {
      // TODO: Implement API call when backend is ready
      console.log('Importing file:', importFile.name);
      
      // Mock success
      setTimeout(() => {
        setImportLoading(false);
        setShowImportModal(false);
        setImportFile(null);
        refetch();
        // You could add a success toast here
      }, 2000);
    } catch (error) {
      setImportLoading(false);
      console.error('Import failed:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
    }
  };

  const handleCreateQuestion = async (questionData: any) => {
    const result = await createQuestion(bookId, questionData);
    if (result) {
      setShowCreateModal(false);
      refetch();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Quản lý câu hỏi</h1>
            <p className="text-sm text-gray-600">Sách ID: {bookId}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => router.push(`/dashboard/books/${bookId}/questions/bulk-edit`)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            Soạn nhiều câu hỏi
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
            Import từ Word
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Thêm câu hỏi
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <QuestionMarkCircleIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="ml-4">
            <dl>
              <dt className="text-sm font-medium text-gray-500">Tổng câu hỏi</dt>
              <dd className="text-2xl font-bold text-gray-900">{totalQuestions}</dd>
            </dl>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((question) => (
          <div key={question.id} className="bg-white shadow-lg rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-medium text-gray-900">
                    Câu hỏi {question.orderIndex}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    question.difficultyLevel === 0 ? 'bg-green-100 text-green-800' :
                    question.difficultyLevel === 1 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {question.difficultyLevel === 0 ? 'Dễ' :
                     question.difficultyLevel === 1 ? 'Trung bình' : 'Khó'}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    question.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {question.isActive ? (
                      <>
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        Hoạt động
                      </>
                    ) : (
                      <>
                        <XCircleIcon className="h-3 w-3 mr-1" />
                        Tạm dừng
                      </>
                    )}
                  </span>
                </div>
                
                <p className="text-gray-900 mb-2">{question.questionText}</p>
                
                {question.explanationContent && (
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Giải thích:</strong> {question.explanationContent}
                  </p>
                )}
                
                {question.options && question.options.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Các lựa chọn:</p>
                    <div className="space-y-1">
                      {question.options.map((option, index) => (
                        <div key={option.id || `option-${index}`} className={`text-sm p-2 rounded ${
                          option.isCorrect ? 'bg-green-50 text-green-800' : 'bg-gray-50 text-gray-700'
                        }`}>
                          {String.fromCharCode(65 + index)}. {option.optionText}
                          {option.isCorrect && <span className="ml-2 text-green-600">✓</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-3 text-xs text-gray-500">
                  Loại: {question.questionType === 1 ? 'Trắc nghiệm' : 'Tự luận'} | 
                  Điểm: {question.defaultPoints} | 
                  Tạo: {new Date(question.createdAt).toLocaleDateString('vi-VN')}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => setEditingQuestion(question)}
                  className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Chỉnh sửa"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setShowDeleteModal(question)}
                  className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                  title="Xóa"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalQuestions > 0 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Trước
          </button>
          <span className="text-sm text-gray-700">
            Trang {page} / {Math.ceil(totalQuestions / pageSize)}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= Math.ceil(totalQuestions / pageSize)}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sau
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Chỉnh sửa câu hỏi</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung câu hỏi
                  </label>
                  <textarea
                    value={editingQuestion.questionText}
                    onChange={(e) => setEditingQuestion({
                      ...editingQuestion,
                      questionText: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giải thích
                  </label>
                  <textarea
                    value={editingQuestion.explanationContent || ''}
                    onChange={(e) => setEditingQuestion({
                      ...editingQuestion,
                      explanationContent: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Độ khó
                    </label>
                    <select
                      value={editingQuestion.difficultyLevel}
                      onChange={(e) => setEditingQuestion({
                        ...editingQuestion,
                        difficultyLevel: parseInt(e.target.value)
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={0}>Dễ</option>
                      <option value={1}>Trung bình</option>
                      <option value={2}>Khó</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Điểm số
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      max="1"
                      value={editingQuestion.defaultPoints || 0.25}
                      onChange={(e) => setEditingQuestion({
                        ...editingQuestion,
                        defaultPoints: parseFloat(e.target.value)
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={editingQuestion.isActive}
                    onChange={(e) => setEditingQuestion({
                      ...editingQuestion,
                      isActive: e.target.checked
                    })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Câu hỏi hoạt động
                  </label>
                </div>

                {/* Options for multiple choice questions */}
                {editingQuestion.questionType === 1 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Các lựa chọn
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const newOptions = [...(editingQuestion.options || [])];
                          newOptions.push({
                            id: Date.now(),
                            questionId: editingQuestion.id,
                            optionText: '',
                            isCorrect: false,
                            orderIndex: newOptions.length
                          });
                          setEditingQuestion({
                            ...editingQuestion,
                            options: newOptions
                          });
                        }}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                      >
                        <PlusIcon className="h-3 w-3 mr-1" />
                        Thêm đáp án
                      </button>
                    </div>
                    
                    {editingQuestion.options && editingQuestion.options.length > 0 && (
                      <div className="space-y-2">
                        {(editingQuestion.options || []).map((option, index) => (
                          <div key={option.id || `option-${index}`} className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-700 w-6">
                              {String.fromCharCode(65 + index)}.
                            </span>
                            <input
                              type="text"
                              value={option.optionText}
                              onChange={(e) => {
                                const newOptions = [...(editingQuestion.options || [])];
                                newOptions[index] = { ...option, optionText: e.target.value };
                                setEditingQuestion({
                                  ...editingQuestion,
                                  options: newOptions
                                });
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Nhập nội dung đáp án..."
                            />
                            <input
                              type="checkbox"
                              checked={option.isCorrect || false}
                              onChange={(e) => {
                                const newOptions = [...(editingQuestion.options || [])];
                                newOptions[index] = { ...option, isCorrect: e.target.checked };
                                setEditingQuestion({
                                  ...editingQuestion,
                                  options: newOptions
                                });
                              }}
                              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            />
                            <span className="text-xs text-gray-500">Đúng</span>
                            {(editingQuestion.options || []).length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newOptions = (editingQuestion.options || []).filter((_, i) => i !== index);
                                  setEditingQuestion({
                                    ...editingQuestion,
                                    options: newOptions
                                  });
                                }}
                                className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                                title="Xóa đáp án"
                              >
                                <TrashIcon className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {(!editingQuestion.options || editingQuestion.options.length === 0) && (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        Chưa có đáp án nào. Nhấn "Thêm đáp án" để bắt đầu.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleUpdateQuestion(editingQuestion)}
                  disabled={updateLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateLoading ? 'Đang cập nhật...' : 'Cập nhật'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Xác nhận xóa</h3>
              <p className="text-sm text-gray-600 mb-6">
                Bạn có chắc chắn muốn xóa câu hỏi này không? Hành động này không thể hoàn tác.
              </p>
              <div className="bg-gray-50 p-3 rounded-lg mb-6">
                <p className="text-sm text-gray-800">{showDeleteModal.questionText}</p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleDeleteQuestion(showDeleteModal)}
                  disabled={deleteLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteLoading ? 'Đang xóa...' : 'Xóa'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Import câu hỏi từ Word</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn file Word (.docx)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                  <div className="space-y-1 text-center">
                    <DocumentDuplicateIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <span>Upload file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          accept=".docx"
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">hoặc kéo thả vào đây</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      Hỗ trợ file Word (.docx) với LaTeX
                    </p>
                  </div>
                </div>
                {importFile && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center">
                      <DocumentDuplicateIcon className="h-5 w-5 text-green-400 mr-2" />
                      <span className="text-sm text-green-800">{importFile.name}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Hướng dẫn format:</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>• Câu hỏi: <code className="bg-gray-100 px-1 rounded">Câu 1: Nội dung câu hỏi?</code></p>
                  <p>• Đáp án: <code className="bg-gray-100 px-1 rounded">A. Đáp án A</code></p>
                  <p>• LaTeX: <code className="bg-gray-100 px-1 rounded">$x^2 + y^2 = z^2$</code></p>
                  <p>• Đáp án đúng: <code className="bg-gray-100 px-1 rounded">Đáp án: A</code></p>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleImportFile}
                  disabled={!importFile || importLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {importLoading ? 'Đang import...' : 'Import'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Question Modal */}
      {showCreateModal && (
        <CreateQuestionModal
          bookId={bookId}
          onSubmit={handleCreateQuestion}
          onClose={() => setShowCreateModal(false)}
          loading={createLoading}
        />
      )}
    </div>
  );
}

// Create Question Modal Component
interface CreateQuestionModalProps {
  bookId: number;
  onSubmit: (questionData: any) => void;
  onClose: () => void;
  loading: boolean;
}

function CreateQuestionModal({ bookId, onSubmit, onClose, loading }: CreateQuestionModalProps) {
  const [questionData, setQuestionData] = useState({
    questionText: '',
    questionType: 1, // 1: Multiple choice, 2: Essay
    difficultyLevel: 0, // 0: Easy, 1: Medium, 2: Hard
    defaultPoints: 0.25,
    explanationContent: '',
    isActive: true,
    options: [] as any[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      QuestionContent: questionData.questionText,
      QuestionType: questionData.questionType,
      DifficultyLevel: questionData.difficultyLevel,
      DefaultPoints: questionData.defaultPoints,
      ExplanationContent: questionData.explanationContent,
      QuestionImage: '',
      VideoUrl: '',
      TimeLimit: 0,
      SubjectType: '',
      OrderIndex: 0,
      ChapterId: 0,
      Options: questionData.options.map((option, index) => ({
        OptionText: option.optionText,
        IsCorrect: option.isCorrect,
        PointsValue: 0,
        OrderIndex: index
      }))
    };
    
    onSubmit(submitData);
  };

  const addOption = () => {
    const newOptions = [...questionData.options];
    newOptions.push({
      id: Date.now(),
      questionId: 0, // Will be set by backend
      optionText: '',
      isCorrect: false,
      orderIndex: newOptions.length
    });
    setQuestionData({
      ...questionData,
      options: newOptions
    });
  };

  const removeOption = (index: number) => {
    const newOptions = questionData.options.filter((_, i) => i !== index);
    setQuestionData({
      ...questionData,
      options: newOptions
    });
  };

  const updateOption = (index: number, field: string, value: any) => {
    const newOptions = [...questionData.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setQuestionData({
      ...questionData,
      options: newOptions
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Thêm câu hỏi mới</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung câu hỏi *
                </label>
                <textarea
                  value={questionData.questionText}
                  onChange={(e) => setQuestionData({
                    ...questionData,
                    questionText: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  required
                  placeholder="Nhập nội dung câu hỏi..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giải thích
                </label>
                <textarea
                  value={questionData.explanationContent}
                  onChange={(e) => setQuestionData({
                    ...questionData,
                    explanationContent: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                  placeholder="Nhập giải thích cho câu hỏi..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại câu hỏi
                  </label>
                  <select
                    value={questionData.questionType}
                    onChange={(e) => setQuestionData({
                      ...questionData,
                      questionType: parseInt(e.target.value)
                    })}
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
                    value={questionData.difficultyLevel}
                    onChange={(e) => setQuestionData({
                      ...questionData,
                      difficultyLevel: parseInt(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={0}>Dễ</option>
                    <option value={1}>Trung bình</option>
                    <option value={2}>Khó</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Điểm số
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    max="1"
                    value={questionData.defaultPoints}
                    onChange={(e) => setQuestionData({
                      ...questionData,
                      defaultPoints: parseFloat(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={questionData.isActive}
                  onChange={(e) => setQuestionData({
                    ...questionData,
                    isActive: e.target.checked
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Câu hỏi hoạt động
                </label>
              </div>

              {/* Options for multiple choice questions */}
              {questionData.questionType === 1 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
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
                  
                  {questionData.options.length > 0 && (
                    <div className="space-y-2">
                      {questionData.options.map((option, index) => (
                        <div key={option.id || `option-${index}`} className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700 w-6">
                            {String.fromCharCode(65 + index)}.
                          </span>
                          <input
                            type="text"
                            value={option.optionText}
                            onChange={(e) => updateOption(index, 'optionText', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Nhập nội dung đáp án..."
                            required
                          />
                          <input
                            type="checkbox"
                            checked={option.isCorrect || false}
                            onChange={(e) => updateOption(index, 'isCorrect', e.target.checked)}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <span className="text-xs text-gray-500">Đúng</span>
                          {questionData.options.length > 1 && (
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
                  )}
                  
                  {questionData.options.length === 0 && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      Chưa có đáp án nào. Nhấn "Thêm đáp án" để bắt đầu.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading || !questionData.questionText || (questionData.questionType === 1 && questionData.options.length === 0)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang tạo...' : 'Tạo câu hỏi'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

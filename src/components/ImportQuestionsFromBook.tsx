'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, X, Check, Loader2, GraduationCap, BookText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { bookApiService, Book, BookChapter, BookQuestion } from '@/services/bookApi';
import { useAttachAssignmentQuestion, useAssignment } from '@/hooks/useAssignments';
import { useCourseLessons, Lesson } from '@/hooks/useLessons';

interface ImportQuestionsFromBookProps {
  assignmentId: number;
  onClose: () => void;
  onSuccess: () => void;
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

export function ImportQuestionsFromBook({ assignmentId, onClose, onSuccess }: ImportQuestionsFromBookProps) {
  // Get assignment to auto-populate course and lesson
  const { assignment, loading: loadingAssignment } = useAssignment(assignmentId);
  
  // Auto-set courseId and lessonId from assignment
  const courseId = assignment?.lesson?.courseId;
  const lessonId = assignment?.lessonId;
  
  const { lessons, loading: loadingLessons } = useCourseLessons(courseId || 0);
  const selectedCourseId = courseId ? courseId.toString() : '';
  const selectedLessonId = lessonId ? lessonId.toString() : '';

  // Book and Question selection
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [chapters, setChapters] = useState<BookChapter[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<string>('all');
  const [questions, setQuestions] = useState<BookQuestion[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<number>>(new Set());
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { attachQuestion, loading: attaching } = useAttachAssignmentQuestion();

  // Auto-load books when assignment is loaded and lessonId is available

  // Load books when lesson is selected
  useEffect(() => {
    if (!selectedLessonId) {
      setBooks([]);
      setSelectedBookId('');
      setChapters([]);
      setQuestions([]);
      setSelectedQuestionIds(new Set());
      return;
    }

    const fetchBooks = async () => {
      try {
        setLoadingBooks(true);
        setError(null);
        const booksData = await bookApiService.getBooks({ page: 1, pageSize: 100 });
        setBooks(booksData);
      } catch (err: any) {
        console.error('Error fetching books:', err);
        setError(err.message || 'Không thể tải danh sách sách');
      } finally {
        setLoadingBooks(false);
      }
    };

    fetchBooks();
  }, [selectedLessonId]);

  // Load chapters when book is selected
  useEffect(() => {
    if (!selectedBookId) {
      setChapters([]);
      setQuestions([]);
      setSelectedQuestionIds(new Set());
      return;
    }

    const fetchChapters = async () => {
      try {
        setLoadingChapters(true);
        setError(null);
        const bookId = parseInt(selectedBookId);
        const chaptersData = await bookApiService.getBookChapters(bookId);
        setChapters(chaptersData);
      } catch (err: any) {
        console.error('Error fetching chapters:', err);
        setError(err.message || 'Không thể tải danh sách chương');
      } finally {
        setLoadingChapters(false);
      }
    };

    fetchChapters();
  }, [selectedBookId]);

  // Load questions when book/chapter is selected
  useEffect(() => {
    if (!selectedBookId) {
      setQuestions([]);
      setSelectedQuestionIds(new Set());
      return;
    }

    const fetchQuestions = async () => {
      try {
        setLoadingQuestions(true);
        setError(null);
        const bookId = parseInt(selectedBookId);
        const allQuestions = await bookApiService.getBookQuestions(bookId, 1, 1000);
        
        // Filter by chapter if selected
        let filteredQuestions = allQuestions;
        if (selectedChapterId !== 'all') {
          const chapterId = parseInt(selectedChapterId);
          filteredQuestions = allQuestions.filter(q => q.chapterId === chapterId);
        }

        setQuestions(filteredQuestions);
        setSelectedQuestionIds(new Set()); // Reset selection
      } catch (err: any) {
        console.error('Error fetching questions:', err);
        setError(err.message || 'Không thể tải danh sách câu hỏi');
      } finally {
        setLoadingQuestions(false);
      }
    };

    fetchQuestions();
  }, [selectedBookId, selectedChapterId]);

  const toggleQuestionSelection = (questionId: number) => {
    setSelectedQuestionIds(prev => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedQuestionIds(new Set(questions.map(q => q.id)));
  };

  const deselectAll = () => {
    setSelectedQuestionIds(new Set());
  };

  const handleImport = async () => {
    if (selectedQuestionIds.size === 0) {
      setError('Vui lòng chọn ít nhất một câu hỏi');
      return;
    }

    try {
      setImporting(true);
      setError(null);

      const questionIds = Array.from(selectedQuestionIds);
      let successCount = 0;
      let failCount = 0;

      // Attach questions one by one with order index
      for (let i = 0; i < questionIds.length; i++) {
        const result = await attachQuestion(assignmentId, questionIds[i], i);
        if (result.success) {
          successCount++;
        } else {
          failCount++;
          console.error(`Failed to attach question ${questionIds[i]}:`, result.error);
        }
      }

      if (failCount > 0) {
        setError(`Đã import ${successCount} câu hỏi, ${failCount} câu hỏi thất bại`);
      } else {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi import câu hỏi');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-6 border w-full max-w-6xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">
              Import câu hỏi từ sách
            </h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {loadingAssignment ? (
          <div className="text-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
            <p className="mt-2 text-sm text-gray-600">Đang tải thông tin bài tập...</p>
          </div>
        ) : !lessonId ? (
          <div className="text-center py-8">
            <p className="text-red-600">Không thể lấy thông tin khóa học và bài học từ bài tập này.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Display Course and Lesson Info (Read-only) */}
            {assignment && (
              <div className="border-b pb-4">
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  <h4 className="font-medium text-gray-900">Thông tin khóa học và bài học</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Khóa học
                    </label>
                    <div className="p-2 bg-gray-50 border rounded text-sm text-gray-700">
                      {assignment.lesson?.title || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bài học
                    </label>
                    <div className="p-2 bg-gray-50 border rounded text-sm text-gray-700">
                      {assignment.lesson?.title || assignment.title || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Book and Question Selection - Only show when lesson is selected */}
            {selectedLessonId && (
            <>
              <div className="border-b pb-4">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-5 h-5 text-green-600" />
                  <h4 className="font-medium text-gray-900">Bước 2: Chọn sách và câu hỏi</h4>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn sách *
                  </label>
                  <Select
                    value={selectedBookId}
                    onValueChange={setSelectedBookId}
                    disabled={loadingBooks}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn sách..." />
                    </SelectTrigger>
                    <SelectContent>
                      {books.map(book => (
                        <SelectItem key={book.id} value={book.id.toString()}>
                          {book.title}
                          {book.totalQuestions && ` (${book.totalQuestions} câu hỏi)`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
            )}

            {/* Chapter Selection */}
          {selectedLessonId && selectedBookId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn chương
              </label>
              <Select
                value={selectedChapterId}
                onValueChange={setSelectedChapterId}
                disabled={loadingChapters}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn chương..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả các chương</SelectItem>
                  {chapters.map(chapter => (
                    <SelectItem key={chapter.id} value={chapter.id.toString()}>
                      {chapter.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

            {/* Questions List */}
            {selectedLessonId && selectedBookId && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Danh sách câu hỏi ({questions.length} câu)
                </label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAll}
                    disabled={questions.length === 0}
                  >
                    Chọn tất cả
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={deselectAll}
                    disabled={selectedQuestionIds.size === 0}
                  >
                    Bỏ chọn tất cả
                  </Button>
                </div>
              </div>

              {loadingQuestions ? (
                <div className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                  <p className="mt-2 text-sm text-gray-600">Đang tải câu hỏi...</p>
                </div>
              ) : questions.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-gray-500">
                    {selectedChapterId === 'all' 
                      ? 'Không có câu hỏi nào trong sách này'
                      : 'Không có câu hỏi nào trong chương này'}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-4">
                  {questions.map((question, index) => {
                    const isSelected = selectedQuestionIds.has(question.id);
                    const questionContent = question.question || '';
                    const difficulty = question.difficulty || 1;
                    const questionType = question.questionType || 1;
                    const options = question.options || [];

                    return (
                      <Card
                        key={question.id}
                        className={`cursor-pointer transition-all ${
                          isSelected ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'
                        }`}
                        onClick={() => toggleQuestionSelection(question.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center ${
                              isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
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
                              </div>
                              <p className="text-sm text-gray-900">{questionContent}</p>
                              {options.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {options.slice(0, 2).map((opt: any, optIndex: number) => (
                                    <div key={optIndex} className="text-xs text-gray-600">
                                      {String.fromCharCode(65 + optIndex)}. {opt.OptionText || opt.optionText || opt.OptionContent || opt.optionContent}
                                      {(opt.IsCorrect || opt.isCorrect) && (
                                        <Badge className="ml-2 bg-green-100 text-green-700 text-xs">Đúng</Badge>
                                      )}
                                    </div>
                                  ))}
                                  {options.length > 2 && (
                                    <div className="text-xs text-gray-500">
                                      ... và {options.length - 2} đáp án khác
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              <div className="mt-3 text-sm text-gray-600">
                Đã chọn: <span className="font-medium">{selectedQuestionIds.size}</span> câu hỏi
              </div>
            </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={importing}>
            Hủy
          </Button>
          <Button
            onClick={handleImport}
            disabled={importing || selectedQuestionIds.size === 0 || !selectedBookId || !selectedLessonId}
          >
            {importing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang import...
              </>
            ) : (
              <>
                Import {selectedQuestionIds.size > 0 && `(${selectedQuestionIds.size})`}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
    
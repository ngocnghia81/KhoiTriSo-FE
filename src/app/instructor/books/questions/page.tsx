'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  FileQuestion,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowLeft
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { bookApiService, BookQuestion, Book, BookChapter } from '@/services/bookApi';
import { useAuth } from '@/contexts/AuthContext';
import { useCallback } from 'react';
import { useBooks } from '@/hooks/useBooks';

const questionTypeLabels: Record<number, string> = {
  0: 'Trắc nghiệm',
  1: 'Đúng/Sai',
  2: 'Tự luận ngắn',
  3: 'Tiêu đề'
};

const difficultyConfig: Record<number, { label: string; color: string }> = {
  1: { label: 'Dễ', color: 'bg-green-100 text-green-700' },
  2: { label: 'Trung bình', color: 'bg-yellow-100 text-yellow-700' },
  3: { label: 'Khó', color: 'bg-red-100 text-red-700' }
};

export default function QuestionsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const userRole = String(user?.role ?? '').toLowerCase();
  const isTeacher = userRole === 'instructor' ;
  const authorId = isTeacher && user?.id ? Number(user.id) : undefined;
  
  const [chapters, setChapters] = useState<BookChapter[]>([]);
  const [questions, setQuestions] = useState<BookQuestion[]>([]);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [bookSearchQuery, setBookSearchQuery] = useState('');
  const [chapterSearchQuery, setChapterSearchQuery] = useState('');
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  
  // Pagination
  const [bookPage, setBookPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // Use useBooks hook for pagination
  const { books, loading: loadingBooks, pagination: booksPagination } = useBooks({
    page: bookPage,
    pageSize: 10,
    search: bookSearchQuery || undefined,
    authorId
  }, { enabled: !!isAuthenticated && (!isTeacher || !!authorId) });

  const totalBookPages = booksPagination?.totalPages || 1;

  const fetchChapters = useCallback(async () => {
    if (!selectedBookId) return;
    
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
  }, [selectedBookId]);

  const fetchQuestions = useCallback(async () => {
    if (!selectedChapterId) return;
    
    try {
      setLoadingQuestions(true);
      setError(null);
      
      const bookId = parseInt(selectedBookId);
      const chapterId = parseInt(selectedChapterId);
      const allQuestions = await bookApiService.getBookQuestions(bookId, 1, 1000);
      
      // Filter questions by chapter
      const filteredQuestions = allQuestions.filter(q => q.chapterId === chapterId);
      
      if (filteredQuestions.length === 0) {
        console.warn('No questions found for chapter, showing all book questions');
        setQuestions(allQuestions);
        setTotalQuestions(allQuestions.length);
      } else {
        setQuestions(filteredQuestions);
        setTotalQuestions(filteredQuestions.length);
      }
      
    } catch (err: any) {
      console.error('Error fetching questions:', err);
      setError(err.message || 'Không thể tải danh sách câu hỏi');
    } finally {
      setLoadingQuestions(false);
    }
  }, [selectedChapterId, selectedBookId]);

  useEffect(() => {
    if (selectedBookId) {
      fetchChapters();
    }
  }, [selectedBookId, fetchChapters]);

  useEffect(() => {
    if (selectedChapterId) {
      fetchQuestions();
    }
  }, [currentPage, selectedChapterId, fetchQuestions]);

  const handleDelete = async (questionId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) return;
    
    try {
      // Add delete API call here
      alert('Chức năng xóa sẽ được triển khai sau');
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Không thể xóa câu hỏi!');
    }
  };

  const filteredQuestions = questions.filter(q => {
    const questionText = q.question || q.QuestionContent || '';
    const questionType = q.questionType ?? q.QuestionType ?? 0;
    const difficulty = q.difficulty ?? q.DifficultyLevel ?? 0;
    
    const matchesSearch = searchQuery === '' || 
      questionText.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || questionType.toString() === selectedType;
    const matchesDifficulty = selectedDifficulty === 'all' || difficulty.toString() === selectedDifficulty;
    
    return matchesSearch && matchesType && matchesDifficulty;
  });

  const totalPages = Math.ceil(totalQuestions / pageSize);

  if (loadingBooks && books.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            onClick={() => router.push('/dashboard/books')}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách sách
          </Button>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
            <FileQuestion className="w-10 h-10 text-blue-600" />
            Quản lý Câu hỏi
          </h1>
          <p className="text-gray-600 mt-2">Chọn sách để xem và quản lý câu hỏi</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tổng câu hỏi</p>
                  <p className="text-2xl font-bold text-blue-600">{totalQuestions}</p>
                </div>
                <FileQuestion className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Dễ</p>
                  <p className="text-2xl font-bold text-green-600">
                    {questions.filter(q => q.difficulty === 1).length}
                  </p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Trung bình</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {questions.filter(q => q.difficulty === 2).length}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Khó</p>
                  <p className="text-2xl font-bold text-red-600">
                    {questions.filter(q => q.difficulty === 3).length}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Book Selection */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Chọn Sách
            </CardTitle>
            <CardDescription>Tìm kiếm và chọn sách để xem câu hỏi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Input for Books */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm sách theo tên..."
                value={bookSearchQuery}
                onChange={(e) => {
                  setBookSearchQuery(e.target.value);
                  setBookPage(1);
                }}
                className="pl-10"
              />
            </div>

            {loadingBooks ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Đang tải sách...</p>
              </div>
            ) : (
              <>
            {/* Books Grid */}
                {books.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">Không tìm thấy sách nào</p>
                  </div>
                ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-1">
                    {books.map((book) => (
                  <button
                    key={book.id}
                    onClick={() => setSelectedBookId(book.id.toString())}
                    className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                      selectedBookId === book.id.toString()
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{book.title}</p>
                        <p className="text-xs text-gray-500 mt-1">ID: {book.id}</p>
                        {book.totalQuestions !== undefined && (
                          <p className="text-xs text-blue-600 mt-1">
                            {book.totalQuestions} câu hỏi
                          </p>
                        )}
                      </div>
                      {selectedBookId === book.id.toString() && (
                        <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
            </div>
                )}

                {/* Book Pagination */}
                {totalBookPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBookPage((p) => Math.max(1, p - 1))}
                      disabled={bookPage === 1 || loadingBooks}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Trang trước
                    </Button>
                    <div className="text-sm text-gray-500">
                      Trang {bookPage} / {totalBookPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBookPage((p) => Math.min(totalBookPages, p + 1))}
                      disabled={bookPage >= totalBookPages || loadingBooks}
                    >
                      Trang sau
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
              </div>
                )}
              </>
            )}

            {selectedBookId && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">
                    Đã chọn: {books.find(b => b.id.toString() === selectedBookId)?.title || 'Đang tải...'}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedBookId('')}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chapter Selection - Only show when book is selected */}
        {selectedBookId && (
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Chọn Chương
              </CardTitle>
              <CardDescription>Chọn chương để xem câu hỏi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Input for Chapters */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm chương..."
                  value={chapterSearchQuery}
                  onChange={(e) => setChapterSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {loadingChapters ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Đang tải chương...</p>
                </div>
              ) : (
                <>
                  {/* Chapters List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-80 overflow-y-auto p-1">
                    {chapters
                      .filter(ch => 
                        chapterSearchQuery === '' || 
                        ch.title.toLowerCase().includes(chapterSearchQuery.toLowerCase()) ||
                        ch.id.toString().includes(chapterSearchQuery)
                      )
                      .map((chapter) => (
                        <button
                          key={chapter.id}
                          onClick={() => setSelectedChapterId(chapter.id.toString())}
                          className={`p-3 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                            selectedChapterId === chapter.id.toString()
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{chapter.title}</p>
                              <p className="text-xs text-gray-500 mt-1">Chương {chapter.orderIndex}</p>
                            </div>
                            {selectedChapterId === chapter.id.toString() && (
                              <CheckCircle2 className="w-5 h-5 text-purple-500 flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      ))}
                  </div>

                  {chapters.filter(ch => 
                    chapterSearchQuery === '' || 
                    ch.title.toLowerCase().includes(chapterSearchQuery.toLowerCase()) ||
                    ch.id.toString().includes(chapterSearchQuery)
                  ).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">Không tìm thấy chương nào</p>
                    </div>
                  )}
                </>
              )}

              {selectedChapterId && (
                <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-purple-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-purple-900">
                      Đã chọn: {chapters.find(ch => ch.id.toString() === selectedChapterId)?.title}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedChapterId('')}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Filters & Actions - Only show when chapter is selected */}
        {selectedChapterId && (
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md mb-6">
            <CardHeader>
              <CardTitle>Bộ lọc & Tìm kiếm</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm câu hỏi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Question Type Filter */}
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Loại câu hỏi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả loại</SelectItem>
                    <SelectItem value="1">Trắc nghiệm</SelectItem>
                    <SelectItem value="2">Đúng/Sai</SelectItem>
                    <SelectItem value="3">Tự luận</SelectItem>
                    <SelectItem value="4">Điền khuyết</SelectItem>
                  </SelectContent>
                </Select>

                {/* Difficulty Filter */}
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Độ khó" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả độ khó</SelectItem>
                    <SelectItem value="1">Dễ</SelectItem>
                    <SelectItem value="2">Trung bình</SelectItem>
                    <SelectItem value="3">Khó</SelectItem>
                  </SelectContent>
                </Select>

                {/* Add Button */}
                <Button
                  onClick={() => router.push(`/dashboard/books/${selectedBookId}/questions/create`)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm câu hỏi
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Questions Table */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md">
          <CardHeader>
            <CardTitle>Danh sách Câu hỏi</CardTitle>
            <CardDescription>
              Hiển thị {filteredQuestions.length} câu hỏi
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedBookId ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2 font-medium">Vui lòng chọn một cuốn sách</p>
                <p className="text-sm text-gray-500">
                  Chọn sách từ dropdown bên trên để xem danh sách câu hỏi
                </p>
              </div>
            ) : loadingQuestions ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Đang tải câu hỏi...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600">{error}</p>
                <Button onClick={fetchQuestions} className="mt-4">
                  Thử lại
                </Button>
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="text-center py-12">
                <FileQuestion className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Chưa có câu hỏi nào</p>
                <p className="text-sm text-gray-500 mb-4">
                  Sách này chưa có câu hỏi. Hãy thêm câu hỏi mới!
                </p>
                <Button
                  onClick={() => router.push(`/dashboard/books/${selectedBookId}/questions/create`)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm câu hỏi đầu tiên
                </Button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">ID</TableHead>
                        <TableHead>Câu hỏi</TableHead>
                        <TableHead>Loại</TableHead>
                        <TableHead>Độ khó</TableHead>
                        <TableHead>Sách</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredQuestions.map((question) => (
                        <TableRow key={question.id}>
                          <TableCell className="font-medium">#{question.id}</TableCell>
                          <TableCell className="max-w-md">
                            <p className="truncate">{question.question || question.QuestionContent || 'N/A'}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {questionTypeLabels[question.questionType ?? question.QuestionType ?? 0] || 'Không xác định'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {(() => {
                              const difficulty = question.difficulty ?? question.DifficultyLevel ?? 0;
                              const config = difficultyConfig[difficulty as keyof typeof difficultyConfig];
                              return (
                                <Badge className={config?.color || 'bg-gray-100 text-gray-700'}>
                                  {config?.label || 'N/A'}
                            </Badge>
                              );
                            })()}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">Book #{question.bookId}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => router.push(`/dashboard/books/${selectedBookId}/questions/${question.id}`)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => router.push(`/dashboard/books/${selectedBookId}/questions/${question.id}/edit`)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(question.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-gray-600">
                      Trang {currentPage} / {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

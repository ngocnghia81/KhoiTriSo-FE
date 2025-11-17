'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BookOpen,
  ArrowLeft,
  Lock,
  ChevronLeft,
  ChevronRight,
  FileQuestion,
  Menu,
  X,
  CheckCircle2,
  Circle,
  Eye,
  EyeOff,
  Search
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { bookApiService, BookChapter } from '@/services/bookApi';

export default function BookChapterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params?.id ? parseInt(params.id as string) : null;
  const chapterId = params?.chapterId ? parseInt(params.chapterId as string) : null;
  
  const [chapter, setChapter] = useState<BookChapter | null>(null);
  const [book, setBook] = useState<any>(null);
  const [allChapters, setAllChapters] = useState<BookChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAnswers, setShowAnswers] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!bookId || !chapterId) {
      setError('ID sách hoặc chương không hợp lệ');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch book details
        try {
          const bookData = await bookApiService.getBookById(bookId);
          setBook(bookData);
        } catch (err) {
          console.warn('Could not load book:', err);
        }

        // Fetch all chapters để có navigation
        try {
          const chaptersData = await bookApiService.getBookChapters(bookId);
          setAllChapters(chaptersData);
        } catch (err) {
          console.warn('Could not load chapters:', err);
        }

        // Fetch chapter details
        try {
          const chapterData = await bookApiService.getBookChapterById(bookId, chapterId);
          setChapter(chapterData);
        } catch (err: any) {
          console.error('Error fetching chapter:', err);
          setError(err.message || 'Không thể tải thông tin chương');
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Có lỗi xảy ra');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bookId, chapterId]);

  const stripHtml = (html: string | undefined | null): string => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').trim();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !chapter) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <Lock className="w-6 h-6" />
              {error || 'Không tìm thấy chương'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              {error?.includes('FORBIDDEN') || error?.includes('403')
                ? 'Bạn không có quyền xem chương này. Vui lòng mua sách để xem đầy đủ nội dung.'
                : 'Chương không tồn tại hoặc đã bị xóa.'}
            </p>
            <div className="flex gap-2">
              <Button onClick={() => router.back()} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
              {bookId && (
                <Button asChild>
                  <Link href={`/books/${bookId}`}>
                    Về trang sách
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentChapterIndex = allChapters.findIndex(c => c.id === chapterId);
  const prevChapter = currentChapterIndex > 0 ? allChapters[currentChapterIndex - 1] : null;
  const nextChapter = currentChapterIndex < allChapters.length - 1 ? allChapters[currentChapterIndex + 1] : null;
  const canView = chapter.canView !== false;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Danh sách chương */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-80 bg-white border-r border-gray-200 z-40 transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } overflow-y-auto`}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            {book && (
              <Link 
                href={`/books/${bookId}`}
                className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
              >
                {book.title}
              </Link>
            )}
            <p className="text-xs text-gray-500 mt-1">Danh sách chương</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <nav className="p-2">
          {allChapters.map((ch, index) => {
            const isActive = ch.id === chapterId;
            const canViewChapter = ch.canView !== false;
            
            return (
              <Link
                key={ch.id}
                href={canViewChapter ? `/books/${bookId}/chapters/${ch.id}` : '#'}
                onClick={(e) => {
                  if (!canViewChapter) {
                    e.preventDefault();
                  } else {
                    setSidebarOpen(false);
                  }
                }}
                className={`block px-4 py-3 mb-1 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                    : canViewChapter
                    ? 'text-gray-700 hover:bg-gray-50'
                    : 'text-gray-400 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : canViewChapter
                      ? 'bg-gray-200 text-gray-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {ch.orderIndex || index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      isActive ? 'text-blue-700' : canViewChapter ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {stripHtml(ch.title)}
                    </p>
                  </div>
                  {!canViewChapter && (
                    <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Overlay cho mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại
                </Button>
                {book && (
                  <div className="hidden sm:block">
                    <Link 
                      href={`/books/${bookId}`}
                      className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      {book.title}
                    </Link>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-700">
                  Chương {chapter.orderIndex || currentChapterIndex + 1}/{allChapters.length}
                </Badge>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Chapter Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
              {stripHtml(chapter.title)}
            </h1>
            {chapter.description && !chapter.content && (
              <p className="text-gray-600 text-lg">
                {stripHtml(chapter.description)}
              </p>
            )}
          </div>

          {/* Chapter Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            {chapter.description || chapter.content ? (
              <div 
                className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:text-gray-700"
                dangerouslySetInnerHTML={{ 
                  __html: chapter.description || chapter.content || '' 
                }}
              />
            ) : (
              <p className="text-gray-500 text-center py-12">Chưa có nội dung cho chương này.</p>
            )}
          </div>

          {/* Questions */}
          {chapter.questions && chapter.questions.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <FileQuestion className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Câu hỏi ({chapter.questions.length})
                </h2>
              </div>
              
              <div className="space-y-6">
                {chapter.questions.map((question: any, index: number) => {
                  const questionId = question.id || question.Id || index;
                  const isAnswerVisible = showAnswers[questionId] || false;
                  
                  return (
                    <div key={questionId} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            {index + 1}
                          </div>
                          {/* ID để search */}
                          <div className="mt-2 text-xs text-center">
                            <span className="text-gray-500">ID:</span>
                            <span className="text-gray-700 font-mono font-semibold ml-1">{questionId}</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div 
                              className="text-gray-900 text-lg leading-relaxed prose prose-lg max-w-none flex-1"
                              dangerouslySetInnerHTML={{ 
                                __html: question.QuestionContent || question.questionContent || question.question || '' 
                              }}
                            />
                            {/* Chỉ hiện nút "Xem lựa chọn" cho trắc nghiệm, đúng/sai, nhiều đáp án - không hiện cho tự luận */}
                            {(() => {
                              const questionType = question.questionType || question.QuestionType;
                              // 0 = MultipleChoice, 1 = TrueFalse, 2 = ShortAnswer (tự luận), 3 = có thể là Essay
                              const isEssay = questionType === 2 || questionType === 3;
                              const hasOptions = question.options && question.options.length > 0;
                              
                              // Chỉ hiện nút nếu không phải tự luận và có options
                              if (isEssay || !hasOptions) {
                                return null;
                              }
                              
                              return (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setShowAnswers(prev => ({
                                    ...prev,
                                    [questionId]: !prev[questionId]
                                  }))}
                                  className="ml-4 flex-shrink-0"
                                >
                                  {isAnswerVisible ? (
                                    <>
                                      <EyeOff className="w-4 h-4 mr-2" />
                                      Ẩn lựa chọn
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="w-4 h-4 mr-2" />
                                      Xem lựa chọn
                                    </>
                                  )}
                                </Button>
                              );
                            })()}
                          </div>
                          
                          {question.options && question.options.length > 0 ? (
                            <div className="mt-4 space-y-3">
                              <p className="text-sm font-medium text-gray-700 mb-2">Các phương án:</p>
                              {question.options.map((option: any, optIndex: number) => {
                                const isCorrect = option.isCorrect || option.IsCorrect;
                                const showCorrect = isAnswerVisible && isCorrect;
                                
                                return (
                                  <div 
                                    key={optIndex}
                                    className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:border-blue-300 ${
                                      showCorrect
                                        ? 'bg-green-50 border-green-300' 
                                        : 'bg-gray-50 border-gray-200'
                                    }`}
                                  >
                                    <div className="flex-shrink-0 mt-0.5">
                                      {showCorrect ? (
                                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                                      ) : (
                                        <Circle className="w-5 h-5 text-gray-400" />
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <span className="font-medium text-gray-700 mr-2">
                                        {String.fromCharCode(65 + optIndex)}.
                                      </span>
                                      <span className={`${showCorrect ? 'text-green-800 font-medium' : 'text-gray-700'}`}>
                                        {option.optionText || option.OptionText || option.optionContent || option.OptionContent || ''}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <p className="text-sm text-yellow-800">Câu hỏi này chưa có đáp án.</p>
                            </div>
                          )}

                          {isAnswerVisible && question.explanationContent && (
                            <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                              <p className="text-sm font-semibold text-blue-900 mb-2">Giải thích:</p>
                              <div 
                                className="text-blue-800 prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ 
                                  __html: question.explanationContent || question.explanation || '' 
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            {prevChapter && prevChapter.canView !== false ? (
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-gray-300 hover:border-blue-500 hover:text-blue-600"
              >
                <Link href={`/books/${bookId}/chapters/${prevChapter.id}`}>
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  Chương trước
                </Link>
              </Button>
            ) : (
              <div></div>
            )}

            {nextChapter ? (
              nextChapter.canView !== false ? (
                <Button
                  asChild
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Link href={`/books/${bookId}/chapters/${nextChapter.id}`}>
                    Chương tiếp theo
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              ) : (
                <Button
                  disabled
                  size="lg"
                  variant="outline"
                  className="border-gray-300 opacity-50 cursor-not-allowed"
                >
                  <Lock className="w-5 h-5 mr-2" />
                  Chương tiếp theo (Khóa)
                </Button>
              )
            ) : (
              <Button
                asChild
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Link href={`/books/${bookId}`}>
                  Hoàn thành đọc sách
                </Link>
              </Button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

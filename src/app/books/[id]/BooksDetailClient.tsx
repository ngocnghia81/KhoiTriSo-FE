'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BookOpen,
  User,
  Tag,
  DollarSign,
  XCircle,
  ArrowLeft,
  ShoppingCart,
  Key,
  Eye,
  Lock,
  Star,
  Users,
  FileText,
  CheckCircle2,
  Clock,
  ArrowRight,
  Download
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { bookApiService, Book, BookChapter } from '@/services/bookApi';
import { toast } from 'sonner';
import { ReviewsSection } from '@/components/reviews/ReviewsSection';
import { useAuth } from '@/contexts/AuthContext';

interface BooksDetailClientProps {
  initialBook?: Book;
  initialChapters?: BookChapter[];
  bookId: number;
}

export default function BooksDetailClient({ 
  initialBook, 
  initialChapters,
  bookId 
}: BooksDetailClientProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  const [book, setBook] = useState<Book | null>(initialBook || null);
  const [chapters, setChapters] = useState<BookChapter[]>(initialChapters || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [includeExplanation, setIncludeExplanation] = useState(false);

  // Only load if no initial data provided
  useEffect(() => {
    if (!bookId) {
      setError('ID sách không hợp lệ');
      setLoading(false);
      return;
    }

    if (!initialBook) {
      const fetchBookData = async () => {
        try {
          setLoading(true);
          setError(null);
          
          // Fetch book details (đã bao gồm chapters)
          const bookData = await bookApiService.getBookById(bookId);
          setBook(bookData);
          
          // Sử dụng chapters từ bookData nếu có, nếu không thì fetch riêng
          if (bookData.chapters && bookData.chapters.length > 0) {
            // Sắp xếp theo OrderIndex để đảm bảo thứ tự đúng
            const sortedChapters = [...bookData.chapters].sort((a, b) => 
              (a.orderIndex || 0) - (b.orderIndex || 0)
            );
            setChapters(sortedChapters);
          } else {
            // Fallback: fetch chapters riêng nếu không có trong bookData
            try {
              const chaptersData = await bookApiService.getBookChapters(bookId);
              const sortedChapters = [...chaptersData].sort((a, b) => 
                (a.orderIndex || 0) - (b.orderIndex || 0)
              );
              setChapters(sortedChapters);
            } catch (err) {
              console.warn('Could not load chapters:', err);
              setChapters([]);
            }
          }
        } catch (err: any) {
          console.error('Error fetching book:', err);
          setError(err.message || 'Không thể tải thông tin sách');
        } finally {
          setLoading(false);
        }
      };

      fetchBookData();
    } else {
      // Use initial data, but refetch with auth if user is logged in
      // to get correct canView status
      setLoading(false);
      if (initialChapters && initialChapters.length > 0) {
        const sortedChapters = [...initialChapters].sort((a, b) => 
          (a.orderIndex || 0) - (b.orderIndex || 0)
        );
        setChapters(sortedChapters);
      }

      // Refetch book and chapters with authentication to get correct canView
      if (isAuthenticated) {
        const refetchWithAuth = async () => {
          try {
            // Refetch book to get updated isOwned status
            const bookData = await bookApiService.getBookById(bookId);
            setBook(bookData);
            
            // Refetch chapters to get correct canView status
            const chaptersData = await bookApiService.getBookChapters(bookId);
            const sortedChapters = [...chaptersData].sort((a, b) => 
              (a.orderIndex || 0) - (b.orderIndex || 0)
            );
            setChapters(sortedChapters);
          } catch (err) {
            console.warn('Could not refetch book/chapters with auth:', err);
            // Keep initial data if refetch fails
          }
        };
        
        refetchWithAuth();
      }
    }
  }, [bookId, isAuthenticated]);

  const stripHtml = (html: string | undefined | null): string => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').trim();
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleExportToWord = async () => {
    if (!book || !bookId) return;

    try {
      setExporting(true);
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      if (!token) {
        toast.error('Vui lòng đăng nhập');
        return;
      }

      const response = await fetch(
        `/api/books/${bookId}/export-word/my-purchase?includeExplanation=${includeExplanation}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.Message || 'Không thể xuất sách');
      }

      const blob = await response.blob();
      
      // Get filename from Content-Disposition or use default
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `book_${bookId}.docx`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Đã xuất sách sang Word thành công');
    } catch (err: any) {
      console.error('Error exporting book:', err);
      toast.error(err.message || 'Không thể xuất sách sang Word');
    } finally {
      setExporting(false);
    }
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

  if (error || !book) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <XCircle className="w-6 h-6" />
              Lỗi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error || 'Không tìm thấy sách'}</p>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Book Cover */}
            <div className="flex justify-center md:justify-start">
              <div className="relative w-full max-w-sm aspect-[3/4] rounded-lg overflow-hidden shadow-2xl bg-white">
                {book.coverImage ? (
                  <Image
                    src={book.coverImage}
                    alt={book.title}
                    fill
                    className="object-cover"
                    quality={100}
                    unoptimized={true}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <BookOpen className="w-24 h-24 text-white opacity-50" />
                  </div>
                )}
              </div>
            </div>

            {/* Book Info */}
            <div className="space-y-6">
              {/* Title & Category */}
              <div>
                {book.categoryName && (
                  <Badge className="mb-3 bg-blue-100 text-blue-700">
                    {book.categoryName}
                  </Badge>
                )}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {stripHtml(book.title)}
                </h1>
                
                {/* Author */}
                {book.authorName && (
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <User className="w-5 h-5" />
                    <span className="text-lg">Tác giả: <span className="font-semibold text-gray-900">{book.authorName}</span></span>
                  </div>
                )}

                {/* Stats */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
                  {chapters.length > 0 && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>{chapters.length} chương</span>
                    </div>
                  )}
                  {chapters.reduce((sum, ch) => sum + (ch.questionCount || 0), 0) > 0 && (
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span>{chapters.reduce((sum, ch) => sum + (ch.questionCount || 0), 0)} câu hỏi</span>
                    </div>
                  )}
                  {book.rating !== null && book.rating !== undefined && (
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span>{(book.rating || 0).toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Price & Actions */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="mb-4">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-bold text-blue-600">
                      {formatPrice(book.price)}
                    </span>
                  </div>
                  {book.isFree && (
                    <p className="text-sm text-green-600 font-medium">
                      ✓ Sách miễn phí - Đọc ngay không cần đăng ký
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  {(book.isOwned || book.isFree) ? (
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      size="lg"
                      onClick={() => {
                        if (chapters.length > 0) {
                          const sortedChapters = [...chapters].sort((a, b) => 
                            (a.orderIndex || 0) - (b.orderIndex || 0)
                          );
                          const firstChapter = sortedChapters.find(ch => ch.canView !== false) || sortedChapters[0];
                          if (firstChapter) {
                            router.push(`/books/${bookId}/chapters/${firstChapter.id}`);
                          } else {
                            toast.info('Sách này chưa có chương nào');
                          }
                        } else {
                          toast.info('Sách này chưa có chương nào');
                        }
                      }}
                    >
                      <BookOpen className="w-5 h-5 mr-2" />
                      {book.isFree ? 'Đọc ngay' : 'Đọc sách'}
                    </Button>
                  ) : book.isFree ? (
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      size="lg"
                      onClick={() => {
                        toast.info('Sách miễn phí, bạn có thể đọc ngay!');
                        if (chapters.length > 0 && chapters[0].canView) {
                          router.push(`/books/${bookId}/chapters/${chapters[0].id}`);
                        }
                      }}
                    >
                      <BookOpen className="w-5 h-5 mr-2" />
                      Đọc ngay
                    </Button>
                  ) : (
                    <>
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        size="lg"
                        onClick={() => {
                          toast.info('Tính năng mua sách đang được phát triển');
                        }}
                      >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Mua ngay - {formatPrice(book.price)}
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        size="lg"
                        onClick={() => router.push('/books/activation')}
                      >
                        <Key className="w-5 h-5 mr-2" />
                        Kích hoạt bằng mã
                      </Button>
                    </>
                  )}
                </div>

                {/* Export to Word - Only for owned books */}
                {(book.isOwned || book.isFree) && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleExportToWord}
                      disabled={exporting}
                    >
                      {exporting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                          Đang xuất...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Xuất sách sang Word
                        </>
                      )}
                    </Button>
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="includeExplanation"
                        checked={includeExplanation}
                        onChange={(e) => setIncludeExplanation(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="includeExplanation" className="text-sm text-gray-600 cursor-pointer">
                        Bao gồm lời giải
                      </label>
                    </div>
                  </div>
                )}

                {/* Features */}
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Truy cập trọn đời</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Đọc trên mọi thiết bị</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Cập nhật miễn phí</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {book.description && (
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Mô tả sách</CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="prose prose-lg max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ 
                      __html: book.description 
                    }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Chapters */}
            {chapters && chapters.length > 0 && (
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                    Mục lục ({chapters.length} chương)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {chapters.map((chapter, index) => {
                      const canView = chapter.canView !== false;
                      const chapterNumber = chapter.orderIndex || index + 1;
                      
                      return (
                        <Link
                          key={chapter.id}
                          href={canView ? `/books/${bookId}/chapters/${chapter.id}` : '#'}
                          onClick={(e) => {
                            if (!canView) {
                              e.preventDefault();
                              toast.info('Vui lòng mua sách hoặc kích hoạt mã để xem chương này');
                            }
                          }}
                          className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                            canView
                              ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
                              : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                          }`}
                        >
                          <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold ${
                            canView
                              ? 'bg-blue-600'
                              : 'bg-gray-400'
                          }`}>
                            {chapterNumber}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className={`font-semibold ${canView ? 'text-gray-900' : 'text-gray-500'}`}>
                                {stripHtml(chapter.title)}
                              </h4>
                              {!canView && (
                                <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              )}
                            </div>
                            {chapter.questionCount && chapter.questionCount > 0 && (
                              <p className="text-xs text-gray-500 mt-1">
                                {chapter.questionCount} câu hỏi
                              </p>
                            )}
                          </div>
                          {canView && (
                            <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews Section */}
            {bookId && (
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <ReviewsSection
                    itemType={0}
                    itemId={bookId}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Book Info Card */}
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Thông tin sách</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <span className="text-gray-600">ID sách:</span>
                    <p className="font-mono font-semibold text-gray-900 mt-1">{book.id ?? bookId}</p>
                  </div>
                  <Separator />
                  <div>
                    <span className="text-gray-600">Danh mục:</span>
                    <p className="font-semibold text-gray-900 mt-1">{book.categoryName || 'Chưa cập nhật'}</p>
                  </div>
                  {book.isbn && (
                    <>
                      <Separator />
                      <div>
                        <span className="text-gray-600">ISBN:</span>
                        <p className="font-semibold text-gray-900 mt-1">{book.isbn}</p>
                      </div>
                    </>
                  )}
                  <Separator />
                  <div>
                    <span className="text-gray-600">Số chương:</span>
                    <p className="font-semibold text-gray-900 mt-1">{chapters.length}</p>
                  </div>
                  <Separator />
                  <div>
                    <span className="text-gray-600">Số câu hỏi:</span>
                    <p className="font-semibold text-gray-900 mt-1">
                      {chapters.reduce((sum, ch) => sum + (ch.questionCount || 0), 0)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Thao tác nhanh</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push('/books/activation')}
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Kích hoạt sách
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push(`/answer-search`)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Tìm đáp án
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


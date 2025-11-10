'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BookOpen,
  User,
  Tag,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  ShoppingCart,
  Key,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { bookApiService, Book } from '@/services/bookApi';

const approvalStatusConfig = {
  0: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  1: { label: 'Đã duyệt', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  2: { label: 'Từ chối', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params?.id ? parseInt(params.id as string) : null;
  
  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookId) {
      setError('ID sách không hợp lệ');
      setLoading(false);
      return;
    }

    const fetchBookData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch book details
        const bookData = await bookApiService.getBookById(bookId);
        setBook(bookData);
        
        // Fetch chapters
        try {
          const chaptersData = await bookApiService.getBookChapters(bookId);
          setChapters(chaptersData);
        } catch (err) {
          console.warn('Could not load chapters:', err);
          setChapters([]);
        }
      } catch (err: any) {
        console.error('Error fetching book:', err);
        setError(err.message || 'Không thể tải thông tin sách');
      } finally {
        setLoading(false);
      }
    };

    fetchBookData();
  }, [bookId]);

  const StatusBadge = ({ status }: { status: number }) => {
    const config = approvalStatusConfig[status as keyof typeof approvalStatusConfig];
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Background decorations */}
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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <Button
          onClick={() => router.back()}
          variant="ghost"
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Book header card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50" />
                <CardHeader className="relative">
                  <div className="flex items-start gap-4">
                    {book.coverImage ? (
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-32 h-48 object-cover rounded-lg shadow-lg"
                      />
                    ) : (
                      <div className="w-32 h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                        <BookOpen className="w-16 h-16 text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <CardTitle className="text-3xl mb-2">{book.title}</CardTitle>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <StatusBadge status={book.approvalStatus} />
                        {book.isFree ? (
                          <Badge className="bg-green-100 text-green-700">Miễn phí</Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-700">
                            {book.price.toLocaleString('vi-VN')} đ
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>Tác giả: {book.authorName || 'N/A'}</span>
                        </div>
                        {book.categoryName && (
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4" />
                            <span>Danh mục: {book.categoryName}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          <span>{book.totalChapters || 0} chương</span>
                          <span className="text-gray-400">•</span>
                          <span>{book.totalQuestions || 0} câu hỏi</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                {book.description && (
                  <CardContent className="relative">
                    <h3 className="font-semibold text-lg mb-2">Mô tả</h3>
                    <p className="text-gray-700 whitespace-pre-line">{book.description}</p>
                  </CardContent>
                )}
              </Card>
            </motion.div>

            {/* Chapters */}
            {chapters.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                      Danh sách chương ({chapters.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {chapters.map((chapter, index) => (
                        <div
                          key={chapter.id}
                          className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {chapter.orderIndex || index + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{chapter.title}</h4>
                              {chapter.content && (
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {chapter.content}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Actions card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md sticky top-6">
                <CardHeader>
                  <CardTitle className="text-xl">Thao tác</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!book.isFree && (
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      size="lg"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Mua ngay - {book.price.toLocaleString('vi-VN')} đ
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push(`/books/${book.id}/activation`)}
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Kích hoạt mã
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push(`/books/${book.id}/preview`)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Xem trước
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Info card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-xl">Thông tin chi tiết</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID:</span>
                    <span className="font-semibold">{book.id}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tổng chương:</span>
                    <span className="font-semibold">{book.totalChapters || 0}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tổng câu hỏi:</span>
                    <span className="font-semibold">{book.totalQuestions || 0}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngày tạo:</span>
                    <span className="font-semibold">
                      {new Date(book.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  {book.updatedAt && (
                    <>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cập nhật:</span>
                        <span className="font-semibold">
                          {new Date(book.updatedAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

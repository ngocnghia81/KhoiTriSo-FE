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
  Edit,
  Trash2,
  Key,
  FileText,
  BarChart3,
  Plus,
  Download
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { bookApiService, Book } from '@/services/bookApi';
import { useDeleteBook } from '@/hooks/useBooks';

// Declare MathJax global type
declare global {
  interface Window {
    MathJax?: any;
  }
}

const approvalStatusConfig = {
  0: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  1: { label: 'Đã duyệt', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  2: { label: 'Từ chối', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export default function DashboardBookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params?.id ? parseInt(params.id as string) : null;
  
  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [includeExplanation, setIncludeExplanation] = useState(false);
  const { deleteBook, loading: deleteLoading } = useDeleteBook();

  // Load MathJax để render MathML
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const w = window as any;
    if (!w.MathJax) {
      w.MathJax = {
        loader: { load: ['input/mml', 'input/tex', 'output/chtml'] },
        options: {
          renderActions: { addMenu: [0, '', ''] },
          skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
          ignoreHtmlClass: 'tex2jax_ignore',
          processHtmlClass: 'tex2jax_process',
        },
        chtml: { scale: 1, displayAlign: "center" },
        startup: {
          ready: () => {
            if (w.MathJax && w.MathJax.startup) {
              w.MathJax.startup.defaultReady && w.MathJax.startup.defaultReady();
            }
          },
        },
      };
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/mml-chtml.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  // Render HTML content với MathML và images
  const renderQuestionContent = (content: string) => {
    if (!content) return '';
    
    // Tạo một div tạm để parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    
    // Xử lý images
    doc.querySelectorAll('img').forEach(img => {
      const src = img.getAttribute('src');
      if (src && (src.startsWith('data:image') || src.startsWith('http'))) {
        // Giữ nguyên base64 image hoặc URL
        img.setAttribute('style', 'max-width: 100%; height: auto; display: block; margin: 10px 0;');
      }
    });
    
    // Đảm bảo MathML có namespace đúng và format đúng
    doc.querySelectorAll('math').forEach(math => {
      if (!math.getAttribute('xmlns')) {
        math.setAttribute('xmlns', 'http://www.w3.org/1998/Math/MathML');
      }
      // Đảm bảo MathML được format đúng để MathJax có thể parse
      math.setAttribute('display', 'inline');
    });
    
    return doc.body.innerHTML;
  };

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

        // Fetch questions
        try {
          const questionsData = await bookApiService.getBookQuestions(bookId);
          setQuestions(questionsData);
        } catch (err) {
          console.warn('Could not load questions:', err);
          setQuestions([]);
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

  // Inject CSS for MathML and images
  useEffect(() => {
    const styleId = 'book-detail-mathml-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .question-content math,
      .option-content math,
      .explanation-content math {
        line-height: 1.5;
        vertical-align: middle;
      }
      .question-content math[display="block"],
      .option-content math[display="block"],
      .explanation-content math[display="block"] {
        display: block;
        text-align: center;
        margin: 10px 0;
      }
      .question-content img,
      .option-content img,
      .explanation-content img {
        max-width: 100%;
        height: auto;
        display: block;
        margin: 10px 0;
      }
      .question-content,
      .option-content,
      .explanation-content {
        line-height: 1.6;
      }
    `;
    document.head.appendChild(style);

    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  // Typeset MathML sau khi questions được render
  useEffect(() => {
    if (questions.length > 0) {
      const w = window as any;
      if (w && w.MathJax && typeof w.MathJax.typesetPromise === 'function') {
        // Đợi DOM render xong rồi mới typeset
        const timer = setTimeout(() => {
          w.MathJax.typesetPromise().catch((err: any) => {
            console.warn('MathJax typeset error:', err);
          });
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [questions]);

  const handleDelete = async () => {
    if (!book || !confirm(`Bạn có chắc chắn muốn xóa sách "${book.title}"?`)) return;

    try {
      await deleteBook(book.id);
      router.push('/dashboard/books');
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Không thể xóa sách!');
    }
  };

  const handleExportToWord = async () => {
    if (!book) return;

    try {
      setExporting(true);
      const blob = await bookApiService.exportToWord(book.id, includeExplanation);
      
      // Tạo URL tạm thời và download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${book.title.replace(/[^a-z0-9]/gi, '_')}_${book.id}${includeExplanation ? '_with_explanation' : ''}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Error exporting book:', error);
      alert(error?.message || 'Không thể xuất file Word!');
    } finally {
      setExporting(false);
    }
  };

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
            <Button onClick={() => router.push('/dashboard/books')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại danh sách
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
        {/* Header with actions */}
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={() => router.push('/dashboard/books')}
            variant="ghost"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách
          </Button>

          <div className="flex gap-2">
            <Button
              onClick={() => router.push(`/dashboard/books/${book.id}/edit`)}
              variant="outline"
            >
              <Edit className="w-4 h-4 mr-2" />
              Sửa
            </Button>
            <Button
              onClick={handleDelete}
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              disabled={deleteLoading}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Xóa
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
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
                    <div 
                      className="prose max-w-none text-gray-700"
                      dangerouslySetInnerHTML={{ __html: book.description }}
                    />
                  </CardContent>
                )}
              </Card>
            </motion.div>

            {/* Tabs for chapters and questions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md">
                <CardContent className="pt-6">
                  <Tabs defaultValue="chapters">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="chapters">
                        Chương ({chapters.length})
                      </TabsTrigger>
                      <TabsTrigger value="questions">
                        Câu hỏi ({questions.length})
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="chapters" className="mt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Danh sách chương ({chapters.length})</h3>
                        <Button 
                          variant="outline" 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
                          onClick={() => router.push(`/dashboard/books/${book.id}/chapters/create`)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Thêm chương
                        </Button>
                      </div>
                      {chapters.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>Chưa có chương nào</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {chapters.map((chapter, index) => (
                            <div
                              key={chapter.id}
                              className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                              onClick={() => router.push(`/dashboard/books/${book.id}/chapters/${chapter.id}`)}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                  {chapter.orderIndex || index + 1}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900">{chapter.title}</h4>
                                  {chapter.content && (
                                    <div 
                                      className="text-sm text-gray-600 mt-1 line-clamp-2 prose prose-sm max-w-none"
                                      dangerouslySetInnerHTML={{ __html: chapter.content }}
                                    />
                                  )}
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="outline" className="text-xs">
                                      {chapter.isPublished ? 'Đã xuất bản' : 'Nháp'}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="questions" className="mt-6">
                      {questions.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>Chưa có câu hỏi nào</p>
                          <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={() => router.push(`/dashboard/books/${book.id}/questions/create`)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Thêm câu hỏi
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {questions.map((question, index) => (
                            <div
                              key={question.id}
                              className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                              onClick={() => {
                                // Nếu có chapterId, điều hướng đến trang chapter detail
                                if (question.chapterId) {
                                  router.push(`/dashboard/books/${book.id}/chapters/${question.chapterId}`);
                                } else {
                                  router.push(`/dashboard/books/${book.id}/questions/${question.id}`);
                                }
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <div 
                                    className="prose max-w-none question-content text-base text-gray-900"
                                    dangerouslySetInnerHTML={{ 
                                      __html: renderQuestionContent(question.question || question.QuestionContent || '') 
                                    }}
                                    ref={(el) => {
                                      if (el) {
                                        // Typeset MathML sau khi element được render
                                        const typeset = () => {
                                          const w = window as any;
                                          if (w.MathJax && typeof w.MathJax.typesetPromise === 'function') {
                                            const mathElements = el.querySelectorAll('math');
                                            if (mathElements.length > 0) {
                                              w.MathJax.typesetPromise(mathElements as any).catch(() => {});
                                            } else {
                                              w.MathJax.typesetPromise([el] as any).catch(() => {});
                                            }
                                          }
                                        };
                                        typeset();
                                        setTimeout(typeset, 100);
                                        setTimeout(typeset, 300);
                                      }
                                    }}
                                  />
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="outline" className="text-xs">
                                      Độ khó: {question.difficulty || question.DifficultyLevel || 'N/A'}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      Loại: {(() => {
                                        const type = question.questionType || question.QuestionType;
                                        if (type === undefined || type === null) return 'N/A';
                                        switch (type) {
                                          case 0: return 'Trắc nghiệm';
                                          case 1: return 'Đúng/Sai';
                                          case 2: return 'Tự luận ngắn';
                                          case 3: return 'Tiêu đề';
                                          default: return `Loại ${type}`;
                                        }
                                      })()}
                                    </Badge>
                                    {question.chapterId && (
                                      <Badge variant="outline" className="text-xs">
                                        Chương: {question.chapterId}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md sticky top-6">
                <CardHeader>
                  <CardTitle className="text-xl">Thao tác nhanh</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => router.push(`/dashboard/books/${book.id}/activation-codes`)}
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Quản lý mã kích hoạt
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => router.push(`/dashboard/books/${book.id}/questions`)}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Quản lý câu hỏi
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => router.push(`/dashboard/books/${book.id}/analytics`)}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Thống kê
                  </Button>
                  <Separator className="my-3" />
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="includeExplanation"
                        checked={includeExplanation}
                        onChange={(e) => setIncludeExplanation(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="includeExplanation" className="text-sm text-gray-700">
                        Bao gồm lời giải
                      </label>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0"
                      onClick={handleExportToWord}
                      disabled={exporting}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {exporting ? 'Đang xuất...' : 'Xuất Word'}
                    </Button>
                  </div>
                  <Separator className="my-3" />
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => router.push(`/books/${book.id}`)}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Xem trang công khai
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Stats card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-xl">Thống kê</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tổng chương:</span>
                    <span className="text-2xl font-bold text-blue-600">{chapters.length}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tổng câu hỏi:</span>
                    <span className="text-2xl font-bold text-purple-600">{questions.length}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Giá:</span>
                    <span className="text-xl font-bold text-green-600">
                      {book.isFree ? 'Miễn phí' : `${book.price.toLocaleString('vi-VN')} đ`}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Info card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-xl">Thông tin</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID:</span>
                    <span className="font-semibold">{book.id}</span>
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


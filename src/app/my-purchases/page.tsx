'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { safeJsonParse, isSuccessfulResponse, extractResult } from '@/utils/apiHelpers';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AcademicCapIcon, 
  BookOpenIcon, 
  ClockIcon, 
  PlayCircleIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import { bookApiService } from '@/services/bookApi';

interface Course {
  id: number;
  title: string;
  description?: string;
  thumbnail?: string;
  instructor?: {
    id: number;
    name: string;
  };
  categoryName?: string;
  price?: number;
  isFree: boolean;
  totalLessons?: number;
  progressPercentage: number;
  enrolledAt: string;
  lastAccessed?: string;
  isCompleted: boolean;
}

interface Book {
  id: number;
  title: string;
  description?: string;
  coverImage?: string;
  author?: {
    id: number;
    fullName: string;
  };
  categoryName?: string;
  price?: number;
  isFree: boolean;
  activatedAt: string;
  totalChapters: number;
  completedChapters: number;
}

const formatDate = (dateString: string) => {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: vi });
  } catch {
    return dateString;
  }
};

const formatPrice = (price: number | null | undefined) => {
  if (!price || isNaN(price) || price === 0) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

const stripHtml = (html: string | undefined | null) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
};

export default function MyPurchasesPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [activeTab, setActiveTab] = useState('courses');
  const [courses, setCourses] = useState<Course[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [booksLoading, setBooksLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportingBookId, setExportingBookId] = useState<number | null>(null);
  const [includeExplanation, setIncludeExplanation] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (user?.role !== 'student') {
      router.push('/dashboard');
      return;
    }

    fetchCourses();
    fetchBooks();
  }, [isAuthenticated, user, router]);

  const handleExportBookToWord = async (bookId: number) => {
    try {
      setExportingBookId(bookId);
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
      setExportingBookId(null);
    }
  };

  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
      const response = await authenticatedFetch('/api/courses/my-courses?page=1&pageSize=100');
      const result = await safeJsonParse(response);

      if (isSuccessfulResponse(result)) {
        const data = extractResult(result);
        let coursesArray = [];
        
        if (Array.isArray(data)) {
          coursesArray = data;
        } else if (data?.Items || data?.items) {
          coursesArray = data.Items || data.items;
        }

        const transformedCourses = coursesArray.map((c: any) => {
          const courseData = c.Course || c.course || c;
          const instructorData = courseData?.Instructor || courseData?.instructor || c.Instructor || c.instructor;
          const categoryData = courseData?.Category || courseData?.category || c.Category || c.category;

          return {
            id: courseData?.Id || courseData?.id || c.CourseId || c.courseId,
            title: courseData?.Title || courseData?.title || c.Title || c.title || '',
            description: courseData?.Description || courseData?.description || c.Description || c.description,
            thumbnail: courseData?.Thumbnail || courseData?.thumbnail,
            instructor: instructorData
              ? {
                  id: instructorData.Id || instructorData.id,
                  name: instructorData.Name || instructorData.name,
                }
              : undefined,
            categoryName: categoryData?.Name || categoryData?.name,
            price: courseData?.Price ?? c.Price,
            isFree: courseData?.IsFree ?? courseData?.isFree ?? c.IsFree ?? false,
            totalLessons: courseData?.TotalLessons ?? courseData?.totalLessons ?? c.TotalLessons ?? c.totalLessons ?? 0,
            progressPercentage: c.ProgressPercentage || c.progressPercentage || 0,
            enrolledAt: c.EnrolledAt || c.enrolledAt,
            lastAccessed: c.LastAccessed || c.lastAccessed,
            isCompleted: c.CompletedAt !== null && c.CompletedAt !== undefined,
          } as Course;
        });

        setCourses(transformedCourses);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Không thể tải khóa học');
    } finally {
      setCoursesLoading(false);
    }
  };

  const fetchBooks = async () => {
    try {
      setBooksLoading(true);
      const response = await authenticatedFetch('/api/books/my-books?page=1&pageSize=100');
      const result = await safeJsonParse(response);

      if (isSuccessfulResponse(result)) {
        const data = extractResult(result);
        let booksArray = [];
        
        if (Array.isArray(data)) {
          booksArray = data;
        } else if (data?.Items || data?.items) {
          booksArray = data.Items || data.items;
        }

        const transformedBooks = booksArray.map((b: any) => {
          const rawBook = b.Book || b.book || null;
          const authorData = rawBook?.Author || rawBook?.author || b.Author || b.author;
          const categoryData = rawBook?.Category || rawBook?.category || b.Category || b.category;

          return {
            id: rawBook?.Id || rawBook?.id || b.BookId || b.bookId || b.Id || b.id,
            userBookId: b.Id || b.id,
            title: rawBook?.Title || rawBook?.title || b.Title || b.title || '',
            description: rawBook?.Description || rawBook?.description || b.Description || b.description,
            coverImage: rawBook?.CoverImage || rawBook?.coverImage || b.CoverImage || b.coverImage,
            author: authorData
              ? {
                  id: authorData.Id || authorData.id,
                  fullName: authorData.FullName || authorData.fullName || authorData.Name || authorData.name,
                }
              : undefined,
            categoryName: categoryData?.Name || categoryData?.name,
            price: rawBook?.Price ?? b.Price,
            isFree: rawBook?.IsFree ?? rawBook?.isFree ?? b.IsFree ?? false,
            activatedAt: b.ActivatedAt || b.activatedAt || b.CreatedAt || b.createdAt,
            totalChapters: rawBook?.TotalChapters || rawBook?.totalChapters || b.TotalChapters || b.totalChapters || 0,
            completedChapters: b.CompletedChapters || b.completedChapters || 0,
          } as Book;
        });

        setBooks(transformedBooks);
      }
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Không thể tải sách');
    } finally {
      setBooksLoading(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'student') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Khóa học/Sách đã mua</h1>
          <p className="text-gray-600 mt-2">Quản lý các khóa học và sách bạn đã mua</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <AcademicCapIcon className="h-4 w-4" />
              Khóa học ({courses.length})
            </TabsTrigger>
            <TabsTrigger value="books" className="flex items-center gap-2">
              <BookOpenIcon className="h-4 w-4" />
              Sách ({books.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="mt-6">
            {coursesLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Đang tải khóa học...</p>
              </div>
            ) : courses.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <AcademicCapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có khóa học nào</h3>
                  <p className="text-gray-500 mb-6">Bạn chưa mua khóa học nào. Hãy khám phá các khóa học có sẵn!</p>
                  <Button asChild>
                    <Link href="/courses">
                      Khám phá khóa học
                      <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <Card key={course.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <Link href={`/courses/${course.id}`}>
                        <div className="relative h-48 bg-gray-200 overflow-hidden">
                          {course.thumbnail && course.thumbnail.startsWith('http') ? (
                            <Image
                              src={course.thumbnail}
                              alt={course.title}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                              <AcademicCapIcon className="h-16 w-16 text-white opacity-50" />
                            </div>
                          )}
                          {course.isCompleted && (
                            <Badge className="absolute top-2 right-2 bg-green-600 text-white">
                              <CheckCircleIconSolid className="h-3 w-3 mr-1" />
                              Hoàn thành
                            </Badge>
                          )}
                        </div>
                      </Link>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          {course.categoryName ? (
                            <Badge variant="outline" className="text-xs border-blue-200 text-blue-600 bg-blue-50">
                              {course.categoryName}
                            </Badge>
                          ) : <span />}
                          <Badge className={`text-xs ${course.isFree ? 'bg-green-600' : 'bg-amber-500'}`}>
                            {course.isFree ? 'Miễn phí' : formatPrice(course.price || 0)}
                          </Badge>
                        </div>
                        <Link href={`/courses/${course.id}`}>
                          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-blue-600">
                            {stripHtml(course.title)}
                          </h3>
                        </Link>
                        {course.instructor && (
                          <p className="text-sm text-gray-600">
                            {course.instructor.name}
                          </p>
                        )}
                        {course.description && (
                          <p className="text-sm text-gray-500 mt-2 mb-3 line-clamp-2">
                            {stripHtml(course.description)}
                          </p>
                        )}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Tiến độ</span>
                            <span className="font-medium text-blue-600">{Math.round(course.progressPercentage)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                course.isCompleted ? 'bg-green-600' : 'bg-blue-600'
                              }`}
                              style={{ width: `${Math.min(course.progressPercentage, 100)}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Đăng ký {formatDate(course.enrolledAt)}</span>
                            {course.totalLessons !== undefined && (
                              <span className="flex items-center gap-1">
                                <BookOpenIcon className="h-3 w-3" />
                                {course.totalLessons} bài học
                              </span>
                            )}
                          </div>
                          {course.lastAccessed && (
                            <div className="text-xs text-gray-500">
                              Truy cập {formatDate(course.lastAccessed)}
                            </div>
                          )}
                        </div>
                        <Button asChild className="w-full mt-4" variant="outline">
                          <Link href={`/courses/${course.id}`}>
                            {course.isCompleted ? 'Xem lại' : 'Tiếp tục học'}
                            <PlayCircleIcon className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="books" className="mt-6">
            {booksLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Đang tải sách...</p>
              </div>
            ) : books.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có sách nào</h3>
                  <p className="text-gray-500 mb-6">Bạn chưa mua hoặc kích hoạt sách nào. Hãy khám phá các sách có sẵn!</p>
                  <Button asChild>
                    <Link href="/books">
                      Khám phá sách
                      <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {books.map((book) => (
                  <Card key={book.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <Link href={`/books/${book.id}`}>
                        <div className="relative h-64 bg-gray-200 overflow-hidden">
                          {book.coverImage && book.coverImage.startsWith('http') ? (
                            <Image
                              src={book.coverImage}
                              alt={book.title}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-600">
                              <BookOpenIcon className="h-16 w-16 text-white opacity-50" />
                            </div>
                          )}
                        </div>
                      </Link>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3 gap-2">
                          {book.categoryName ? (
                            <Badge variant="outline" className="text-xs border-amber-200 text-amber-700 bg-amber-50">
                              {book.categoryName}
                            </Badge>
                          ) : (
                            <span />
                          )}
                          <Badge className={`text-xs ${book.isFree ? 'bg-green-600' : 'bg-rose-500'}`}>
                            {book.isFree ? 'Miễn phí' : formatPrice(book.price || 0)}
                          </Badge>
                        </div>
                        <Link href={`/books/${book.id}`}>
                          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-blue-600">
                            {stripHtml(book.title)}
                          </h3>
                        </Link>
                        {book.author && (
                          <p className="text-sm text-gray-600">
                            {book.author.fullName}
                          </p>
                        )}
                        {book.description && (
                          <p className="text-sm text-gray-500 mt-2 mb-3 line-clamp-2">
                            {stripHtml(book.description)}
                          </p>
                        )}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Tiến độ</span>
                            <span className="font-medium text-blue-600">
                              {book.totalChapters > 0 
                                ? `${book.completedChapters}/${book.totalChapters} chương`
                                : '0 chương'}
                            </span>
                          </div>
                          {book.totalChapters > 0 && (
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ 
                                  width: `${Math.min(
                                    (book.completedChapters / (book.totalChapters || 1)) * 100,
                                    100
                                  )}%` 
                                }}
                              />
                            </div>
                          )}
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Kích hoạt {formatDate(book.activatedAt)}</span>
                            {book.totalChapters > 0 && (
                              <span className="flex items-center gap-1">
                                <BookOpenIcon className="h-3 w-3" />
                                {book.totalChapters} chương
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button 
                            className="flex-1" 
                            variant="outline"
                            onClick={async () => {
                              try {
                                // Fetch chapters để lấy chương đầu tiên
                                const chapters = await bookApiService.getBookChapters(book.id);
                                if (chapters && chapters.length > 0) {
                                  // Sắp xếp theo orderIndex và lấy chương đầu tiên
                                  const sortedChapters = [...chapters].sort((a, b) => 
                                    (a.orderIndex || 0) - (b.orderIndex || 0)
                                  );
                                  const firstChapter = sortedChapters[0];
                                  if (firstChapter && firstChapter.canView !== false) {
                                    router.push(`/books/${book.id}/chapters/${firstChapter.id}`);
                                  } else {
                                    router.push(`/books/${book.id}`);
                                  }
                                } else {
                                  router.push(`/books/${book.id}`);
                                }
                              } catch (err) {
                                console.error('Error fetching chapters:', err);
                                router.push(`/books/${book.id}`);
                              }
                            }}
                          >
                            <BookOpenIcon className="mr-2 h-4 w-4" />
                            Đọc sách
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleExportBookToWord(book.id)}
                            disabled={exportingBookId === book.id}
                            className="flex items-center"
                            title="Xuất sách sang Word"
                          >
                            {exportingBookId === book.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            ) : (
                              <ArrowDownTrayIcon className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


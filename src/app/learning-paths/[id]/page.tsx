'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BookOpen,
  ArrowLeft,
  Users,
  Clock,
  Star,
  ShoppingCart,
  CheckCircle2,
  PlayCircle,
  TrendingUp,
  Award,
  Tag,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { toast } from 'sonner';

interface LearningPath {
  id: number;
  title: string;
  description: string;
  thumbnail?: string;
  instructor?: {
    id: number;
    name: string;
    avatar?: string;
  };
  category?: {
    id: number;
    name: string;
  };
  estimatedDuration?: number;
  difficultyLevel: number;
  difficultyLevelName: string;
  price: number;
  courseCount: number;
  enrollmentCount: number;
  isEnrolled?: boolean;
  createdAt: string;
}

interface Course {
  id: number;
  courseId: number;
  course?: {
    id: number;
    title: string;
    thumbnail?: string;
    price: number;
  };
  orderIndex: number;
  isRequired: boolean;
}

export default function LearningPathDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const pathId = params?.id ? parseInt(params.id as string) : null;
  
  const [path, setPath] = useState<LearningPath | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (!pathId) {
      setError('ID lộ trình không hợp lệ');
      setLoading(false);
      return;
    }

    fetchData();
  }, [pathId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch learning path details
      const pathResponse = await authenticatedFetch(`/api/learning-paths/${pathId}`);
      const pathData = await pathResponse.json();
      
      console.log('Learning path detail API response:', pathData);
      
      if (pathData.Result) {
        const result = pathData.Result;
        
        // Map từ PascalCase sang camelCase
        const mappedPath: LearningPath = {
          id: result.Id || result.id,
          title: result.Title || result.title,
          description: result.Description || result.description,
          thumbnail: result.Thumbnail || result.thumbnail,
          instructorId: result.InstructorId || result.instructorId,
          instructor: result.Instructor || result.instructor ? {
            id: (result.Instructor || result.instructor).Id || (result.Instructor || result.instructor).id,
            name: (result.Instructor || result.instructor).Name || (result.Instructor || result.instructor).name,
            avatar: (result.Instructor || result.instructor).Avatar || (result.Instructor || result.instructor).avatar,
          } : undefined,
          categoryId: result.CategoryId || result.categoryId,
          category: result.Category || result.category ? {
            id: (result.Category || result.category).Id || (result.Category || result.category).id,
            name: (result.Category || result.category).Name || (result.Category || result.category).name,
          } : undefined,
          estimatedDuration: result.EstimatedDuration || result.estimatedDuration,
          difficultyLevel: result.DifficultyLevel || result.difficultyLevel || 0,
          difficultyLevelName: result.DifficultyLevelName || result.difficultyLevelName || '',
          price: result.Price || result.price || 0,
          courseCount: result.CourseCount || result.courseCount || 0,
          enrollmentCount: result.EnrollmentCount || result.enrollmentCount || 0,
          isEnrolled: result.IsEnrolled || result.isEnrolled || false,
          createdAt: result.CreatedAt || result.createdAt,
        };
        
        // Courses có thể nằm trong Result.Courses
        const coursesData = result.Courses || result.courses || [];
        let mappedCourses: Course[] = [];
        
        if (Array.isArray(coursesData) && coursesData.length > 0) {
          mappedCourses = coursesData.map((course: any) => ({
            id: course.Id || course.id,
            courseId: course.CourseId || course.courseId || (course.Course?.Id || course.course?.id),
            course: course.Course || course.course ? {
              id: (course.Course || course.course).Id || (course.Course || course.course).id,
              title: (course.Course || course.course).Title || (course.Course || course.course).title,
              thumbnail: (course.Course || course.course).Thumbnail || (course.Course || course.course).thumbnail,
              price: (course.Course || course.course).Price || (course.Course || course.course).price || 0,
            } : undefined,
            orderIndex: course.OrderIndex || course.orderIndex || 0,
            isRequired: course.IsRequired || course.isRequired || false,
          }));
        } else {
          // Fallback: fetch courses riêng nếu không có trong Result
          try {
            const coursesResponse = await authenticatedFetch(`/api/learning-paths/${pathId}/courses`);
            const coursesData = await coursesResponse.json();
            
            if (coursesData.Result?.courses || coursesData.Result?.Courses) {
              const courses = coursesData.Result.courses || coursesData.Result.Courses || [];
              mappedCourses = courses.map((course: any) => ({
                id: course.Id || course.id,
                courseId: course.CourseId || course.courseId || (course.Course?.Id || course.course?.id),
                course: course.Course || course.course ? {
                  id: (course.Course || course.course).Id || (course.Course || course.course).id,
                  title: (course.Course || course.course).Title || (course.Course || course.course).title,
                  thumbnail: (course.Course || course.course).Thumbnail || (course.Course || course.course).thumbnail,
                  price: (course.Course || course.course).Price || (course.Course || course.course).price || 0,
                } : undefined,
                orderIndex: course.OrderIndex || course.orderIndex || 0,
                isRequired: course.IsRequired || course.isRequired || false,
              }));
            } else if (Array.isArray(coursesData.Result)) {
              mappedCourses = coursesData.Result.map((course: any) => ({
                id: course.Id || course.id,
                courseId: course.CourseId || course.courseId || (course.Course?.Id || course.course?.id),
                course: course.Course || course.course ? {
                  id: (course.Course || course.course).Id || (course.Course || course.course).id,
                  title: (course.Course || course.course).Title || (course.Course || course.course).title,
                  thumbnail: (course.Course || course.course).Thumbnail || (course.Course || course.course).thumbnail,
                  price: (course.Course || course.course).Price || (course.Course || course.course).price || 0,
                } : undefined,
                orderIndex: course.OrderIndex || course.orderIndex || 0,
                isRequired: course.IsRequired || course.isRequired || false,
              }));
            }
          } catch (err) {
            console.warn('Could not load courses:', err);
          }
        }
        
        // Cập nhật courseCount từ số lượng courses thực tế
        mappedPath.courseCount = mappedCourses.length > 0 ? mappedCourses.length : mappedPath.courseCount;
        setPath(mappedPath);
        setCourses(mappedCourses);
      } else {
        setError(pathData.Message || 'Không tìm thấy lộ trình');
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!pathId) return;

    try {
      setEnrolling(true);
      const response = await authenticatedFetch(`/api/learning-paths/${pathId}/enroll`, {
        method: 'POST',
      });

      const data = await response.json();
      
      if (response.ok || response.status === 201) {
        toast.success('Đăng ký lộ trình thành công!');
        setPath(prev => prev ? { ...prev, isEnrolled: true } : null);
        router.push(`/profile/my-courses`);
      } else {
        toast.error(data.Message || 'Không thể đăng ký lộ trình');
      }
    } catch (err: any) {
      console.error('Error enrolling:', err);
      toast.error(err.message || 'Có lỗi xảy ra khi đăng ký');
    } finally {
      setEnrolling(false);
    }
  };

  const formatPrice = (price: number | undefined | null) => {
    if (price === null || price === undefined || isNaN(price)) return 'Miễn phí';
    if (price === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDuration = (hours?: number) => {
    if (!hours) return 'N/A';
    if (hours < 1) return `${Math.round(hours * 60)} phút`;
    return `${hours} giờ`;
  };

  const stripHtml = (html: string | undefined | null): string => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').trim();
  };

  // Calculate total price if buying courses separately
  const totalIndividualPrice = courses.reduce((sum, course) => {
    return sum + (course.course?.price || 0);
  }, 0);
  const savings = totalIndividualPrice > path?.price ? totalIndividualPrice - (path?.price || 0) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !path) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Lỗi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error || 'Không tìm thấy lộ trình'}</p>
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
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="mb-6 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                {path.category && (
                  <Badge className="bg-white/30 text-white border-white/40">
                    {path.category.name}
                  </Badge>
                )}
                <Badge className="bg-white/30 text-white border-white/40">
                  {path.difficultyLevelName || 'Cơ bản'}
                </Badge>
                <Badge className="bg-white/30 text-white border-white/40">
                  📚 {path.courseCount || 0} khóa học
                </Badge>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {stripHtml(path.title)}
              </h1>
              
              <p className="text-xl text-blue-100 mb-6">
                {stripHtml(path.description)}
              </p>

              <div className="flex flex-wrap gap-4 text-sm">
                {path.enrollmentCount > 0 && (
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <span>{path.enrollmentCount}+ học viên</span>
                  </div>
                )}
                {path.estimatedDuration && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>{formatDuration(path.estimatedDuration)}</span>
                  </div>
                )}
                {path.instructor && (
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    <Link 
                      href={`/instructors/${path.instructor.id}`}
                      className="hover:underline"
                    >
                      {path.instructor.name}
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {path.thumbnail && (
              <div className="relative aspect-video rounded-lg overflow-hidden shadow-2xl">
                <Image
                  src={path.thumbnail}
                  alt={path.title}
                  fill
                  className="object-cover"
                  quality={100}
                  unoptimized={true}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Courses */}
          <div className="lg:col-span-2 space-y-6">
            {/* What You'll Learn */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  Lộ trình học tập
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Lộ trình này bao gồm {path.courseCount} khóa học được sắp xếp theo thứ tự từ cơ bản đến nâng cao, 
                  giúp bạn học một cách có hệ thống và hiệu quả.
                </p>
              </CardContent>
            </Card>

            {/* Courses List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                  Danh sách khóa học ({courses.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {courses.length > 0 ? (
                  <div className="space-y-4">
                    {courses
                      .sort((a, b) => a.orderIndex - b.orderIndex)
                      .map((course, index) => (
                        <Link
                          key={course.id}
                          href={`/courses/${course.courseId}`}
                          className="block"
                        >
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all bg-white"
                          >
                            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold">
                              {index + 1}
                            </div>
                            
                            {course.course?.thumbnail ? (
                              <div className="flex-shrink-0 w-24 h-16 relative rounded overflow-hidden">
                                <Image
                                  src={course.course.thumbnail}
                                  alt={course.course.title || ''}
                                  fill
                                  className="object-cover"
                                  quality={80}
                                  unoptimized={true}
                                />
                              </div>
                            ) : (
                              <div className="flex-shrink-0 w-24 h-16 bg-gray-100 rounded flex items-center justify-center">
                                <PlayCircle className="w-8 h-8 text-gray-400" />
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-gray-900 truncate">
                                  {course.course?.title || `Khóa học ${index + 1}`}
                                </h4>
                                {course.isRequired && (
                                  <Badge className="bg-blue-100 text-blue-700 text-xs">
                                    Bắt buộc
                                  </Badge>
                                )}
                              </div>
                              {course.course?.price !== undefined && (
                                <p className="text-sm text-gray-500">
                                  {formatPrice(course.course.price)}
                                </p>
                              )}
                            </div>

                            <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          </motion.div>
                        </Link>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Chưa có khóa học trong lộ trình này
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6 border-2 border-blue-200 shadow-xl">
              <CardHeader className="bg-blue-600 text-white">
                <CardTitle className="text-2xl">Đăng ký ngay</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Price */}
                <div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-bold text-blue-600">
                      {formatPrice(path.price)}
                    </span>
                  </div>
                  
                  {savings > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 line-through">
                        {formatPrice(totalIndividualPrice)} (mua lẻ)
                      </p>
                      <p className="text-sm font-semibold text-green-600">
                        Tiết kiệm {formatPrice(savings)} ({Math.round((savings / totalIndividualPrice) * 100)}%)
                      </p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Features */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>Truy cập trọn đời</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>{path.courseCount} khóa học chất lượng</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>Học mọi lúc, mọi nơi</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>Hỗ trợ 24/7</span>
                  </div>
                </div>

                <Separator />

                {/* CTA Buttons */}
                {path.isEnrolled ? (
                  <Button
                    disabled
                    className="w-full bg-green-600 text-white"
                    size="lg"
                  >
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Đã đăng ký
                  </Button>
                ) : path.price === 0 ? (
                  <Button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    size="lg"
                  >
                    {enrolling ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Đang đăng ký...
                      </>
                    ) : (
                      <>
                        Đăng ký miễn phí
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      size="lg"
                    >
                      {enrolling ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-5 h-5 mr-2" />
                          Mua ngay
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      size="lg"
                      onClick={() => {
                        // Add to cart logic here
                        toast.info('Tính năng thêm vào giỏ hàng đang được phát triển');
                      }}
                    >
                      Thêm vào giỏ hàng
                    </Button>
                  </>
                )}

                <p className="text-xs text-center text-gray-500">
                  Đảm bảo hoàn tiền trong 30 ngày
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}


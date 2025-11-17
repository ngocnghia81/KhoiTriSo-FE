'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { safeJsonParse, isSuccessfulResponse, extractResult, extractMessage } from '@/utils/apiHelpers';
import {
  AcademicCapIcon,
  BookOpenIcon,
  UserGroupIcon,
  StarIcon,
  ClockIcon,
  ChartBarIcon,
  CheckBadgeIcon,
  EnvelopeIcon,
  MapPinIcon,
  GlobeAltIcon,
  PlayCircleIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Course } from '@/hooks/useCourses';

interface InstructorCourse {
  id: number;
  title: string;
  thumbnail?: string;
  price: number;
  enrollments: number;
  rating: number;
  isActive: boolean;
  createdAt: string;
}

interface InstructorDetail {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  avatar?: string;
  phone?: string;
  address?: string;
  socialLinks?: string;
  teacherStaticPagePath?: string;
  teacherAdditionalInfo?: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  totalCourses: number;
  totalBooks: number;
  totalLearningPaths: number;
  totalStudents: number;
  totalEarnings: number;
  averageRating: number;
  courses: InstructorCourse[];
  stats?: {
    totalReviews: number;
    totalLessons: number;
    totalVideos: number;
    totalAssignments: number;
    courseRevenue: number;
    bookRevenue: number;
    learningPathRevenue: number;
    completionRate: number;
    studentSatisfaction: number;
  };
}

export default function InstructorProfilePage() {
  const params = useParams();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const instructorId = params?.id ? parseInt(params.id as string) : null;

  const [instructor, setInstructor] = useState<InstructorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (!instructorId) {
      setError('ID giảng viên không hợp lệ');
      setLoading(false);
      return;
    }

    const fetchInstructor = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await authenticatedFetch(`/api/instructor/${instructorId}`);
        const result = await safeJsonParse(response);

        if (isSuccessfulResponse(result)) {
          const instructorData = extractResult(result);
          if (!instructorData) {
            // If API requires auth and we don't have it, try to get basic info from courses
            console.warn('Instructor API requires auth, trying alternative approach');
            // We'll show a basic profile with courses fetched separately
            throw new Error('API_REQUIRES_AUTH');
          }

          // Transform PascalCase to camelCase
          const transformedInstructor: InstructorDetail = {
            id: instructorData.Id || instructorData.id,
            username: instructorData.Username || instructorData.username,
            email: instructorData.Email || instructorData.email,
            fullName: instructorData.FullName || instructorData.fullName,
            avatar: instructorData.Avatar || instructorData.avatar,
            phone: instructorData.Phone || instructorData.phone,
            address: instructorData.Address || instructorData.address,
            socialLinks: instructorData.SocialLinks || instructorData.socialLinks,
            teacherStaticPagePath: instructorData.TeacherStaticPagePath || instructorData.teacherStaticPagePath,
            teacherAdditionalInfo: instructorData.TeacherAdditionalInfo || instructorData.teacherAdditionalInfo,
            isActive: instructorData.IsActive || instructorData.isActive,
            emailVerified: instructorData.EmailVerified || instructorData.emailVerified,
            lastLogin: instructorData.LastLogin || instructorData.lastLogin,
            createdAt: instructorData.CreatedAt || instructorData.createdAt,
            totalCourses: instructorData.TotalCourses || instructorData.totalCourses,
            totalBooks: instructorData.TotalBooks || instructorData.totalBooks,
            totalLearningPaths: instructorData.TotalLearningPaths || instructorData.totalLearningPaths,
            totalStudents: instructorData.TotalStudents || instructorData.totalStudents,
            totalEarnings: instructorData.TotalEarnings || instructorData.totalEarnings,
            averageRating: instructorData.AverageRating || instructorData.averageRating,
            courses: (instructorData.Courses || instructorData.courses || []).map((c: any) => ({
              id: c.Id || c.id,
              title: c.Title || c.title,
              thumbnail: c.Thumbnail || c.thumbnail,
              price: c.Price || c.price,
              enrollments: c.Enrollments || c.enrollments,
              rating: c.Rating || c.rating,
              isActive: c.IsActive || c.isActive,
              createdAt: c.CreatedAt || c.createdAt,
            })),
            stats: instructorData.Stats ? {
              totalReviews: instructorData.Stats.TotalReviews || instructorData.Stats.totalReviews,
              totalLessons: instructorData.Stats.TotalLessons || instructorData.Stats.totalLessons,
              totalVideos: instructorData.Stats.TotalVideos || instructorData.Stats.totalVideos,
              totalAssignments: instructorData.Stats.TotalAssignments || instructorData.Stats.totalAssignments,
              courseRevenue: instructorData.Stats.CourseRevenue || instructorData.Stats.courseRevenue,
              bookRevenue: instructorData.Stats.BookRevenue || instructorData.Stats.bookRevenue,
              learningPathRevenue: instructorData.Stats.LearningPathRevenue || instructorData.Stats.learningPathRevenue,
              completionRate: instructorData.Stats.CompletionRate || instructorData.Stats.completionRate,
              studentSatisfaction: instructorData.Stats.StudentSatisfaction || instructorData.Stats.studentSatisfaction,
            } : undefined,
          };

          setInstructor(transformedInstructor);
        } else {
          // If API fails, try to get courses and build basic profile
          const errorMsg = extractMessage(result);
          if (errorMsg?.includes('Unauthorized') || errorMsg?.includes('Forbidden')) {
            console.warn('Instructor API requires auth, fetching courses instead');
            await fetchInstructorCourses();
          } else {
            setError(errorMsg || 'Không thể tải thông tin giảng viên');
          }
        }
      } catch (err) {
        console.error('Error fetching instructor:', err);
        // Try to fetch courses as fallback
        if (err instanceof Error && err.message.includes('API_REQUIRES_AUTH')) {
          await fetchInstructorCourses();
        } else {
          setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchInstructorCourses = async () => {
      try {
        // Fetch all courses and filter by instructor
        const response = await authenticatedFetch(`/api/courses?page=1&pageSize=100&approvalStatus=2`);
        const result = await safeJsonParse(response);
        
        if (isSuccessfulResponse(result)) {
          const coursesData = extractResult(result);
          const allCourses = coursesData?.Items || coursesData?.items || [];
          
          // Filter courses by instructorId
          const instructorCourses = allCourses.filter((c: any) => {
            const instructorIdFromCourse = c.InstructorId || c.instructorId || c.Instructor?.Id || c.instructor?.id;
            return instructorIdFromCourse === instructorId;
          });

          if (instructorCourses.length > 0) {
            // Get instructor info from first course
            const firstCourse = instructorCourses[0];
            const instructorInfo = firstCourse.Instructor || firstCourse.instructor;
            
            // Build basic instructor profile
            const basicInstructor: InstructorDetail = {
              id: instructorId!,
              username: instructorInfo?.Name || instructorInfo?.name || 'Giảng viên',
              email: '',
              fullName: instructorInfo?.Name || instructorInfo?.name || 'Giảng viên',
              avatar: instructorInfo?.Avatar || instructorInfo?.avatar,
              phone: '',
              address: '',
              socialLinks: '',
              teacherStaticPagePath: '',
              teacherAdditionalInfo: '',
              isActive: true,
              emailVerified: false,
              createdAt: new Date().toISOString(),
              totalCourses: instructorCourses.length,
              totalBooks: 0,
              totalLearningPaths: 0,
              totalStudents: instructorCourses.reduce((sum: number, c: any) => 
                sum + (c.TotalStudents || c.totalStudents || 0), 0),
              totalEarnings: 0,
              averageRating: instructorCourses.length > 0
                ? instructorCourses.reduce((sum: number, c: any) => 
                    sum + (c.Rating || c.rating || 0), 0) / instructorCourses.length
                : 0,
              courses: instructorCourses.map((c: any) => ({
                id: c.Id || c.id,
                title: c.Title || c.title,
                thumbnail: c.Thumbnail || c.thumbnail,
                price: c.Price || c.price,
                enrollments: c.TotalStudents || c.totalStudents || 0,
                rating: c.Rating || c.rating || 0,
                isActive: c.IsActive || c.isActive,
                createdAt: c.CreatedAt || c.createdAt,
              })),
            };

            setInstructor(basicInstructor);
            setCourses(instructorCourses.map((c: any) => ({
              id: c.Id || c.id,
              title: c.Title || c.title,
              description: c.Description || c.description,
              thumbnail: c.Thumbnail || c.thumbnail,
              categoryId: c.CategoryId || c.categoryId,
              category: c.Category ? {
                id: c.Category.Id || c.Category.id,
                name: c.Category.Name || c.Category.name,
              } : undefined,
              instructorId: c.InstructorId || c.instructorId,
              instructor: c.Instructor ? {
                id: c.Instructor.Id || c.Instructor.id,
                name: c.Instructor.Name || c.Instructor.name,
                avatar: c.Instructor.Avatar || c.Instructor.avatar,
              } : undefined,
              level: c.Level || c.level,
              isFree: c.IsFree || c.isFree,
              price: c.Price || c.price,
              estimatedDuration: c.EstimatedDuration || c.estimatedDuration,
              totalLessons: c.TotalLessons || c.totalLessons,
              totalStudents: c.TotalStudents || c.totalStudents,
              rating: c.Rating || c.rating,
              totalReviews: c.TotalReviews || c.totalReviews,
              approvalStatus: c.ApprovalStatus || c.approvalStatus,
              isPublished: c.IsPublished || c.isPublished,
              isActive: c.IsActive || c.isActive,
              createdAt: c.CreatedAt || c.createdAt,
              updatedAt: c.UpdatedAt || c.updatedAt,
            })));
          } else {
            setError('Không tìm thấy khóa học của giảng viên này');
          }
        }
      } catch (err) {
        console.error('Error fetching instructor courses:', err);
        setError('Không thể tải thông tin giảng viên');
      }
    };

    fetchInstructor();
  }, [instructorId, authenticatedFetch]);

  const formatPrice = (price: number) => {
    if (price === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const stripHtml = (html: string | undefined | null): string => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').trim();
  };

  const parseSocialLinks = (socialLinks: string | undefined | null) => {
    if (!socialLinks) return {};
    try {
      return JSON.parse(socialLinks);
    } catch {
      return {};
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin giảng viên...</p>
        </div>
      </div>
    );
  }

  if (error || !instructor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AcademicCapIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy giảng viên</h2>
            <p className="text-gray-600 mb-6">{error || 'Giảng viên không tồn tại'}</p>
            <Button asChild>
              <Link href="/courses">Quay lại khóa học</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const socialLinks = parseSocialLinks(instructor.socialLinks);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {instructor.avatar ? (
                <div className="relative">
                  <Image
                    src={instructor.avatar}
                    alt={instructor.fullName || instructor.username}
                    width={160}
                    height={160}
                    className="rounded-full border-4 border-white shadow-xl"
                  />
                  {instructor.emailVerified && (
                    <div className="absolute bottom-2 right-2 bg-green-500 rounded-full p-2 border-2 border-white">
                      <CheckBadgeIcon className="h-6 w-6 text-white" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-40 h-40 bg-white/20 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                  <AcademicCapIcon className="h-20 w-20 text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <h1 className="text-4xl font-bold">
                  {instructor.fullName || instructor.username}
                </h1>
                {instructor.isActive && (
                  <Badge className="bg-green-500 text-white">Đang hoạt động</Badge>
                )}
              </div>
              
              <p className="text-xl text-blue-100 mb-4">Giảng viên</p>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                    <BookOpenIcon className="h-5 w-5" />
                    <span className="text-2xl font-bold">{instructor.totalCourses}</span>
                  </div>
                  <p className="text-sm text-blue-100">Khóa học</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                    <UserGroupIcon className="h-5 w-5" />
                    <span className="text-2xl font-bold">{instructor.totalStudents.toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-blue-100">Học viên</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                    <StarIconSolid className="h-5 w-5 text-yellow-300" />
                    <span className="text-2xl font-bold">{(instructor.averageRating || 0).toFixed(1)}</span>
                  </div>
                  <p className="text-sm text-blue-100">Đánh giá</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                    <ChartBarIcon className="h-5 w-5" />
                    <span className="text-2xl font-bold">{instructor.totalBooks}</span>
                  </div>
                  <p className="text-sm text-blue-100">Sách</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Giới thiệu</h2>
                {instructor.teacherAdditionalInfo ? (
                  <div 
                    className="prose prose-sm max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: instructor.teacherAdditionalInfo }}
                  />
                ) : (
                  <p className="text-gray-600">
                    {instructor.fullName || instructor.username} là một giảng viên giàu kinh nghiệm với {instructor.totalCourses} khóa học và hơn {instructor.totalStudents.toLocaleString()} học viên.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Contact Info */}
            {(instructor.email || instructor.phone || instructor.address || Object.keys(socialLinks).length > 0) && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Thông tin liên hệ</h2>
                  <div className="space-y-3">
                    {instructor.email && (
                      <div className="flex items-center gap-3">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-700">{instructor.email}</span>
                      </div>
                    )}
                    {instructor.phone && (
                      <div className="flex items-center gap-3">
                        <AcademicCapIcon className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-700">{instructor.phone}</span>
                      </div>
                    )}
                    {instructor.address && (
                      <div className="flex items-center gap-3">
                        <MapPinIcon className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-700">{instructor.address}</span>
                      </div>
                    )}
                    {Object.keys(socialLinks).length > 0 && (
                      <div className="flex items-center gap-3">
                        <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                        <div className="flex gap-2">
                          {Object.entries(socialLinks).map(([key, value]: [string, any]) => (
                            <a
                              key={key}
                              href={value}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 underline"
                            >
                              {key}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Courses Section */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Khóa học của giảng viên
                  </h2>
                  <Badge className="bg-blue-100 text-blue-700">
                    {instructor.courses.length} khóa học
                  </Badge>
                </div>

                {instructor.courses.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Giảng viên chưa có khóa học nào
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {instructor.courses
                      .filter(c => c.isActive)
                      .map((course) => (
                        <Link
                          key={course.id}
                          href={`/courses/${course.id}`}
                          className="group"
                        >
                          <Card className="h-full hover:shadow-lg transition-all border hover:border-blue-300">
                            <CardContent className="p-0">
                              <div className="relative aspect-video bg-gray-200 overflow-hidden rounded-t-lg">
                                {course.thumbnail ? (
                                  <Image
                                    src={course.thumbnail}
                                    alt={course.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <PlayCircleIcon className="h-16 w-16 text-gray-400" />
                                  </div>
                                )}
                                <div className="absolute top-2 right-2">
                                  {course.price === 0 ? (
                                    <Badge className="bg-green-500 text-white">Miễn phí</Badge>
                                  ) : (
                                    <Badge className="bg-blue-600 text-white">
                                      {formatPrice(course.price)}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="p-4">
                                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                  {stripHtml(course.title)}
                                </h3>
                                <div className="flex items-center justify-between text-sm text-gray-600">
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center">
                                      <UserGroupIcon className="h-4 w-4 mr-1" />
                                      <span>{course.enrollments}</span>
                                    </div>
                                    {course.rating > 0 && (
                                      <div className="flex items-center">
                                        <StarIconSolid className="h-4 w-4 text-yellow-400 mr-1" />
                                        <span>{course.rating.toFixed(1)}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stats Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Thống kê</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Tổng khóa học:</span>
                    <span className="font-semibold">{instructor.totalCourses}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Tổng học viên:</span>
                    <span className="font-semibold">{instructor.totalStudents.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Đánh giá trung bình:</span>
                    <div className="flex items-center">
                      <StarIconSolid className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="font-semibold">{(instructor.averageRating || 0).toFixed(1)}</span>
                    </div>
                  </div>
                  {instructor.stats && (
                    <>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Tổng bài học:</span>
                        <span className="font-semibold">{instructor.stats.totalLessons}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Tổng đánh giá:</span>
                        <span className="font-semibold">{instructor.stats.totalReviews}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Tỷ lệ hoàn thành:</span>
                        <span className="font-semibold">{instructor.stats.completionRate.toFixed(1)}%</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Join Date */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Thông tin</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Tham gia:</span>
                    <span className="font-semibold">
                      {new Date(instructor.createdAt).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long'
                      })}
                    </span>
                  </div>
                  {instructor.lastLogin && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Đăng nhập lần cuối:</span>
                      <span className="font-semibold">
                        {new Date(instructor.lastLogin).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { useAddToCart } from '@/hooks/useCart';
import { safeJsonParse, isSuccessfulResponse, extractMessage } from '@/utils/apiHelpers';
import {
  ClockIcon,
  UserGroupIcon,
  PlayCircleIcon,
  AcademicCapIcon,
  CheckIcon,
  LockClosedIcon,
  ShoppingCartIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ReviewsSection } from '@/components/reviews/ReviewsSection';
import { liveClassApiService, LiveClassDTO } from '@/services/liveClassApi';

export interface Lesson {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  videoDuration: number;
  lessonOrder: number;
  isPublished: boolean;
  isFree: boolean;
}

export interface CourseDetail {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  instructorId: number;
  instructor: {
    id: number;
    name: string;
    avatar?: string;
    bio?: string;
  };
  categoryId: number;
  category: {
    id: number;
    name: string;
  };
  level: number;
  isFree: boolean;
  price: number;
  rating: number;
  totalReviews: number;
  totalStudents: number;
  lessons: Lesson[];
  isEnrolled: boolean;
  requirements?: string[];
  whatYouWillLearn?: string[];
  createdAt: string;
  updatedAt?: string;
}

interface CourseDetailClientProps {
  initialCourse: CourseDetail;
  courseId: number;
}

export function CourseDetailClient({ initialCourse, courseId }: CourseDetailClientProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const { addToCart } = useAddToCart();

  const [course, setCourse] = useState<CourseDetail>(initialCourse);
  const [enrolling, setEnrolling] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [liveClasses, setLiveClasses] = useState<LiveClassDTO[]>([]);
  const [joiningLiveClass, setJoiningLiveClass] = useState<number | null>(null);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    try {
      setEnrolling(true);
      const response = await authenticatedFetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
      });

      const result = await safeJsonParse(response);

      if (isSuccessfulResponse(result)) {
        toast.success('Đăng ký khóa học thành công!');
        // Update course state to reflect enrollment
        setCourse(prev => ({ ...prev, isEnrolled: true }));
        // Optionally refresh the page to get updated data
        router.refresh();
      } else {
        const message = extractMessage(result);
        toast.error(message || 'Không thể đăng ký khóa học');
      }
    } catch (err) {
      console.error('Error enrolling:', err);
      toast.error('Có lỗi xảy ra khi đăng ký');
    } finally {
      setEnrolling(false);
    }
  };

  const handleAddCourseToCart = async () => {
    if (!course) return;

    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để thêm khóa học vào giỏ hàng');
      router.push('/auth/login');
      return;
    }

    try {
      setAddingToCart(true);
      await addToCart({ ItemId: course.id, ItemType: 1 });
      toast.success(`Đã thêm "${stripHtml(course.title)}" vào giỏ hàng`);
    } catch (err) {
      if (err instanceof Error && err.message.includes('đã có trong giỏ hàng')) {
        toast.info(`"${stripHtml(course.title)}" đã có trong giỏ hàng`);
      } else {
        toast.error('Không thể thêm khóa học vào giỏ hàng');
      }
    } finally {
      setAddingToCart(false);
    }
  };

  const formatPrice = (price: number | undefined | null) => {
    if (price === undefined || price === null || price === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours} giờ ${minutes} phút`;
    }
    return `${minutes} phút`;
  };

  const canViewAllLessons = course?.isFree || course?.isEnrolled;

  // Fetch LiveClasses for this course
  useEffect(() => {
    const fetchLiveClasses = async () => {
      if (!isAuthenticated || !courseId) return;
      
      try {
        const result = await liveClassApiService.getLiveClasses(authenticatedFetch, {
          courseId: courseId,
          page: 1,
          pageSize: 100, // Get all live classes for this course
        });
        setLiveClasses(result.items);
      } catch (err) {
        console.error('Error fetching live classes:', err);
        // Don't show error toast, just silently fail
      }
    };

    fetchLiveClasses();
  }, [isAuthenticated, courseId, authenticatedFetch]);

  const handleJoinLiveClass = async (liveClassId: number, meetingUrl: string) => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // Check if user can join (course is free or user is enrolled)
    if (!course.isFree && !course.isEnrolled) {
      toast.error('Bạn cần đăng ký khóa học để tham gia lớp học trực tuyến');
      return;
    }

    try {
      setJoiningLiveClass(liveClassId);
      await liveClassApiService.joinLiveClass(authenticatedFetch, liveClassId);
      toast.success('Tham gia lớp học thành công!');
      // Open meeting URL in new tab
      window.open(meetingUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Error joining live class:', err);
      const errorMessage = err instanceof Error ? err.message : 'Không thể tham gia lớp học';
      toast.error(errorMessage);
    } finally {
      setJoiningLiveClass(null);
    }
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 0: return 'Đã lên lịch';
      case 1: return 'Đang diễn ra';
      case 2: return 'Đã kết thúc';
      case 3: return 'Đã hủy';
      default: return 'Không xác định';
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return 'bg-blue-100 text-blue-700';
      case 1: return 'bg-green-100 text-green-700';
      case 2: return 'bg-gray-100 text-gray-700';
      case 3: return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Strip HTML tags
  const stripHtml = (html: string | undefined | null): string => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').trim();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/" className="text-gray-700 hover:text-blue-600">
                  Trang chủ
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <Link href="/courses" className="text-gray-700 hover:text-blue-600">
                    Khóa học
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-gray-500 line-clamp-1">{stripHtml(course.title)}</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Hero Section - Udemy Style */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-blue-100 text-blue-700 text-xs">
              {course.category.name}
            </Badge>
            {course.isFree && (
              <Badge className="bg-green-100 text-green-700 text-xs">
                Miễn phí
              </Badge>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {stripHtml(course.title)}
          </h1>
          <p className="text-lg text-gray-600 mb-4 max-w-4xl">
            {stripHtml(course.description)}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <StarIconSolid className="h-5 w-5 text-yellow-400 mr-1" />
              <span className="font-semibold text-gray-900">{(course.rating || 0).toFixed(1)}</span>
              <span className="ml-1">({course.totalReviews || 0})</span>
            </div>
            <div className="flex items-center">
              <UserGroupIcon className="h-5 w-5 text-gray-400 mr-1" />
              <span>{(course.totalStudents || 0).toLocaleString()} học viên</span>
            </div>
            <div className="flex items-center">
              <ClockIcon className="h-5 w-5 text-gray-400 mr-1" />
              <span>{course.lessons.length} bài học</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Preview */}
            <Card className="overflow-hidden">
              <div className="relative aspect-video bg-black">
                {course.thumbnail ? (
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <PlayCircleIcon className="h-24 w-24 text-gray-300" />
                  </div>
                )}
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <button className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg">
                    <PlayCircleIcon className="h-12 w-12 text-blue-600" />
                  </button>
                </div>
              </div>
            </Card>

            {/* Instructor Section */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Giảng viên</h2>
                <div className="flex items-start space-x-4">
                  {course.instructor.avatar ? (
                    <Image
                      src={course.instructor.avatar}
                      alt={course.instructor.name}
                      width={64}
                      height={64}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <AcademicCapIcon className="h-8 w-8 text-blue-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Link
                      href={`/instructors/${course.instructor.id}`}
                      className="text-lg font-bold text-gray-900 hover:text-blue-600 block mb-1"
                    >
                      {course.instructor.name}
                    </Link>
                    {course.instructor.bio && (
                      <p className="text-sm text-gray-600 mb-2">{course.instructor.bio}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What You Will Learn */}
            {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Bạn sẽ học được gì?
                  </h2>
                  <ul className="space-y-3">
                    {course.whatYouWillLearn.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{stripHtml(item)}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Requirements */}
            {course.requirements && course.requirements.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Yêu cầu
                  </h2>
                  <ul className="space-y-3">
                    {course.requirements.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{stripHtml(item)}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Course Curriculum */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Nội dung khóa học
                  </h2>
                  {!canViewAllLessons && (
                    <Badge variant="outline" className="text-orange-600 border-orange-300">
                      {course.lessons.length} bài học miễn phí
                    </Badge>
                  )}
                </div>

                {course.lessons.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Chưa có bài học nào trong khóa học này
                  </p>
                ) : (
                  <div className="space-y-2">
                    {course.lessons
                      .sort((a, b) => a.lessonOrder - b.lessonOrder)
                      .map((lesson, index) => {
                        const canView = lesson.isFree || canViewAllLessons;
                        return (
                          <div
                            key={lesson.id}
                            className={`flex items-center justify-between p-4 rounded-lg border ${
                              canView
                                ? 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                : 'bg-gray-50 border-gray-200 opacity-75'
                            } transition-all`}
                          >
                            <div className="flex items-center flex-1">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                                canView ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-400'
                              }`}>
                                {canView ? (
                                  <PlayCircleIcon className="h-5 w-5" />
                                ) : (
                                  <LockClosedIcon className="h-5 w-5" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h3 className={`font-semibold ${
                                    canView ? 'text-gray-900' : 'text-gray-500'
                                  }`}>
                                    {index + 1}. {stripHtml(lesson.title)}
                                  </h3>
                                  {lesson.isFree && (
                                    <Badge className="bg-green-100 text-green-700 text-xs">
                                      Miễn phí
                                    </Badge>
                                  )}
                                </div>
                                {lesson.description && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {stripHtml(lesson.description)}
                                  </p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                  <span className="flex items-center">
                                    <ClockIcon className="h-4 w-4 mr-1" />
                                    {formatDuration(lesson.videoDuration)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {canView ? (
                              <Link
                                href={`/courses/${course.id}/lessons/${lesson.id}`}
                                className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                              >
                                Xem
                              </Link>
                            ) : (
                              <div className="ml-4 px-4 py-2 bg-gray-300 text-gray-500 rounded-lg text-sm font-semibold cursor-not-allowed">
                                Khóa
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}

                {!canViewAllLessons && (
                  <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-800">
                      🔒 Một số bài học đã bị khóa. Đăng ký khóa học để xem tất cả nội dung.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Live Classes Section */}
            {liveClasses.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Lớp học trực tuyến
                  </h2>
                  <div className="space-y-4">
                    {liveClasses.map((liveClass) => {
                      const canJoin = (course.isFree || course.isEnrolled) && liveClass.status === 1;
                      const isJoining = joiningLiveClass === liveClass.id;
                      
                      return (
                        <div
                          key={liveClass.id}
                          className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-all"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <VideoCameraIcon className="h-5 w-5 text-blue-600" />
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {stripHtml(liveClass.title)}
                                </h3>
                                <Badge className={getStatusColor(liveClass.status)}>
                                  {getStatusLabel(liveClass.status)}
                                </Badge>
                              </div>
                              {liveClass.description && (
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                  {stripHtml(liveClass.description)}
                                </p>
                              )}
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center">
                                  <ClockIcon className="h-4 w-4 mr-1" />
                                  {new Date(liveClass.scheduledAt).toLocaleDateString('vi-VN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })}
                                </div>
                                <div className="flex items-center">
                                  <ClockIcon className="h-4 w-4 mr-1" />
                                  {new Date(liveClass.scheduledAt).toLocaleTimeString('vi-VN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })} ({liveClass.durationMinutes} phút)
                                </div>
                                {liveClass.maxParticipants && (
                                  <div className="flex items-center">
                                    <UserGroupIcon className="h-4 w-4 mr-1" />
                                    Tối đa {liveClass.maxParticipants} học viên
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="ml-4">
                              {canJoin ? (
                                <Button
                                  onClick={() => handleJoinLiveClass(liveClass.id, liveClass.meetingUrl)}
                                  disabled={isJoining}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  {isJoining ? 'Đang tham gia...' : 'Tham gia'}
                                </Button>
                              ) : !course.isFree && !course.isEnrolled ? (
                                <Badge variant="outline" className="text-orange-600 border-orange-300">
                                  Cần đăng ký
                                </Badge>
                              ) : liveClass.status === 0 ? (
                                <Badge variant="outline" className="text-blue-600 border-blue-300">
                                  Chưa bắt đầu
                                </Badge>
                              ) : liveClass.status === 2 ? (
                                <Badge variant="outline" className="text-gray-600 border-gray-300">
                                  Đã kết thúc
                                </Badge>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews Section */}
            {courseId && (
              <Card>
                <CardContent className="p-6">
                  <ReviewsSection
                    itemType={1}
                    itemId={courseId}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                {/* Price */}
                <div className="text-center mb-6">
                  {course.isFree ? (
                    <div>
                      <div className="text-4xl font-bold text-green-600 mb-2">
                        Miễn phí
                      </div>
                      <p className="text-sm text-gray-500">
                        Bắt đầu học ngay
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="text-4xl font-bold text-blue-600 mb-2">
                        {formatPrice(course.price)}
                      </div>
                      <p className="text-sm text-gray-500">
                        Một lần thanh toán, học mãi mãi
                      </p>
                    </div>
                  )}
                </div>

                <Separator className="my-6" />

                {/* Action Buttons */}
                {course.isEnrolled ? (
                  <div className="space-y-3">
                    <Button
                      asChild
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      size="lg"
                    >
                      <Link href={`/courses/${course.id}/lessons`}>
                        <PlayCircleIcon className="h-5 w-5 mr-2" />
                        Tiếp tục học
                      </Link>
                    </Button>
                    <p className="text-sm text-center text-gray-500">
                      Bạn đã đăng ký khóa học này
                    </p>
                  </div>
                ) : course.isFree ? (
                  <Button
                    onClick={handleEnroll}
                    disabled={enrolling || !isAuthenticated}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    size="lg"
                  >
                    {enrolling ? (
                      'Đang đăng ký...'
                    ) : !isAuthenticated ? (
                      'Đăng nhập để học'
                    ) : (
                      <>
                        <PlayCircleIcon className="h-5 w-5 mr-2" />
                        Đăng ký miễn phí
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Button
                      onClick={handleAddCourseToCart}
                      disabled={addingToCart}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-70 disabled:cursor-not-allowed"
                      size="lg"
                    >
                      <>
                        <ShoppingCartIcon className="h-5 w-5 mr-2" />
                        {addingToCart ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
                      </>
                    </Button>
                    {!isAuthenticated && (
                      <p className="text-sm text-center text-gray-500">
                        <Link href="/auth/login" className="text-blue-600 hover:underline">
                          Đăng nhập
                        </Link>
                        {' '}để mua khóa học
                      </p>
                    )}
                  </div>
                )}

                <Separator className="my-6" />

                {/* Course Info */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Cấp độ:</span>
                    <span className="font-semibold">
                      {course.level === 1 ? 'Dễ' : course.level === 2 ? 'Trung bình' : course.level === 3 ? 'Khó' : 'Chưa xác định'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Số bài học:</span>
                    <span className="font-semibold">{course.lessons.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Đánh giá:</span>
                    <div className="flex items-center">
                      <StarIconSolid className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="font-semibold">{(course.rating || 0).toFixed(1)}</span>
                      <span className="text-gray-500 ml-1">({course.totalReviews || 0})</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}


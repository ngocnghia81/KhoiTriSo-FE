'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { safeJsonParse, isSuccessfulResponse, extractResult } from '@/utils/apiHelpers';
import {
  PlayCircleIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ClockIcon,
  BookOpenIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';

interface Lesson {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  videoDuration: number;
  lessonOrder: number;
  isPublished: boolean;
  isFree: boolean;
  userProgress?: {
    isCompleted: boolean;
    watchTime: number;
    lastAccessed: string;
  };
}

interface CourseDetail {
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
  isFree: boolean;
  price: number;
  isEnrolled: boolean;
  totalLessons: number;
  totalStudents: number;
  rating: number;
  totalReviews: number;
}

const formatDuration = (seconds: number | undefined | null) => {
  if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const stripHtml = (html: string | undefined | null) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
};

export default function CourseLessonsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const courseId = params?.id ? parseInt(params.id as string) : null;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));

  useEffect(() => {
    if (!courseId || isNaN(courseId)) {
      setError('ID khóa học không hợp lệ');
      setLoading(false);
      return;
    }

    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch course details
      const courseResponse = await authenticatedFetch(`/api/courses/${courseId}`);
      const courseResult = await safeJsonParse(courseResponse);

      if (!courseResponse.ok) {
        const errorData = await courseResponse.json().catch(() => ({}));
        const errorMessage = errorData.Message || errorData.message || 'Không tìm thấy khóa học';
        setError(errorMessage);
        setLoading(false);
        return;
      }

      if (isSuccessfulResponse(courseResult)) {
        const courseData = extractResult(courseResult);
        if (courseData) {
          const transformedCourse: CourseDetail = {
            id: courseData.Id || courseData.id,
            title: courseData.Title || courseData.title,
            description: courseData.Description || courseData.description,
            thumbnail: courseData.Thumbnail || courseData.thumbnail,
            instructor: courseData.Instructor || courseData.instructor ? {
              id: (courseData.Instructor || courseData.instructor).Id || (courseData.Instructor || courseData.instructor).id,
              name: (courseData.Instructor || courseData.instructor).Name || (courseData.Instructor || courseData.instructor).name,
              avatar: (courseData.Instructor || courseData.instructor).Avatar || (courseData.Instructor || courseData.instructor).avatar,
            } : undefined,
            category: courseData.Category || courseData.category ? {
              id: (courseData.Category || courseData.category).Id || (courseData.Category || courseData.category).id,
              name: (courseData.Category || courseData.category).Name || (courseData.Category || courseData.category).name,
            } : undefined,
            isFree: courseData.IsFree || courseData.isFree || false,
            price: courseData.Price || courseData.price || 0,
            isEnrolled: courseData.IsEnrolled || courseData.isEnrolled || false,
            totalLessons: courseData.TotalLessons || courseData.totalLessons || 0,
            totalStudents: courseData.TotalStudents || courseData.totalStudents || 0,
            rating: courseData.Rating || courseData.rating || 0,
            totalReviews: courseData.TotalReviews || courseData.totalReviews || 0,
          };
          setCourse(transformedCourse);
        }
      }

      // Fetch lessons
      const lessonsResponse = await authenticatedFetch(`/api/courses/${courseId}/lessons`);
      const lessonsResult = await safeJsonParse(lessonsResponse);

      if (isSuccessfulResponse(lessonsResult)) {
        const lessonsData = extractResult(lessonsResult);
        let lessonsArray = [];
        
        if (Array.isArray(lessonsData)) {
          lessonsArray = lessonsData;
        } else if (lessonsData?.Items || lessonsData?.items) {
          lessonsArray = lessonsData.Items || lessonsData.items;
        } else if (lessonsData?.Lessons || lessonsData?.lessons) {
          lessonsArray = lessonsData.Lessons || lessonsData.lessons;
        }

        const transformedLessons = lessonsArray.map((l: any) => ({
          id: l.Id || l.id,
          title: l.Title || l.title,
          description: l.Description || l.description,
          videoUrl: l.VideoUrl || l.videoUrl,
          videoDuration: l.VideoDuration || l.videoDuration || 0,
          lessonOrder: l.LessonOrder || l.lessonOrder || l.OrderIndex || l.orderIndex,
          isPublished: l.IsPublished !== undefined ? l.IsPublished : (l.IsPublished || l.isPublished),
          isFree: l.IsFree || l.isFree || false,
          userProgress: l.UserProgress || l.userProgress ? {
            isCompleted: (l.UserProgress || l.userProgress).IsCompleted || (l.UserProgress || l.userProgress).isCompleted,
            watchTime: (l.UserProgress || l.userProgress).WatchTime || (l.UserProgress || l.userProgress).watchTime || 0,
            lastAccessed: (l.UserProgress || l.userProgress).LastAccessed || (l.UserProgress || l.userProgress).lastAccessed,
          } : undefined,
        })).sort((a: Lesson, b: Lesson) => a.lessonOrder - b.lessonOrder);

        setLessons(transformedLessons);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const canViewLesson = (lesson: Lesson) => {
    if (course?.isFree) return true;
    if (lesson.isFree) return true;
    if (course?.isEnrolled) return true;
    return false;
  };

  const toggleSection = (index: number) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleLessonClick = (lesson: Lesson) => {
    if (!canViewLesson(lesson)) {
      return;
    }
    router.push(`/courses/${courseId}/lessons/${lesson.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-red-900 mb-2">Không tìm thấy khóa học</h2>
                <p className="text-red-700 mb-6">{error || 'Khóa học không tồn tại'}</p>
                <Button asChild>
                  <Link href="/courses">Quay lại danh sách khóa học</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const completedLessons = lessons.filter(l => l.userProgress?.isCompleted).length;
  const totalLessons = lessons.length;
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 max-w-7xl py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/courses/${courseId}`)}
                className="flex items-center gap-2"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                Quay lại
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{stripHtml(course.title)}</h1>
                <p className="text-sm text-gray-600">Nội dung khóa học</p>
              </div>
            </div>
            {course.isEnrolled && (
              <div className="text-right">
                <div className="text-sm text-gray-600">Tiến độ</div>
                <div className="text-lg font-bold text-blue-600">
                  {completedLessons}/{totalLessons} bài học
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Curriculum */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Nội dung khóa học</CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  {totalLessons} bài học • {formatDuration(lessons.reduce((sum, l) => sum + (l.videoDuration || 0), 0))} tổng thời lượng
                </p>
              </CardHeader>
              <CardContent>
                {/* Progress Bar */}
                {course.isEnrolled && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Tiến độ của bạn</span>
                      <span className="text-sm font-medium text-blue-600">{Math.round(progressPercentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Lessons List */}
                <div className="space-y-2">
                  {lessons.map((lesson, index) => {
                    const canView = canViewLesson(lesson);
                    const isCompleted = lesson.userProgress?.isCompleted;
                    const watchTime = lesson.userProgress?.watchTime || 0;
                    const videoDuration = lesson.videoDuration || 0;
                    const watchProgress = videoDuration > 0 ? (watchTime / videoDuration) * 100 : 0;

                    return (
                      <motion.div
                        key={lesson.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div
                          className={`border border-gray-200 rounded-lg p-4 transition-all ${
                            canView
                              ? 'hover:border-blue-500 hover:shadow-md cursor-pointer bg-white'
                              : 'bg-gray-50 opacity-75'
                          }`}
                          onClick={() => handleLessonClick(lesson)}
                        >
                          <div className="flex items-start gap-4">
                            {/* Icon */}
                            <div className="flex-shrink-0 mt-1">
                              {canView ? (
                                isCompleted ? (
                                  <CheckCircleIconSolid className="h-6 w-6 text-green-600" />
                                ) : (
                                  <PlayCircleIcon className="h-6 w-6 text-blue-600" />
                                )
                              ) : (
                                <LockClosedIcon className="h-6 w-6 text-gray-400" />
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <h3 className={`font-medium mb-1 ${
                                    canView ? 'text-gray-900' : 'text-gray-500'
                                  }`}>
                                    {index + 1}. {stripHtml(lesson.title)}
                                  </h3>
                                  {lesson.description && (
                                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                      {stripHtml(lesson.description)}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <div className="flex items-center gap-1">
                                      <ClockIcon className="h-4 w-4" />
                                      <span>{formatDuration(lesson.videoDuration)}</span>
                                    </div>
                                    {lesson.isFree && (
                                      <Badge variant="outline" className="text-xs">Miễn phí</Badge>
                                    )}
                                    {isCompleted && (
                                      <Badge className="bg-green-600 text-white text-xs">Hoàn thành</Badge>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Progress Bar for enrolled users */}
                              {course.isEnrolled && canView && videoDuration > 0 && (
                                <div className="mt-3">
                                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div
                                      className={`h-1.5 rounded-full transition-all ${
                                        isCompleted ? 'bg-green-600' : 'bg-blue-600'
                                      }`}
                                      style={{ width: `${Math.min(watchProgress, 100)}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Action */}
                            {canView && (
                              <div className="flex-shrink-0">
                                <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {lessons.length === 0 && (
                  <div className="text-center py-12">
                    <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Chưa có bài học nào trong khóa học này</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Course Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Thông tin khóa học</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {course.thumbnail && course.thumbnail.startsWith('http') && (
                    <div className="relative w-full h-32 bg-gray-200 rounded-lg overflow-hidden">
                      <Image
                        src={course.thumbnail}
                        alt={course.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                  
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-600">Số bài học:</span>
                      <p className="font-semibold text-gray-900">{totalLessons}</p>
                    </div>
                    <Separator />
                    <div>
                      <span className="text-gray-600">Tổng thời lượng:</span>
                      <p className="font-semibold text-gray-900">
                        {formatDuration(lessons.reduce((sum, l) => sum + (l.videoDuration || 0), 0))}
                      </p>
                    </div>
                    {course.isEnrolled && (
                      <>
                        <Separator />
                        <div>
                          <span className="text-gray-600">Tiến độ:</span>
                          <p className="font-semibold text-blue-600">
                            {completedLessons}/{totalLessons} bài học ({Math.round(progressPercentage)}%)
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {!course.isEnrolled && (
                    <>
                      <Separator />
                      <Button
                        asChild
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        <Link href={`/courses/${courseId}`}>
                          Đăng ký khóa học
                        </Link>
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Instructor Card */}
              {course.instructor && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Giảng viên</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      {course.instructor.avatar ? (
                        <Image
                          src={course.instructor.avatar}
                          alt={course.instructor.name}
                          width={48}
                          height={48}
                          className="rounded-full"
                          unoptimized
                        />
                      ) : (
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {course.instructor.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">{course.instructor.name}</p>
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 h-auto text-blue-600"
                          asChild
                        >
                          <Link href={`/instructors/${course.instructor.id}`}>
                            Xem hồ sơ
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


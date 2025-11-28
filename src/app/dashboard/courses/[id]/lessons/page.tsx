"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import {
  PlusIcon,
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  ClockIcon,
  DocumentTextIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

function LessonsClient() {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  
  const [lessons, setLessons] = useState<any[]>([]);
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
        
        // Load course info
        const courseResp = await authenticatedFetch(`${baseUrl}/courses/${courseId}`);
        const courseData = await courseResp.json();
        
        if (!courseResp.ok) {
          setError(courseData.Message || 'Không thể tải thông tin khóa học');
          return;
        }
        
        const courseInfo = courseData?.Result?.Result ?? courseData?.Result ?? courseData;
        setCourse(courseInfo);
        
        // Load lessons
        const lessonsResp = await authenticatedFetch(`${baseUrl}/courses/${courseId}/lessons`);
        const lessonsData = await lessonsResp.json();
        
        if (lessonsResp.ok) {
          const lessonsList = lessonsData?.Result?.Items ?? lessonsData?.Result ?? lessonsData?.items ?? [];
          setLessons(lessonsList);
        }
        
      } catch (err) {
        setError('Có lỗi xảy ra khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      loadData();
    }
  }, [courseId, authenticatedFetch]);

  const handleCreateLesson = () => {
    router.push(`/dashboard/courses/${courseId}/lessons/create`);
  };

  const handleEditLesson = (lessonId: number) => {
    router.push(`/dashboard/courses/${courseId}/lessons/${lessonId}/edit`);
  };

  const handleDeleteLesson = async (lessonId: number) => {
    if (!confirm('Xóa bài học này?')) return;
    
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
    const resp = await authenticatedFetch(`${baseUrl}/lessons/${lessonId}`, { method: 'DELETE' });
    if (resp.ok) {
      // Reload lessons
      const lessonsResp = await authenticatedFetch(`${baseUrl}/courses/${courseId}/lessons`);
      const lessonsData = await lessonsResp.json();
      const lessonsList = lessonsData?.Result?.Items ?? lessonsData?.Result ?? lessonsData?.items ?? [];
      setLessons(lessonsList);
    }
  };

  const formatDuration = (duration: number | null | undefined) => {
    if (!duration && duration !== 0) return 'Không xác định';
    // VideoDuration từ API là giây, cần convert sang phút/giờ
    const totalSeconds = duration;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m${seconds > 0 ? ` ${seconds}s` : ''}`;
    }
    if (minutes > 0) {
      return `${minutes}m${seconds > 0 ? ` ${seconds}s` : ''}`;
    }
    return `${seconds}s`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Lỗi</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
        <button
          onClick={() => router.push('/dashboard/courses')}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Quay lại danh sách khóa học
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/dashboard/courses')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Quay lại
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Quản lý bài học
            </h1>
            <p className="text-sm text-gray-600">
              {course?.Title || course?.title || 'Khóa học'}
            </p>
          </div>
        </div>
        <button
          onClick={handleCreateLesson}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Thêm bài học
        </button>
      </div>

      {/* Lessons list */}
      <div className="bg-white shadow rounded-lg">
        {lessons.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {lessons.map((lesson: any, index: number) => (
              <div key={lesson.id || lesson.Id || index} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <PlayIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {lesson.title || lesson.Title || `Bài ${lesson.lessonOrder || lesson.LessonOrder || index + 1}`}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {lesson.description || lesson.Description || 'Không có mô tả'}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {formatDuration(lesson.VideoDuration ?? lesson.videoDuration ?? lesson.Duration ?? lesson.duration)}
                        </div>
                        <div className="flex items-center">
                          <DocumentTextIcon className="h-4 w-4 mr-1" />
                          {lesson.Materials?.length ?? lesson.materials?.length ?? 0} tài liệu
                        </div>
                        <div className="flex items-center">
                          <AcademicCapIcon className="h-4 w-4 mr-1" />
                          {lesson.Assignments?.length ?? lesson.assignments?.length ?? 0} bài tập
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      (lesson.IsPublished ?? lesson.isPublished ?? false) ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {(lesson.IsPublished ?? lesson.isPublished ?? false) ? 'Đã xuất bản' : 'Chưa xuất bản'}
                    </span>
                    <button
                      onClick={() => handleEditLesson(lesson.id || lesson.Id)}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteLesson(lesson.id || lesson.Id)}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg border border-red-300 text-sm text-red-600 hover:bg-red-50"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <PlayIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có bài học</h3>
            <p className="mt-1 text-sm text-gray-500">
              Bắt đầu bằng cách tạo bài học đầu tiên cho khóa học này.
            </p>
            <div className="mt-6">
              <button
                onClick={handleCreateLesson}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Thêm bài học
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LessonsPage() {
  return <LessonsClient />;
}

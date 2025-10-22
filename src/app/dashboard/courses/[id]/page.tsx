"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import {
  AcademicCapIcon,
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  UserGroupIcon,
  ClockIcon,
  CurrencyDollarIcon,
  EyeIcon,
  PlayIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const renderStars = (rating: number) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <StarIconSolid
          key={i}
          className={`h-4 w-4 ${
            i < fullStars ? 'text-yellow-400' : 'text-gray-200'
          }`}
        />
      ))}
      <span className="ml-1 text-sm text-gray-600">{rating}</span>
    </div>
  );
};

const getLevelBadge = (level: string) => {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  
  switch (level) {
    case 'Cơ bản':
      return `${baseClasses} bg-green-100 text-green-800`;
    case 'Trung bình':
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    case 'Nâng cao':
      return `${baseClasses} bg-red-100 text-red-800`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`;
  }
};

const getStatusBadge = (status: string) => {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  
  switch (status) {
    case 'Published':
    case 'Approved':
      return `${baseClasses} bg-green-100 text-green-800`;
    case 'Pending':
    case 'Under Review':
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    case 'Draft':
    case 'Rejected':
      return `${baseClasses} bg-red-100 text-red-800`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`;
  }
};

function CourseDetailClient() {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load course details
        const courseResp = await authenticatedFetch(`/api/courses/${id}`);
        const courseData = await courseResp.json();
        
        if (!courseResp.ok) {
          setError(courseData.Message || 'Không thể tải thông tin khóa học');
          return;
        }
        
        const courseInfo = courseData?.Result?.Result ?? courseData?.Result ?? courseData;
        setCourse(courseInfo);
        
        // Load lessons for this course
        const lessonsResp = await authenticatedFetch(`/api/courses/${id}/lessons`);
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

    if (id) {
      loadCourse();
    }
  }, [id, authenticatedFetch]);

  const handleEdit = () => {
    router.push(`/dashboard/courses/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm('Xóa khóa học này?')) return;
    
    const resp = await authenticatedFetch(`/api/courses/${id}`, { method: 'DELETE' });
    if (resp.ok) {
      router.push('/dashboard/courses');
    }
  };

  const handleAddLesson = () => {
    router.push(`/dashboard/courses/${id}/lessons`);
  };

  const handleEnroll = async () => {
    const resp = await authenticatedFetch(`/api/courses/${id}/enroll`, { method: 'POST' });
    if (resp.ok) {
      // Reload course data
      const courseResp = await authenticatedFetch(`/api/courses/${id}`);
      const courseData = await courseResp.json();
      const courseInfo = courseData?.Result?.Result ?? courseData?.Result ?? courseData;
      setCourse(courseInfo);
    }
  };

  const handleUnenroll = async () => {
    const resp = await authenticatedFetch(`/api/courses/${id}/unenroll`, { method: 'DELETE' });
    if (resp.ok) {
      // Reload course data
      const courseResp = await authenticatedFetch(`/api/courses/${id}`);
      const courseData = await courseResp.json();
      const courseInfo = courseData?.Result?.Result ?? courseData?.Result ?? courseData;
      setCourse(courseInfo);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
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
            <XCircleIcon className="h-5 w-5 text-red-400" />
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
          Quay lại danh sách
        </button>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Không tìm thấy khóa học</h1>
          <p className="mt-2 text-sm text-gray-600">Khóa học này không tồn tại hoặc đã bị xóa.</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/courses')}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Quay lại danh sách
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
          <h1 className="text-2xl font-semibold text-gray-900">
            {course.title || course.name || 'Chi tiết khóa học'}
          </h1>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleEdit}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Chỉnh sửa
          </button>
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Xóa
          </button>
        </div>
      </div>

      {/* Course thumbnail */}
      <div className="aspect-video bg-gray-200 relative rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-80"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <AcademicCapIcon className="h-24 w-24 text-white" />
        </div>
        
        {/* Status badges */}
        <div className="absolute top-4 left-4 flex space-x-2">
          {course.isFree && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Miễn phí
            </span>
          )}
          <span className={getStatusBadge(course.status || course.approvalStatus || 'Draft')}>
            {course.status || course.approvalStatus || 'Draft'}
          </span>
        </div>
      </div>

      {/* Course info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic info */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-blue-600 font-medium">
                {course.Category?.Name || course.categoryName || course.category || '-'}
              </span>
              <span className={getLevelBadge(course.Level === 1 ? 'Cơ bản' : course.Level === 2 ? 'Trung bình' : course.Level === 3 ? 'Nâng cao' : 'Cơ bản')}>
                {course.Level === 1 ? 'Cơ bản' : course.Level === 2 ? 'Trung bình' : course.Level === 3 ? 'Nâng cao' : 'Cơ bản'}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {course.Title || course.title || course.name || 'Khóa học'}
            </h2>

            <p className="text-gray-600 mb-6">
              {course.Description || course.description || 'Không có mô tả'}
            </p>

            {/* Instructor */}
            <div className="flex items-center mb-6">
              <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center mr-4">
                <span className="text-lg font-medium text-white">
                  {(course.Instructor?.Name?.charAt(0)) || (course.instructor?.name?.charAt(0)) || (course.instructorName?.charAt?.(0)) || '?'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {course.Instructor?.Name || course.instructor?.name || course.instructorName || 'Giảng viên'}
                </p>
                <p className="text-sm text-gray-500">Giảng viên</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {course.Lessons?.length ?? course.totalLessons ?? course.lessonsCount ?? 0}
                </div>
                <div className="text-sm text-gray-500">Bài học</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {(course.TotalStudents ?? course.totalStudents ?? course.studentsCount ?? 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Học viên</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {course.Rating ?? course.rating ?? 0}
                </div>
                <div className="text-sm text-gray-500">Đánh giá</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {course.TotalReviews ?? course.totalReviews ?? 0}
                </div>
                <div className="text-sm text-gray-500">Nhận xét</div>
              </div>
            </div>
          </div>

          {/* Lessons */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Danh sách bài học</h3>
            {lessons.length > 0 ? (
              <div className="space-y-3">
                {lessons.map((lesson: any, index: number) => (
                  <div key={lesson.id || lesson.Id || index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <PlayIcon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {lesson.title || lesson.name || `Bài ${index + 1}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {lesson.duration || lesson.estimatedDuration || 'Không xác định'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        lesson.isPublished !== false ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {lesson.isPublished !== false ? 'Đã xuất bản' : 'Chưa xuất bản'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Chưa có bài học nào</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price and enrollment */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center mb-4">
              {course.IsFree || course.isFree || course.price === 0 ? (
                <div className="text-3xl font-bold text-green-600">Miễn phí</div>
              ) : (
                <div className="text-3xl font-bold text-gray-900">
                  {(course.Price ?? course.price ?? 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleAddLesson}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Quản lý bài học
              </button>
            </div>
          </div>

          {/* Course details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin khóa học</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Ngôn ngữ</dt>
                <dd className="text-sm text-gray-900">{course.Language || course.language || 'Tiếng Việt'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Thời lượng ước tính</dt>
                <dd className="text-sm text-gray-900">{course.EstimatedDuration || course.estimatedDuration || 'Không xác định'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Ngày tạo</dt>
                <dd className="text-sm text-gray-900">
                  {course.CreatedAt ? new Date(course.CreatedAt).toLocaleDateString('vi-VN') : 'Không xác định'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Cập nhật lần cuối</dt>
                <dd className="text-sm text-gray-900">
                  {course.UpdatedAt ? new Date(course.UpdatedAt).toLocaleDateString('vi-VN') : 'Không xác định'}
                </dd>
              </div>
            </dl>
          </div>

          {/* Requirements */}
          {(course.Requirements && course.Requirements.length > 0) || (course.requirements && course.requirements.length > 0) ? (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Yêu cầu</h3>
              <ul className="space-y-2">
                {(course.Requirements || course.requirements || []).map((req: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <div className="h-2 w-2 rounded-full bg-blue-600 mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-sm text-gray-700">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* What you'll learn */}
          {(course.WhatYouWillLearn && course.WhatYouWillLearn.length > 0) || (course.whatYouWillLearn && course.whatYouWillLearn.length > 0) ? (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bạn sẽ học được gì</h3>
              <ul className="space-y-2">
                {(course.WhatYouWillLearn || course.whatYouWillLearn || []).map((item: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <CheckCircleIcon className="h-4 w-4 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function CourseDetailPage() {
  return <CourseDetailClient />;
}

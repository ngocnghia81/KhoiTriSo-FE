'use client';

import { useState, useEffect } from 'react';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import {
  AcademicCapIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

interface Course {
  id: number;
  title: string;
  description: string;
  instructorId: number;
  instructorName?: string;
  categoryId: number;
  categoryName?: string;
  level: number;
  price: number;
  isFree: boolean;
  isPublished: boolean;
  isActive: boolean;
  thumbnail: string;
  staticPagePath?: string;
  createdAt: string;
  updatedAt: string;
  enrollmentCount?: number;
  rating?: number;
  reviewCount?: number;
  lessonCount?: number;
}

interface CourseFilters {
  category?: number;
  level?: number;
  isFree?: boolean;
  search?: string;
  approvalStatus?: number;
  page: number;
  pageSize: number;
}

export default function CoursesManagementPage() {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CourseFilters>({
    page: 1,
    pageSize: 20
  });
  const [totalCount, setTotalCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'all' | 'free' | 'paid' | 'pending'>('all');

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (filters.category) queryParams.append('category', filters.category.toString());
      if (filters.level !== undefined) queryParams.append('level', filters.level.toString());
      if (filters.isFree !== undefined) queryParams.append('isFree', filters.isFree.toString());
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.approvalStatus !== undefined) queryParams.append('approvalStatus', filters.approvalStatus.toString());
      queryParams.append('page', filters.page.toString());
      queryParams.append('pageSize', filters.pageSize.toString());

      const resp = await authenticatedFetch(`/api/courses?${queryParams}`);
      const data = await resp.json();
      
      if (resp.ok) {
        const result = data?.Result || data;
        setCourses(result?.Items || result?.items || []);
        setTotalCount(result?.TotalCount || result?.totalCount || 0);
      } else {
        setError(data?.Message || 'Không thể tải danh sách khóa học');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const resp = await authenticatedFetch('/api/categories?pageSize=100');
      const data = await resp.json();
      
      if (resp.ok) {
        const result = data?.Result || data;
        setCategories(result?.Items || result?.items || []);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  useEffect(() => {
    loadCourses();
    loadCategories();
  }, [filters]);

  const handleFilterChange = (key: keyof CourseFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handleTabChange = (tab: 'all' | 'free' | 'paid' | 'pending') => {
    setActiveTab(tab);
    switch (tab) {
      case 'free':
        handleFilterChange('isFree', true);
        handleFilterChange('approvalStatus', undefined);
        break;
      case 'paid':
        handleFilterChange('isFree', false);
        handleFilterChange('approvalStatus', undefined);
        break;
      case 'pending':
        handleFilterChange('approvalStatus', 0); // Assuming 0 = pending
        handleFilterChange('isFree', undefined);
        break;
      default:
        handleFilterChange('isFree', undefined);
        handleFilterChange('approvalStatus', undefined);
        break;
    }
  };

  const handleToggleStatus = async (courseId: number, currentStatus: boolean) => {
    try {
      const resp = await authenticatedFetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      
      if (resp.ok) {
        await loadCourses();
        alert('Cập nhật trạng thái khóa học thành công!');
      } else {
        const data = await resp.json();
        alert(data?.Message || 'Có lỗi xảy ra khi cập nhật');
      }
    } catch (err) {
      alert('Có lỗi xảy ra khi cập nhật khóa học');
    }
  };

  const handleSubmitForReview = async (courseId: number) => {
    try {
      const resp = await authenticatedFetch(`/api/courses/${courseId}/submit`, {
        method: 'PUT'
      });
      
      if (resp.ok) {
        await loadCourses();
        alert('Gửi khóa học để duyệt thành công!');
      } else {
        const data = await resp.json();
        alert(data?.Message || 'Có lỗi xảy ra khi gửi duyệt');
      }
    } catch (err) {
      alert('Có lỗi xảy ra khi gửi duyệt khóa học');
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (!confirm('Xóa khóa học này?')) return;
    
    try {
      const resp = await authenticatedFetch(`/api/courses/${courseId}`, {
        method: 'DELETE'
      });
      
      if (resp.ok) {
        await loadCourses();
        alert('Xóa khóa học thành công!');
      } else {
        const data = await resp.json();
        alert(data?.Message || 'Có lỗi xảy ra khi xóa');
      }
    } catch (err) {
      alert('Có lỗi xảy ra khi xóa khóa học');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('vi-VN');
  };

  const getLevelName = (level: number) => {
    const levels = ['Nhận biết', 'Thông hiểu', 'Vận dụng', 'Vận dụng cao'];
    return levels[level] || 'Không xác định';
  };

  const getLevelColor = (level: number) => {
    const colors = ['bg-blue-100 text-blue-800', 'bg-green-100 text-green-800', 'bg-yellow-100 text-yellow-800', 'bg-red-100 text-red-800'];
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const totalPages = Math.ceil(totalCount / filters.pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý khóa học</h1>
          <p className="text-sm text-gray-600">Quản lý tất cả khóa học trong hệ thống</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => window.location.href = '/dashboard/courses/create'}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Tạo khóa học mới
          </button>
          <span className="text-sm text-gray-500">
            Tổng: {totalCount} khóa học
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange('all')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <AcademicCapIcon className="h-4 w-4 inline mr-2" />
            Tất cả khóa học
          </button>
          <button
            onClick={() => handleTabChange('free')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'free'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <CheckCircleIcon className="h-4 w-4 inline mr-2" />
            Khóa học miễn phí
          </button>
          <button
            onClick={() => handleTabChange('paid')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'paid'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <CurrencyDollarIcon className="h-4 w-4 inline mr-2" />
            Khóa học trả phí
          </button>
          <button
            onClick={() => handleTabChange('pending')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pending'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ClockIcon className="h-4 w-4 inline mr-2" />
            Chờ duyệt
          </button>
        </nav>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tên khóa học, mô tả..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Danh mục
            </label>
            <select
              value={filters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name || category.Name}
                </option>
              ))}
            </select>
          </div>

          {/* Level Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cấp độ
            </label>
            <select
              value={filters.level === undefined ? '' : filters.level.toString()}
              onChange={(e) => handleFilterChange('level', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả cấp độ</option>
              <option value="0">Nhận biết</option>
              <option value="1">Thông hiểu</option>
              <option value="2">Vận dụng</option>
              <option value="3">Vận dụng cao</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sắp xếp
            </label>
            <select
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('_');
                // TODO: Implement sorting
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt_desc">Mới nhất</option>
              <option value="createdAt_asc">Cũ nhất</option>
              <option value="title_asc">Tên A-Z</option>
              <option value="title_desc">Tên Z-A</option>
              <option value="price_asc">Giá thấp đến cao</option>
              <option value="price_desc">Giá cao đến thấp</option>
            </select>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))
        ) : error ? (
          <div className="col-span-full text-center py-12">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadCourses}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Thử lại
            </button>
          </div>
        ) : courses.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có khóa học</h3>
            <p className="text-sm text-gray-500 mb-4">
              Bắt đầu bằng cách tạo khóa học đầu tiên.
            </p>
            <button
              onClick={() => window.location.href = '/dashboard/courses/create'}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Tạo khóa học mới
            </button>
          </div>
        ) : (
          courses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {course.instructorName || `Giảng viên #${course.instructorId}`}
                    </p>
                    <p className="text-sm text-gray-500">
                      {course.categoryName || `Danh mục #${course.categoryId}`}
                    </p>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                      {getLevelName(course.level)}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      course.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {course.isActive ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                    {!course.isPublished && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Chưa xuất bản
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                {course.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {course.description}
                  </p>
                )}

                {/* Stats */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Giá:</span>
                    <span className="font-medium text-gray-900">
                      {course.isFree ? 'Miễn phí' : formatCurrency(course.price)}
                    </span>
                  </div>
                  {course.enrollmentCount !== undefined && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Học viên:</span>
                      <span className="font-medium text-gray-900">{course.enrollmentCount}</span>
                    </div>
                  )}
                  {course.lessonCount !== undefined && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Bài học:</span>
                      <span className="font-medium text-gray-900">{course.lessonCount}</span>
                    </div>
                  )}
                  {course.rating !== undefined && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Đánh giá:</span>
                      <div className="flex items-center">
                        <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="font-medium text-gray-900">
                          {course.rating.toFixed(1)} ({course.reviewCount || 0})
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {/* TODO: View details */}}
                      className="text-gray-600 hover:text-gray-800"
                      title="Xem chi tiết"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {/* TODO: Edit */}}
                      className="text-blue-600 hover:text-blue-800"
                      title="Chỉnh sửa"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(course.id, course.isActive)}
                      className={`${
                        course.isActive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'
                      }`}
                      title={course.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                    >
                      {course.isActive ? (
                        <ExclamationTriangleIcon className="h-4 w-4" />
                      ) : (
                        <CheckCircleIcon className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Xóa"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!course.isPublished && (
                      <button
                        onClick={() => handleSubmitForReview(course.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        Gửi duyệt
                      </button>
                    )}
                    <button
                      onClick={() => window.location.href = `/dashboard/courses/${course.id}/lessons`}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-600 bg-blue-50 hover:bg-blue-100"
                    >
                      <PlayIcon className="h-3 w-3 mr-1" />
                      Bài học
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
              disabled={filters.page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Trước
            </button>
            <button
              onClick={() => handleFilterChange('page', Math.min(totalPages, filters.page + 1))}
              disabled={filters.page === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Sau
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Hiển thị <span className="font-medium">{(filters.page - 1) * filters.pageSize + 1}</span> đến{' '}
                <span className="font-medium">{Math.min(filters.page * filters.pageSize, totalCount)}</span> trong{' '}
                <span className="font-medium">{totalCount}</span> kết quả
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                  disabled={filters.page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Trước
                </button>
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, filters.page - 2)) + i;
                  if (pageNum > totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handleFilterChange('page', pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pageNum === filters.page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => handleFilterChange('page', Math.min(totalPages, filters.page + 1))}
                  disabled={filters.page === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Sau
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
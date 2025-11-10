'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import RejectCourseModal from '@/components/modals/RejectCourseModal';
import {
  AcademicCapIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
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
  Id: number;
  Title: string;
  Description: string;
  Thumbnail: string;
  InstructorId: number;
  Instructor?: {
    Id: number;
    Name: string;
    Avatar: string | null;
    Bio: string | null;
  };
  CategoryId: number;
  Category?: {
    Id: number;
    Name: string;
  };
  Level: number;
  IsFree: boolean;
  Price: number;
  Rating: number;
  TotalReviews: number;
  TotalStudents: number;
  TotalLessons: number;
  IsPublished: boolean;
  ApprovalStatus: number;
  EstimatedDuration: number;
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
  const searchParams = useSearchParams();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize filters from URL params
  const getInitialFilters = (): CourseFilters => {
    const approvalStatus = searchParams?.get('approvalStatus');
    const isFree = searchParams?.get('isFree');
    const page = searchParams?.get('page');
    
    return {
      page: page ? parseInt(page) : 1,
      pageSize: 20,
      approvalStatus: approvalStatus ? parseInt(approvalStatus) : undefined,
      isFree: isFree !== null ? isFree === 'true' : undefined
    };
  };
  
  const [filters, setFilters] = useState<CourseFilters>(getInitialFilters());
  const [totalCount, setTotalCount] = useState(0);
  
  // Determine active tab from URL params
  const getActiveTab = (): 'all' | 'free' | 'paid' | 'pending' => {
    if (searchParams?.get('approvalStatus') === '0') return 'pending';
    if (searchParams?.get('isFree') === 'true') return 'free';
    if (searchParams?.get('isFree') === 'false') return 'paid';
    return 'all';
  };
  
  const [activeTab, setActiveTab] = useState<'all' | 'free' | 'paid' | 'pending'>(getActiveTab());
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [sortBy, setSortBy] = useState<string>('createdAt_desc');
  
  // Update filters when URL params change
  useEffect(() => {
    const newFilters = getInitialFilters();
    setFilters(newFilters);
    setActiveTab(getActiveTab());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      
      // Filters
      if (filters.category) queryParams.append('category', filters.category.toString());
      if (filters.level !== undefined) queryParams.append('level', filters.level.toString());
      if (filters.isFree !== undefined) queryParams.append('isFree', filters.isFree.toString());
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.approvalStatus !== undefined) queryParams.append('approvalStatus', filters.approvalStatus.toString());
      
      // Pagination
      queryParams.append('page', filters.page.toString());
      queryParams.append('pageSize', filters.pageSize.toString());
      
      // Sorting
      if (sortBy) {
        const [field, order] = sortBy.split('_');
        queryParams.append('sortBy', field);
        queryParams.append('sortOrder', order);
      }

      const resp = await authenticatedFetch(`/api/courses?${queryParams}`);
      const data = await resp.json();
      
      if (resp.ok) {
        const result = data?.Result || data;
        const coursesData = result?.Items || result?.items || [];
        
        // Remove duplicates by ID (keep first occurrence)
        const uniqueCourses = coursesData.reduce((acc: Course[], course: Course) => {
          if (!acc.find(c => c.Id === course.Id)) {
            acc.push(course);
          } else {
            console.warn(`Duplicate course found and removed: ID ${course.Id} - ${course.Title}`);
          }
          return acc;
        }, []);
        
        setCourses(uniqueCourses);
        setTotalCount(result?.Total || result?.TotalCount || result?.totalCount || 0);
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
        // API returns nested Result.Result structure
        const result = data?.Result?.Result || data?.Result || data;
        const categoryList = Array.isArray(result) ? result : (result?.Items || result?.items || []);
        setCategories(categoryList);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  useEffect(() => {
    loadCourses();
  }, [filters, sortBy]);

  useEffect(() => {
    loadCategories();
  }, []);

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

  const handleApproveCourse = async (courseId: number) => {
    if (!confirm('Bạn có chắc muốn duyệt khóa học này?')) return;
    
    try {
      const resp = await authenticatedFetch(`/api/courses/${courseId}/approve`, {
        method: 'PUT'
      });
      
      if (resp.ok) {
        alert('Đã duyệt khóa học thành công!');
        loadCourses();
      } else {
        const data = await resp.json();
        alert(data?.Message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      alert('Có lỗi xảy ra khi duyệt khóa học');
    }
  };

  const handleRejectCourse = async (reason: string) => {
    if (!selectedCourse) return;
    
    try {
      const resp = await authenticatedFetch(`/api/courses/${selectedCourse.Id}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Reason: reason })
      });
      
      if (resp.ok) {
        alert('Đã từ chối khóa học. Giảng viên sẽ nhận được thông báo với lý do từ chối.');
        setRejectModalOpen(false);
        setSelectedCourse(null);
        loadCourses();
      } else {
        const data = await resp.json();
        alert(data?.Message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      alert('Có lỗi xảy ra khi từ chối khóa học');
    }
  };

  const openRejectModal = (course: Course) => {
    setSelectedCourse(course);
    setRejectModalOpen(true);
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

  const sanitizeHtml = (html?: string) => {
    if (!html) return '';
    let out = String(html);
    // Remove script/style/iframe tags
    out = out.replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '');
    out = out.replace(/<\s*style[^>]*>[\s\S]*?<\s*\/\s*style\s*>/gi, '');
    out = out.replace(/<\s*iframe[^>]*>[\s\S]*?<\s*\/\s*iframe\s*>/gi, '');
    // Encode
    out = out.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    // Allow basic formatting tags
    const allowed = ['b','strong','i','em','u','br','p','ul','ol','li','h1','h2','h3'];
    for (const tag of allowed) {
      const open = new RegExp(`&lt;${tag}(\\s[^&>]*)?&gt;`, 'gi');
      const close = new RegExp(`&lt;\\/${tag}&gt;`, 'gi');
      out = out.replace(open, `<${tag}$1>`).replace(close, `</${tag}>`);
    }
    return out;
  };

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

      {/* Active Filters */}
      {(filters.search || filters.category || filters.level !== undefined || activeTab !== 'all') && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700">Đang lọc:</span>
              {filters.search && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Tìm kiếm: "{filters.search}"
                </span>
              )}
              {filters.category && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Danh mục: {categories.find(c => (c.Id || c.id) === filters.category)?.Name || categories.find(c => (c.Id || c.id) === filters.category)?.name || filters.category}
                </span>
              )}
              {filters.level !== undefined && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Cấp độ: {getLevelName(filters.level)}
                </span>
              )}
              {activeTab === 'free' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Miễn phí
                </span>
              )}
              {activeTab === 'paid' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Trả phí
                </span>
              )}
              {activeTab === 'pending' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  Chờ duyệt
                </span>
              )}
            </div>
            <button
              onClick={() => {
                setFilters({ page: 1, pageSize: 20 });
                setSortBy('createdAt_desc');
                setActiveTab('all');
              }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Xóa tất cả
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900 flex items-center">
            <FunnelIcon className="h-5 w-5 mr-2" />
            Bộ lọc
          </h3>
          <span className="text-xs text-gray-500">
            {totalCount} kết quả
          </span>
        </div>
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
                <option key={category.Id || category.id} value={category.Id || category.id}>
                  {category.Name || category.name}
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
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                const [field, order] = e.target.value.split('_');
                // TODO: Implement sorting with field and order
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
          courses.map((course, index) => (
            <div key={course.Id || `course-${index}`} className="bg-white rounded-lg shadow hover:shadow-lg transition-all overflow-hidden">
              {/* Thumbnail */}
              <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                {course.Thumbnail ? (
                  <img 
                    src={course.Thumbnail} 
                    alt={course.Title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <AcademicCapIcon className="h-20 w-20 text-white opacity-50" />
                  </div>
                )}
                
                {/* Badges Container */}
                <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
                  {/* Approval Status badge */}
                  {!course.IsPublished && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-400 text-gray-900 inline-flex items-center shadow-sm">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      Chờ duyệt
                    </span>
                  )}
                  
                  {/* Spacer */}
                  <div className="flex-1"></div>
                  
                  {/* Price badge */}
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold shadow-sm ${
                    course.IsFree 
                      ? 'bg-green-500 text-white' 
                      : 'bg-yellow-500 text-gray-900'
                  }`}>
                    {course.IsFree ? 'Miễn phí' : formatCurrency(course.Price)}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                {/* Header */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-2 flex-1 pr-4">
                      {course.Title}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(course.Level)}`}>
                      {getLevelName(course.Level)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <div className="flex items-center">
                      <UserGroupIcon className="h-4 w-4 mr-1" />
                      {course.Instructor?.Name || `Giảng viên #${course.InstructorId}`}
                    </div>
                    <span>•</span>
                    <div className="flex items-center">
                      <AcademicCapIcon className="h-4 w-4 mr-1" />
                      {course.Category?.Name || `Danh mục #${course.CategoryId}`}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {course.Description && (
                  <div
                    className="prose prose-sm max-w-none text-gray-700 mb-4 line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(course.Description) }}
                  />
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4 py-3 border-y border-gray-200">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <UserGroupIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="text-lg font-bold text-gray-900">{course.TotalStudents || 0}</div>
                    <div className="text-xs text-gray-500">Học viên</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <PlayIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="text-lg font-bold text-gray-900">{course.TotalLessons || 0}</div>
                    <div className="text-xs text-gray-500">Bài học</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <StarIcon className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="text-lg font-bold text-gray-900">{course.Rating?.toFixed(1) || '0.0'}</div>
                    <div className="text-xs text-gray-500">({course.TotalReviews || 0} đánh giá)</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  {/* Primary Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.location.href = `/dashboard/courses/${course.Id}`}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <EyeIcon className="h-4 w-4 mr-1.5" />
                      Xem
                    </button>
                    <button
                      onClick={() => window.location.href = `/dashboard/courses/${course.Id}/edit`}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
                    >
                      <PencilIcon className="h-4 w-4 mr-1.5" />
                      Sửa
                    </button>
                  </div>
                  
                  {/* Admin Actions */}
                  {!course.IsPublished && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApproveCourse(course.Id)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                        title="Duyệt khóa học"
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-1.5" />
                        Duyệt
                      </button>
                      <button
                        onClick={() => openRejectModal(course)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                        title="Từ chối khóa học"
                      >
                        <XCircleIcon className="h-4 w-4 mr-1.5" />
                        Từ chối
                      </button>
                    </div>
                  )}
                  
                  {/* Delete Action */}
                  <button
                    onClick={() => {/* TODO: Delete */}}
                    className="w-full inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100"
                    title="Xóa khóa học"
                  >
                    <TrashIcon className="h-4 w-4 mr-1.5" />
                    Xóa khóa học
                  </button>
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

      {/* Reject Course Modal */}
      <RejectCourseModal
        isOpen={rejectModalOpen}
        courseTitle={selectedCourse?.Title || ''}
        onClose={() => {
          setRejectModalOpen(false);
          setSelectedCourse(null);
        }}
        onConfirm={handleRejectCourse}
      />
    </div>
  );
}
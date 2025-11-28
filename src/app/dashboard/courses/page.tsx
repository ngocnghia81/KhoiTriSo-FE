'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  PlayIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

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
  IsActive?: boolean;
  EstimatedDuration: number;
  CreatedAt?: string;
  UpdatedAt?: string;
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  
  // Initialize filters from URL params
  const getInitialFilters = (): CourseFilters => {
    const approvalStatus = searchParams?.get('approvalStatus');
    const isFree = searchParams?.get('isFree');
    const category = searchParams?.get('category');
    const level = searchParams?.get('level');
    const search = searchParams?.get('search');
    const page = searchParams?.get('page');
    
    return {
      page: page ? parseInt(page) : 1,
      pageSize: 20,
      approvalStatus: approvalStatus ? parseInt(approvalStatus) : undefined,
      isFree: isFree !== null ? isFree === 'true' : undefined,
      category: category ? parseInt(category) : undefined,
      level: level !== null ? parseInt(level) : undefined,
      search: search || undefined,
    };
  };
  
  const [filters, setFilters] = useState<CourseFilters>(getInitialFilters());
  const [totalCount, setTotalCount] = useState(0);
  
  const [activeTab, setActiveTab] = useState<'all' | 'free' | 'paid' | 'pending' | 'inactive'>('all');
  
  // Determine active tab from filters or maintain tab state
  useEffect(() => {
    if (filters.approvalStatus === 1) {
      if (activeTab !== 'pending') setActiveTab('pending');
    } else if (filters.isFree === true) {
      if (activeTab !== 'free') setActiveTab('free');
    } else if (filters.isFree === false) {
      if (activeTab !== 'paid') setActiveTab('paid');
    } else if (activeTab !== 'inactive' && activeTab !== 'all') {
      // Don't change tab if it's inactive or all
      setActiveTab('all');
    }
  }, [filters.approvalStatus, filters.isFree]);
  
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [sortBy, setSortBy] = useState<string>('createdAt_desc');
  
  // Sync search input with filters
  useEffect(() => {
    setSearchInput(filters.search || '');
  }, [filters.search]);

  // Update URL when filters change
  const updateURL = useCallback((newFilters: CourseFilters) => {
    const params = new URLSearchParams();
    if (newFilters.approvalStatus !== undefined) params.set('approvalStatus', newFilters.approvalStatus.toString());
    if (newFilters.isFree !== undefined) params.set('isFree', newFilters.isFree.toString());
    if (newFilters.category) params.set('category', newFilters.category.toString());
    if (newFilters.level !== undefined) params.set('level', newFilters.level.toString());
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.page > 1) params.set('page', newFilters.page.toString());
    
    const queryString = params.toString();
    router.push(`/dashboard/courses${queryString ? `?${queryString}` : ''}`, { scroll: false });
  }, [router]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        handleFilterChange('search', searchInput || undefined);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const [allCourses, setAllCourses] = useState<Course[]>([]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      
      // Filters (don't filter by isActive - let backend handle role-based filtering)
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
        
        // Remove duplicates by ID
        const uniqueCourses = coursesData.reduce((acc: Course[], course: Course) => {
          if (!acc.find(c => c.Id === course.Id)) {
            acc.push(course);
          }
          return acc;
        }, []);
        
        setAllCourses(uniqueCourses);
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

  // Filter courses by active tab (client-side filter)
  const courses = useMemo(() => {
    if (activeTab === 'inactive') {
      // Chỉ hiển thị courses có IsActive === false
      return allCourses.filter(c => c.IsActive === false);
    }
    // Các tab khác (all, free, paid, pending): vẫn áp dụng filters từ backend
    return allCourses;
  }, [allCourses, activeTab]);

  const loadCategories = async () => {
    try {
      const resp = await authenticatedFetch('/api/categories?pageSize=100');
      const data = await resp.json();
      
      if (resp.ok) {
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

  const handleFilterChange = useCallback((key: keyof CourseFilters, value: any) => {
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [key]: value,
        page: 1 // Reset to first page when filter changes
      };
      updateURL(newFilters);
      return newFilters;
    });
  }, [updateURL]);

  const handleTabChange = (tab: 'all' | 'free' | 'paid' | 'pending' | 'inactive') => {
    setActiveTab(tab);
    
    if (tab === 'inactive') {
      // Don't change filters for inactive tab - filter client-side
      return;
    }
    
    const newFilters: Partial<CourseFilters> = {
      page: 1,
      pageSize: 20,
    };
    
    switch (tab) {
      case 'free':
        newFilters.isFree = true;
        newFilters.approvalStatus = undefined;
        break;
      case 'paid':
        newFilters.isFree = false;
        newFilters.approvalStatus = undefined;
        break;
      case 'pending':
        newFilters.approvalStatus = 1; // Pending = 1 (Rejected = 0, Approved = 2)
        newFilters.isFree = undefined;
        break;
      default:
        newFilters.isFree = undefined;
        newFilters.approvalStatus = undefined;
        break;
    }
    
    setFilters(prev => {
      const updated = { ...prev, ...newFilters };
      updateURL(updated);
      return updated;
    });
  };

  const clearAllFilters = () => {
    const clearedFilters: CourseFilters = {
      page: 1,
      pageSize: 20,
    };
    setFilters(clearedFilters);
    setSearchInput('');
    updateURL(clearedFilters);
  };

  const removeFilter = (key: keyof CourseFilters) => {
    handleFilterChange(key, undefined);
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa khóa học này? Hành động này không thể hoàn tác.')) return;
    
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

  const handleRestoreCourse = async (courseId: number) => {
    if (!confirm('Bạn có chắc chắn muốn khôi phục khóa học này?')) return;
    
    try {
      const resp = await authenticatedFetch(`/api/courses/${courseId}/restore`, {
        method: 'PUT'
      });
      
      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.Message || errorData.message || 'Không thể khôi phục khóa học');
      }
      
      alert('Khôi phục khóa học thành công!');
      await loadCourses();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Có lỗi xảy ra khi khôi phục khóa học';
      alert(message);
      console.error('Restore course error:', err);
    }
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getLevelName = (level: number) => {
    const levels = ['Nhận biết', 'Thông hiểu', 'Vận dụng', 'Vận dụng cao'];
    return levels[level] || 'Không xác định';
  };

  const getLevelColor = (level: number) => {
    const colors = [
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-green-100 text-green-800 border-green-200',
      'bg-yellow-100 text-yellow-800 border-yellow-200',
      'bg-red-100 text-red-800 border-red-200'
    ];
    return colors[level] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getApprovalStatusBadge = (status: number, isPublished: boolean) => {
    if (!isPublished) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
          <ClockIcon className="h-3 w-3 mr-1" />
          Chờ duyệt
        </span>
      );
    }
    if (status === 2) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
          <CheckCircleIcon className="h-3 w-3 mr-1" />
          Đã duyệt
        </span>
      );
    }
    return null;
  };

  const totalPages = Math.ceil(totalCount / filters.pageSize);

  const sanitizeHtml = (html?: string) => {
    if (!html) return '';
    let out = String(html);
    out = out.replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '');
    out = out.replace(/<\s*style[^>]*>[\s\S]*?<\s*\/\s*style\s*>/gi, '');
    out = out.replace(/<\s*iframe[^>]*>[\s\S]*?<\s*\/\s*iframe\s*>/gi, '');
    out = out.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const allowed = ['b','strong','i','em','u','br','p','ul','ol','li','h1','h2','h3'];
    for (const tag of allowed) {
      const open = new RegExp(`&lt;${tag}(\\s[^&>]*)?&gt;`, 'gi');
      const close = new RegExp(`&lt;\\/${tag}&gt;`, 'gi');
      out = out.replace(open, `<${tag}$1>`).replace(close, `</${tag}>`);
    }
    return out;
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category) count++;
    if (filters.level !== undefined) count++;
    if (filters.isFree !== undefined) count++;
    if (filters.approvalStatus !== undefined) count++;
    return count;
  }, [filters]);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý khóa học</h1>
          <p className="text-sm text-gray-600 mt-1">Quản lý và theo dõi tất cả khóa học trong hệ thống</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
            <span className="font-semibold text-gray-900">{totalCount}</span> khóa học
          </div>
          <button
            onClick={() => router.push('/dashboard/courses/create')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Tạo khóa học mới
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px overflow-x-auto">
            <button
              onClick={() => handleTabChange('all')}
              className={`flex items-center px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <AcademicCapIcon className="h-5 w-5 mr-2" />
              Tất cả
            </button>
            <button
              onClick={() => handleTabChange('free')}
              className={`flex items-center px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === 'free'
                  ? 'border-green-500 text-green-600 bg-green-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              Miễn phí
            </button>
            <button
              onClick={() => handleTabChange('paid')}
              className={`flex items-center px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === 'paid'
                  ? 'border-yellow-500 text-yellow-600 bg-yellow-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <CurrencyDollarIcon className="h-5 w-5 mr-2" />
              Trả phí
            </button>
            <button
              onClick={() => handleTabChange('pending')}
              className={`flex items-center px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === 'pending'
                  ? 'border-orange-500 text-orange-600 bg-orange-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ClockIcon className="h-5 w-5 mr-2" />
              Chờ duyệt
            </button>
            <button
              onClick={() => handleTabChange('inactive')}
              className={`flex items-center px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === 'inactive'
                  ? 'border-red-500 text-red-600 bg-red-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <XCircleIcon className="h-5 w-5 mr-2" />
              Đã vô hiệu
            </button>
          </nav>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <button
          onClick={() => setFiltersExpanded(!filtersExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-600" />
            <h3 className="text-sm font-semibold text-gray-900">Bộ lọc</h3>
            {activeFiltersCount > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {activeFiltersCount}
              </span>
            )}
          </div>
          {filtersExpanded ? (
            <ChevronUpIcon className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-gray-400" />
          )}
        </button>

        {filtersExpanded && (
          <div className="border-t border-gray-200 p-4 space-y-4">
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
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div className="flex items-center flex-wrap gap-2 pt-2 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-700">Đang lọc:</span>
                {filters.search && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    Tìm kiếm: "{filters.search}"
                    <button
                      onClick={() => removeFilter('search')}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.category && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                    Danh mục: {categories.find(c => (c.Id || c.id) === filters.category)?.Name || categories.find(c => (c.Id || c.id) === filters.category)?.name}
                    <button
                      onClick={() => removeFilter('category')}
                      className="hover:bg-green-200 rounded-full p-0.5"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.level !== undefined && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                    Cấp độ: {getLevelName(filters.level)}
                    <button
                      onClick={() => removeFilter('level')}
                      className="hover:bg-purple-200 rounded-full p-0.5"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.isFree !== undefined && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                    {filters.isFree ? 'Miễn phí' : 'Trả phí'}
                    <button
                      onClick={() => removeFilter('isFree')}
                      className="hover:bg-yellow-200 rounded-full p-0.5"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.approvalStatus !== undefined && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                    Chờ duyệt
                    <button
                      onClick={() => removeFilter('approvalStatus')}
                      className="hover:bg-orange-200 rounded-full p-0.5"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium ml-auto"
                >
                  Xóa tất cả
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-6 space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 mb-4 font-medium">{error}</p>
          <button
            onClick={loadCourses}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <AcademicCapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có khóa học</h3>
          <p className="text-sm text-gray-500 mb-6">
            {activeFiltersCount > 0 
              ? 'Không tìm thấy khóa học nào phù hợp với bộ lọc của bạn.'
              : 'Bắt đầu bằng cách tạo khóa học đầu tiên.'}
          </p>
          {activeFiltersCount > 0 ? (
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
            >
              Xóa bộ lọc
            </button>
          ) : (
            <button
              onClick={() => router.push('/dashboard/courses/create')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Tạo khóa học mới
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div 
                key={course.Id} 
                className={`bg-white rounded-lg shadow-sm border hover:shadow-md transition-all overflow-hidden flex flex-col ${
                  course.IsActive === false 
                    ? 'border-red-300 opacity-75 bg-red-50/30' 
                    : 'border-gray-200'
                }`}
              >
                {/* Thumbnail */}
                <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
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
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-2">
                      {course.IsActive === false && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300 shadow-sm">
                          <XCircleIcon className="h-3 w-3 mr-1" />
                          Đã vô hiệu
                        </span>
                      )}
                      {getApprovalStatusBadge(course.ApprovalStatus, course.IsPublished)}
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getLevelColor(course.Level)}`}>
                        {getLevelName(course.Level)}
                      </span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold shadow-sm ${
                      course.IsFree 
                        ? 'bg-green-500 text-white' 
                        : 'bg-yellow-500 text-gray-900'
                    }`}>
                      {course.IsFree ? 'Miễn phí' : formatCurrency(course.Price)}
                    </span>
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  {/* Header */}
                  <div className="mb-4">
                    <h3 className={`text-xl font-bold line-clamp-2 mb-2 ${
                      course.IsActive === false ? 'text-red-700' : 'text-gray-900'
                    }`}>
                      {course.Title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <UserGroupIcon className="h-4 w-4 mr-1" />
                        <span className="truncate">{course.Instructor?.Name || `GV #${course.InstructorId}`}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center">
                        <AcademicCapIcon className="h-4 w-4 mr-1" />
                        <span className="truncate">{course.Category?.Name || `DM #${course.CategoryId}`}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {course.Description && (
                    <div
                      className="prose prose-sm max-w-none text-gray-700 mb-4 line-clamp-3 flex-1"
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
                      <div className="text-xs text-gray-500">({course.TotalReviews || 0})</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 mt-auto">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/dashboard/courses/${course.Id}`)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <EyeIcon className="h-4 w-4 mr-1.5" />
                        Xem
                      </button>
                      <button
                        onClick={() => router.push(`/dashboard/courses/${course.Id}/edit`)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <PencilIcon className="h-4 w-4 mr-1.5" />
                        Sửa
                      </button>
                    </div>
                    
                    {!course.IsPublished && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApproveCourse(course.Id)}
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircleIcon className="h-4 w-4 mr-1.5" />
                          Duyệt
                        </button>
                        <button
                          onClick={() => openRejectModal(course)}
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <XCircleIcon className="h-4 w-4 mr-1.5" />
                          Từ chối
                        </button>
                      </div>
                    )}
                    
                    {course.IsActive === false ? (
                      <button
                        onClick={() => handleRestoreCourse(course.Id)}
                        className="w-full inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-1.5" />
                        Khôi phục
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDeleteCourse(course.Id)}
                        className="w-full inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <TrashIcon className="h-4 w-4 mr-1.5" />
                        Xóa khóa học
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                  disabled={filters.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <button
                  onClick={() => handleFilterChange('page', Math.min(totalPages, filters.page + 1))}
                  disabled={filters.page === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px">
                    <button
                      onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                      disabled={filters.page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className="relative inline-flex items-center px-2 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sau
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
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

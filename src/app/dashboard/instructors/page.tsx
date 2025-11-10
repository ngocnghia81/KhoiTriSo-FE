'use client';

import { useState } from 'react';
import { useInstructors } from '@/hooks/useInstructors';
import { useDebouncedCallback } from '@/hooks/useDebounce';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import Link from 'next/link';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  UserIcon,
  AcademicCapIcon,
  BookOpenIcon,
  CurrencyDollarIcon,
  StarIcon,
  ChartBarIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export default function InstructorsPage() {
  const [search, setSearch] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createEmail, setCreateEmail] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  const { data, loading, error, refetch } = useInstructors(search, isActive, page, pageSize);
  const { authenticatedFetch } = useAuthenticatedFetch();

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, 500);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    debouncedSearch(value);
  };

  const handleCreateInstructor = async () => {
    if (!createEmail || !createEmail.includes('@')) {
      setCreateError('Vui lòng nhập email hợp lệ');
      return;
    }

    setCreateLoading(true);
    setCreateError(null);
    setCreateSuccess(null);

    try {
      const response = await authenticatedFetch('/api/admin/instructors/create', {
        method: 'POST',
        body: JSON.stringify({ Email: createEmail }),
      });

      const result = await response.json();

      if (response.ok) {
        setCreateSuccess(result.Result?.Message || 'Tạo tài khoản thành công! Email đã được gửi.');
        setCreateEmail('');
        setTimeout(() => {
          setShowCreateModal(false);
          setCreateSuccess(null);
          refetch();
        }, 2000);
      } else {
        setCreateError(result.Message || 'Không thể tạo tài khoản');
      }
    } catch (err) {
      setCreateError('Có lỗi xảy ra khi tạo tài khoản');
    } finally {
      setCreateLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Lỗi tải dữ liệu</h3>
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Giảng viên</h1>
            <p className="text-gray-600 mt-1">Quản lý và theo dõi hoạt động của giảng viên</p>
          </div>
          <button
            onClick={() => {
              console.log('Opening modal...');
              setShowCreateModal(true);
            }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Tạo giảng viên
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm giảng viên..."
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={isActive === undefined ? 'all' : isActive ? 'active' : 'inactive'}
              onChange={(e) => {
                const value = e.target.value;
                setIsActive(value === 'all' ? undefined : value === 'active');
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>

            {/* Stats */}
            <div className="flex items-center justify-end text-sm text-gray-600">
              <FunnelIcon className="h-5 w-5 mr-2" />
              Tổng: <span className="font-semibold ml-1">{data?.Total || 0}</span> giảng viên
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Instructors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.Items.map((instructor) => (
            <div
              key={instructor.Id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    {instructor.Avatar ? (
                      <img
                        src={instructor.Avatar}
                        alt={instructor.FullName || instructor.Username}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-bold text-xl">
                          {(instructor.FullName || instructor.Username).charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {instructor.FullName || instructor.Username}
                      </h3>
                      <p className="text-sm text-gray-500">{instructor.Email}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      instructor.IsActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {instructor.IsActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center">
                    <AcademicCapIcon className="h-5 w-5 text-blue-500 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Khóa học</p>
                      <p className="text-sm font-semibold">{instructor.TotalCourses}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <BookOpenIcon className="h-5 w-5 text-purple-500 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Sách</p>
                      <p className="text-sm font-semibold">{instructor.TotalBooks}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <UserIcon className="h-5 w-5 text-green-500 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Học viên</p>
                      <p className="text-sm font-semibold">{instructor.TotalStudents}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <StarIcon className="h-5 w-5 text-yellow-500 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Đánh giá</p>
                      <p className="text-sm font-semibold">{instructor.AverageRating.toFixed(1)}</p>
                    </div>
                  </div>
                </div>

                {/* Earnings */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm text-gray-600">Thu nhập</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    ${instructor.TotalEarnings.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-gray-200 px-6 py-3 bg-gray-50 flex justify-between">
                <Link
                  href={`/dashboard/instructors/${instructor.Id}`}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Xem chi tiết
                </Link>
                <Link
                  href={`/dashboard/instructors/${instructor.Id}/analytics`}
                  className="flex items-center text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  <ChartBarIcon className="h-4 w-4 mr-1" />
                  Analytics
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {data?.Items.length === 0 && (
          <div className="text-center py-12">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy giảng viên</h3>
            <p className="mt-1 text-sm text-gray-500">Thử thay đổi bộ lọc hoặc tìm kiếm khác</p>
          </div>
        )}

        {/* Pagination */}
        {data && data.Total > pageSize && (
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trang trước
            </button>
            <span className="text-sm text-gray-700">
              Trang {page} / {Math.ceil(data.Total / pageSize)}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= Math.ceil(data.Total / pageSize)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trang sau
            </button>
          </div>
        )}

        {/* Create Instructor Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-[9999] overflow-y-auto" onClick={(e) => console.log('Modal clicked', e.target)}>
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              {/* Background overlay */}
              <div
                className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 z-[9998]"
                onClick={() => setShowCreateModal(false)}
              ></div>

              {/* Modal */}
              <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full z-[9999]">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Tạo tài khoản giảng viên</h3>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email giảng viên
                    </label>
                    <input
                      type="email"
                      value={createEmail}
                      onChange={(e) => setCreateEmail(e.target.value)}
                      placeholder="instructor@example.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={createLoading}
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      Hệ thống sẽ tự động tạo username và mật khẩu, sau đó gửi email cho giảng viên.
                    </p>
                  </div>

                  {/* Error Message */}
                  {createError && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{createError}</p>
                    </div>
                  )}

                  {/* Success Message */}
                  {createSuccess && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-600">{createSuccess}</p>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    onClick={handleCreateInstructor}
                    disabled={createLoading || !createEmail}
                    className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Đang tạo...
                      </>
                    ) : (
                      'Tạo tài khoản'
                    )}
                  </button>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    disabled={createLoading}
                    className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

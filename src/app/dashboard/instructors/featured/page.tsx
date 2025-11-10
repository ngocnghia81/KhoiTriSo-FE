'use client';

import { useFeaturedInstructors } from '@/hooks/useInstructors';
import Link from 'next/link';
import {
  StarIcon,
  AcademicCapIcon,
  BookOpenIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

export default function FeaturedInstructorsPage() {
  const { data, loading, error } = useFeaturedInstructors(20);

  if (loading) {
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <StarIcon className="h-8 w-8 text-yellow-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Giảng viên Tiêu biểu</h1>
          </div>
          <p className="text-gray-600">
            Top giảng viên xuất sắc với đánh giá cao và nhiều học viên nhất
          </p>
        </div>

        {/* Featured Instructors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.map((instructor, index) => (
            <div
              key={instructor.Id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow relative"
            >
              {/* Featured Badge */}
              {index < 3 && (
                <div className="absolute top-4 right-4 z-10">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    index === 0 ? 'bg-yellow-400 text-yellow-900' :
                    index === 1 ? 'bg-gray-300 text-gray-900' :
                    'bg-orange-400 text-orange-900'
                  }`}>
                    #{index + 1}
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="flex items-center justify-center mb-4">
                  {instructor.Avatar ? (
                    <img
                      src={instructor.Avatar}
                      alt={instructor.FullName || instructor.Username}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-4 border-white shadow-lg">
                      <span className="text-white font-bold text-3xl">
                        {(instructor.FullName || instructor.Username).charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900">
                    {instructor.FullName || instructor.Username}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{instructor.Email}</p>
                  <div className="flex items-center justify-center mt-2">
                    <StarIcon className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <span className="ml-1 text-lg font-bold text-gray-900">
                      {instructor.AverageRating.toFixed(1)}
                    </span>
                    <span className="ml-1 text-sm text-gray-500">rating</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <AcademicCapIcon className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-gray-900">{instructor.TotalCourses}</p>
                    <p className="text-xs text-gray-500">Courses</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <BookOpenIcon className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-gray-900">{instructor.TotalBooks}</p>
                    <p className="text-xs text-gray-500">Books</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <UserGroupIcon className="h-6 w-6 text-green-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-gray-900">{instructor.TotalStudents}</p>
                    <p className="text-xs text-gray-500">Students</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <CurrencyDollarIcon className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900">${(instructor.TotalEarnings / 1000).toFixed(1)}k</p>
                    <p className="text-xs text-gray-500">Earnings</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/instructors/${instructor.Id}`}
                    className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    View Profile
                  </Link>
                  <Link
                    href={`/dashboard/instructors/${instructor.Id}/analytics`}
                    className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <ChartBarIcon className="h-5 w-5 text-gray-600" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {data?.length === 0 && (
          <div className="text-center py-12">
            <StarIcon className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Chưa có giảng viên tiêu biểu</h3>
            <p className="mt-2 text-gray-500">Hệ thống sẽ tự động chọn giảng viên xuất sắc nhất</p>
          </div>
        )}
      </div>
    </div>
  );
}

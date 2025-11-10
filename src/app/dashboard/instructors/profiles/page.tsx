'use client';

import { useState } from 'react';
import { useInstructors } from '@/hooks/useInstructors';
import Link from 'next/link';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

export default function InstructorProfilesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const { data, loading, error } = useInstructors(search, undefined, page, pageSize);

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
          <h1 className="text-3xl font-bold text-gray-900">Hồ sơ Giảng viên</h1>
          <p className="text-gray-600 mt-1">Danh sách hồ sơ chi tiết của các giảng viên</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Tìm kiếm giảng viên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Profiles List */}
        <div className="space-y-4">
          {data?.Items.map((instructor) => (
            <div
              key={instructor.Id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {instructor.Avatar ? (
                    <img
                      src={instructor.Avatar}
                      alt={instructor.FullName || instructor.Username}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-bold text-2xl">
                        {(instructor.FullName || instructor.Username).charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {instructor.FullName || instructor.Username}
                      </h3>
                      <div className="flex items-center mt-1">
                        {instructor.IsActive ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-500 mr-1" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-red-500 mr-1" />
                        )}
                        <span className={`text-sm ${instructor.IsActive ? 'text-green-600' : 'text-red-600'}`}>
                          {instructor.IsActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/dashboard/instructors/${instructor.Id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      View Details
                    </Link>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center text-gray-600">
                      <EnvelopeIcon className="h-5 w-5 mr-2" />
                      <span className="text-sm">{instructor.Email}</span>
                    </div>
                    {instructor.Phone && (
                      <div className="flex items-center text-gray-600">
                        <PhoneIcon className="h-5 w-5 mr-2" />
                        <span className="text-sm">{instructor.Phone}</span>
                      </div>
                    )}
                    {instructor.Address && (
                      <div className="flex items-center text-gray-600">
                        <MapPinIcon className="h-5 w-5 mr-2" />
                        <span className="text-sm">{instructor.Address}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex gap-6 text-sm">
                    <div>
                      <span className="text-gray-500">Courses:</span>
                      <span className="ml-1 font-semibold text-gray-900">{instructor.TotalCourses}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Books:</span>
                      <span className="ml-1 font-semibold text-gray-900">{instructor.TotalBooks}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Students:</span>
                      <span className="ml-1 font-semibold text-gray-900">{instructor.TotalStudents}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Rating:</span>
                      <span className="ml-1 font-semibold text-gray-900">{instructor.AverageRating.toFixed(1)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Earnings:</span>
                      <span className="ml-1 font-semibold text-green-600">${instructor.TotalEarnings.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Additional Info */}
                  {instructor.TeacherAdditionalInfo && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{instructor.TeacherAdditionalInfo}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {data?.Items.length === 0 && (
          <div className="text-center py-12">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy giảng viên</h3>
            <p className="mt-1 text-sm text-gray-500">Thử thay đổi từ khóa tìm kiếm</p>
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
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {page} / {Math.ceil(data.Total / pageSize)}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= Math.ceil(data.Total / pageSize)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

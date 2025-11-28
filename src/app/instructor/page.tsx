'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AcademicCapIcon,
  BookOpenIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  StarIcon,
  CalendarIcon,
  PlusIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { useCourses, Course } from '@/hooks/useCourses';
import { useInstructorDetail, useInstructorAnalytics } from '@/hooks/useInstructors';
import { useBooks } from '@/hooks/useBooks';
import type { Book } from '@/services/bookApi';
import Chart from '@/components/dashboard/Chart';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'published':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'published':
      return 'Đã xuất bản';
    case 'pending':
      return 'Chờ phê duyệt';
    case 'draft':
      return 'Bản nháp';
    case 'rejected':
      return 'Bị từ chối';
    default:
      return 'Không xác định';
  }
};

type BookWithStats = Book & {
  Id?: number;
  Title?: string;
  status?: string;
  activations?: number;
  Activations?: number;
  activationCount?: number;
  totalActivations?: number;
  revenue?: number;
  Revenue?: number;
  totalRevenue?: number;
  earnings?: number;
  codesRemaining?: number;
  CodesRemaining?: number;
  remainingCodes?: number;
  RemainingCodes?: number;
  lastUpdated?: string;
  LastUpdated?: string;
  updatedAt?: string;
  UpdatedAt?: string;
  isPublished?: boolean;
  IsPublished?: boolean;
  ApprovalStatus?: number;
};

export default function InstructorDashboard() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const normalizedRole = user?.role as string | undefined;
  const isTeacher = normalizedRole === 'instructor' || normalizedRole === 'teacher';
  const instructorId = user?.id ? Number(user.id) : 0;
  const {
    data: instructorDetail,
    loading: instructorLoading,
    error: instructorError,
  } = useInstructorDetail(instructorId);
  const {
    data: analytics,
    loading: analyticsLoading,
    error: analyticsError,
  } = useInstructorAnalytics(instructorId, '6m');
  const lastMonthEntry = (() => {
    const list = analytics?.MonthlyEarnings || [];
    return list.length > 0 ? list[list.length - 1] : null;
  })();
  const prevMonthEntry = (() => {
    const list = analytics?.MonthlyEarnings || [];
    return list.length > 1 ? list[list.length - 2] : null;
  })();
  const currentMonthEarnings = lastMonthEntry?.Earnings ?? 0;
  const previousMonthEarnings = prevMonthEntry?.Earnings ?? 0;
  const latestMonthLabel = lastMonthEntry?.Month ?? null;
  const {
    courses: recentCourses,
    loading: courseLoading,
    error: courseError,
  } = useCourses({
    page: 1,
    pageSize: 5,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
    instructorId: instructorId,
  });
  const {
    books: recentBooks,
    loading: booksLoading,
    error: booksError,
  } = useBooks({
    authorId: instructorId,
    page: 1,
    pageSize: 5,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });

  useEffect(() => {
    if (isAuthenticated && !isTeacher) {
      router.push('/');
    }
  }, [isAuthenticated, isTeacher, router]);

  if (!isAuthenticated || !isTeacher) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const displayName = user?.name || user?.email || 'Giảng viên';

  const getCourseStatus = (course: Course): string => {
    if (course.isPublished) return 'published';

    switch (course.approvalStatus) {
      case 2:
        return 'approved';
      case 1:
        return 'pending';
      case 0:
        return 'rejected';
      default:
        return 'draft';
    }
  };

  const getBookStatus = (book: BookWithStats): string => {
    if (book.isPublished || book.IsPublished) return 'published';

    const approval = book.approvalStatus ?? book.ApprovalStatus;
    switch (approval) {
      case 2:
        return 'published';
      case 1:
        return 'pending';
      case 0:
        return 'rejected';
      default:
        return 'draft';
    }
  };

  const statCards = [
    {
      name: 'Tổng khóa học',
      value: instructorDetail?.TotalCourses ?? 0,
      icon: AcademicCapIcon,
      color: 'blue',
      isCurrency: false,
    },
    {
      name: 'Tổng sách',
      value: instructorDetail?.TotalBooks ?? 0,
      icon: BookOpenIcon,
      color: 'green',
      isCurrency: false,
    },
    {
      name: 'Học viên',
      value: instructorDetail?.TotalStudents ?? 0,
      icon: UserGroupIcon,
      color: 'purple',
      isCurrency: false,
    },
    {
      name: 'Tổng thu nhập',
      value: instructorDetail?.TotalEarnings ?? 0,
      icon: CurrencyDollarIcon,
      color: 'yellow',
      isCurrency: true,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Welcome header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Chào mừng trở lại, {displayName}!</h1>
            <p className="text-green-100 mt-1">
              Bạn có 2 nội dung chờ phê duyệt và thu nhập tháng này đã tăng 12.5%
            </p>
          </div>
          <div className="hidden md:flex space-x-3">
            <Link href="/instructor/courses/create" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <PlusIcon className="h-4 w-4 inline mr-2" />
              Tạo khóa học
            </Link>
            <Link href="/instructor/assignments/create" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <DocumentTextIcon className="h-4 w-4 inline mr-2" />
              Tạo bài tập
            </Link>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <div key={stat.name ?? index} className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-2.5 rounded-lg bg-${stat.color}-500`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {instructorLoading ? (
                          <span className="block h-5 bg-gray-200 rounded animate-pulse w-16" />
                        ) : instructorError ? (
                          '—'
                        ) : stat.isCurrency ? (
                          `₫${stat.value.toLocaleString()}`
                        ) : (
                          stat.value.toLocaleString()
                        )}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Monthly Earnings Chart */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Thu nhập theo tháng</h3>
            {analytics.MonthlyEarnings && analytics.MonthlyEarnings.length > 0 ? (
              <div className="h-64">
                <Chart
                  data={analytics.MonthlyEarnings.map(e => ({ Date: e.Month, Amount: e.Earnings }))}
                  type="area"
                  xKey="Date"
                  yKey="Amount"
                  color="#10b981"
                  height={250}
                />
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Chưa có dữ liệu</p>
            )}
          </div>

          {/* Enrollment Trend Chart */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Xu hướng đăng ký</h3>
            {analytics.EnrollmentTrend && analytics.EnrollmentTrend.length > 0 ? (
              <div className="h-64">
                <Chart
                  data={analytics.EnrollmentTrend.map(t => ({ Date: t.Date, Amount: t.Amount }))}
                  type="area"
                  xKey="Date"
                  yKey="Amount"
                  color="#3b82f6"
                  height={250}
                />
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Chưa có dữ liệu</p>
            )}
          </div>

          {/* Revenue Trend Chart */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Xu hướng doanh thu</h3>
            {analytics.RevenueTrend && analytics.RevenueTrend.length > 0 ? (
              <div className="h-64">
                <Chart
                  data={analytics.RevenueTrend.map(t => ({ Date: t.Date, Amount: t.Amount }))}
                  type="area"
                  xKey="Date"
                  yKey="Amount"
                  color="#8b5cf6"
                  height={250}
                />
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Chưa có dữ liệu</p>
            )}
          </div>

          {/* Course Performance Chart */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Hiệu suất khóa học</h3>
            {analytics.CoursePerformance && analytics.CoursePerformance.length > 0 ? (
              <div className="h-64">
                <Chart
                  data={analytics.CoursePerformance.map(c => ({ Date: c.Title, Amount: c.Revenue }))}
                  type="bar"
                  xKey="Date"
                  yKey="Amount"
                  color="#f59e0b"
                  height={250}
                />
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Chưa có dữ liệu</p>
            )}
          </div>
        </div>
      )}

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Recent courses */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Khóa học gần đây</h3>
                <Link href="/instructor/courses" className="text-sm text-green-600 hover:text-green-800">
                  Xem tất cả
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {courseLoading ? (
                <div className="p-6 text-center text-gray-500">Đang tải dữ liệu khóa học...</div>
              ) : courseError ? (
                <div className="p-6 text-center text-red-600">{courseError}</div>
              ) : recentCourses.length === 0 ? (
                <div className="p-6 text-center text-gray-500">Chưa có khóa học nào gần đây.</div>
              ) : (
                recentCourses.map((course) => {
                  const status = getCourseStatus(course);
                  return (
                    <div key={course.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <AcademicCapIcon className="h-8 w-8 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {course.title}
                            </h4>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(status)}`}>
                              {getStatusText(status)}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <UserGroupIcon className="h-4 w-4 mr-1" />
                              {course.totalStudents ?? 0} học viên
                            </div>
                            <div className="flex items-center">
                              <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                              ₫{(course.price ?? 0).toLocaleString()}
                            </div>
                            <div className="flex items-center">
                              <StarIcon className="h-4 w-4 mr-1" />
                              {course.rating ?? 'Chưa có'}
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-gray-400">
                            Cập nhật: {course.updatedAt ? new Date(course.updatedAt).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Earnings summary */}
        <div className="space-y-4">
          {/* Earnings card */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Thu nhập</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tháng này</span>
                <span className="text-lg font-semibold text-gray-900">
                  {analyticsLoading ? (
                    <span className="inline-block h-5 bg-gray-200 rounded animate-pulse w-24" />
                  ) : analyticsError ? (
                    '—'
                  ) : (
                    `₫${currentMonthEarnings.toLocaleString()}`
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tháng trước</span>
                <span className="text-sm text-gray-500">
                  {analyticsLoading ? (
                    <span className="inline-block h-4 bg-gray-200 rounded animate-pulse w-20" />
                  ) : analyticsError ? (
                    '—'
                  ) : (
                    `₫${previousMonthEarnings.toLocaleString()}`
                  )}
                </span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Chờ thanh toán</span>
                  <span className="text-sm font-medium text-yellow-600">
                    ₫{(0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Có thể rút</span>
                  <span className="text-sm font-medium text-green-600">
                    {analyticsLoading ? (
                      <span className="inline-block h-4 bg-gray-200 rounded animate-pulse w-20" />
                    ) : analyticsError ? (
                      '—'
                    ) : (
                      `₫${(analytics?.TotalEarnings ?? 0).toLocaleString()}`
                    )}
                  </span>
                </div>
              </div>
              {!!latestMonthLabel && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm text-blue-800">
                      Cập nhật gần nhất: {new Date(latestMonthLabel).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              )}
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                Yêu cầu rút tiền
              </button>
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Thao tác nhanh</h3>
            </div>
            <div className="p-6 space-y-3">
              <Link href="/instructor/courses/create" className="w-full flex items-center justify-center px-4 py-2 border border-green-300 rounded-lg text-green-700 hover:bg-green-50 transition-colors">
                <PlusIcon className="h-4 w-4 mr-2" />
                Tạo khóa học mới
              </Link>
              <Link href="/instructor/assignments/create" className="w-full flex items-center justify-center px-4 py-2 border border-blue-300 rounded-lg text-blue-700 hover:bg-blue-50 transition-colors">
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                Tạo bài tập
              </Link>
              <Link href="/instructor/live-classes/create" className="w-full flex items-center justify-center px-4 py-2 border border-red-300 rounded-lg text-red-700 hover:bg-red-50 transition-colors">
                <VideoCameraIcon className="h-4 w-4 mr-2" />
                Tạo lớp học trực tuyến
              </Link>
              <Link href="/instructor/students" className="w-full flex items-center justify-center px-4 py-2 border border-indigo-300 rounded-lg text-indigo-700 hover:bg-indigo-50 transition-colors">
                <UsersIcon className="h-4 w-4 mr-2" />
                Xem học sinh
              </Link>
              <Link href="/instructor/analytics" className="w-full flex items-center justify-center px-4 py-2 border border-purple-300 rounded-lg text-purple-700 hover:bg-purple-50 transition-colors">
                <ChartBarIcon className="h-4 w-4 mr-2" />
                Xem thống kê
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Top Courses and Books Charts */}
      {analytics && (analytics.TopCourses.length > 0 || analytics.TopBooks.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top Courses Chart */}
          {analytics.TopCourses.length > 0 && (
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Top khóa học</h3>
              <div className="h-64">
                <Chart
                  data={analytics.TopCourses.map(c => ({ Date: c.Title, Amount: c.Revenue }))}
                  type="bar"
                  xKey="Date"
                  yKey="Amount"
                  color="#3b82f6"
                  height={250}
                />
              </div>
              <div className="mt-4 space-y-2">
                {analytics.TopCourses.slice(0, 3).map((course) => (
                  <div key={course.Id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 truncate flex-1">{course.Title}</span>
                    <div className="flex items-center gap-4 ml-4">
                      <span className="text-gray-500">{course.Enrollments} học viên</span>
                      <span className="font-semibold text-gray-900">₫{course.Revenue.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Books Chart */}
          {analytics.TopBooks.length > 0 && (
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Top sách</h3>
              <div className="h-64">
                <Chart
                  data={analytics.TopBooks.map(b => ({ Date: b.Title, Amount: b.Revenue }))}
                  type="bar"
                  xKey="Date"
                  yKey="Amount"
                  color="#10b981"
                  height={250}
                />
              </div>
              <div className="mt-4 space-y-2">
                {analytics.TopBooks.slice(0, 3).map((book) => (
                  <div key={book.Id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 truncate flex-1">{book.Title}</span>
                    <div className="flex items-center gap-4 ml-4">
                      <span className="text-gray-500">{book.Enrollments} kích hoạt</span>
                      <span className="font-semibold text-gray-900">₫{book.Revenue.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent books */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Sách điện tử gần đây</h3>
            <Link href="/instructor/books" className="text-sm text-green-600 hover:text-green-800">
              Xem tất cả
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên sách
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kích hoạt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doanh thu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã còn lại
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {booksLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Đang tải dữ liệu sách...
                  </td>
                </tr>
              ) : booksError ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-red-600">
                    {booksError}
                  </td>
                </tr>
              ) : recentBooks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Bạn chưa có sách nào.
                  </td>
                </tr>
              ) : (
                recentBooks.map((book, index) => {
                  const extendedBook = book as BookWithStats;
                  const status = getBookStatus(extendedBook);
                  const activations =
                    extendedBook.Activations ??
                    extendedBook.activations ??
                    extendedBook.activationCount ??
                    extendedBook.totalActivations ??
                    0;
                  const revenue =
                    extendedBook.totalRevenue ??
                    extendedBook.revenue ??
                    extendedBook.earnings ??
                    0;
                  const codesRemaining =
                    extendedBook.CodesRemaining ??
                    extendedBook.codesRemaining ??
                    extendedBook.RemainingCodes ??
                    extendedBook.remainingCodes ??
                    0;
                  const updatedAt =
                    extendedBook.UpdatedAt ??
                    extendedBook.updatedAt ??
                    extendedBook.LastUpdated ??
                    extendedBook.lastUpdated ??
                    null;

                  return (
                    <tr key={extendedBook.id ?? extendedBook.Id ?? index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                              <BookOpenIcon className="h-5 w-5 text-white" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {extendedBook.title ?? extendedBook.Title ?? 'Không có tên'}
                            </div>
                            <div className="text-sm text-gray-500">
                              Cập nhật: {updatedAt ? new Date(updatedAt).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(status)}`}>
                          {getStatusText(status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {activations}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₫{Number(revenue).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {codesRemaining}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-green-600 hover:text-green-900">Quản lý</button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import {
  ChartBarIcon,
  AcademicCapIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface AnalyticsData {
  Overview: {
    TotalCourses: number;
    PublishedCourses: number;
    DraftCourses: number;
    PendingApproval: number;
    TotalEnrollments: number;
    TotalRevenue: number;
    AverageRating: number;
    TotalReviews: number;
    ActiveStudents: number;
    CompletionRate: number;
  };
  CategoryStats: Array<{
    CategoryId: number;
    CategoryName: string;
    CourseCount: number;
    EnrollmentCount: number;
    Revenue: number;
    AverageRating: number;
  }>;
  TopCourses: Array<{
    Id: number;
    Title: string;
    Thumbnail: string;
    InstructorName: string;
    EnrollmentCount: number;
    Revenue: number;
    Rating: number;
    ReviewCount: number;
    CompletionRate: number;
  }>;
  RevenueByMonth: Array<{
    Month: string;
    Revenue: number;
    EnrollmentCount: number;
    AverageOrderValue: number;
  }>;
  EnrollmentTrends: Array<{
    Date: string;
    NewEnrollments: number;
    ActiveStudents: number;
    CompletedCourses: number;
  }>;
  TopInstructors: Array<{
    InstructorId: number;
    InstructorName: string;
    Avatar: string;
    TotalCourses: number;
    TotalStudents: number;
    TotalRevenue: number;
    AverageRating: number;
  }>;
}

export default function CourseAnalyticsPage() {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const resp = await authenticatedFetch(`/api/courses/analytics?days=${timeRange}`);
      const result = await resp.json();
      
      if (resp.ok && result.Result) {
        setData(result.Result);
      }
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatMonth = (month: string) => {
    const [year, m] = month.split('-');
    return `Tháng ${m}/${year}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!data) {
    return <div>Không có dữ liệu</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Phân tích khóa học</h1>
          <p className="text-sm text-gray-600">Thống kê và báo cáo chi tiết</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(parseInt(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value={7}>7 ngày qua</option>
          <option value={30}>30 ngày qua</option>
          <option value={90}>90 ngày qua</option>
          <option value={365}>1 năm qua</option>
        </select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
              <AcademicCapIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Tổng khóa học</p>
              <p className="text-2xl font-semibold text-gray-900">{data.Overview.TotalCourses}</p>
              <div className="flex items-center mt-1 text-xs">
                <CheckCircleIcon className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-green-600">{data.Overview.PublishedCourses} đã xuất bản</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
              <UserGroupIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Tổng học viên</p>
              <p className="text-2xl font-semibold text-gray-900">{data.Overview.TotalEnrollments.toLocaleString()}</p>
              <div className="flex items-center mt-1 text-xs">
                <ArrowTrendingUpIcon className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-green-600">{data.Overview.ActiveStudents} đang hoạt động</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
              <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Doanh thu</p>
              <p className="text-2xl font-semibold text-gray-900">
                {(data.Overview.TotalRevenue / 1000000).toFixed(1)}M
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatCurrency(data.Overview.TotalRevenue)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
              <StarIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Đánh giá TB</p>
              <p className="text-2xl font-semibold text-gray-900">{data.Overview.AverageRating.toFixed(1)}</p>
              <p className="text-xs text-gray-500 mt-1">
                {data.Overview.TotalReviews} đánh giá
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Doanh thu theo tháng</h3>
          <div className="space-y-3">
            {data.RevenueByMonth.slice(-6).map((item) => (
              <div key={item.Month}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">{formatMonth(item.Month)}</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(item.Revenue)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(item.Revenue / Math.max(...data.RevenueByMonth.map(r => r.Revenue))) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{item.EnrollmentCount} đăng ký</p>
              </div>
            ))}
          </div>
        </div>

        {/* Category Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê theo danh mục</h3>
          <div className="space-y-4">
            {data.CategoryStats.map((cat) => (
              <div key={cat.CategoryId} className="border-b border-gray-200 pb-3 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{cat.CategoryName}</span>
                  <span className="text-sm text-gray-600">{cat.CourseCount} khóa học</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-gray-500">Học viên</p>
                    <p className="font-semibold text-gray-900">{cat.EnrollmentCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Doanh thu</p>
                    <p className="font-semibold text-gray-900">{(cat.Revenue / 1000000).toFixed(1)}M</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Đánh giá</p>
                    <p className="font-semibold text-gray-900 flex items-center">
                      <StarIcon className="h-3 w-3 text-yellow-400 mr-1" />
                      {cat.AverageRating.toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Courses */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Khóa học hàng đầu</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khóa học</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giảng viên</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Học viên</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doanh thu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đánh giá</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hoàn thành</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.TopCourses.map((course) => (
                <tr key={course.Id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 rounded overflow-hidden bg-gray-200">
                        {course.Thumbnail ? (
                          <img
                            src={course.Thumbnail}
                            alt={course.Title}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              // Hide image if it fails to load
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : null}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{course.Title}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{course.InstructorName}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{course.EnrollmentCount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(course.Revenue)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm">
                      <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="font-medium">{course.Rating.toFixed(1)}</span>
                      <span className="text-gray-500 ml-1">({course.ReviewCount})</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{course.CompletionRate.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Instructors */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Giảng viên xuất sắc</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.TopInstructors.map((instructor) => (
            <div key={instructor.InstructorId} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="h-12 w-12 bg-gray-200 rounded-full flex-shrink-0"></div>
                <div className="ml-3">
                  <p className="font-semibold text-gray-900">{instructor.InstructorName}</p>
                  <div className="flex items-center text-sm text-yellow-600">
                    <StarIcon className="h-4 w-4 mr-1" />
                    {instructor.AverageRating.toFixed(1)}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Khóa học</p>
                  <p className="font-semibold text-gray-900">{instructor.TotalCourses}</p>
                </div>
                <div>
                  <p className="text-gray-500">Học viên</p>
                  <p className="font-semibold text-gray-900">{instructor.TotalStudents.toLocaleString()}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Doanh thu</p>
                  <p className="font-semibold text-gray-900">{formatCurrency(instructor.TotalRevenue)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

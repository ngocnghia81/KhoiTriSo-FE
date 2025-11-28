'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useCourseAnalytics } from '@/hooks/useCourseAnalytics';
import Chart from '@/components/dashboard/Chart';
import ProgressDistributionChart from '@/components/analytics/ProgressDistributionChart';
import LessonEngagementChart from '@/components/analytics/LessonEngagementChart';
import AssignmentPerformanceChart from '@/components/analytics/AssignmentPerformanceChart';
import {
  AcademicCapIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  StarIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function InstructorCourseAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id ? parseInt(params.id as string) : null;
  const [period, setPeriod] = useState('30d');
  const { data, loading, error } = useCourseAnalytics(courseId, period);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <p className="ml-3 text-gray-600">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600 text-center">
          <p className="text-xl font-semibold">Lỗi tải dữ liệu</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Không có dữ liệu</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push(`/instructor/courses/${courseId}`)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Phân tích khóa học</h1>
              <p className="text-gray-600 mt-1">Course ID: {courseId}</p>
            </div>
            
            {/* Period Selector */}
            <div className="flex gap-2">
              {['7d', '30d', '90d'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    period === p
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {p === '7d' ? '7 ngày' : p === '30d' ? '30 ngày' : '90 ngày'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                  <UserGroupIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">Tổng học viên</p>
                  <p className="text-2xl font-semibold text-gray-900">{data.TotalEnrollments.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">{data.ActiveStudents} đang hoạt động</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">Tỷ lệ hoàn thành</p>
                  <p className="text-2xl font-semibold text-gray-900">{data.CompletionRate.toFixed(1)}%</p>
                  <p className="text-xs text-gray-500 mt-1">Tiến độ TB: {data.AverageProgress.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                  <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">Doanh thu</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatCurrency(data.TotalRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                  <StarIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">Đánh giá</p>
                  <p className="text-2xl font-semibold text-gray-900">{data.Rating.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Average Progress Card */}
        <Card>
          <CardHeader>
            <CardTitle>Tiến độ trung bình</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Tiến độ trung bình của học viên</span>
                  <span className="font-semibold text-gray-900">{data.AverageProgress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all ${
                      data.AverageProgress >= 80 ? 'bg-green-500' :
                      data.AverageProgress >= 60 ? 'bg-yellow-500' :
                      data.AverageProgress >= 40 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${data.AverageProgress}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Tỷ lệ hoàn thành</p>
                  <p className="text-lg font-semibold text-gray-900">{data.CompletionRate.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-gray-500">Học viên đang hoạt động</p>
                  <p className="text-lg font-semibold text-gray-900">{data.ActiveStudents}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enrollment Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Xu hướng đăng ký</CardTitle>
            </CardHeader>
            <CardContent>
              {data.EnrollmentTrend.length > 0 ? (
                <Chart
                  data={data.EnrollmentTrend.map(t => ({ Date: t.Date, Amount: t.Amount }))}
                  type="area"
                  xKey="Date"
                  yKey="Amount"
                  color="#10b981"
                  height={250}
                />
              ) : (
                <p className="text-gray-500 text-center py-8">Chưa có dữ liệu</p>
              )}
            </CardContent>
          </Card>

          {/* Progress Distribution */}
          <ProgressDistributionChart data={data.ProgressDistribution} />
        </div>

        {/* Lesson Engagement */}
        <LessonEngagementChart data={data.LessonEngagement} />

        {/* Assignment Performance */}
        <AssignmentPerformanceChart data={data.AssignmentPerformance} />
      </div>
    </div>
  );
}


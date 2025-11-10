'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useInstructorAnalytics } from '@/hooks/useInstructors';
import Chart from '@/components/dashboard/Chart';
import StatsCard from '@/components/dashboard/StatsCard';
import {
  AcademicCapIcon,
  BookOpenIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  StarIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

export default function InstructorAnalyticsPage() {
  const params = useParams();
  const id = params?.id ? parseInt(params.id as string) : 0;
  const [period, setPeriod] = useState('30d');
  const { data, loading, error } = useInstructorAnalytics(id, period);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 text-center">
          <p className="text-xl font-semibold">Error loading analytics</p>
          <p className="text-sm mt-2">{error || 'No data available'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div className="flex items-center">
            {data.Avatar && (
              <img
                src={data.Avatar}
                alt={data.InstructorName}
                className="w-16 h-16 rounded-full object-cover mr-4"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{data.InstructorName}</h1>
              <p className="text-gray-600 mt-1">Instructor Analytics</p>
            </div>
          </div>

          {/* Period Selector */}
          <div className="flex gap-2">
            {['7d', '30d', '90d'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  period === p
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatsCard
            name="Total Courses"
            value={data.TotalCourses.toString()}
            change={`${data.TotalStudents} students`}
            changeType="increase"
            icon={AcademicCapIcon}
            color="blue"
            description="Published courses"
          />
          <StatsCard
            name="Total Books"
            value={data.TotalBooks.toString()}
            change={`${data.TotalLearningPaths} paths`}
            changeType="increase"
            icon={BookOpenIcon}
            color="purple"
            description="Published books"
          />
          <StatsCard
            name="Total Students"
            value={data.TotalStudents.toLocaleString()}
            change={`${data.AverageRating.toFixed(1)} rating`}
            changeType="increase"
            icon={UserGroupIcon}
            color="green"
            description="Enrolled students"
          />
          <StatsCard
            name="Total Earnings"
            value={`$${data.TotalEarnings.toLocaleString()}`}
            change={`$${data.TotalRevenue.toLocaleString()} revenue`}
            changeType="increase"
            icon={CurrencyDollarIcon}
            color="yellow"
            description="Total earnings (70%)"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Enrollment Trend */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrollment Trend</h3>
            {data.EnrollmentTrend.length > 0 ? (
              <Chart
                data={data.EnrollmentTrend as any}
                type="area"
                xKey="Date"
                yKey="Amount"
                color="#3b82f6"
                height={250}
              />
            ) : (
              <p className="text-gray-500 text-center py-8">No data available</p>
            )}
          </div>

          {/* Revenue Trend */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
            {data.RevenueTrend.length > 0 ? (
              <Chart
                data={data.RevenueTrend as any}
                type="line"
                xKey="Date"
                yKey="Amount"
                color="#10b981"
                height={250}
              />
            ) : (
              <p className="text-gray-500 text-center py-8">No data available</p>
            )}
          </div>
        </div>

        {/* Student Feedback */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Feedback</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{data.StudentFeedback.Positive.toFixed(1)}%</div>
              <div className="text-sm text-gray-500 mt-1">Positive</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{data.StudentFeedback.Neutral.toFixed(1)}%</div>
              <div className="text-sm text-gray-500 mt-1">Neutral</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{data.StudentFeedback.Negative.toFixed(1)}%</div>
              <div className="text-sm text-gray-500 mt-1">Negative</div>
            </div>
          </div>
        </div>

        {/* Top Courses & Books */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Top Courses */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Courses</h3>
            <div className="space-y-3">
              {data.TopCourses.map((course, index) => (
                <div key={course.Id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-lg font-bold text-gray-400 mr-3">#{index + 1}</span>
                    <div>
                      <p className="font-medium text-gray-900">{course.Title}</p>
                      <p className="text-sm text-gray-500">{course.Enrollments} students</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">${course.Revenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">⭐ {course.Rating.toFixed(1)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Books */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Books</h3>
            <div className="space-y-3">
              {data.TopBooks.map((book, index) => (
                <div key={book.Id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-lg font-bold text-gray-400 mr-3">#{index + 1}</span>
                    <div>
                      <p className="font-medium text-gray-900">{book.Title}</p>
                      <p className="text-sm text-gray-500">{book.Enrollments} sales</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">${book.Revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Course Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Performance</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrollments</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.CoursePerformance.map((course) => (
                  <tr key={course.CourseId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {course.Title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.Enrollments}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${course.Revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

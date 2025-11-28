 'use client';

import { Metadata } from 'next';
import {
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  BanknotesIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon,
  BookOpenIcon,
  UserGroupIcon,
  EyeIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useInstructorAnalytics } from '@/hooks/useInstructors';
import Chart from '@/components/dashboard/Chart';
// Note: Metadata can only be exported from a Server Component.
// This page is a Client Component because it uses client hooks.

const formatCurrency = (amount: number) => {
  return `₫${amount.toLocaleString()}`;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getTransactionIcon = (type: string) => {
  return type === 'course_enrollment' ? AcademicCapIcon : BookOpenIcon;
};

const getTransactionTypeText = (type: string) => {
  return type === 'course_enrollment' ? 'Khóa học' : 'Sách';
};

export default function InstructorEarningsPage() {
  const { isAuthenticated, user } = useAuth();
  const isTeacher = user?.role === 'instructor' || user?.role === 'teacher';
  const instructorId = isTeacher ? Number(user?.id) : undefined;
  const { data: analytics, loading, error } = useInstructorAnalytics(instructorId ?? 0, '6m');

  const totals = useMemo(() => {
    const monthly = analytics?.MonthlyEarnings ?? [];
    const totalEarnings = monthly.reduce((sum, m) => sum + (m.Earnings ?? 0), 0);
    const thisMonth = monthly.length > 0 ? (monthly[monthly.length - 1].Earnings ?? 0) : 0;
    const lastMonth = monthly.length > 1 ? (monthly[monthly.length - 2].Earnings ?? 0) : 0;
    return { totalEarnings, thisMonth, lastMonth };
  }, [analytics]);

  const monthly = analytics?.MonthlyEarnings ?? [];
  const monthsCount = monthly.length;
  const avgPerMonth = monthsCount > 0 ? totals.totalEarnings / monthsCount : 0;
  const handleExportCsv = () => {
    const rows = [
      ['Month', 'Earnings'],
      ...monthly.map((m) => [m.Month ?? '', String(m.Earnings ?? 0)]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    link.download = `instructor-earnings-${instructorId ?? 'me'}-${ts}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}
      {/* Page header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Thu nhập</h1>
          <p className="mt-2 text-sm text-gray-700">Theo dõi thu nhập theo tháng</p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none space-x-3">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all duration-200"
            onClick={handleExportCsv}
          >
            <ArrowDownTrayIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
            Xuất CSV
          </button>
        </div>
      </div>

      {/* Earnings overview */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-6 text-white">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-medium text-green-100">Tổng thu nhập</h3>
            <p className="text-3xl font-bold">{loading ? '...' : formatCurrency(totals.totalEarnings)}</p>
            <p className="text-sm text-green-100 mt-1">Từ khi bắt đầu</p>
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-lg font-medium text-green-100">Tháng này</h3>
            <p className="text-2xl font-bold">{loading ? '...' : formatCurrency(totals.thisMonth)}</p>
            <div className="flex items-center justify-center md:justify-start mt-1">
              <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
              <span className="text-sm">
                {totals.lastMonth > 0 ? `+${(((totals.thisMonth - totals.lastMonth) / totals.lastMonth) * 100).toFixed(1)}%` : '0%'}
              </span>
            </div>
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-lg font-medium text-green-100">Tháng trước</h3>
            <p className="text-2xl font-bold">{loading ? '...' : formatCurrency(totals.lastMonth)}</p>
            <p className="text-sm text-green-100 mt-1">So sánh</p>
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-lg font-medium text-green-100">Số tháng báo cáo</h3>
            <p className="text-2xl font-bold">{monthsCount}</p>
            <p className="text-sm text-green-100 mt-1">Gần đây</p>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <dl>
                <dt className="text-sm font-medium text-gray-500">Tổng theo kỳ</dt>
                <dd className="text-2xl font-bold text-gray-900">{formatCurrency(totals.totalEarnings)}</dd>
                <dd className="text-sm text-green-600">6 tháng gần nhất</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <dl>
                <dt className="text-sm font-medium text-gray-500">Trung bình/tháng</dt>
                <dd className="text-2xl font-bold text-gray-900">{formatCurrency(avgPerMonth)}</dd>
                <dd className="text-sm text-blue-600">6 tháng gần nhất</dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                <CalendarIcon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <dl>
                <dt className="text-sm font-medium text-gray-500">Số tháng báo cáo</dt>
                <dd className="text-2xl font-bold text-gray-900">{monthsCount}</dd>
                <dd className="text-sm text-yellow-600">Gần đây</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>


      {/* Top courses and books */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* Top Courses */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Khóa học nổi bật</h3>
          </div>
          <div className="p-6 space-y-4">
            {(analytics?.TopCourses ?? []).length === 0 ? (
              <div className="text-sm text-gray-500">Chưa có dữ liệu.</div>
            ) : (
              (analytics?.TopCourses ?? []).map((c, idx) => (
                <div key={c.Id ?? idx} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <AcademicCapIcon className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {c.Title}
                    </h4>
                    <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                      <span>{c.Enrollments} học viên</span>
                      <span className="text-green-600 font-medium">{formatCurrency(c.Revenue ?? 0)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Books */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Sách nổi bật</h3>
          </div>
          <div className="p-6 space-y-4">
            {(analytics?.TopBooks ?? []).length === 0 ? (
              <div className="text-sm text-gray-500">Chưa có dữ liệu.</div>
            ) : (
              (analytics?.TopBooks ?? []).map((b, idx) => (
                <div key={b.Id ?? idx} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BookOpenIcon className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {b.Title}
                    </h4>
                    <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                      <span>{b.Enrollments} kích hoạt</span>
                      <span className="text-blue-600 font-medium">{formatCurrency(b.Revenue ?? 0)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* Monthly earnings chart */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Thu nhập theo tháng</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CalendarIcon className="h-4 w-4" />
                  <span>6 tháng gần nhất</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  <p className="ml-3 text-gray-600">Đang tải dữ liệu...</p>
                </div>
              ) : monthly.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ChartBarIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Chưa có dữ liệu thu nhập</p>
                </div>
              ) : (
                <>
                  {/* Chart */}
                  <div className="mb-6">
                    <div className="h-80">
                      <Chart
                        data={monthly.map(m => ({ Date: m.Month, Amount: m.Earnings ?? 0 }))}
                        type="line"
                        xKey="Date"
                        yKey="Amount"
                        color="#10b981"
                        height={300}
                      />
                    </div>
                  </div>
                  
                  {/* List below chart */}
                  <div className="border-t pt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-4">Chi tiết từng tháng</h4>
                    <div className="space-y-3">
                      {monthly.map((m, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                              <CalendarIcon className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{m.Month}</h4>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {index === monthly.length - 1 ? 'Tháng hiện tại' : 
                                 index === monthly.length - 2 ? 'Tháng trước' : 
                                 `${monthly.length - index - 1} tháng trước`}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-gray-900">
                              {formatCurrency(m.Earnings ?? 0)}
                            </div>
                            {index > 0 && monthly[index - 1].Earnings > 0 && (
                              <div className={`text-xs mt-1 ${
                                (m.Earnings ?? 0) > (monthly[index - 1].Earnings ?? 0) 
                                  ? 'text-green-600' 
                                  : (m.Earnings ?? 0) < (monthly[index - 1].Earnings ?? 0)
                                  ? 'text-red-600'
                                  : 'text-gray-500'
                              }`}>
                                {((m.Earnings ?? 0) > (monthly[index - 1].Earnings ?? 0)) ? '↑' : 
                                  ((m.Earnings ?? 0) < (monthly[index - 1].Earnings ?? 0)) ? '↓' : '→'} 
                                {Math.abs(
                                  (((m.Earnings ?? 0) - (monthly[index - 1].Earnings ?? 0)) / (monthly[index - 1].Earnings ?? 1)) * 100
                                ).toFixed(1)}%
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

      </div>
      
    </div>
  );
}

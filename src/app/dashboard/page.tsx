import { Metadata } from 'next';
import {
  UserGroupIcon,
  AcademicCapIcon,
  BookOpenIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import StatsCard from '@/components/dashboard/StatsCard';
import Chart from '@/components/dashboard/Chart';
import RecentActivity from '@/components/dashboard/RecentActivity';
import TopPerformers from '@/components/dashboard/TopPerformers';

export const metadata: Metadata = {
  title: 'Dashboard - Khởi Trí Số',
  description: 'Tổng quan hệ thống giáo dục Khởi Trí Số',
};

// Mock data - sẽ được thay thế bằng API calls
const stats = [
  {
    name: 'Tổng người dùng',
    value: '12,345',
    change: '+12%',
    changeType: 'increase' as const,
    icon: UserGroupIcon,
    color: 'blue' as const,
    description: 'So với tháng trước'
  },
  {
    name: 'Khóa học hoạt động',
    value: '156',
    change: '+8%',
    changeType: 'increase' as const,
    icon: AcademicCapIcon,
    color: 'green' as const,
    description: 'Khóa học đang hoạt động'
  },
  {
    name: 'Sách điện tử',
    value: '89',
    change: '+3%',
    changeType: 'increase' as const,
    icon: BookOpenIcon,
    color: 'purple' as const,
    description: 'Sách đang bán'
  },
  {
    name: 'Doanh thu tháng',
    value: '₫245M',
    change: '+18%',
    changeType: 'increase' as const,
    icon: CurrencyDollarIcon,
    color: 'yellow' as const,
    description: 'Doanh thu tháng này'
  },
  {
    name: 'Học sinh hoạt động',
    value: '8,567',
    change: '+15%',
    changeType: 'increase' as const,
    icon: ChartBarIcon,
    color: 'indigo' as const,
    description: 'Học sinh đang học'
  },
  {
    name: 'Tỷ lệ hoàn thành',
    value: '78%',
    change: '-2%',
    changeType: 'decrease' as const,
    icon: CheckCircleIcon,
    color: 'red' as const,
    description: 'Tỷ lệ hoàn thành khóa học'
  }
];

const revenueData = [
  { month: 'T1', revenue: 180 },
  { month: 'T2', revenue: 200 },
  { month: 'T3', revenue: 170 },
  { month: 'T4', revenue: 220 },
  { month: 'T5', revenue: 250 },
  { month: 'T6', revenue: 245 },
];

const userGrowthData = [
  { month: 'T1', users: 8500 },
  { month: 'T2', users: 9200 },
  { month: 'T3', users: 9800 },
  { month: 'T4', users: 10500 },
  { month: 'T5', users: 11200 },
  { month: 'T6', users: 12345 },
];

const courseCompletionData = [
  { course: 'Toán 12', completion: 85 },
  { course: 'Vật lý 11', completion: 78 },
  { course: 'Hóa học 10', completion: 82 },
  { course: 'Sinh học 12', completion: 75 },
  { course: 'Văn 11', completion: 88 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Dashboard
          </h1>
          <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <ClockIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
              Cập nhật lần cuối: {new Date().toLocaleString('vi-VN')}
            </div>
          </div>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            <EyeIcon className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" />
            Xem báo cáo chi tiết
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <StatsCard key={stat.name} {...stat} />
        ))}
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue chart */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Doanh thu theo tháng</h3>
              <div className="flex items-center text-sm text-green-600">
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                +18%
              </div>
            </div>
            <div className="mt-6">
              <Chart 
                data={revenueData} 
                type="line" 
                xKey="month" 
                yKey="revenue"
                color="#10B981"
                height={300}
              />
            </div>
          </div>
        </div>

        {/* User growth chart */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Tăng trưởng người dùng</h3>
              <div className="flex items-center text-sm text-blue-600">
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                +12%
              </div>
            </div>
            <div className="mt-6">
              <Chart 
                data={userGrowthData} 
                type="area" 
                xKey="month" 
                yKey="users"
                color="#3B82F6"
                height={300}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Course completion and recent activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Course completion rates */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Tỷ lệ hoàn thành khóa học</h3>
            <div className="space-y-4">
              {courseCompletionData.map((course) => (
                <div key={course.course} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{course.course}</span>
                      <span className="text-sm text-gray-500">{course.completion}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${course.completion}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <RecentActivity />
      </div>

      {/* Top performers and alerts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TopPerformers />
        
        {/* System alerts */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Cảnh báo hệ thống</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Server tải cao</p>
                  <p className="text-sm text-red-600">CPU usage đạt 85%, cần kiểm tra</p>
                  <p className="text-xs text-red-500 mt-1">5 phút trước</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Backup chậm</p>
                  <p className="text-sm text-yellow-600">Backup database mất 2h để hoàn thành</p>
                  <p className="text-xs text-yellow-500 mt-1">1 giờ trước</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <CheckCircleIcon className="h-5 w-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Cập nhật thành công</p>
                  <p className="text-sm text-blue-600">Hệ thống đã được cập nhật lên v2.1.0</p>
                  <p className="text-xs text-blue-500 mt-1">3 giờ trước</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

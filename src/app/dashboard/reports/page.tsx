import { Metadata } from 'next';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  DocumentChartBarIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  UserGroupIcon,
  AcademicCapIcon,
  BookOpenIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Báo cáo thống kê - Admin Dashboard',
  description: 'Xem báo cáo và phân tích dữ liệu hệ thống',
};

// Mock data
const overviewStats = {
  totalRevenue: 2450000000,
  totalUsers: 15420,
  totalCourses: 234,
  totalBooks: 156,
  monthlyGrowth: {
    revenue: 12.5,
    users: 8.3,
    courses: 15.2,
    books: 6.8
  }
};

const monthlyData = [
  { month: 'T1/2024', revenue: 1890000000, users: 1245, courses: 12, books: 8 },
  { month: 'T2/2024', revenue: 2180000000, users: 1456, courses: 15, books: 11 },
  { month: 'T3/2024', revenue: 2450000000, users: 1623, courses: 18, books: 9 },
];

const topCourses = [
  {
    id: 1,
    title: 'Toán học nâng cao lớp 12',
    instructor: 'GS. Nguyễn Văn A',
    students: 1234,
    revenue: 369666000,
    rating: 4.8,
    completionRate: 85
  },
  {
    id: 2,
    title: 'Vật lý thí nghiệm lớp 11',
    instructor: 'TS. Trần Thị B',
    students: 987,
    revenue: 196413000,
    rating: 4.7,
    completionRate: 78
  },
  {
    id: 3,
    title: 'Hóa học cơ bản lớp 10',
    instructor: 'ThS. Lê Văn C',
    students: 756,
    revenue: 112644000,
    rating: 4.6,
    completionRate: 92
  }
];

const topInstructors = [
  {
    id: 1,
    name: 'GS. Nguyễn Văn A',
    courses: 5,
    students: 2341,
    revenue: 701300000,
    rating: 4.9,
    completionRate: 87
  },
  {
    id: 2,
    name: 'TS. Trần Thị B',
    students: 1876,
    courses: 4,
    revenue: 562800000,
    rating: 4.8,
    completionRate: 82
  },
  {
    id: 3,
    name: 'ThS. Lê Văn C',
    students: 1523,
    courses: 3,
    revenue: 456900000,
    rating: 4.7,
    completionRate: 90
  }
];

const userActivity = [
  { date: '2024-01-15', newUsers: 45, activeUsers: 1234, coursesCompleted: 23 },
  { date: '2024-01-16', newUsers: 52, activeUsers: 1456, coursesCompleted: 31 },
  { date: '2024-01-17', newUsers: 38, activeUsers: 1345, coursesCompleted: 28 },
  { date: '2024-01-18', newUsers: 67, activeUsers: 1567, coursesCompleted: 35 },
  { date: '2024-01-19', newUsers: 43, activeUsers: 1423, coursesCompleted: 29 }
];

const formatCurrency = (amount: number) => {
  return `₫${(amount / 1000000).toFixed(1)}M`;
};

const formatNumber = (num: number) => {
  return num.toLocaleString();
};

export default function ReportsPage() {
  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Báo cáo thống kê</h1>
          <p className="mt-2 text-sm text-gray-700">
            Phân tích dữ liệu và xu hướng của hệ thống
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none space-x-3">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            <FunnelIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
            Lọc
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all duration-200"
          >
            <ArrowDownTrayIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Time period selector */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-900">Khoảng thời gian:</span>
            <select className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>7 ngày qua</option>
              <option>30 ngày qua</option>
              <option>3 tháng qua</option>
              <option>1 năm qua</option>
              <option>Tùy chỉnh</option>
            </select>
          </div>
          <div className="text-sm text-gray-500">
            Cập nhật lần cuối: {new Date().toLocaleString('vi-VN')}
          </div>
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <dl>
                <dt className="text-sm font-medium text-gray-500">Tổng doanh thu</dt>
                <dd className="text-2xl font-bold text-gray-900">{formatCurrency(overviewStats.totalRevenue)}</dd>
                <dd className="flex items-center text-sm text-green-600">
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                  +{overviewStats.monthlyGrowth.revenue}%
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <UserGroupIcon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <dl>
                <dt className="text-sm font-medium text-gray-500">Tổng người dùng</dt>
                <dd className="text-2xl font-bold text-gray-900">{formatNumber(overviewStats.totalUsers)}</dd>
                <dd className="flex items-center text-sm text-blue-600">
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                  +{overviewStats.monthlyGrowth.users}%
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <AcademicCapIcon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <dl>
                <dt className="text-sm font-medium text-gray-500">Tổng khóa học</dt>
                <dd className="text-2xl font-bold text-gray-900">{overviewStats.totalCourses}</dd>
                <dd className="flex items-center text-sm text-purple-600">
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                  +{overviewStats.monthlyGrowth.courses}%
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                <BookOpenIcon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <dl>
                <dt className="text-sm font-medium text-gray-500">Tổng sách</dt>
                <dd className="text-2xl font-bold text-gray-900">{overviewStats.totalBooks}</dd>
                <dd className="flex items-center text-sm text-yellow-600">
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                  +{overviewStats.monthlyGrowth.books}%
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and main content */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Revenue chart */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Doanh thu theo tháng</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {monthlyData.map((month, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{month.month}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span>Người dùng: {formatNumber(month.users)}</span>
                        <span>Khóa học: {month.courses}</span>
                        <span>Sách: {month.books}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        {formatCurrency(month.revenue)}
                      </div>
                      <div className="text-sm text-green-600">
                        +{index === 0 ? 0 : ((month.revenue - monthlyData[index-1].revenue) / monthlyData[index-1].revenue * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* User activity */}
        <div>
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Hoạt động người dùng</h3>
            </div>
            <div className="p-6 space-y-4">
              {userActivity.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(day.date).toLocaleDateString('vi-VN')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {day.newUsers} người dùng mới
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatNumber(day.activeUsers)}
                    </div>
                    <div className="text-xs text-green-600">
                      {day.coursesCompleted} hoàn thành
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top courses and instructors */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Top courses */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Khóa học hàng đầu</h3>
              <button className="text-sm text-blue-600 hover:text-blue-800">Xem tất cả</button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {topCourses.map((course, index) => (
              <div key={course.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600">#{index + 1}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {course.title}
                  </h4>
                  <p className="text-xs text-gray-500">{course.instructor}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-3 text-xs text-gray-600">
                      <span>{formatNumber(course.students)} học viên</span>
                      <span>★ {course.rating}</span>
                      <span>{course.completionRate}% hoàn thành</span>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-green-600 mt-1">
                    {formatCurrency(course.revenue)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top instructors */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Giảng viên hàng đầu</h3>
              <button className="text-sm text-blue-600 hover:text-blue-800">Xem tất cả</button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {topInstructors.map((instructor, index) => (
              <div key={instructor.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-semibold text-green-600">#{index + 1}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900">
                    {instructor.name}
                  </h4>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center space-x-3 text-xs text-gray-600">
                      <span>{instructor.courses} khóa học</span>
                      <span>{formatNumber(instructor.students)} học viên</span>
                      <span>★ {instructor.rating}</span>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-green-600 mt-1">
                    {formatCurrency(instructor.revenue)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed reports section */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Báo cáo chi tiết</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <DocumentChartBarIcon className="h-8 w-8 text-blue-500 mr-3" />
              <div className="text-left">
                <div className="text-sm font-medium text-gray-900">Báo cáo doanh thu</div>
                <div className="text-xs text-gray-500">Chi tiết theo sản phẩm</div>
              </div>
            </button>

            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <UserGroupIcon className="h-8 w-8 text-green-500 mr-3" />
              <div className="text-left">
                <div className="text-sm font-medium text-gray-900">Báo cáo người dùng</div>
                <div className="text-xs text-gray-500">Phân tích hành vi</div>
              </div>
            </button>

            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <AcademicCapIcon className="h-8 w-8 text-purple-500 mr-3" />
              <div className="text-left">
                <div className="text-sm font-medium text-gray-900">Báo cáo khóa học</div>
                <div className="text-xs text-gray-500">Hiệu suất học tập</div>
              </div>
            </button>

            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <ChartBarIcon className="h-8 w-8 text-yellow-500 mr-3" />
              <div className="text-left">
                <div className="text-sm font-medium text-gray-900">Báo cáo tùy chỉnh</div>
                <div className="text-xs text-gray-500">Tạo báo cáo riêng</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

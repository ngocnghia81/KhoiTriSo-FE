import { Metadata } from 'next';
import Link from 'next/link';
import {
  AcademicCapIcon,
  BookOpenIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  HandThumbUpIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  PlusIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Instructor Dashboard - Khởi Trí Số',
  description: 'Bảng điều khiển giảng viên - Quản lý khóa học và thu nhập',
};

// Mock data
const stats = [
  {
    name: 'Tổng khóa học',
    value: '12',
    change: '+2',
    changeType: 'increase' as const,
    icon: AcademicCapIcon,
    color: 'blue',
  },
  {
    name: 'Tổng sách',
    value: '8',
    change: '+1',
    changeType: 'increase' as const,
    icon: BookOpenIcon,
    color: 'green',
  },
  {
    name: 'Học viên',
    value: '1,234',
    change: '+89',
    changeType: 'increase' as const,
    icon: UserGroupIcon,
    color: 'purple',
  },
  {
    name: 'Thu nhập tháng',
    value: '₫2,450,000',
    change: '+12.5%',
    changeType: 'increase' as const,
    icon: CurrencyDollarIcon,
    color: 'yellow',
  },
];

const recentCourses = [
  {
    id: 1,
    title: 'Toán học nâng cao lớp 12',
    status: 'published',
    students: 234,
    revenue: 1200000,
    rating: 4.8,
    lastUpdated: '2024-01-20',
    thumbnail: '/images/courses/math-12.jpg'
  },
  {
    id: 2,
    title: 'Vật lý cơ bản lớp 11',
    status: 'pending',
    students: 0,
    revenue: 0,
    rating: 0,
    lastUpdated: '2024-01-19',
    thumbnail: '/images/courses/physics-11.jpg'
  },
  {
    id: 3,
    title: 'Hóa học thực hành',
    status: 'draft',
    students: 0,
    revenue: 0,
    rating: 0,
    lastUpdated: '2024-01-18',
    thumbnail: '/images/courses/chemistry.jpg'
  },
];

const recentBooks = [
  {
    id: 1,
    title: 'Sách bài tập Toán 12',
    status: 'published',
    activations: 156,
    revenue: 780000,
    codesRemaining: 344,
    lastUpdated: '2024-01-20'
  },
  {
    id: 2,
    title: 'Tuyển tập đề thi Vật lý',
    status: 'pending',
    activations: 0,
    revenue: 0,
    codesRemaining: 500,
    lastUpdated: '2024-01-19'
  },
];

const earnings = {
  thisMonth: 2450000,
  lastMonth: 2180000,
  pending: 340000,
  available: 2110000,
  nextPayout: '2024-02-15'
};

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

export default function InstructorDashboard() {
  return (
    <div className="space-y-4">
      {/* Welcome header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Chào mừng trở lại, Nguyễn Văn A!</h1>
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
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
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
                      <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Recent courses */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Khóa học gần đây</h3>
                <button className="text-sm text-green-600 hover:text-green-800">Xem tất cả</button>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {recentCourses.map((course) => (
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(course.status)}`}>
                          {getStatusText(course.status)}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <UserGroupIcon className="h-4 w-4 mr-1" />
                          {course.students} học viên
                        </div>
                        <div className="flex items-center">
                          <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                          ₫{course.revenue.toLocaleString()}
                        </div>
                        <div className="flex items-center">
                          <StarIcon className="h-4 w-4 mr-1" />
                          {course.rating || 'Chưa có'}
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        Cập nhật: {new Date(course.lastUpdated).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
                  ₫{earnings.thisMonth.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tháng trước</span>
                <span className="text-sm text-gray-500">
                  ₫{earnings.lastMonth.toLocaleString()}
                </span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Chờ thanh toán</span>
                  <span className="text-sm font-medium text-yellow-600">
                    ₫{earnings.pending.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Có thể rút</span>
                  <span className="text-sm font-medium text-green-600">
                    ₫{earnings.available.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-sm text-blue-800">
                    Thanh toán tiếp theo: {new Date(earnings.nextPayout).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
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

      {/* Recent books */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Sách điện tử gần đây</h3>
            <button className="text-sm text-green-600 hover:text-green-800">Xem tất cả</button>
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
              {recentBooks.map((book) => (
                <tr key={book.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                          <BookOpenIcon className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{book.title}</div>
                        <div className="text-sm text-gray-500">
                          Cập nhật: {new Date(book.lastUpdated).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(book.status)}`}>
                      {getStatusText(book.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {book.activations}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₫{book.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {book.codesRemaining}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-green-600 hover:text-green-900">Quản lý</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

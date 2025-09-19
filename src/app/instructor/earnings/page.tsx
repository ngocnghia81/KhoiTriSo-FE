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

export const metadata: Metadata = {
  title: 'Thu nhập - Instructor Dashboard',
  description: 'Theo dõi thu nhập và yêu cầu rút tiền',
};

// Mock data
const earningsData = {
  totalEarnings: 12450000,
  thisMonth: 2450000,
  lastMonth: 2180000,
  available: 8900000,
  pending: 3550000,
  nextPayout: '2024-02-15',
  commissionRate: 30,
  totalWithdrawn: 45600000
};

const monthlyEarnings = [
  { month: 'Jan 2024', earnings: 1890000, courses: 1200000, books: 690000 },
  { month: 'Feb 2024', earnings: 2180000, courses: 1500000, books: 680000 },
  { month: 'Mar 2024', earnings: 2450000, courses: 1800000, books: 650000 },
];

const recentTransactions = [
  {
    id: 1,
    type: 'course_enrollment',
    courseName: 'Toán học nâng cao lớp 12',
    studentName: 'Nguyễn Văn A',
    amount: 299000,
    commission: 89700,
    date: '2024-01-20T10:30:00Z',
    status: 'completed'
  },
  {
    id: 2,
    type: 'book_purchase',
    courseName: 'Sách bài tập Toán 12',
    studentName: 'Trần Thị B',
    amount: 150000,
    commission: 45000,
    date: '2024-01-19T15:45:00Z',
    status: 'completed'
  },
  {
    id: 3,
    type: 'course_enrollment',
    courseName: 'Vật lý thí nghiệm lớp 11',
    studentName: 'Lê Văn C',
    amount: 199000,
    commission: 59700,
    date: '2024-01-18T09:20:00Z',
    status: 'pending'
  },
  {
    id: 4,
    type: 'book_purchase',
    courseName: 'Tuyển tập đề thi THPT',
    studentName: 'Phạm Thị D',
    amount: 120000,
    commission: 36000,
    date: '2024-01-17T14:15:00Z',
    status: 'completed'
  }
];

const topProducts = [
  {
    name: 'Toán học nâng cao lớp 12',
    type: 'course',
    students: 234,
    revenue: 69666000,
    commission: 20899800,
    growth: '+12%'
  },
  {
    name: 'Sách bài tập Toán 12',
    type: 'book',
    students: 156,
    revenue: 23400000,
    commission: 7020000,
    growth: '+8%'
  },
  {
    name: 'Vật lý thí nghiệm lớp 11',
    type: 'course',
    students: 89,
    revenue: 17711000,
    commission: 5313300,
    growth: '+15%'
  }
];

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
  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Thu nhập</h1>
          <p className="mt-2 text-sm text-gray-700">
            Theo dõi thu nhập và quản lý việc rút tiền
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none space-x-3">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all duration-200"
          >
            <ArrowDownTrayIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
            Xuất báo cáo
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 transition-all duration-200"
          >
            <BanknotesIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
            Yêu cầu rút tiền
          </button>
        </div>
      </div>

      {/* Earnings overview */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-6 text-white">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-medium text-green-100">Tổng thu nhập</h3>
            <p className="text-3xl font-bold">{formatCurrency(earningsData.totalEarnings)}</p>
            <p className="text-sm text-green-100 mt-1">Từ khi bắt đầu</p>
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-lg font-medium text-green-100">Tháng này</h3>
            <p className="text-2xl font-bold">{formatCurrency(earningsData.thisMonth)}</p>
            <div className="flex items-center justify-center md:justify-start mt-1">
              <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
              <span className="text-sm">
                +{(((earningsData.thisMonth - earningsData.lastMonth) / earningsData.lastMonth) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-lg font-medium text-green-100">Có thể rút</h3>
            <p className="text-2xl font-bold">{formatCurrency(earningsData.available)}</p>
            <p className="text-sm text-green-100 mt-1">Sẵn sàng thanh toán</p>
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-lg font-medium text-green-100">Chờ thanh toán</h3>
            <p className="text-2xl font-bold">{formatCurrency(earningsData.pending)}</p>
            <p className="text-sm text-green-100 mt-1">
              Ngày {new Date(earningsData.nextPayout).getDate()}/{new Date(earningsData.nextPayout).getMonth() + 1}
            </p>
          </div>
        </div>
      </div>

      {/* Stats cards */}
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
                <dt className="text-sm font-medium text-gray-500">Tỷ lệ chiết khấu</dt>
                <dd className="text-2xl font-bold text-gray-900">{earningsData.commissionRate}%</dd>
                <dd className="text-sm text-green-600">Mỗi giao dịch</dd>
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
                <dt className="text-sm font-medium text-gray-500">Đã rút</dt>
                <dd className="text-2xl font-bold text-gray-900">{formatCurrency(earningsData.totalWithdrawn)}</dd>
                <dd className="text-sm text-blue-600">Tổng cộng</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <UserGroupIcon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <dl>
                <dt className="text-sm font-medium text-gray-500">Học viên</dt>
                <dd className="text-2xl font-bold text-gray-900">479</dd>
                <dd className="text-sm text-purple-600">Tổng cộng</dd>
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
                <dt className="text-sm font-medium text-gray-500">Thanh toán tiếp theo</dt>
                <dd className="text-lg font-bold text-gray-900">
                  {new Date(earningsData.nextPayout).toLocaleDateString('vi-VN')}
                </dd>
                <dd className="text-sm text-yellow-600">Hàng tháng</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Monthly earnings chart */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Thu nhập theo tháng</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {monthlyEarnings.map((month, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{month.month}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span>Khóa học: {formatCurrency(month.courses)}</span>
                        <span>Sách: {formatCurrency(month.books)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        {formatCurrency(month.earnings)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top products */}
        <div>
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Sản phẩm bán chạy</h3>
            </div>
            <div className="p-6 space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      {product.type === 'course' ? (
                        <AcademicCapIcon className="h-4 w-4 text-green-600" />
                      ) : (
                        <BookOpenIcon className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {product.name}
                    </h4>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">
                        {product.students} học viên
                      </span>
                      <span className="text-xs text-green-600 font-medium">
                        {product.growth}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-gray-900 mt-1">
                      {formatCurrency(product.commission)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Giao dịch gần đây</h3>
            <button className="text-sm text-green-600 hover:text-green-800">Xem tất cả</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sản phẩm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Học viên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chiết khấu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentTransactions.map((transaction) => {
                const Icon = getTransactionIcon(transaction.type);
                return (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                            <Icon className="h-4 w-4 text-green-600" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 line-clamp-1">
                            {transaction.courseName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {getTransactionTypeText(transaction.type)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.studentName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatCurrency(transaction.commission)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.status === 'completed' ? (
                          <CheckCircleIcon className="h-3 w-3 mr-1" />
                        ) : (
                          <ClockIcon className="h-3 w-3 mr-1" />
                        )}
                        {transaction.status === 'completed' ? 'Hoàn thành' : 'Chờ xử lý'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-green-600 hover:text-green-900">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Withdrawal info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Thông tin rút tiền</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>Số tiền tối thiểu để rút: ₫500,000</li>
                <li>Phí giao dịch: Miễn phí cho chuyển khoản ngân hàng</li>
                <li>Thời gian xử lý: 1-3 ngày làm việc</li>
                <li>Thanh toán định kỳ: Ngày 15 hàng tháng</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

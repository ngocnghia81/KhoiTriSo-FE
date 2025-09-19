import { Metadata } from 'next';
import {
  CurrencyDollarIcon,
  UserIcon,
  ChartBarIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Quản lý chiết khấu - Admin Dashboard',
  description: 'Quản lý chiết khấu và thanh toán cho giảng viên',
};

// Mock data
const commissionStats = {
  totalPending: 45600000,
  totalPaid: 123400000,
  totalInstructors: 156,
  avgCommissionRate: 32.5,
  thisMonthPending: 12300000,
  nextPayoutDate: '2024-02-15'
};

const pendingPayouts = [
  {
    id: 1,
    instructor: {
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@email.com',
      avatar: '/images/avatars/instructor-1.jpg'
    },
    totalEarnings: 2450000,
    commissionRate: 30,
    coursesRevenue: 1800000,
    booksRevenue: 650000,
    transactionCount: 156,
    pendingSince: '2024-01-01',
    bankInfo: {
      bankName: 'Vietcombank',
      accountNumber: '1234567890',
      accountName: 'NGUYEN VAN A'
    }
  },
  {
    id: 2,
    instructor: {
      name: 'Trần Thị B',
      email: 'tranthib@email.com',
      avatar: '/images/avatars/instructor-2.jpg'
    },
    totalEarnings: 1890000,
    commissionRate: 35,
    coursesRevenue: 1200000,
    booksRevenue: 690000,
    transactionCount: 89,
    pendingSince: '2024-01-01',
    bankInfo: {
      bankName: 'Techcombank',
      accountNumber: '0987654321',
      accountName: 'TRAN THI B'
    }
  }
];

const recentTransactions = [
  {
    id: 1,
    instructor: 'Nguyễn Văn A',
    type: 'course_enrollment',
    originalAmount: 299000,
    commissionRate: 30,
    commissionAmount: 89700,
    status: 'paid',
    paidAt: '2024-01-20T10:30:00Z',
    reference: 'TXN-001234'
  },
  {
    id: 2,
    instructor: 'Trần Thị B',
    type: 'book_purchase',
    originalAmount: 150000,
    commissionRate: 35,
    commissionAmount: 52500,
    status: 'pending',
    paidAt: null,
    reference: 'TXN-001235'
  },
  {
    id: 3,
    instructor: 'Lê Văn C',
    type: 'course_enrollment',
    originalAmount: 199000,
    commissionRate: 30,
    commissionAmount: 59700,
    status: 'paid',
    paidAt: '2024-01-19T15:45:00Z',
    reference: 'TXN-001236'
  }
];

const topInstructors = [
  {
    name: 'Nguyễn Văn A',
    totalEarnings: 12450000,
    coursesCount: 8,
    booksCount: 5,
    studentsCount: 1234,
    commissionRate: 30,
    avatar: '/images/avatars/instructor-1.jpg'
  },
  {
    name: 'Trần Thị B',
    totalEarnings: 9890000,
    coursesCount: 6,
    booksCount: 4,
    studentsCount: 987,
    commissionRate: 35,
    avatar: '/images/avatars/instructor-2.jpg'
  },
  {
    name: 'Lê Văn C',
    totalEarnings: 8750000,
    coursesCount: 5,
    booksCount: 6,
    studentsCount: 856,
    commissionRate: 30,
    avatar: '/images/avatars/instructor-3.jpg'
  }
];

const formatCurrency = (amount: number) => {
  return `₫${amount.toLocaleString()}`;
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'paid':
      return 'Đã thanh toán';
    case 'pending':
      return 'Chờ thanh toán';
    case 'cancelled':
      return 'Đã hủy';
    default:
      return 'Không xác định';
  }
};

const getTransactionTypeText = (type: string) => {
  switch (type) {
    case 'course_enrollment':
      return 'Đăng ký khóa học';
    case 'book_purchase':
      return 'Mua sách';
    default:
      return 'Khác';
  }
};

export default function CommissionsPage() {
  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý chiết khấu</h1>
          <p className="mt-2 text-sm text-gray-700">
            Quản lý chiết khấu và thanh toán cho giảng viên
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none space-x-3">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 transition-all duration-200"
          >
            <BanknotesIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
            Thanh toán hàng loạt
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

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 overflow-hidden shadow-sm rounded-lg p-4 border border-yellow-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                <ClockIcon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <dl>
                <dt className="text-sm font-medium text-yellow-700">Chờ thanh toán</dt>
                <dd className="text-2xl font-bold text-yellow-900">{formatCurrency(commissionStats.totalPending)}</dd>
                <dd className="text-sm text-yellow-600">Tổng cộng</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 overflow-hidden shadow-sm rounded-lg p-4 border border-green-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <dl>
                <dt className="text-sm font-medium text-green-700">Đã thanh toán</dt>
                <dd className="text-2xl font-bold text-green-900">{formatCurrency(commissionStats.totalPaid)}</dd>
                <dd className="text-sm text-green-600">Tổng cộng</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden shadow-sm rounded-lg p-4 border border-blue-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <dl>
                <dt className="text-sm font-medium text-blue-700">Giảng viên</dt>
                <dd className="text-2xl font-bold text-blue-900">{commissionStats.totalInstructors}</dd>
                <dd className="text-sm text-blue-600">Đang hoạt động</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 overflow-hidden shadow-sm rounded-lg p-4 border border-purple-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <dl>
                <dt className="text-sm font-medium text-purple-700">Tỷ lệ TB</dt>
                <dd className="text-2xl font-bold text-purple-900">{commissionStats.avgCommissionRate}%</dd>
                <dd className="text-sm text-purple-600">Chiết khấu</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Next payout info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center">
          <CalendarIcon className="h-5 w-5 text-blue-600 mr-2" />
          <span className="text-sm text-blue-800">
            <strong>Thanh toán tiếp theo:</strong> {new Date(commissionStats.nextPayoutDate).toLocaleDateString('vi-VN')} 
            - Tổng cộng: <strong>{formatCurrency(commissionStats.thisMonthPending)}</strong>
          </span>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Pending payouts */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Thanh toán chờ xử lý</h3>
                <button className="text-sm text-blue-600 hover:text-blue-800">Xem tất cả</button>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {pendingPayouts.map((payout) => (
                <div key={payout.id} className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {payout.instructor.name.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{payout.instructor.name}</h4>
                          <p className="text-sm text-gray-500">{payout.instructor.email}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-green-600">
                            {formatCurrency(payout.totalEarnings)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {payout.commissionRate}% chiết khấu
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="font-medium">Khóa học:</span> {formatCurrency(payout.coursesRevenue)}
                        </div>
                        <div>
                          <span className="font-medium">Sách:</span> {formatCurrency(payout.booksRevenue)}
                        </div>
                        <div>
                          <span className="font-medium">Giao dịch:</span> {payout.transactionCount}
                        </div>
                        <div>
                          <span className="font-medium">Chờ từ:</span> {new Date(payout.pendingSince).toLocaleDateString('vi-VN')}
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg mb-3">
                        <div className="text-xs text-gray-600">
                          <div><strong>Ngân hàng:</strong> {payout.bankInfo.bankName}</div>
                          <div><strong>Số TK:</strong> {payout.bankInfo.accountNumber}</div>
                          <div><strong>Tên TK:</strong> {payout.bankInfo.accountName}</div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Thanh toán
                        </button>
                        <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                          <EyeIcon className="h-4 w-4 mr-1" />
                          Chi tiết
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top instructors */}
        <div className="space-y-4">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Top giảng viên</h3>
            </div>
            <div className="p-6 space-y-4">
              {topInstructors.map((instructor, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-xs font-medium text-white">
                        {instructor.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {instructor.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {instructor.coursesCount} khóa học • {instructor.booksCount} sách
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-green-600">
                      {formatCurrency(instructor.totalEarnings)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {instructor.commissionRate}%
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
          <h3 className="text-lg font-medium text-gray-900">Giao dịch gần đây</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giảng viên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số tiền gốc
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tỷ lệ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chiết khấu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày thanh toán
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {transaction.instructor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getTransactionTypeText(transaction.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(transaction.originalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.commissionRate}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    {formatCurrency(transaction.commissionAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(transaction.status)}`}>
                      {getStatusText(transaction.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(transaction.paidAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900">
                      <EyeIcon className="h-4 w-4" />
                    </button>
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

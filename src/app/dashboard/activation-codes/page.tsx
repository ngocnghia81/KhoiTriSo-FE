import { Metadata } from 'next';
import {
  KeyIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentDuplicateIcon,
  QrCodeIcon,
  UserIcon,
  CalendarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Quản lý mã kích hoạt - Dashboard',
  description: 'Quản lý mã kích hoạt sách điện tử hệ thống Khởi Trí Số',
};

// Mock data for activation codes
const activationCodes = [
  {
    id: 1,
    activationCode: 'MATH12-A001-2024',
    book: {
      id: 1,
      title: 'Toán học lớp 12 - Nâng cao',
      coverImage: '/images/books/math-12.jpg'
    },
    isUsed: true,
    usedBy: {
      id: 123,
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@email.com'
    },
    usedAt: '2024-01-20T10:30:00Z',
    expiresAt: '2026-01-20T10:30:00Z',
    createdAt: '2024-01-15T09:00:00Z',
    ipAddress: '192.168.1.100',
    deviceInfo: 'Chrome on Windows',
    status: 'active'
  },
  {
    id: 2,
    activationCode: 'MATH12-A002-2024',
    book: {
      id: 1,
      title: 'Toán học lớp 12 - Nâng cao',
      coverImage: '/images/books/math-12.jpg'
    },
    isUsed: false,
    usedBy: null,
    usedAt: null,
    expiresAt: null,
    createdAt: '2024-01-15T09:00:00Z',
    ipAddress: null,
    deviceInfo: null,
    status: 'unused'
  },
  {
    id: 3,
    activationCode: 'PHYS11-B001-2024',
    book: {
      id: 2,
      title: 'Vật lý lớp 11 - Cơ bản',
      coverImage: '/images/books/physics-11.jpg'
    },
    isUsed: true,
    usedBy: {
      id: 124,
      name: 'Trần Thị B',
      email: 'tranthib@email.com'
    },
    usedAt: '2024-01-18T14:20:00Z',
    expiresAt: '2026-01-18T14:20:00Z',
    createdAt: '2024-01-10T08:00:00Z',
    ipAddress: '192.168.1.101',
    deviceInfo: 'Safari on iPhone',
    status: 'active'
  },
  {
    id: 4,
    activationCode: 'CHEM10-C001-2024',
    book: {
      id: 3,
      title: 'Hóa học lớp 10 - Tổng hợp',
      coverImage: '/images/books/chemistry-10.jpg'
    },
    isUsed: true,
    usedBy: {
      id: 125,
      name: 'Lê Văn C',
      email: 'levanc@email.com'
    },
    usedAt: '2024-01-19T16:45:00Z',
    expiresAt: '2026-01-19T16:45:00Z',
    createdAt: '2024-01-08T07:30:00Z',
    ipAddress: '192.168.1.102',
    deviceInfo: 'Chrome on Android',
    status: 'expired'
  }
];

const getStatusBadge = (status: string, isUsed: boolean) => {
  if (!isUsed) {
    return 'bg-gray-100 text-gray-800';
  }
  
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'expired':
      return 'bg-red-100 text-red-800';
    case 'suspended':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: string, isUsed: boolean) => {
  if (!isUsed) {
    return 'Chưa sử dụng';
  }
  
  switch (status) {
    case 'active':
      return 'Đang hoạt động';
    case 'expired':
      return 'Đã hết hạn';
    case 'suspended':
      return 'Tạm khóa';
    default:
      return 'Không xác định';
  }
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

export default function ActivationCodesPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý mã kích hoạt</h1>
          <p className="mt-2 text-sm text-gray-700">
            Quản lý mã kích hoạt sách điện tử và theo dõi việc sử dụng
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none space-x-3">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 transition-all duration-200"
          >
            <DocumentDuplicateIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
            Tạo mã hàng loạt
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all duration-200"
          >
            <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
            Tạo mã mới
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden shadow-lg rounded-xl p-6 border border-blue-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <KeyIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <dl>
                <dt className="text-sm font-medium text-blue-700">Tổng mã</dt>
                <dd className="text-2xl font-bold text-blue-900">4,700</dd>
                <dd className="text-sm text-blue-600">Tất cả mã đã tạo</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 overflow-hidden shadow-lg rounded-xl p-6 border border-green-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <CheckCircleIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <dl>
                <dt className="text-sm font-medium text-green-700">Đã kích hoạt</dt>
                <dd className="text-2xl font-bold text-green-900">2,735</dd>
                <dd className="text-sm text-green-600">58% tỷ lệ sử dụng</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 overflow-hidden shadow-lg rounded-xl p-6 border border-yellow-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                <ClockIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <dl>
                <dt className="text-sm font-medium text-yellow-700">Chưa sử dụng</dt>
                <dd className="text-2xl font-bold text-yellow-900">1,965</dd>
                <dd className="text-sm text-yellow-600">42% còn lại</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 overflow-hidden shadow-lg rounded-xl p-6 border border-red-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                <ExclamationTriangleIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <dl>
                <dt className="text-sm font-medium text-red-700">Hết hạn</dt>
                <dd className="text-2xl font-bold text-red-900">156</dd>
                <dd className="text-sm text-red-600">Cần gia hạn</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and search */}
      <div className="bg-white shadow-lg rounded-xl">
        <div className="p-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="sm:flex sm:items-center sm:space-x-4">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
                  placeholder="Tìm kiếm mã kích hoạt..."
                />
              </div>

              {/* Book filter */}
              <select className="mt-2 sm:mt-0 block w-full sm:w-auto pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-xl bg-gray-50">
                <option>Tất cả sách</option>
                <option>Toán học lớp 12</option>
                <option>Vật lý lớp 11</option>
                <option>Hóa học lớp 10</option>
              </select>

              {/* Status filter */}
              <select className="mt-2 sm:mt-0 block w-full sm:w-auto pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-xl bg-gray-50">
                <option>Tất cả trạng thái</option>
                <option>Chưa sử dụng</option>
                <option>Đang hoạt động</option>
                <option>Đã hết hạn</option>
                <option>Tạm khóa</option>
              </select>
            </div>

            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FunnelIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
                Lọc nâng cao
              </button>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <QrCodeIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
                Xuất QR Code
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Activation codes table */}
      <div className="bg-white shadow-lg overflow-hidden rounded-xl">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Danh sách mã kích hoạt</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã kích hoạt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sách
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người sử dụng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày kích hoạt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hết hạn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thông tin truy cập
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activationCodes.map((code) => (
                <tr key={code.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <KeyIcon className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-mono font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">
                          {code.activationCode}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Tạo: {formatDate(code.createdAt)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                          <span className="text-xs font-medium text-white">
                            {code.book.title.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 line-clamp-1">
                          {code.book.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {code.book.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(code.status, code.isUsed)}`}>
                      {getStatusText(code.status, code.isUsed)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {code.usedBy ? (
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                            <UserIcon className="h-4 w-4 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {code.usedBy.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {code.usedBy.email}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {code.usedAt ? (
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 text-gray-400 mr-1" />
                        {formatDate(code.usedAt)}
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {code.expiresAt ? (
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 text-gray-400 mr-1" />
                        {formatDate(code.expiresAt)}
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {code.ipAddress ? (
                      <div className="text-xs">
                        <div className="text-gray-900 font-mono">{code.ipAddress}</div>
                        <div className="text-gray-500 mt-1">{code.deviceInfo}</div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors">
                        <QrCodeIcon className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-50 transition-colors">
                        <EllipsisVerticalIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50">
              Trước
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50">
              Sau
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Hiển thị <span className="font-medium">1</span> đến{' '}
                <span className="font-medium">4</span> trong{' '}
                <span className="font-medium">4,700</span> kết quả
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Trước
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-50 text-sm font-medium text-blue-600">
                  1
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  2
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  3
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Sau
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Metadata } from 'next';
import {
  BookOpenIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  UserGroupIcon,
  ClockIcon,
  CurrencyDollarIcon,
  KeyIcon,
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

export const metadata: Metadata = {
  title: 'Quản lý sách điện tử - Dashboard',
  description: 'Quản lý sách điện tử và mã kích hoạt hệ thống Khởi Trí Số',
};

// Mock data for books
const books = [
  {
    id: 1,
    title: 'Toán học lớp 12 - Nâng cao',
    description: 'Sách toán nâng cao với hơn 500 câu hỏi và lời giải chi tiết',
    coverImage: '/images/books/math-12.jpg',
    author: {
      id: 1,
      name: 'Nguyễn Văn Minh',
    },
    category: 'Toán học',
    isbn: '978-604-0-12345-1',
    price: 199000,
    totalQuestions: 534,
    totalActivations: 1245,
    activationCodes: 2000,
    usedCodes: 1245,
    isActive: true,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
    rating: 4.8,
    reviewCount: 156,
    downloadCount: 2341
  },
  {
    id: 2,
    title: 'Vật lý lớp 11 - Cơ bản',
    description: 'Sách vật lý cơ bản với video giải thích chi tiết',
    coverImage: '/images/books/physics-11.jpg',
    author: {
      id: 2,
      name: 'Trần Thị Hoa',
    },
    category: 'Vật lý',
    isbn: '978-604-0-12345-2',
    price: 159000,
    totalQuestions: 423,
    totalActivations: 856,
    activationCodes: 1500,
    usedCodes: 856,
    isActive: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-18',
    rating: 4.6,
    reviewCount: 89,
    downloadCount: 1567
  },
  {
    id: 3,
    title: 'Hóa học lớp 10 - Tổng hợp',
    description: 'Sách hóa học với phương pháp giải nhanh',
    coverImage: '/images/books/chemistry-10.jpg',
    author: {
      id: 3,
      name: 'Lê Đức Anh',
    },
    category: 'Hóa học',
    isbn: '978-604-0-12345-3',
    price: 179000,
    totalQuestions: 367,
    totalActivations: 634,
    activationCodes: 1200,
    usedCodes: 634,
    isActive: false,
    createdAt: '2024-01-08',
    updatedAt: '2024-01-19',
    rating: 4.5,
    reviewCount: 67,
    downloadCount: 1023
  }
];

const renderStars = (rating: number) => {
  const fullStars = Math.floor(rating);
  
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <StarIconSolid
          key={i}
          className={`h-4 w-4 ${
            i < fullStars ? 'text-yellow-400' : 'text-gray-200'
          }`}
        />
      ))}
      <span className="ml-1 text-sm text-gray-600">{rating}</span>
    </div>
  );
};

export default function BooksPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý sách điện tử</h1>
          <p className="mt-2 text-sm text-gray-700">
            Quản lý sách điện tử, mã kích hoạt và nội dung số
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none space-x-3">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
          >
            <KeyIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
            Tạo mã kích hoạt
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
            Thêm sách mới
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow-lg rounded-xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <BookOpenIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <dl>
                <dt className="text-sm font-medium text-gray-500">Tổng sách</dt>
                <dd className="text-2xl font-bold text-gray-900">89</dd>
                <dd className="text-sm text-green-600">+3 tháng này</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <KeyIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <dl>
                <dt className="text-sm font-medium text-gray-500">Mã đã kích hoạt</dt>
                <dd className="text-2xl font-bold text-gray-900">2,735</dd>
                <dd className="text-sm text-green-600">+156 tuần này</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <DocumentTextIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <dl>
                <dt className="text-sm font-medium text-gray-500">Tổng câu hỏi</dt>
                <dd className="text-2xl font-bold text-gray-900">1,324</dd>
                <dd className="text-sm text-blue-600">Có lời giải</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="ml-4">
              <dl>
                <dt className="text-sm font-medium text-gray-500">Doanh thu</dt>
                <dd className="text-2xl font-bold text-gray-900">₫87M</dd>
                <dd className="text-sm text-green-600">+12% tháng này</dd>
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
                  placeholder="Tìm kiếm sách..."
                />
              </div>

              {/* Category filter */}
              <select className="mt-2 sm:mt-0 block w-full sm:w-auto pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-xl bg-gray-50">
                <option>Tất cả danh mục</option>
                <option>Toán học</option>
                <option>Vật lý</option>
                <option>Hóa học</option>
                <option>Sinh học</option>
              </select>

              {/* Status filter */}
              <select className="mt-2 sm:mt-0 block w-full sm:w-auto pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-xl bg-gray-50">
                <option>Tất cả trạng thái</option>
                <option>Đang bán</option>
                <option>Tạm dừng</option>
                <option>Hết mã</option>
              </select>
            </div>

            <div className="mt-4 sm:mt-0">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FunnelIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
                Lọc nâng cao
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Books grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {books.map((book) => (
          <div key={book.id} className="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-all duration-300">
            {/* Book cover */}
            <div className="aspect-[3/4] bg-gradient-to-br from-blue-500 to-purple-600 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpenIcon className="h-20 w-20 text-white opacity-80" />
              </div>
              
              {/* Status badges */}
              <div className="absolute top-3 left-3 flex flex-col space-y-2">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  book.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {book.isActive ? 'Đang bán' : 'Tạm dừng'}
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {book.totalQuestions} câu hỏi
                </span>
              </div>

              {/* Actions */}
              <div className="absolute top-3 right-3">
                <div className="flex flex-col space-y-1">
                  <button className="p-2 bg-white/90 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-white transition-all">
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button className="p-2 bg-white/90 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-white transition-all">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button className="p-2 bg-white/90 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-white transition-all">
                    <KeyIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Activation progress */}
              <div className="absolute bottom-3 left-3 right-3">
                <div className="bg-white/90 rounded-lg p-2">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Đã kích hoạt</span>
                    <span>{book.usedCodes}/{book.activationCodes}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(book.usedCodes / book.activationCodes) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Book content */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-blue-600 font-medium">{book.category}</span>
                <span className="text-sm text-gray-500">ISBN: {book.isbn}</span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {book.title}
              </h3>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {book.description}
              </p>

              {/* Author */}
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                  <span className="text-sm font-medium text-white">
                    {book.author.name.charAt(0)}
                  </span>
                </div>
                <span className="text-sm text-gray-700">{book.author.name}</span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="flex items-center justify-center mb-1">
                    <KeyIcon className="h-4 w-4 text-blue-600 mr-1" />
                  </div>
                  <div className="text-sm font-medium text-gray-900">{book.totalActivations}</div>
                  <div className="text-xs text-gray-500">Kích hoạt</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="flex items-center justify-center mb-1">
                    <DocumentTextIcon className="h-4 w-4 text-green-600 mr-1" />
                  </div>
                  <div className="text-sm font-medium text-gray-900">{book.downloadCount}</div>
                  <div className="text-xs text-gray-500">Tải xuống</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="flex items-center justify-center mb-1">
                    <StarIcon className="h-4 w-4 text-yellow-600 mr-1" />
                  </div>
                  <div className="text-sm font-medium text-gray-900">{book.rating}</div>
                  <div className="text-xs text-gray-500">Đánh giá</div>
                </div>
              </div>

              {/* Rating and price */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {renderStars(book.rating)}
                  <span className="ml-2 text-sm text-gray-500">({book.reviewCount})</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-gray-900">
                    {book.price.toLocaleString()}₫
                  </span>
                </div>
              </div>

              {/* Content types */}
              <div className="flex items-center justify-center space-x-4 mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center text-xs text-gray-600">
                  <DocumentTextIcon className="h-4 w-4 mr-1 text-blue-500" />
                  Văn bản
                </div>
                <div className="flex items-center text-xs text-gray-600">
                  <PhotoIcon className="h-4 w-4 mr-1 text-green-500" />
                  Hình ảnh
                </div>
                <div className="flex items-center text-xs text-gray-600">
                  <VideoCameraIcon className="h-4 w-4 mr-1 text-red-500" />
                  Video
                </div>
              </div>
            </div>

            {/* Actions footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <button className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                    Xem chi tiết
                  </button>
                  <button className="px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                    Quản lý mã
                  </button>
                </div>
                <div className="flex space-x-1">
                  <button className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-xl shadow-lg">
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
              <span className="font-medium">3</span> trong{' '}
              <span className="font-medium">89</span> kết quả
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
  );
}

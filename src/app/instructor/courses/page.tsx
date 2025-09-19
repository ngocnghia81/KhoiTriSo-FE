import { Metadata } from 'next';
import {
  AcademicCapIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  StarIcon,
  PlayIcon,
  PauseIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Quản lý khóa học - Instructor',
  description: 'Quản lý tất cả khóa học của giảng viên',
};

// Mock data
const courses = [
  {
    id: 1,
    title: 'Toán học nâng cao lớp 12 - Phần Đạo hàm',
    description: 'Khóa học chuyên sâu về đạo hàm với nhiều bài tập thực hành và ứng dụng thực tế',
    category: 'Toán học',
    price: 299000,
    originalPrice: 399000,
    duration: '40 giờ',
    lessons: 25,
    students: 234,
    rating: 4.8,
    reviewCount: 156,
    revenue: 69666000,
    status: 'published',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    thumbnail: '/images/courses/math-advanced.jpg',
    tags: ['toán-12', 'đạo-hàm', 'nâng-cao']
  },
  {
    id: 2,
    title: 'Vật lý thí nghiệm lớp 11',
    description: 'Khóa học thí nghiệm vật lý với video thực hành chi tiết và mô phỏng 3D',
    category: 'Vật lý',
    price: 199000,
    originalPrice: 299000,
    duration: '30 giờ',
    lessons: 20,
    students: 89,
    rating: 4.6,
    reviewCount: 67,
    revenue: 17711000,
    status: 'pending',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-19T16:45:00Z',
    thumbnail: '/images/courses/physics-lab.jpg',
    tags: ['vật-lý-11', 'thí-nghiệm', 'thực-hành']
  },
  {
    id: 3,
    title: 'Hóa học cơ bản lớp 10',
    description: 'Nền tảng hóa học với các phản ứng cơ bản và bài tập thực hành',
    category: 'Hóa học',
    price: 149000,
    originalPrice: 199000,
    duration: '25 giờ',
    lessons: 18,
    students: 0,
    rating: 0,
    reviewCount: 0,
    revenue: 0,
    status: 'draft',
    createdAt: '2024-01-08T07:30:00Z',
    updatedAt: '2024-01-18T11:15:00Z',
    thumbnail: '/images/courses/chemistry-basic.jpg',
    tags: ['hóa-10', 'cơ-bản', 'nền-tảng']
  },
  {
    id: 4,
    title: 'Sinh học phân tử',
    description: 'Khóa học về sinh học phân tử và công nghệ gen hiện đại',
    category: 'Sinh học',
    price: 249000,
    originalPrice: 349000,
    duration: '35 giờ',
    lessons: 22,
    students: 45,
    rating: 4.9,
    reviewCount: 23,
    revenue: 11205000,
    status: 'rejected',
    rejectionReason: 'Nội dung cần bổ sung thêm video thực hành',
    createdAt: '2024-01-05T06:00:00Z',
    updatedAt: '2024-01-17T09:20:00Z',
    thumbnail: '/images/courses/biology-molecular.jpg',
    tags: ['sinh-học', 'phân-tử', 'công-nghệ-gen']
  }
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'published':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'draft':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
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

const formatCurrency = (amount: number) => {
  return `₫${amount.toLocaleString()}`;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN');
};

export default function InstructorCoursesPage() {
  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý khóa học</h1>
          <p className="mt-2 text-sm text-gray-700">
            Tạo, chỉnh sửa và quản lý tất cả khóa học của bạn
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none space-x-3">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all duration-200"
          >
            <DocumentDuplicateIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
            Nhân bản khóa học
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 transition-all duration-200"
          >
            <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
            Tạo khóa học mới
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 overflow-hidden shadow-sm rounded-lg p-4 border border-green-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <dl>
                <dt className="text-sm font-medium text-green-700">Đã xuất bản</dt>
                <dd className="text-2xl font-bold text-green-900">1</dd>
                <dd className="text-sm text-green-600">Khóa học</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 overflow-hidden shadow-sm rounded-lg p-4 border border-yellow-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                <ClockIcon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <dl>
                <dt className="text-sm font-medium text-yellow-700">Chờ phê duyệt</dt>
                <dd className="text-2xl font-bold text-yellow-900">1</dd>
                <dd className="text-sm text-yellow-600">Khóa học</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden shadow-sm rounded-lg p-4 border border-blue-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <UserGroupIcon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <dl>
                <dt className="text-sm font-medium text-blue-700">Tổng học viên</dt>
                <dd className="text-2xl font-bold text-blue-900">368</dd>
                <dd className="text-sm text-blue-600">Đã đăng ký</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 overflow-hidden shadow-sm rounded-lg p-4 border border-purple-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <dl>
                <dt className="text-sm font-medium text-purple-700">Tổng doanh thu</dt>
                <dd className="text-2xl font-bold text-purple-900">₫98M</dd>
                <dd className="text-sm text-purple-600">Từ khóa học</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and search */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
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
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-all"
                  placeholder="Tìm kiếm khóa học..."
                />
              </div>

              {/* Category filter */}
              <select className="mt-2 sm:mt-0 block w-full sm:w-auto pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 rounded-xl bg-gray-50">
                <option>Tất cả danh mục</option>
                <option>Toán học</option>
                <option>Vật lý</option>
                <option>Hóa học</option>
                <option>Sinh học</option>
              </select>

              {/* Status filter */}
              <select className="mt-2 sm:mt-0 block w-full sm:w-auto pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 rounded-xl bg-gray-50">
                <option>Tất cả trạng thái</option>
                <option>Đã xuất bản</option>
                <option>Chờ phê duyệt</option>
                <option>Bản nháp</option>
                <option>Bị từ chối</option>
              </select>
            </div>

            <div className="mt-4 sm:mt-0">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <FunnelIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
                Lọc nâng cao
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Courses grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <div key={course.id} className="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 border border-gray-100">
            {/* Course thumbnail */}
            <div className="aspect-video bg-gradient-to-br from-green-500 to-blue-600 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <AcademicCapIcon className="h-16 w-16 text-white opacity-80" />
              </div>
              
              {/* Status badge */}
              <div className="absolute top-3 left-3">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadge(course.status)}`}>
                  {getStatusText(course.status)}
                </span>
              </div>

              {/* Actions */}
              <div className="absolute top-3 right-3">
                <div className="flex space-x-1">
                  <button className="p-2 bg-white/90 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-white transition-all">
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button className="p-2 bg-white/90 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-white transition-all">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button className="p-2 bg-white/90 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-white transition-all">
                    <EllipsisVerticalIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Course stats overlay */}
              {course.status === 'published' && (
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="bg-white/90 rounded-lg p-2 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{course.students}</div>
                      <div className="text-xs text-gray-600">Học viên</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{course.rating}</div>
                      <div className="text-xs text-gray-600">Đánh giá</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{formatCurrency(course.revenue)}</div>
                      <div className="text-xs text-gray-600">Doanh thu</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Course content */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-green-600 font-medium">{course.category}</span>
                <div className="flex items-center">
                  {course.rating > 0 && (
                    <>
                      <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm text-gray-600">{course.rating}</span>
                    </>
                  )}
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {course.title}
              </h3>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {course.description}
              </p>

              {/* Course details */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Thời lượng:</span> {course.duration}
                </div>
                <div>
                  <span className="font-medium">Bài học:</span> {course.lessons}
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-lg font-bold text-gray-900">{formatCurrency(course.price)}</span>
                  {course.originalPrice > course.price && (
                    <span className="ml-2 text-sm text-gray-500 line-through">
                      {formatCurrency(course.originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {course.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {tag}
                  </span>
                ))}
                {course.tags.length > 3 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                    +{course.tags.length - 3}
                  </span>
                )}
              </div>

              {/* Rejection reason */}
              {course.status === 'rejected' && course.rejectionReason && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>Lý do từ chối:</strong> {course.rejectionReason}
                  </p>
                </div>
              )}

              {/* Dates */}
              <div className="text-xs text-gray-500 mb-4">
                <div>Tạo: {formatDate(course.createdAt)}</div>
                <div>Cập nhật: {formatDate(course.updatedAt)}</div>
              </div>
            </div>

            {/* Actions footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <button className="px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                    Chỉnh sửa
                  </button>
                  <button className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                    Thống kê
                  </button>
                  {course.status === 'published' && (
                    <button className="px-3 py-1.5 text-xs bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors">
                      <PauseIcon className="h-3 w-3 inline mr-1" />
                      Tạm dừng
                    </button>
                  )}
                  {course.status === 'draft' && (
                    <button className="px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                      <PlayIcon className="h-3 w-3 inline mr-1" />
                      Gửi duyệt
                    </button>
                  )}
                </div>
                <button className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-xl shadow-sm border border-gray-200">
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
              <span className="font-medium">4</span> kết quả
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px">
              <button className="relative inline-flex items-center px-2 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                Trước
              </button>
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-green-50 text-sm font-medium text-green-600">
                1
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

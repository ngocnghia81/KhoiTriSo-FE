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
  XCircleIcon,
  StarIcon,
  UserGroupIcon,
  ClockIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

export const metadata: Metadata = {
  title: 'Quản lý khóa học - Dashboard',
  description: 'Quản lý khóa học hệ thống Khởi Trí Số',
};

// Mock data
const courses = [
  {
    id: 1,
    title: 'Toán học lớp 12 - Nâng cao',
    description: 'Khóa học toán nâng cao cho học sinh lớp 12, chuẩn bị thi THPT',
    thumbnail: '/images/courses/math-12.jpg',
    instructor: {
      id: 1,
      name: 'Nguyễn Văn Minh',
      avatar: '/images/avatars/instructor-1.jpg'
    },
    category: 'Toán học',
    level: 'Nâng cao',
    isFree: false,
    price: 299000,
    totalLessons: 24,
    totalStudents: 1245,
    rating: 4.8,
    totalReviews: 156,
    isPublished: true,
    isActive: true,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20'
  },
  {
    id: 2,
    title: 'Vật lý lớp 11 - Cơ bản',
    description: 'Khóa học vật lý cơ bản cho học sinh lớp 11',
    thumbnail: '/images/courses/physics-11.jpg',
    instructor: {
      id: 2,
      name: 'Trần Thị Hoa',
      avatar: '/images/avatars/instructor-2.jpg'
    },
    category: 'Vật lý',
    level: 'Cơ bản',
    isFree: true,
    price: 0,
    totalLessons: 18,
    totalStudents: 856,
    rating: 4.6,
    totalReviews: 89,
    isPublished: true,
    isActive: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-18'
  },
  {
    id: 3,
    title: 'Hóa học lớp 10 - Tổng hợp',
    description: 'Khóa học hóa học tổng hợp cho học sinh lớp 10',
    thumbnail: '/images/courses/chemistry-10.jpg',
    instructor: {
      id: 3,
      name: 'Lê Đức Anh',
      avatar: '/images/avatars/instructor-3.jpg'
    },
    category: 'Hóa học',
    level: 'Trung bình',
    isFree: false,
    price: 199000,
    totalLessons: 20,
    totalStudents: 634,
    rating: 4.5,
    totalReviews: 67,
    isPublished: false,
    isActive: true,
    createdAt: '2024-01-08',
    updatedAt: '2024-01-19'
  }
];

const renderStars = (rating: number) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  
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

const getLevelBadge = (level: string) => {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  
  switch (level) {
    case 'Cơ bản':
      return `${baseClasses} bg-green-100 text-green-800`;
    case 'Trung bình':
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    case 'Nâng cao':
      return `${baseClasses} bg-red-100 text-red-800`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`;
  }
};

export default function CoursesPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý khóa học</h1>
          <p className="mt-2 text-sm text-gray-700">
            Danh sách tất cả khóa học trong hệ thống
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
            Tạo khóa học mới
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AcademicCapIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Tổng khóa học</dt>
                  <dd className="text-lg font-medium text-gray-900">156</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Đã xuất bản</dt>
                  <dd className="text-lg font-medium text-gray-900">134</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Tổng học sinh</dt>
                  <dd className="text-lg font-medium text-gray-900">8,567</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Doanh thu</dt>
                  <dd className="text-lg font-medium text-gray-900">₫145M</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and search */}
      <div className="bg-white shadow rounded-lg">
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
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tìm kiếm khóa học..."
                />
              </div>

              {/* Category filter */}
              <select className="mt-2 sm:mt-0 block w-full sm:w-auto pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md">
                <option>Tất cả danh mục</option>
                <option>Toán học</option>
                <option>Vật lý</option>
                <option>Hóa học</option>
                <option>Sinh học</option>
              </select>

              {/* Level filter */}
              <select className="mt-2 sm:mt-0 block w-full sm:w-auto pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md">
                <option>Tất cả cấp độ</option>
                <option>Cơ bản</option>
                <option>Trung bình</option>
                <option>Nâng cao</option>
              </select>

              {/* Status filter */}
              <select className="mt-2 sm:mt-0 block w-full sm:w-auto pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md">
                <option>Tất cả trạng thái</option>
                <option>Đã xuất bản</option>
                <option>Chưa xuất bản</option>
                <option>Miễn phí</option>
                <option>Trả phí</option>
              </select>
            </div>

            <div className="mt-4 sm:mt-0">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
          <div key={course.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
            {/* Course thumbnail */}
            <div className="aspect-video bg-gray-200 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-80"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <AcademicCapIcon className="h-16 w-16 text-white" />
              </div>
              
              {/* Status badges */}
              <div className="absolute top-2 left-2 flex space-x-2">
                {course.isFree && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Miễn phí
                  </span>
                )}
                {!course.isPublished && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Chưa xuất bản
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="absolute top-2 right-2">
                <div className="flex space-x-1">
                  <button className="p-2 bg-white bg-opacity-90 rounded-full text-gray-600 hover:text-gray-900">
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button className="p-2 bg-white bg-opacity-90 rounded-full text-gray-600 hover:text-gray-900">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button className="p-2 bg-white bg-opacity-90 rounded-full text-gray-600 hover:text-gray-900">
                    <EllipsisVerticalIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Course content */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-blue-600 font-medium">{course.category}</span>
                <span className={getLevelBadge(course.level)}>{course.level}</span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {course.title}
              </h3>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {course.description}
              </p>

              {/* Instructor */}
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                  <span className="text-sm font-medium text-white">
                    {course.instructor.name.charAt(0)}
                  </span>
                </div>
                <span className="text-sm text-gray-700">{course.instructor.name}</span>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {course.totalLessons} bài
                  </div>
                  <div className="flex items-center">
                    <UserGroupIcon className="h-4 w-4 mr-1" />
                    {course.totalStudents.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Rating and price */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {renderStars(course.rating)}
                  <span className="ml-2 text-sm text-gray-500">({course.totalReviews})</span>
                </div>
                <div className="text-right">
                  {course.isFree ? (
                    <span className="text-lg font-bold text-green-600">Miễn phí</span>
                  ) : (
                    <span className="text-lg font-bold text-gray-900">
                      {course.price.toLocaleString()}₫
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions footer */}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    course.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {course.isActive ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                    Chỉnh sửa
                  </button>
                  <button className="text-red-600 hover:text-red-900 text-sm font-medium">
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
        <div className="flex-1 flex justify-between sm:hidden">
          <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Trước
          </button>
          <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Sau
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Hiển thị <span className="font-medium">1</span> đến{' '}
              <span className="font-medium">3</span> trong{' '}
              <span className="font-medium">156</span> kết quả
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                Trước
              </button>
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                1
              </button>
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                2
              </button>
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                3
              </button>
              <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                Sau
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}

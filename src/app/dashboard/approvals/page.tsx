import { Metadata } from 'next';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  UserIcon,
  AcademicCapIcon,
  BookOpenIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  StarIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  TagIcon
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Phê duyệt nội dung - Admin Dashboard',
  description: 'Phê duyệt khóa học, sách điện tử và đăng ký giảng viên',
};

// Mock data for pending approvals
const pendingInstructors = [
  {
    id: 1,
    name: 'Nguyễn Thị Hoa',
    email: 'hoa.nguyen@email.com',
    specialization: 'Toán học',
    experienceYears: 5,
    qualifications: ['Thạc sĩ Toán học', 'Giáo viên THPT 5 năm'],
    appliedAt: '2024-01-20T10:30:00Z',
    portfolio: 'https://portfolio.example.com',
    avatar: '/images/avatars/instructor-1.jpg'
  },
  {
    id: 2,
    name: 'Trần Văn Minh',
    email: 'minh.tran@email.com',
    specialization: 'Vật lý',
    experienceYears: 8,
    qualifications: ['Tiến sĩ Vật lý', 'Giảng viên Đại học 8 năm'],
    appliedAt: '2024-01-19T14:20:00Z',
    portfolio: 'https://portfolio.example.com',
    avatar: '/images/avatars/instructor-2.jpg'
  }
];

const pendingCourses = [
  {
    id: 1,
    title: 'Toán học nâng cao lớp 12 - Phần Đạo hàm',
    instructor: {
      name: 'Nguyễn Văn A',
      avatar: '/images/avatars/instructor-3.jpg'
    },
    category: 'Toán học',
    price: 299000,
    duration: '40 giờ',
    lessons: 25,
    description: 'Khóa học chuyên sâu về đạo hàm với nhiều bài tập thực hành...',
    submittedAt: '2024-01-20T09:15:00Z',
    thumbnail: '/images/courses/math-advanced.jpg',
    tags: ['toán-12', 'đạo-hàm', 'nâng-cao']
  },
  {
    id: 2,
    title: 'Vật lý thí nghiệm lớp 11',
    instructor: {
      name: 'Trần Thị B',
      avatar: '/images/avatars/instructor-4.jpg'
    },
    category: 'Vật lý',
    price: 199000,
    duration: '30 giờ',
    lessons: 20,
    description: 'Khóa học thí nghiệm vật lý với video thực hành chi tiết...',
    submittedAt: '2024-01-19T16:45:00Z',
    thumbnail: '/images/courses/physics-lab.jpg',
    tags: ['vật-lý-11', 'thí-nghiệm', 'thực-hành']
  }
];

const pendingBooks = [
  {
    id: 1,
    title: 'Tuyển tập đề thi THPT Quốc gia - Toán',
    instructor: {
      name: 'Lê Văn C',
      avatar: '/images/avatars/instructor-5.jpg'
    },
    category: 'Toán học',
    price: 150000,
    totalQuestions: 500,
    description: 'Bộ sưu tập 500 câu hỏi thi THPT với lời giải chi tiết...',
    submittedAt: '2024-01-18T11:30:00Z',
    activationCodes: 1000,
    tags: ['thpt-quốc-gia', 'toán', 'đề-thi']
  },
  {
    id: 2,
    title: 'Sách bài tập Hóa học 10',
    instructor: {
      name: 'Phạm Thị D',
      avatar: '/images/avatars/instructor-6.jpg'
    },
    category: 'Hóa học',
    price: 120000,
    totalQuestions: 300,
    description: 'Bài tập hóa học lớp 10 với video giải thích từng bước...',
    submittedAt: '2024-01-17T08:20:00Z',
    activationCodes: 800,
    tags: ['hóa-10', 'bài-tập', 'cơ-bản']
  }
];

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function ApprovalsPage() {
  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Phê duyệt nội dung</h1>
          <p className="mt-2 text-sm text-gray-700">
            Xem xét và phê duyệt đăng ký giảng viên, khóa học và sách điện tử
          </p>
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
                <dt className="text-sm font-medium text-yellow-700">Chờ phê duyệt</dt>
                <dd className="text-2xl font-bold text-yellow-900">8</dd>
                <dd className="text-sm text-yellow-600">Tất cả loại</dd>
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
                <dd className="text-2xl font-bold text-blue-900">2</dd>
                <dd className="text-sm text-blue-600">Đăng ký mới</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 overflow-hidden shadow-sm rounded-lg p-4 border border-green-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <AcademicCapIcon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <dl>
                <dt className="text-sm font-medium text-green-700">Khóa học</dt>
                <dd className="text-2xl font-bold text-green-900">4</dd>
                <dd className="text-sm text-green-600">Chờ duyệt</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 overflow-hidden shadow-sm rounded-lg p-4 border border-purple-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <BookOpenIcon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <dl>
                <dt className="text-sm font-medium text-purple-700">Sách điện tử</dt>
                <dd className="text-2xl font-bold text-purple-900">2</dd>
                <dd className="text-sm text-purple-600">Chờ duyệt</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Instructors */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Đăng ký giảng viên chờ phê duyệt</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {pendingInstructors.map((instructor) => (
            <div key={instructor.id} className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {instructor.name.charAt(0)}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-medium text-gray-900">{instructor.name}</h4>
                    <div className="flex space-x-2">
                      <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Phê duyệt
                      </button>
                      <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700">
                        <XCircleIcon className="h-4 w-4 mr-1" />
                        Từ chối
                      </button>
                      <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Email:</span> {instructor.email}
                    </div>
                    <div>
                      <span className="font-medium">Chuyên môn:</span> {instructor.specialization}
                    </div>
                    <div>
                      <span className="font-medium">Kinh nghiệm:</span> {instructor.experienceYears} năm
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="font-medium text-sm text-gray-600">Bằng cấp:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {instructor.qualifications.map((qual, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {qual}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Đăng ký: {formatDate(instructor.appliedAt)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Courses */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Khóa học chờ phê duyệt</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {pendingCourses.map((course) => (
            <div key={course.id} className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <AcademicCapIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-1">{course.title}</h4>
                      <div className="flex items-center text-sm text-gray-600">
                        <UserIcon className="h-4 w-4 mr-1" />
                        <span>Giảng viên: {course.instructor.name}</span>
                        <span className="mx-2">•</span>
                        <TagIcon className="h-4 w-4 mr-1" />
                        <span>{course.category}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Phê duyệt
                      </button>
                      <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                        Yêu cầu sửa
                      </button>
                      <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700">
                        <XCircleIcon className="h-4 w-4 mr-1" />
                        Từ chối
                      </button>
                      <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-4 w-4 mr-1 text-green-500" />
                      <span>₫{course.price.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1 text-blue-500" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-4 w-4 mr-1 text-purple-500" />
                      <span>{course.lessons} bài học</span>
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1 text-gray-500" />
                      <span>{formatDate(course.submittedAt)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {course.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Books */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Sách điện tử chờ phê duyệt</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {pendingBooks.map((book) => (
            <div key={book.id} className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <BookOpenIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-1">{book.title}</h4>
                      <div className="flex items-center text-sm text-gray-600">
                        <UserIcon className="h-4 w-4 mr-1" />
                        <span>Tác giả: {book.instructor.name}</span>
                        <span className="mx-2">•</span>
                        <TagIcon className="h-4 w-4 mr-1" />
                        <span>{book.category}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Phê duyệt
                      </button>
                      <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                        Yêu cầu sửa
                      </button>
                      <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700">
                        <XCircleIcon className="h-4 w-4 mr-1" />
                        Từ chối
                      </button>
                      <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{book.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-4 w-4 mr-1 text-green-500" />
                      <span>₫{book.price.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-4 w-4 mr-1 text-blue-500" />
                      <span>{book.totalQuestions} câu hỏi</span>
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1 text-purple-500" />
                      <span>{book.activationCodes} mã kích hoạt</span>
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1 text-gray-500" />
                      <span>{formatDate(book.submittedAt)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {book.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { Metadata } from 'next';
import {
  ClipboardDocumentListIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  UserGroupIcon,
  ChartBarIcon,
  PlayIcon,
  PauseIcon,
  DocumentArrowUpIcon,
  PuzzlePieceIcon
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Quản lý bài tập & kiểm tra - Dashboard',
  description: 'Quản lý bài tập và kiểm tra trực tuyến hệ thống Khởi Trí Số',
};

// Mock data for assignments
const assignments = [
  {
    id: 1,
    title: 'Bài tập: Đạo hàm hàm số',
    description: 'Bài tập trắc nghiệm về đạo hàm hàm số - Toán lớp 12',
    course: {
      id: 1,
      title: 'Toán học lớp 12 - Nâng cao',
    },
    lesson: {
      id: 1,
      title: 'Bài 1: Định nghĩa đạo hàm',
    },
    assignmentType: 'quiz', // quiz, homework, exam
    totalQuestions: 15,
    maxScore: 10,
    timeLimit: 30, // minutes
    maxAttempts: 3,
    showAnswersAfter: 'submit', // submit, deadline, never
    dueDate: '2024-02-15T23:59:59Z',
    isPublished: true,
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    stats: {
      totalAttempts: 156,
      totalStudents: 89,
      averageScore: 7.8,
      completionRate: 85
    }
  },
  {
    id: 2,
    title: 'Kiểm tra giữa kỳ: Vật lý 11',
    description: 'Kiểm tra giữa kỳ môn Vật lý lớp 11 - Chương 1-3',
    course: {
      id: 2,
      title: 'Vật lý lớp 11 - Cơ bản',
    },
    lesson: null,
    assignmentType: 'exam',
    totalQuestions: 25,
    maxScore: 10,
    timeLimit: 60,
    maxAttempts: 1,
    showAnswersAfter: 'deadline',
    dueDate: '2024-02-20T15:00:00Z',
    isPublished: false,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-18T16:20:00Z',
    stats: {
      totalAttempts: 0,
      totalStudents: 0,
      averageScore: 0,
      completionRate: 0
    }
  },
  {
    id: 3,
    title: 'Bài tập về nhà: Phản ứng hóa học',
    description: 'Bài tập về nhà về các phản ứng hóa học cơ bản',
    course: {
      id: 3,
      title: 'Hóa học lớp 10 - Tổng hợp',
    },
    lesson: {
      id: 2,
      title: 'Bài 2: Phản ứng oxi hóa khử',
    },
    assignmentType: 'homework',
    totalQuestions: 12,
    maxScore: 10,
    timeLimit: null,
    maxAttempts: 5,
    showAnswersAfter: 'submit',
    dueDate: '2024-02-10T23:59:59Z',
    isPublished: true,
    createdAt: '2024-01-08T07:30:00Z',
    updatedAt: '2024-01-19T11:15:00Z',
    stats: {
      totalAttempts: 67,
      totalStudents: 34,
      averageScore: 6.5,
      completionRate: 68
    }
  }
];

const getAssignmentTypeBadge = (type: string) => {
  switch (type) {
    case 'quiz':
      return 'bg-blue-100 text-blue-800';
    case 'homework':
      return 'bg-green-100 text-green-800';
    case 'exam':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getAssignmentTypeText = (type: string) => {
  switch (type) {
    case 'quiz':
      return 'Trắc nghiệm';
    case 'homework':
      return 'Bài tập';
    case 'exam':
      return 'Kiểm tra';
    default:
      return 'Khác';
  }
};

const getAssignmentTypeIcon = (type: string) => {
  switch (type) {
    case 'quiz':
      return <PuzzlePieceIcon className="h-5 w-5" />;
    case 'homework':
      return <DocumentTextIcon className="h-5 w-5" />;
    case 'exam':
      return <ClipboardDocumentListIcon className="h-5 w-5" />;
    default:
      return <DocumentTextIcon className="h-5 w-5" />;
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

export default function AssignmentsPage() {
  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý bài tập & kiểm tra</h1>
          <p className="mt-2 text-sm text-gray-700">
            Tạo và quản lý bài tập, kiểm tra trực tuyến cho học sinh
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none space-x-3">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 transition-all duration-200"
          >
            <DocumentArrowUpIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
            Import từ Word
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all duration-200"
          >
            <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
            Tạo bài mới
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden shadow-sm rounded-lg p-4 border border-blue-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <ClipboardDocumentListIcon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <dl>
                <dt className="text-sm font-medium text-blue-700">Tổng bài tập</dt>
                <dd className="text-2xl font-bold text-blue-900">234</dd>
                <dd className="text-sm text-blue-600">+12 tháng này</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 overflow-hidden shadow-sm rounded-lg p-4 border border-green-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <UserGroupIcon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <dl>
                <dt className="text-sm font-medium text-green-700">Học sinh tham gia</dt>
                <dd className="text-2xl font-bold text-green-900">1,456</dd>
                <dd className="text-sm text-green-600">Tổng lượt làm bài</dd>
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
                <dt className="text-sm font-medium text-purple-700">Điểm trung bình</dt>
                <dd className="text-2xl font-bold text-purple-900">7.8</dd>
                <dd className="text-sm text-purple-600">Trên thang điểm 10</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 overflow-hidden shadow-sm rounded-lg p-4 border border-yellow-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <dl>
                <dt className="text-sm font-medium text-yellow-700">Tỷ lệ hoàn thành</dt>
                <dd className="text-2xl font-bold text-yellow-900">78%</dd>
                <dd className="text-sm text-yellow-600">Trung bình các bài</dd>
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
                  placeholder="Tìm kiếm bài tập..."
                />
              </div>

              {/* Course filter */}
              <select className="mt-2 sm:mt-0 block w-full sm:w-auto pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-xl bg-gray-50">
                <option>Tất cả khóa học</option>
                <option>Toán học lớp 12</option>
                <option>Vật lý lớp 11</option>
                <option>Hóa học lớp 10</option>
              </select>

              {/* Type filter */}
              <select className="mt-2 sm:mt-0 block w-full sm:w-auto pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-xl bg-gray-50">
                <option>Tất cả loại</option>
                <option>Trắc nghiệm</option>
                <option>Bài tập</option>
                <option>Kiểm tra</option>
              </select>

              {/* Status filter */}
              <select className="mt-2 sm:mt-0 block w-full sm:w-auto pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-xl bg-gray-50">
                <option>Tất cả trạng thái</option>
                <option>Đã xuất bản</option>
                <option>Nháp</option>
                <option>Đã hết hạn</option>
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

      {/* Assignments list */}
      <div className="space-y-4">
        {assignments.map((assignment) => (
          <div key={assignment.id} className="bg-white shadow-lg rounded-xl hover:shadow-xl transition-all duration-300">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Assignment header */}
                  <div className="flex items-center mb-3">
                    <div className={`p-2 rounded-lg ${getAssignmentTypeBadge(assignment.assignmentType)} mr-3`}>
                      {getAssignmentTypeIcon(assignment.assignmentType)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {assignment.title}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAssignmentTypeBadge(assignment.assignmentType)}`}>
                          {getAssignmentTypeText(assignment.assignmentType)}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          assignment.isPublished
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {assignment.isPublished ? 'Đã xuất bản' : 'Nháp'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {assignment.description}
                      </p>
                    </div>
                  </div>

                  {/* Course and lesson info */}
                  <div className="flex items-center space-x-6 mb-4">
                    <div className="flex items-center">
                      <AcademicCapIcon className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-600">{assignment.course.title}</span>
                    </div>
                    {assignment.lesson && (
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-600">{assignment.lesson.title}</span>
                      </div>
                    )}
                  </div>

                  {/* Assignment details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-gray-900">{assignment.totalQuestions}</div>
                      <div className="text-xs text-gray-500">Câu hỏi</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-gray-900">{assignment.maxScore}</div>
                      <div className="text-xs text-gray-500">Điểm tối đa</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-gray-900">
                        {assignment.timeLimit ? `${assignment.timeLimit}m` : '∞'}
                      </div>
                      <div className="text-xs text-gray-500">Thời gian</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-gray-900">{assignment.maxAttempts}</div>
                      <div className="text-xs text-gray-500">Lần làm</div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center">
                      <UserGroupIcon className="h-5 w-5 text-blue-500 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{assignment.stats.totalStudents}</div>
                        <div className="text-xs text-gray-500">Học sinh</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <ClipboardDocumentListIcon className="h-5 w-5 text-green-500 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{assignment.stats.totalAttempts}</div>
                        <div className="text-xs text-gray-500">Lượt làm</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <ChartBarIcon className="h-5 w-5 text-purple-500 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{assignment.stats.averageScore}</div>
                        <div className="text-xs text-gray-500">Điểm TB</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{assignment.stats.completionRate}%</div>
                        <div className="text-xs text-gray-500">Hoàn thành</div>
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        Hạn nộp: {formatDate(assignment.dueDate)}
                      </div>
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-4 w-4 mr-1" />
                        Tạo: {formatDate(assignment.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2 ml-6">
                  <button className="inline-flex items-center px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                    <EyeIcon className="h-4 w-4 mr-1" />
                    Xem chi tiết
                  </button>
                  <button className="inline-flex items-center px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                    <ChartBarIcon className="h-4 w-4 mr-1" />
                    Thống kê
                  </button>
                  <button className="inline-flex items-center px-3 py-1.5 text-xs bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors">
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Chỉnh sửa
                  </button>
                  <div className="flex space-x-1">
                    <button className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors">
                      {assignment.isPublished ? (
                        <PauseIcon className="h-4 w-4" />
                      ) : (
                        <PlayIcon className="h-4 w-4" />
                      )}
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
                      <EllipsisVerticalIcon className="h-4 w-4" />
                    </button>
                  </div>
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
              <span className="font-medium">234</span> kết quả
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

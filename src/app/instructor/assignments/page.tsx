'use client';

import { useState } from 'react';
import { 
  PlusIcon, 
  DocumentTextIcon,
  ClockIcon,
  AcademicCapIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  CalendarIcon,
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface AssignmentAttempt {
  id: number;
  assignmentId: number;
  userId: number;
  attemptNumber: number;
  startedAt: string;
  submittedAt: string | null;
  score: number | null;
  isCompleted: boolean;
  timeSpent: number | null;
}

interface Assignment {
  id: number;
  lessonId: number;
  title: string;
  description: string;
  assignmentType: number; // 1: Quiz, 2: Homework, 3: Exam, 4: Practice
  maxScore: number;
  timeLimit: number | null; // in minutes
  maxAttempts: number;
  showAnswersAfter: number; // 1: Immediately, 2: After submission, 3: After due date, 4: Never
  dueDate: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  
  // Related data from joins
  lesson?: {
    id: number;
    title: string;
    courseId: number;
  };
  course?: {
    id: number;
    title: string;
    instructorId: number;
  };
  totalQuestions: number;
  studentsAssigned: number;
  studentsCompleted: number;
  averageScore: number | null;
  attempts: AssignmentAttempt[];
}

const mockAssignments: Assignment[] = [
  {
    id: 1,
    lessonId: 1,
    title: 'Kiểm tra giữa kỳ - Toán học',
    description: 'Bài kiểm tra đánh giá kiến thức chương 1 về hàm số, bao gồm các dạng bài tập cơ bản và nâng cao.',
    assignmentType: 3, // Exam
    maxScore: 10,
    timeLimit: 90,
    maxAttempts: 1,
    showAnswersAfter: 3, // After due date
    dueDate: '2024-02-15T23:59:59',
    isPublished: true,
    createdAt: '2024-01-20T10:00:00',
    updatedAt: '2024-01-22T14:30:00',
    createdBy: 'instructor1',
    updatedBy: 'instructor1',
    lesson: {
      id: 1,
      title: 'Chương 1: Hàm số',
      courseId: 1
    },
    course: {
      id: 1,
      title: 'Toán học lớp 12',
      instructorId: 1
    },
    totalQuestions: 25,
    studentsAssigned: 45,
    studentsCompleted: 23,
    averageScore: 7.8,
    attempts: []
  },
  {
    id: 2,
    lessonId: 2,
    title: 'Bài tập về nhà - Đạo hàm',
    description: 'Bài tập thực hành về đạo hàm của hàm số, bao gồm các quy tắc tính đạo hàm cơ bản.',
    assignmentType: 2, // Homework
    maxScore: 10,
    timeLimit: 60,
    maxAttempts: 3,
    showAnswersAfter: 2, // After submission
    dueDate: '2024-02-10T23:59:59',
    isPublished: true,
    createdAt: '2024-01-25T09:00:00',
    updatedAt: null,
    createdBy: 'instructor1',
    updatedBy: null,
    lesson: {
      id: 2,
      title: 'Chương 2: Đạo hàm',
      courseId: 1
    },
    course: {
      id: 1,
      title: 'Toán học lớp 12',
      instructorId: 1
    },
    totalQuestions: 15,
    studentsAssigned: 45,
    studentsCompleted: 38,
    averageScore: 8.2,
    attempts: []
  },
  {
    id: 3,
    lessonId: 3,
    title: 'Quiz - Tích phân cơ bản',
    description: 'Quiz nhanh kiểm tra hiểu biết về các công thức tích phân cơ bản.',
    assignmentType: 1, // Quiz
    maxScore: 5,
    timeLimit: 30,
    maxAttempts: 2,
    showAnswersAfter: 1, // Immediately
    dueDate: '2024-02-20T23:59:59',
    isPublished: false,
    createdAt: '2024-02-01T15:00:00',
    updatedAt: '2024-02-02T10:15:00',
    createdBy: 'instructor1',
    updatedBy: 'instructor1',
    lesson: {
      id: 3,
      title: 'Chương 3: Tích phân',
      courseId: 1
    },
    course: {
      id: 1,
      title: 'Toán học lớp 12',
      instructorId: 1
    },
    totalQuestions: 10,
    studentsAssigned: 45,
    studentsCompleted: 0,
    averageScore: null,
    attempts: []
  },
  {
    id: 4,
    lessonId: 4,
    title: 'Thực hành - Ứng dụng tích phân',
    description: 'Bài thực hành tính toán diện tích và thể tích sử dụng tích phân.',
    assignmentType: 4, // Practice
    maxScore: 8,
    timeLimit: null, // No time limit
    maxAttempts: 5,
    showAnswersAfter: 1, // Immediately
    dueDate: null, // No due date
    isPublished: true,
    createdAt: '2024-02-05T11:30:00',
    updatedAt: null,
    createdBy: 'instructor1',
    updatedBy: null,
    lesson: {
      id: 4,
      title: 'Chương 4: Ứng dụng tích phân',
      courseId: 1
    },
    course: {
      id: 1,
      title: 'Toán học lớp 12',
      instructorId: 1
    },
    totalQuestions: 12,
    studentsAssigned: 45,
    studentsCompleted: 15,
    averageScore: 6.5,
    attempts: []
  }
];

const getTypeLabel = (assignmentType: number) => {
  switch (assignmentType) {
    case 1: return 'Quiz';
    case 2: return 'Bài tập';
    case 3: return 'Kiểm tra';
    case 4: return 'Thực hành';
    default: return 'Khác';
  }
};

const getTypeColor = (assignmentType: number) => {
  switch (assignmentType) {
    case 1: return 'bg-blue-100 text-blue-800'; // Quiz
    case 2: return 'bg-green-100 text-green-800'; // Homework
    case 3: return 'bg-red-100 text-red-800'; // Exam
    case 4: return 'bg-purple-100 text-purple-800'; // Practice
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getShowAnswersLabel = (showAnswersAfter: number) => {
  switch (showAnswersAfter) {
    case 1: return 'Ngay lập tức';
    case 2: return 'Sau khi nộp bài';
    case 3: return 'Sau thời hạn';
    case 4: return 'Không hiển thị';
    default: return 'Không xác định';
  }
};

const formatDateTime = (dateString: string | null) => {
  if (!dateString) return 'Không giới hạn';
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function InstructorAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>(mockAssignments);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [selectedType, setSelectedType] = useState<'all' | number>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const filteredAssignments = assignments.filter(assignment => {
    const matchesFilter = selectedFilter === 'all' || 
      (selectedFilter === 'published' && assignment.isPublished) ||
      (selectedFilter === 'draft' && !assignment.isPublished);
    
    const matchesType = selectedType === 'all' || assignment.assignmentType === selectedType;
    
    const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.course?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.lesson?.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesType && matchesSearch;
  });

  const togglePublishStatus = (id: number) => {
    setAssignments(prev => prev.map(assignment => 
      assignment.id === id 
        ? { ...assignment, isPublished: !assignment.isPublished, updatedAt: new Date().toISOString(), updatedBy: 'instructor1' }
        : assignment
    ));
  };

  const deleteAssignment = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài tập này?')) {
      setAssignments(prev => prev.filter(assignment => assignment.id !== id));
    }
  };

  const openDetailModal = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setSelectedAssignment(null);
    setShowDetailModal(false);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Bài tập</h1>
          <p className="text-gray-600 mt-1">Tạo và quản lý bài tập cho học sinh</p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link 
            href="/instructor/assignments/create"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Tạo bài tập mới
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Tìm kiếm bài tập..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value as 'all' | 'published' | 'draft')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="published">Đã xuất bản</option>
              <option value="draft">Bản nháp</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả loại</option>
              <option value="1">Quiz</option>
              <option value="2">Bài tập</option>
              <option value="3">Kiểm tra</option>
              <option value="4">Thực hành</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tổng bài tập</p>
              <p className="text-2xl font-bold text-gray-900">{assignments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Đã xuất bản</p>
              <p className="text-2xl font-bold text-gray-900">
                {assignments.filter(a => a.isPublished).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <PencilSquareIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Bản nháp</p>
              <p className="text-2xl font-bold text-gray-900">
                {assignments.filter(a => !a.isPublished).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Học sinh làm bài</p>
              <p className="text-2xl font-bold text-gray-900">
                {assignments.reduce((sum, a) => sum + a.studentsCompleted, 0)}
              </p>
              <p className="text-xs text-gray-400">
                Tỷ lệ hoàn thành: {Math.round((assignments.reduce((sum, a) => sum + a.studentsCompleted, 0) / assignments.reduce((sum, a) => sum + a.studentsAssigned, 0)) * 100) || 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Types Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Thống kê theo loại bài tập</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(type => {
            const count = assignments.filter(a => a.assignmentType === type).length;
            const completed = assignments.filter(a => a.assignmentType === type).reduce((sum, a) => sum + a.studentsCompleted, 0);
            return (
              <div key={type} className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${getTypeColor(type)} mb-2`}>
                  <span className="text-lg font-bold">{count}</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{getTypeLabel(type)}</p>
                <p className="text-xs text-gray-500">{completed} lượt hoàn thành</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Assignments List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Danh sách bài tập ({filteredAssignments.length})
          </h2>
        </div>

        {filteredAssignments.length === 0 ? (
          <div className="p-12 text-center">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có bài tập</h3>
            <p className="mt-1 text-sm text-gray-500">
              Bắt đầu bằng cách tạo bài tập đầu tiên của bạn.
            </p>
            <div className="mt-6">
              <Link
                href="/instructor/assignments/create"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Tạo bài tập mới
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bài tập
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời hạn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tiến độ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Điểm TB
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAssignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {assignment.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {assignment.course?.title} • {assignment.lesson?.title}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 flex items-center space-x-4">
                          <span className="flex items-center">
                            <DocumentTextIcon className="h-3 w-3 mr-1" />
                            {assignment.totalQuestions} câu
                          </span>
                          <span className="flex items-center">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            {assignment.timeLimit ? `${assignment.timeLimit} phút` : 'Không giới hạn'}
                          </span>
                          <span className="flex items-center">
                            <AcademicCapIcon className="h-3 w-3 mr-1" />
                            {assignment.maxScore} điểm
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(assignment.assignmentType)}`}>
                        {getTypeLabel(assignment.assignmentType)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDateTime(assignment.dueDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-900">
                            {assignment.studentsCompleted}/{assignment.studentsAssigned}
                          </span>
                          <span className="text-gray-500">
                            {Math.round((assignment.studentsCompleted / assignment.studentsAssigned) * 100)}%
                          </span>
                        </div>
                        <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ 
                              width: `${(assignment.studentsCompleted / assignment.studentsAssigned) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <AcademicCapIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {assignment.averageScore !== null ? `${assignment.averageScore.toFixed(1)}/${assignment.maxScore}` : 'Chưa có'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        assignment.isPublished 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {assignment.isPublished ? 'Đã xuất bản' : 'Bản nháp'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openDetailModal(assignment)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Xem chi tiết"
                        >
                          <InformationCircleIcon className="h-4 w-4" />
                        </button>
                        <Link
                          href={`/instructor/assignments/${assignment.id}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="Xem bài tập"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/instructor/assignments/${assignment.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => togglePublishStatus(assignment.id)}
                          className={`${
                            assignment.isPublished 
                              ? 'text-yellow-600 hover:text-yellow-900' 
                              : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {assignment.isPublished ? (
                            <XCircleIcon className="h-4 w-4" />
                          ) : (
                            <CheckCircleIcon className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => deleteAssignment(assignment.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assignment Detail Modal */}
      {showDetailModal && selectedAssignment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeDetailModal}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${getTypeColor(selectedAssignment.assignmentType)} flex items-center justify-center`}>
                      <DocumentTextIcon className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {selectedAssignment.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {selectedAssignment.course?.title} • {selectedAssignment.lesson?.title}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeDetailModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Mô tả</h4>
                    <p className="text-sm text-gray-600">{selectedAssignment.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Thông tin cơ bản</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Loại:</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(selectedAssignment.assignmentType)}`}>
                            {getTypeLabel(selectedAssignment.assignmentType)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Điểm tối đa:</span>
                          <span>{selectedAssignment.maxScore}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Số câu hỏi:</span>
                          <span>{selectedAssignment.totalQuestions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Thời gian:</span>
                          <span>{selectedAssignment.timeLimit ? `${selectedAssignment.timeLimit} phút` : 'Không giới hạn'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Số lần làm:</span>
                          <span>{selectedAssignment.maxAttempts}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Thống kê</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Học sinh được giao:</span>
                          <span>{selectedAssignment.studentsAssigned}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Đã hoàn thành:</span>
                          <span>{selectedAssignment.studentsCompleted}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tỷ lệ hoàn thành:</span>
                          <span>{Math.round((selectedAssignment.studentsCompleted / selectedAssignment.studentsAssigned) * 100)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Điểm trung bình:</span>
                          <span>{selectedAssignment.averageScore !== null ? `${selectedAssignment.averageScore.toFixed(1)}/${selectedAssignment.maxScore}` : 'Chưa có'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Cài đặt</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Hiển thị đáp án:</span>
                        <span>{getShowAnswersLabel(selectedAssignment.showAnswersAfter)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Thời hạn nộp:</span>
                        <span>{formatDateTime(selectedAssignment.dueDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Trạng thái:</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          selectedAssignment.isPublished 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedAssignment.isPublished ? 'Đã xuất bản' : 'Bản nháp'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ngày tạo:</span>
                        <span>{formatDateTime(selectedAssignment.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Link
                  href={`/instructor/assignments/${selectedAssignment.id}/edit`}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Chỉnh sửa
                </Link>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeDetailModal}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
  XCircleIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Assignment {
  id: string;
  title: string;
  courseTitle: string;
  lessonTitle: string;
  type: 'quiz' | 'homework' | 'exam';
  dueDate: string;
  timeLimit: number; // in minutes
  maxAttempts: number;
  totalQuestions: number;
  studentsAssigned: number;
  studentsCompleted: number;
  isPublished: boolean;
  createdAt: string;
}

const mockAssignments: Assignment[] = [
  {
    id: '1',
    title: 'Kiểm tra giữa kỳ - Toán học',
    courseTitle: 'Toán học lớp 12',
    lessonTitle: 'Chương 1: Hàm số',
    type: 'exam',
    dueDate: '2024-02-15',
    timeLimit: 90,
    maxAttempts: 1,
    totalQuestions: 25,
    studentsAssigned: 45,
    studentsCompleted: 23,
    isPublished: true,
    createdAt: '2024-01-20'
  },
  {
    id: '2',
    title: 'Bài tập về nhà - Đạo hàm',
    courseTitle: 'Toán học lớp 12',
    lessonTitle: 'Chương 2: Đạo hàm',
    type: 'homework',
    dueDate: '2024-02-10',
    timeLimit: 60,
    maxAttempts: 3,
    totalQuestions: 15,
    studentsAssigned: 45,
    studentsCompleted: 38,
    isPublished: true,
    createdAt: '2024-01-25'
  },
  {
    id: '3',
    title: 'Quiz - Tích phân cơ bản',
    courseTitle: 'Toán học lớp 12',
    lessonTitle: 'Chương 3: Tích phân',
    type: 'quiz',
    dueDate: '2024-02-20',
    timeLimit: 30,
    maxAttempts: 2,
    totalQuestions: 10,
    studentsAssigned: 45,
    studentsCompleted: 0,
    isPublished: false,
    createdAt: '2024-02-01'
  }
];

const getTypeLabel = (type: Assignment['type']) => {
  switch (type) {
    case 'quiz': return 'Quiz';
    case 'homework': return 'Bài tập';
    case 'exam': return 'Kiểm tra';
    default: return 'Khác';
  }
};

const getTypeColor = (type: Assignment['type']) => {
  switch (type) {
    case 'quiz': return 'bg-blue-100 text-blue-800';
    case 'homework': return 'bg-green-100 text-green-800';
    case 'exam': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function InstructorAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>(mockAssignments);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [selectedType, setSelectedType] = useState<'all' | Assignment['type']>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAssignments = assignments.filter(assignment => {
    const matchesFilter = selectedFilter === 'all' || 
      (selectedFilter === 'published' && assignment.isPublished) ||
      (selectedFilter === 'draft' && !assignment.isPublished);
    
    const matchesType = selectedType === 'all' || assignment.type === selectedType;
    
    const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.courseTitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesType && matchesSearch;
  });

  const togglePublishStatus = (id: string) => {
    setAssignments(prev => prev.map(assignment => 
      assignment.id === id 
        ? { ...assignment, isPublished: !assignment.isPublished }
        : assignment
    ));
  };

  const deleteAssignment = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài tập này?')) {
      setAssignments(prev => prev.filter(assignment => assignment.id !== id));
    }
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
              onChange={(e) => setSelectedType(e.target.value as 'all' | Assignment['type'])}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả loại</option>
              <option value="quiz">Quiz</option>
              <option value="homework">Bài tập</option>
              <option value="exam">Kiểm tra</option>
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
            </div>
          </div>
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
                          {assignment.courseTitle} • {assignment.lessonTitle}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 flex items-center space-x-4">
                          <span className="flex items-center">
                            <DocumentTextIcon className="h-3 w-3 mr-1" />
                            {assignment.totalQuestions} câu
                          </span>
                          <span className="flex items-center">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            {assignment.timeLimit} phút
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(assignment.type)}`}>
                        {getTypeLabel(assignment.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {new Date(assignment.dueDate).toLocaleDateString('vi-VN')}
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
                        <Link
                          href={`/instructor/assignments/${assignment.id}`}
                          className="text-blue-600 hover:text-blue-900"
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
    </div>
  );
}

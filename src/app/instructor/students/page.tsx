'use client';

import { useState } from 'react';
import { 
  UsersIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  EnvelopeIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string;
  enrolledCourses: number;
  completedCourses: number;
  totalLessons: number;
  completedLessons: number;
  totalAssignments: number;
  completedAssignments: number;
  averageScore: number;
  lastActivity: string;
  status: 'active' | 'inactive' | 'at_risk';
  enrollmentDate: string;
}

interface CourseProgress {
  courseTitle: string;
  progress: number;
  lastAccessed: string;
  timeSpent: number; // in minutes
  status: 'on_track' | 'behind' | 'completed';
}

const mockStudents: Student[] = [
  {
    id: '1',
    name: 'Nguyễn Văn An',
    email: 'an.nguyen@example.com',
    avatar: '/images/avatars/student1.jpg',
    enrolledCourses: 3,
    completedCourses: 1,
    totalLessons: 45,
    completedLessons: 32,
    totalAssignments: 12,
    completedAssignments: 9,
    averageScore: 85.5,
    lastActivity: '2024-02-12T10:30:00',
    status: 'active',
    enrollmentDate: '2024-01-15'
  },
  {
    id: '2',
    name: 'Trần Thị Bình',
    email: 'binh.tran@example.com',
    avatar: '/images/avatars/student2.jpg',
    enrolledCourses: 2,
    completedCourses: 2,
    totalLessons: 30,
    completedLessons: 30,
    totalAssignments: 8,
    completedAssignments: 8,
    averageScore: 92.3,
    lastActivity: '2024-02-12T15:45:00',
    status: 'active',
    enrollmentDate: '2024-01-10'
  },
  {
    id: '3',
    name: 'Lê Minh Cường',
    email: 'cuong.le@example.com',
    avatar: '/images/avatars/student3.jpg',
    enrolledCourses: 4,
    completedCourses: 0,
    totalLessons: 60,
    completedLessons: 15,
    totalAssignments: 16,
    completedAssignments: 4,
    averageScore: 62.1,
    lastActivity: '2024-02-08T09:20:00',
    status: 'at_risk',
    enrollmentDate: '2024-01-20'
  },
  {
    id: '4',
    name: 'Phạm Thị Dung',
    email: 'dung.pham@example.com',
    avatar: '/images/avatars/student4.jpg',
    enrolledCourses: 2,
    completedCourses: 0,
    totalLessons: 30,
    completedLessons: 28,
    totalAssignments: 8,
    completedAssignments: 7,
    averageScore: 78.9,
    lastActivity: '2024-02-11T14:15:00',
    status: 'active',
    enrollmentDate: '2024-01-25'
  },
  {
    id: '5',
    name: 'Hoàng Văn Em',
    email: 'em.hoang@example.com',
    avatar: '/images/avatars/student5.jpg',
    enrolledCourses: 1,
    completedCourses: 0,
    totalLessons: 15,
    completedLessons: 3,
    totalAssignments: 4,
    completedAssignments: 0,
    averageScore: 0,
    lastActivity: '2024-02-05T16:00:00',
    status: 'inactive',
    enrollmentDate: '2024-02-01'
  }
];

const getStatusLabel = (status: Student['status']) => {
  switch (status) {
    case 'active': return 'Hoạt động';
    case 'inactive': return 'Không hoạt động';
    case 'at_risk': return 'Cần quan tâm';
    default: return 'Không xác định';
  }
};

const getStatusColor = (status: Student['status']) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'inactive': return 'bg-gray-100 text-gray-800';
    case 'at_risk': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: Student['status']) => {
  switch (status) {
    case 'active': return CheckCircleIcon;
    case 'inactive': return ClockIcon;
    case 'at_risk': return ExclamationTriangleIcon;
    default: return ClockIcon;
  }
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [selectedFilter, setSelectedFilter] = useState<'all' | Student['status']>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'score' | 'activity'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredStudents = students.filter(student => {
    const matchesFilter = selectedFilter === 'all' || student.status === selectedFilter;
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let aValue: string | number, bValue: string | number;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'progress':
        aValue = (a.completedLessons / a.totalLessons) * 100;
        bValue = (b.completedLessons / b.totalLessons) * 100;
        break;
      case 'score':
        aValue = a.averageScore;
        bValue = b.averageScore;
        break;
      case 'activity':
        aValue = new Date(a.lastActivity).getTime();
        bValue = new Date(b.lastActivity).getTime();
        break;
      default:
        return 0;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const sendMessage = (studentId: string) => {
    alert(`Gửi tin nhắn cho học sinh ${studentId}`);
  };

  const sendEmail = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      window.location.href = `mailto:${student.email}`;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Học sinh của tôi</h1>
          <p className="text-gray-600 mt-1">Theo dõi tiến độ và hoạt động của học sinh</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tổng học sinh</p>
              <p className="text-2xl font-bold text-gray-900">{students.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Đang hoạt động</p>
              <p className="text-2xl font-bold text-gray-900">
                {students.filter(s => s.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Cần quan tâm</p>
              <p className="text-2xl font-bold text-gray-900">
                {students.filter(s => s.status === 'at_risk').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Điểm TB</p>
              <p className="text-2xl font-bold text-gray-900">
                {(students.reduce((sum, s) => sum + s.averageScore, 0) / students.length).toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm học sinh..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value as 'all' | Student['status'])}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Không hoạt động</option>
              <option value="at_risk">Cần quan tâm</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field as 'name' | 'progress' | 'score' | 'activity');
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="name-asc">Tên A-Z</option>
              <option value="name-desc">Tên Z-A</option>
              <option value="progress-desc">Tiến độ cao nhất</option>
              <option value="progress-asc">Tiến độ thấp nhất</option>
              <option value="score-desc">Điểm cao nhất</option>
              <option value="score-asc">Điểm thấp nhất</option>
              <option value="activity-desc">Hoạt động gần nhất</option>
              <option value="activity-asc">Hoạt động lâu nhất</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Danh sách học sinh ({sortedStudents.length})
          </h2>
        </div>

        {sortedStudents.length === 0 ? (
          <div className="p-12 text-center">
            <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có học sinh</h3>
            <p className="mt-1 text-sm text-gray-500">
              Chưa có học sinh nào đăng ký khóa học của bạn.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sortedStudents.map((student) => {
              const StatusIcon = getStatusIcon(student.status);
              const progressPercentage = (student.completedLessons / student.totalLessons) * 100;
              const assignmentProgress = (student.completedAssignments / student.totalAssignments) * 100;

              return (
                <div key={student.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <UsersIcon className="h-6 w-6 text-gray-500" />
                        </div>
                      </div>

                      {/* Student Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {student.name}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {getStatusLabel(student.status)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">
                          {student.email}
                        </p>
                        
                        {/* Progress Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-600">Tiến độ bài học</span>
                              <span className="font-medium">
                                {student.completedLessons}/{student.totalLessons}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${progressPercentage}%` }}
                              ></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-600">Bài tập</span>
                              <span className="font-medium">
                                {student.completedAssignments}/{student.totalAssignments}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${assignmentProgress}%` }}
                              ></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-600">Điểm trung bình</span>
                              <span className="font-medium">
                                {student.averageScore.toFixed(1)}/100
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  student.averageScore >= 80 ? 'bg-green-600' :
                                  student.averageScore >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                                }`}
                                style={{ width: `${student.averageScore}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        {/* Additional Info */}
                        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center">
                            <AcademicCapIcon className="h-4 w-4 mr-1" />
                            {student.enrolledCourses} khóa học
                          </div>
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            Hoạt động: {new Date(student.lastActivity).toLocaleDateString('vi-VN')}
                          </div>
                          <div className="flex items-center">
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            Hoàn thành: {student.completedCourses} khóa học
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      <Link
                        href={`/instructor/students/${student.id}`}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
                        title="Xem chi tiết"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </Link>

                      <button
                        onClick={() => sendMessage(student.id)}
                        className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg"
                        title="Gửi tin nhắn"
                      >
                        <ChatBubbleLeftIcon className="h-5 w-5" />
                      </button>

                      <button
                        onClick={() => sendEmail(student.id)}
                        className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg"
                        title="Gửi email"
                      >
                        <EnvelopeIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

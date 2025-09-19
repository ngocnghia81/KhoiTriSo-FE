'use client';

import { useState } from 'react';
import { 
  PlusIcon,
  VideoCameraIcon,
  CalendarDaysIcon,
  ClockIcon,
  UsersIcon,
  PlayIcon,
  StopIcon,
  PencilSquareIcon,
  TrashIcon,
  LinkIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface LiveClass {
  id: string;
  title: string;
  description: string;
  courseTitle: string;
  scheduledAt: string;
  durationMinutes: number;
  maxParticipants: number;
  currentParticipants: number;
  meetingUrl: string;
  meetingId: string;
  meetingPassword: string;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  recordingUrl?: string;
  createdAt: string;
}

const mockLiveClasses: LiveClass[] = [
  {
    id: '1',
    title: 'Ôn tập Chương 1: Hàm số',
    description: 'Ôn tập tổng hợp các dạng bài tập về hàm số, đồ thị hàm số',
    courseTitle: 'Toán học lớp 12',
    scheduledAt: '2024-02-15T19:00:00',
    durationMinutes: 90,
    maxParticipants: 100,
    currentParticipants: 0,
    meetingUrl: 'https://zoom.us/j/123456789',
    meetingId: '123-456-789',
    meetingPassword: 'math2024',
    status: 'scheduled',
    createdAt: '2024-02-10'
  },
  {
    id: '2',
    title: 'Giải đề thi thử THPT QG 2024',
    description: 'Giải chi tiết đề thi thử THPT Quốc gia môn Toán 2024',
    courseTitle: 'Toán học lớp 12',
    scheduledAt: '2024-02-12T20:00:00',
    durationMinutes: 120,
    maxParticipants: 150,
    currentParticipants: 89,
    meetingUrl: 'https://zoom.us/j/987654321',
    meetingId: '987-654-321',
    meetingPassword: 'exam2024',
    status: 'live',
    createdAt: '2024-02-08'
  },
  {
    id: '3',
    title: 'Q&A Session - Đạo hàm nâng cao',
    description: 'Buổi hỏi đáp về các bài tập đạo hàm khó',
    courseTitle: 'Toán học lớp 12',
    scheduledAt: '2024-02-10T19:30:00',
    durationMinutes: 60,
    maxParticipants: 80,
    currentParticipants: 67,
    meetingUrl: 'https://zoom.us/j/456789123',
    meetingId: '456-789-123',
    meetingPassword: 'qa2024',
    status: 'ended',
    recordingUrl: 'https://zoom.us/rec/share/recording123',
    createdAt: '2024-02-05'
  }
];

const getStatusLabel = (status: LiveClass['status']) => {
  switch (status) {
    case 'scheduled': return 'Đã lên lịch';
    case 'live': return 'Đang diễn ra';
    case 'ended': return 'Đã kết thúc';
    case 'cancelled': return 'Đã hủy';
    default: return 'Không xác định';
  }
};

const getStatusColor = (status: LiveClass['status']) => {
  switch (status) {
    case 'scheduled': return 'bg-blue-100 text-blue-800';
    case 'live': return 'bg-green-100 text-green-800';
    case 'ended': return 'bg-gray-100 text-gray-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function LiveClassesPage() {
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>(mockLiveClasses);
  const [selectedFilter, setSelectedFilter] = useState<'all' | LiveClass['status']>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClasses = liveClasses.filter(liveClass => {
    const matchesFilter = selectedFilter === 'all' || liveClass.status === selectedFilter;
    const matchesSearch = liveClass.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      liveClass.courseTitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const startClass = (id: string) => {
    setLiveClasses(prev => prev.map(liveClass => 
      liveClass.id === id 
        ? { ...liveClass, status: 'live' as const }
        : liveClass
    ));
  };

  const endClass = (id: string) => {
    setLiveClasses(prev => prev.map(liveClass => 
      liveClass.id === id 
        ? { ...liveClass, status: 'ended' as const, recordingUrl: 'https://zoom.us/rec/share/recording' + id }
        : liveClass
    ));
  };

  const deleteClass = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lớp học này?')) {
      setLiveClasses(prev => prev.filter(liveClass => liveClass.id !== id));
    }
  };

  const copyMeetingInfo = (liveClass: LiveClass) => {
    const meetingInfo = `
Thông tin lớp học trực tuyến:
📚 Tiêu đề: ${liveClass.title}
📅 Thời gian: ${new Date(liveClass.scheduledAt).toLocaleString('vi-VN')}
🔗 Link tham gia: ${liveClass.meetingUrl}
🆔 Meeting ID: ${liveClass.meetingId}
🔑 Mật khẩu: ${liveClass.meetingPassword}
    `.trim();
    
    navigator.clipboard.writeText(meetingInfo);
    alert('Đã sao chép thông tin lớp học!');
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lớp học trực tuyến</h1>
          <p className="text-gray-600 mt-1">Quản lý các buổi học trực tuyến của bạn</p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <Link 
            href="/instructor/live-classes/create"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Tạo lớp học mới
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Tìm kiếm lớp học..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value as 'all' | LiveClass['status'])}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="scheduled">Đã lên lịch</option>
              <option value="live">Đang diễn ra</option>
              <option value="ended">Đã kết thúc</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <VideoCameraIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tổng lớp học</p>
              <p className="text-2xl font-bold text-gray-900">{liveClasses.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CalendarDaysIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Đã lên lịch</p>
              <p className="text-2xl font-bold text-gray-900">
                {liveClasses.filter(c => c.status === 'scheduled').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <PlayIcon className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Đang diễn ra</p>
              <p className="text-2xl font-bold text-gray-900">
                {liveClasses.filter(c => c.status === 'live').length}
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
              <p className="text-sm font-medium text-gray-500">Tổng học viên</p>
              <p className="text-2xl font-bold text-gray-900">
                {liveClasses.reduce((sum, c) => sum + c.currentParticipants, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Classes List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Danh sách lớp học ({filteredClasses.length})
          </h2>
        </div>

        {filteredClasses.length === 0 ? (
          <div className="p-12 text-center">
            <VideoCameraIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có lớp học</h3>
            <p className="mt-1 text-sm text-gray-500">
              Bắt đầu bằng cách tạo lớp học trực tuyến đầu tiên của bạn.
            </p>
            <div className="mt-6">
              <Link
                href="/instructor/live-classes/create"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Tạo lớp học mới
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredClasses.map((liveClass) => (
              <div key={liveClass.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {liveClass.title}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(liveClass.status)}`}>
                        {getStatusLabel(liveClass.status)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">
                      {liveClass.description}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <CalendarDaysIcon className="h-4 w-4 mr-1" />
                        {new Date(liveClass.scheduledAt).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {new Date(liveClass.scheduledAt).toLocaleTimeString('vi-VN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })} ({liveClass.durationMinutes} phút)
                      </div>
                      <div className="flex items-center">
                        <UsersIcon className="h-4 w-4 mr-1" />
                        {liveClass.currentParticipants}/{liveClass.maxParticipants} học viên
                      </div>
                    </div>

                    {liveClass.status === 'live' && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-800">
                              Lớp học đang diễn ra
                            </p>
                            <p className="text-xs text-green-600">
                              {liveClass.currentParticipants} học viên đang tham gia
                            </p>
                          </div>
                          <a
                            href={liveClass.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700"
                          >
                            <PlayIcon className="h-3 w-3 mr-1" />
                            Tham gia
                          </a>
                        </div>
                      </div>
                    )}

                    {liveClass.status === 'ended' && liveClass.recordingUrl && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-blue-800">
                              Bản ghi có sẵn
                            </p>
                            <p className="text-xs text-blue-600">
                              Xem lại buổi học đã kết thúc
                            </p>
                          </div>
                          <a
                            href={liveClass.recordingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700"
                          >
                            <EyeIcon className="h-3 w-3 mr-1" />
                            Xem bản ghi
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {liveClass.status === 'scheduled' && (
                      <button
                        onClick={() => startClass(liveClass.id)}
                        className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg"
                        title="Bắt đầu lớp học"
                      >
                        <PlayIcon className="h-5 w-5" />
                      </button>
                    )}

                    {liveClass.status === 'live' && (
                      <button
                        onClick={() => endClass(liveClass.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                        title="Kết thúc lớp học"
                      >
                        <StopIcon className="h-5 w-5" />
                      </button>
                    )}

                    <button
                      onClick={() => copyMeetingInfo(liveClass)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
                      title="Sao chép thông tin lớp học"
                    >
                      <LinkIcon className="h-5 w-5" />
                    </button>

                    <Link
                      href={`/instructor/live-classes/${liveClass.id}/edit`}
                      className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg"
                      title="Chỉnh sửa"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </Link>

                    <button
                      onClick={() => deleteClass(liveClass.id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                      title="Xóa lớp học"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

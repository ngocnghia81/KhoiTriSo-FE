'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/contexts/SidebarContext';
import { useAuth } from '@/contexts/AuthContext';
import { useInstructorDetail } from '@/hooks/useInstructors';
import ResizablePanel from '../dashboard/ResizablePanel';
import {
  HomeIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';

const navigation = [
  {
    name: 'Tổng quan',
    href: '/instructor',
    icon: HomeIcon,
  },
  {
    name: 'Khóa học',
    icon: AcademicCapIcon,
    children: [
      { name: 'Tất cả khóa học', href: '/instructor/courses' },
      { name: 'Tạo khóa học', href: '/instructor/courses/create' },
      {name: 'Học viên', href: '/instructor/students' },
      {name:" Lộ trình học", href: '/instructor/courses/learning-paths' },
    ],
  },
  
  {
    name: 'Lớp học trực tuyến',
    icon: VideoCameraIcon,
    children: [
      { name: 'Danh sách lớp học', href: '/instructor/live-classes' },
      { name: 'Tạo lớp học', href: '/instructor/live-classes/create' }
    ],
  },
  {
    name: 'Bài tập & Kiểm tra',
    icon: DocumentTextIcon,
    children: [
      { name: 'Tất cả bài tập', href: '/instructor/assignments' }
    ],
  },
  {
    name: 'Sách điện tử',
    icon: BookOpenIcon,
    children: [
      { name: 'Tất cả sách', href: '/instructor/books' },
      { name: 'Tạo sách mới', href: '/instructor/books/create' },
      { name: 'Quản lý câu hỏi', href: '/instructor/books/questions' },
      { name: 'Quản lý lời giải', href: '/instructor/books/solutions' },
      { name: 'Quản lý mã ID', href: '/instructor/books/activation-codes' },
      { name: 'Thống kê', href: '/instructor/books/analytics' }
    ],
  },
  {
    name: 'Diễn đàn & Câu hỏi',
    icon: ChatBubbleLeftRightIcon,
    children: [
      { name: 'Danh sách câu hỏi', href: '/instructor/forum/questions' },
      { name: 'Bookmarks', href: '/instructor/forum/bookmarks' },
      { name: 'Câu hỏi chưa trả lời', href: '/instructor/forum/unanswered' },
      { name: 'Câu hỏi nổi bật', href: '/instructor/forum/featured' },
      { name: 'Moderation', href: '/instructor/forum/moderation' },
      { name: 'Báo cáo vi phạm', href: '/instructor/forum/reports' },
      { name: 'Thống kê forum', href: '/instructor/forum/analytics' },
    ],
  },
  {
    name: 'Thu nhập',
    icon: CurrencyDollarIcon,
    children: [
      { name: 'Tổng quan thu nhập', href: '/instructor/earnings' },
      
    ],
  },
  {
    name: 'Hồ sơ',
    href: '/instructor/profile',
    icon: UserIcon,
  },
];

export default function InstructorSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const instructorId = user?.id ? Number(user.id) : 0;
  const { data: instructorDetail, loading: instructorLoading } = useInstructorDetail(instructorId);
  const { 
    sidebarOpen, 
    sidebarCollapsed, 
    sidebarWidth,
    setSidebarOpen, 
    setSidebarWidth,
    toggleCollapse 
  } = useSidebar();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Tổng quan']);

  const avatarContent = useMemo(() => {
    if (user?.avatar) {
      return (
        <img
          src={user.avatar}
          alt={user?.name || user?.email || 'Giảng viên'}
          className="h-8 w-8 rounded-full object-cover"
        />
      );
    }

    const initials = (user?.name || user?.email || 'GV')
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();

    return (
      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
        <span className="text-sm font-medium text-white">{initials}</span>
      </div>
    );
  }, [user?.avatar, user?.name, user?.email]);

  const displayName = user?.name || user?.email || 'Giảng viên';
  const roleLabel = user?.role === 'admin'
    ? 'Quản trị viên'
    : user?.role === 'student'
      ? 'Học viên'
      : 'Giảng viên';

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    );
  };

  const isActive = (href: string) => {
    if (href === '/instructor') {
      return pathname === '/instructor';
    }
    return pathname?.startsWith(href) ?? false;
  };

  const handleWidthChange = (newWidth: number) => {
    setSidebarWidth(newWidth);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          type="button"
          className="bg-white p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          onClick={() => setSidebarOpen(true)}
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Sidebar */}
      <ResizablePanel
        initialWidth={sidebarWidth}
        minWidth={sidebarCollapsed ? 80 : 200}
        maxWidth={400}
        onWidthChange={handleWidthChange}
        className={`bg-white border-r border-gray-200 shadow-sm flex flex-col h-screen ${sidebarOpen ? '' : 'hidden lg:flex'}`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">IN</span>
            </div>
            {!sidebarCollapsed && (
              <div className="text-gray-900 font-semibold text-sm">Instructor Panel</div>
            )}
          </div>
          <div className="flex items-center space-x-1">
            {/* Collapse/Expand button */}
            <button
              type="button"
              className="hidden lg:block p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              onClick={toggleCollapse}
              title={sidebarCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
            >
              {sidebarCollapsed ? (
                <ChevronRightIcon className="h-4 w-4" />
              ) : (
                <ChevronLeftIcon className="h-4 w-4" />
              )}
            </button>
            {/* Mobile close button */}
            <button
              type="button"
              className="lg:hidden p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Quick stats */}
        {!sidebarCollapsed && (
          <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center">
                <div className="font-semibold text-green-600">
                  {instructorLoading ? (
                    <span className="block h-4 bg-green-200 rounded animate-pulse mx-auto w-10" />
                  ) : (
                    instructorDetail?.TotalCourses ?? 0
                  )}
                </div>
                <div className="text-gray-600">Khóa học</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-blue-600">
                  {instructorLoading ? (
                    <span className="block h-4 bg-blue-200 rounded animate-pulse mx-auto w-12" />
                  ) : (
                    `₫${(instructorDetail?.TotalEarnings ?? 0).toLocaleString()}`
                  )}
                </div>
                <div className="text-gray-600">Thu nhập</div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="space-y-1">
            {navigation.map((item) => (
              <div key={item.name}>
                {item.children ? (
                  <div>
                    <button
                      onClick={() => toggleExpanded(item.name)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:text-gray-900 hover:bg-gray-100 group transition-all duration-200"
                    >
                      <div className="flex items-center">
                        <item.icon className={`h-4 w-4 text-gray-500 group-hover:text-green-600 ${sidebarCollapsed ? 'mx-auto' : 'mr-3'}`} />
                        {!sidebarCollapsed && item.name}
                      </div>
                      {!sidebarCollapsed && (
                        <svg
                          className={`ml-2 h-4 w-4 transform transition-transform ${
                            expandedItems.includes(item.name) ? 'rotate-90' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </button>
                    {!sidebarCollapsed && expandedItems.includes(item.name) && (
                      <div className="ml-5 mt-1 space-y-0.5">
                        {item.children.map((child) => (
                          <Link
                            key={child.name}
                            href={child.href}
                            className={`block px-3 py-1.5 text-sm rounded-md transition-colors ${
                              isActive(child.href)
                                ? 'text-green-700 bg-green-50 border-l-2 border-green-600'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                            onClick={() => setSidebarOpen(false)}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive(item.href)
                        ? 'text-green-700 bg-green-50 border-l-2 border-green-600'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className={`h-4 w-4 text-gray-500 ${sidebarCollapsed ? 'mx-auto' : 'mr-3'}`} />
                    {!sidebarCollapsed && item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-gray-200 p-3">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {avatarContent}
            </div>
            {!sidebarCollapsed && (
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{displayName}</p>
                <p className="text-xs text-gray-500">{roleLabel}</p>
              </div>
            )}
          </div>
        </div>
      </ResizablePanel>
    </>
  );
}

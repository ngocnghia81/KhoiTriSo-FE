'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/contexts/SidebarContext';
import ResizablePanel from './ResizablePanel';
import {
  HomeIcon,
  AcademicCapIcon,
  BookOpenIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  BellIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  VideoCameraIcon,
  ClipboardDocumentListIcon,
  TagIcon,
  ExclamationTriangleIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import Logo from '@/components/Logo';

const navigation = [
  {
    name: 'Tổng quan',
    href: '/dashboard',
    icon: HomeIcon,
    current: true,
  },
  {
    name: 'Quản lý người dùng',
    icon: UserGroupIcon,
    children: [
      { name: 'Danh sách người dùng', href: '/dashboard/users' },
      { name: 'Giảng viên', href: '/dashboard/instructors' },
      { name: 'Học sinh', href: '/dashboard/students' },
      { name: 'Vai trò & quyền', href: '/dashboard/roles' },
    ],
  },
  {
    name: 'Khóa học',
    icon: AcademicCapIcon,
    children: [
      { name: 'Danh sách khóa học', href: '/dashboard/courses' },
      { name: 'Tạo khóa học mới', href: '/dashboard/courses/create' },
      { name: 'Bài giảng', href: '/dashboard/lessons' },
      { name: 'Tài liệu', href: '/dashboard/materials' },
      { name: 'Lớp học trực tuyến', href: '/dashboard/live-classes' },
    ],
  },
  {
    name: 'Bài tập & Kiểm tra',
    icon: ClipboardDocumentListIcon,
    children: [
      { name: 'Danh sách bài tập', href: '/dashboard/assignments' },
      { name: 'Câu hỏi', href: '/dashboard/questions' },
      { name: 'Kết quả', href: '/dashboard/results' },
      { name: 'Thống kê điểm', href: '/dashboard/grades' },
    ],
  },
  {
    name: 'Sách điện tử',
    icon: BookOpenIcon,
    children: [
      { name: 'Danh sách sách', href: '/dashboard/books' },
      { name: 'Mã kích hoạt', href: '/dashboard/activation-codes' },
      { name: 'Chương sách', href: '/dashboard/book-chapters' },
      { name: 'Câu hỏi sách', href: '/dashboard/book-questions' },
    ],
  },
  {
    name: 'Diễn đàn',
    icon: ChatBubbleLeftRightIcon,
    children: [
      { name: 'Bài viết', href: '/dashboard/forum-posts' },
      { name: 'Câu trả lời', href: '/dashboard/forum-replies' },
      { name: 'Moderation', href: '/dashboard/forum-moderation' },
      { name: 'Báo cáo', href: '/dashboard/forum-reports' },
    ],
  },
  {
    name: 'Đơn hàng & Thanh toán',
    icon: ShoppingCartIcon,
    children: [
      { name: 'Đơn hàng', href: '/dashboard/orders' },
      { name: 'Thanh toán', href: '/dashboard/payments' },
      { name: 'Giỏ hàng', href: '/dashboard/carts' },
      { name: 'Mã giảm giá', href: '/dashboard/coupons' },
    ],
  },
  {
    name: 'Báo cáo & Thống kê',
    icon: ChartBarIcon,
    children: [
      { name: 'Doanh thu', href: '/dashboard/revenue' },
      { name: 'Người dùng', href: '/dashboard/user-analytics' },
      { name: 'Khóa học', href: '/dashboard/course-analytics' },
      { name: 'Hoạt động', href: '/dashboard/activity-analytics' },
    ],
  },
  {
    name: 'Nội dung',
    icon: DocumentTextIcon,
    children: [
      { name: 'Danh mục', href: '/dashboard/categories' },
      { name: 'Tags', href: '/dashboard/tags' },
      { name: 'Thông báo', href: '/dashboard/announcements' },
      { name: 'Trang tĩnh', href: '/dashboard/static-pages' },
    ],
  },
  {
    name: 'Phê duyệt',
    icon: ExclamationTriangleIcon,
    children: [
      { name: 'Tổng quan', href: '/dashboard/approvals' },
      { name: 'Đăng ký giảng viên', href: '/dashboard/approvals/instructors' },
      { name: 'Khóa học', href: '/dashboard/approvals/courses' },
      { name: 'Sách điện tử', href: '/dashboard/approvals/books' },
    ],
  },
  {
    name: 'Chiết khấu',
    icon: CurrencyDollarIcon,
    children: [
      { name: 'Tổng quan', href: '/dashboard/commissions' },
      { name: 'Thanh toán chờ', href: '/dashboard/commissions/pending' },
      { name: 'Lịch sử thanh toán', href: '/dashboard/commissions/history' },
      { name: 'Top giảng viên', href: '/dashboard/commissions/top-instructors' },
    ],
  },
  {
    name: 'Hệ thống',
    icon: CogIcon,
    children: [
      { name: 'Cài đặt', href: '/dashboard/settings' },
      { name: 'Audit Logs', href: '/dashboard/audit-logs' },
      { name: 'Notifications', href: '/dashboard/notifications' },
      { name: 'Backup & Restore', href: '/dashboard/backup' },
    ],
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { 
    sidebarOpen, 
    sidebarCollapsed, 
    sidebarWidth,
    setSidebarOpen, 
    setSidebarWidth,
    toggleCollapse 
  } = useSidebar();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Tổng quan']);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    );
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
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
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">KT</span>
            </div>
            {!sidebarCollapsed && (
              <div className="text-gray-900 font-semibold text-sm">Khởi Trí Số</div>
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
                        <item.icon className={`h-4 w-4 text-gray-500 group-hover:text-blue-600 ${sidebarCollapsed ? 'mx-auto' : 'mr-3'}`} />
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
                                ? 'text-blue-700 bg-blue-50 border-l-2 border-blue-600'
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
                        ? 'text-blue-700 bg-blue-50 border-l-2 border-blue-600'
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
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <UserIcon className="h-4 w-4 text-white" />
              </div>
            </div>
            {!sidebarCollapsed && (
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">admin@khoitriso.com</p>
              </div>
            )}
          </div>
        </div>
      </ResizablePanel>
    </>
  );
}

'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/contexts/SidebarContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { navigationTranslations } from '@/locales/navigation';
import ResizablePanel from './ResizablePanel';
import LanguageSwitcher from '../LanguageSwitcher';
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
  ChevronRightIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import Logo from '@/components/Logo';

// Type definition for navigation items
type NavigationItem = {
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  current?: boolean;
} & (
  | { href: string; children?: never }
  | { href?: never; children: { name: string; href: string }[] }
);

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
      { name: 'Thống kê người dùng', href: '/dashboard/users/analytics' },
    ],
  },
  {
    name: 'Quản lý giảng viên',
    icon: AcademicCapIcon,
    children: [
      { name: 'Danh sách giảng viên', href: '/dashboard/instructors' },
      { name: 'Hồ sơ giảng viên', href: '/dashboard/instructors/profiles' },
      { name: 'Giảng viên tiêu biểu', href: '/dashboard/instructors/featured' },
    ],
  },
  {
    name: 'Quản lý khóa học',
    icon: BookOpenIcon,
    children: [
      { name: 'Danh sách khóa học', href: '/dashboard/courses' },
      { name: 'Thống kê khóa học', href: '/dashboard/courses/analytics' },
    ],
  },
  {
    name: 'Quản lý bài học',
    icon: DocumentTextIcon,
    children: [
      { name: 'Danh sách bài học', href: '/dashboard/lessons' },
      { name: 'Tạo bài học mới', href: '/dashboard/lessons/create' },
      { name: 'Video bài giảng', href: '/dashboard/lessons/videos' },
      { name: 'Tài liệu tham khảo', href: '/dashboard/lessons/materials' },
      { name: 'Thảo luận bài học', href: '/dashboard/lessons/discussions' },
    ],
  },
  {
    name: 'Lớp học trực tuyến',
    icon: VideoCameraIcon,
    children: [
      { name: 'Danh sách lớp học', href: '/dashboard/live-classes' },
      { name: 'Tạo lớp học mới', href: '/dashboard/live-classes/create' },
      { name: 'Lớp học sắp diễn ra', href: '/dashboard/live-classes/upcoming' },
      { name: 'Lịch sử lớp học', href: '/dashboard/live-classes/history' },
      { name: 'Điểm danh', href: '/dashboard/live-classes/attendance' },
    ],
  },
  {
    name: 'Bài tập & Kiểm tra',
    icon: ClipboardDocumentListIcon,
    children: [
      { name: 'Danh sách bài tập', href: '/dashboard/assignments' },
      { name: 'Tạo bài tập mới', href: '/dashboard/assignments/create' },
      { name: 'Import từ Word', href: '/dashboard/assignments/import' },
      { name: 'Kết quả bài tập', href: '/dashboard/assignments/results' },
      { name: 'Thống kê điểm', href: '/dashboard/assignments/statistics' },
      { name: 'Hướng dẫn soạn bài', href: '/dashboard/assignments/guide' },
    ],
  },
  {
    name: 'Sách điện tử',
    icon: BookOpenIcon,
    children: [
      { name: 'Danh sách sách', href: '/dashboard/books' },
      { name: 'Thêm sách mới', href: '/dashboard/books/create' },
      { name: 'Mã kích hoạt', href: '/dashboard/books/activation-codes' },
      { name: 'Câu hỏi sách', href: '/dashboard/books/questions' },
      { name: 'Lời giải video', href: '/dashboard/books/solutions' },
      { name: 'Thống kê sách', href: '/dashboard/books/analytics' },
    ],
  },
  {
    name: 'Diễn đàn & Câu hỏi',
    icon: ChatBubbleLeftRightIcon,
    children: [
      { name: 'Danh sách câu hỏi', href: '/dashboard/forum/questions' },
      { name: 'Câu hỏi chưa trả lời', href: '/dashboard/forum/unanswered' },
      { name: 'Câu hỏi nổi bật', href: '/dashboard/forum/featured' },
      { name: 'Moderation', href: '/dashboard/forum/moderation' },
      { name: 'Báo cáo vi phạm', href: '/dashboard/forum/reports' },
      { name: 'Thống kê forum', href: '/dashboard/forum/analytics' },
    ],
  },
  {
    name: 'Trang tĩnh',
    icon: DocumentTextIcon,
    children: [
      { name: 'Danh sách trang', href: '/dashboard/static-pages' },
      { name: 'Tạo trang mới', href: '/dashboard/static-pages/create' },
      { name: 'Trang khóa học', href: '/dashboard/static-pages/courses' },
      { name: 'Trang giảng viên', href: '/dashboard/static-pages/instructors' },
      { name: 'Trang câu hỏi', href: '/dashboard/static-pages/questions' },
      { name: 'SEO Management', href: '/dashboard/static-pages/seo' },
    ],
  },
  {
    name: 'AI Học tập',
    icon: CogIcon,
    children: [
      { name: 'Luyện phát âm', href: '/dashboard/ai/pronunciation' },
      { name: 'Phân tích học tập', href: '/dashboard/ai/learning-analysis' },
      { name: 'Gợi ý cá nhân hóa', href: '/dashboard/ai/personalization' },
      { name: 'Chatbot hỗ trợ', href: '/dashboard/ai/chatbot' },
      { name: 'Thống kê AI', href: '/dashboard/ai/analytics' },
    ],
  },
  {
    name: 'Đánh giá & Phản hồi',
    icon: StarIcon,
    children: [
      { name: 'Đánh giá khóa học', href: '/dashboard/reviews' },
      { name: 'Đánh giá giảng viên', href: '/dashboard/reviews/instructors' },
      { name: 'Phản hồi học viên', href: '/dashboard/reviews/feedback' },
      { name: 'Thống kê đánh giá', href: '/dashboard/reviews/analytics' },
    ],
  },
  {
    name: 'Đơn hàng & Thanh toán',
    icon: ShoppingCartIcon,
    children: [
      { name: 'Danh sách đơn hàng', href: '/dashboard/orders' },
      { name: 'Giao dịch', href: '/dashboard/transactions' },
      { name: 'Giỏ hàng', href: '/dashboard/carts' },
      { name: 'Mã giảm giá', href: '/dashboard/coupons' },
      { name: 'Hoàn tiền', href: '/dashboard/refunds' },
      { name: 'Thống kê doanh thu', href: '/dashboard/revenue' },
    ],
  },
  {
    name: 'Thống kê & Báo cáo',
    icon: ChartBarIcon,
    children: [
      { name: 'Dashboard Analytics', href: '/dashboard/analytics' },
      { name: 'Thống kê khóa học', href: '/dashboard/analytics/courses' },
      { name: 'Thống kê giảng viên', href: '/dashboard/analytics/instructors' },
      { name: 'Thống kê học viên', href: '/dashboard/analytics/students' },
      { name: 'Báo cáo hệ thống', href: '/dashboard/analytics/system' },
      { name: 'Báo cáo SEO', href: '/dashboard/analytics/seo' },
    ],
  },
  {
    name: 'Thông báo',
    icon: BellIcon,
    children: [
      { name: 'Danh sách thông báo', href: '/dashboard/notifications' },
      { name: 'Gửi thông báo', href: '/dashboard/notifications/create' },
    ],
  },
  {
    name: 'Cài đặt hệ thống',
    icon: CogIcon,
    children: [
      { name: 'Cài đặt chung', href: '/dashboard/settings' },
      { name: 'Cài đặt streaming', href: '/dashboard/settings/streaming' },
      { name: 'Cài đặt SEO', href: '/dashboard/settings/seo' },
      { name: 'Backup & Restore', href: '/dashboard/settings/backup' },
      { name: 'Thống kê hệ thống', href: '/dashboard/settings/stats' },
    ],
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const { 
    sidebarOpen, 
    sidebarCollapsed, 
    sidebarWidth,
    setSidebarOpen, 
    setSidebarWidth,
    toggleCollapse 
  } = useSidebar();
  
  // Get navigation based on current language
  const navigation = useMemo(() => {
    return require('@/utils/getNavigation').getNavigation(language);
  }, [language]);
  
  const [expandedItems, setExpandedItems] = useState<string[]>([navigation[0]?.name || '']);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    );
  };

  // Auto-expand parent items that have active children
  useEffect(() => {
    const activeParents = navigation
      .filter((item: NavigationItem) => item.children && hasActiveChild(item.children))
      .map((item: NavigationItem) => item.name);
    
    // Only keep active parents and default items (like 'Tổng quan')
    const defaultItems = ['Tổng quan'];
    const newExpandedItems = [...new Set([...defaultItems, ...activeParents])];
    
    setExpandedItems(newExpandedItems);
  }, [pathname]);

  const isActive = (href: string) => {
    if (!pathname) return false;
    
    // Exact match only - no partial matching
    return pathname === href;
  };

  const hasActiveChild = (children: any[]) => {
    return children.some(child => isActive(child.href));
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
            {/* Language Switcher */}
            {!sidebarCollapsed && <LanguageSwitcher />}
            
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
            {navigation.map((item: NavigationItem) => (
              <div key={item.name}>
                {item.children ? (
                  <div>
                    <button
                      onClick={() => toggleExpanded(item.name)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md group transition-all duration-200 text-gray-700 hover:text-gray-900 hover:bg-gray-100"
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

'use client';

import { useState } from 'react';
import { useSidebar } from '@/contexts/SidebarContext';
import {
  MagnifyingGlassIcon,
  BellIcon,
  UserCircleIcon,
  SunIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  Bars3Icon,
  PlusIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

export default function InstructorHeader() {
  const { toggleSidebar } = useSidebar();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    {
      id: 1,
      title: 'Khóa học được phê duyệt',
      message: 'Khóa học "Toán học nâng cao" đã được phê duyệt và xuất bản',
      time: '2 phút trước',
      type: 'success',
      unread: true,
    },
    {
      id: 2,
      title: 'Yêu cầu chỉnh sửa',
      message: 'Sách "Vật lý 12" cần chỉnh sửa một số nội dung',
      time: '1 giờ trước',
      type: 'warning',
      unread: true,
    },
    {
      id: 3,
      title: 'Thu nhập mới',
      message: 'Bạn có thu nhập mới từ khóa học "Hóa học cơ bản"',
      time: '3 giờ trước',
      type: 'info',
      unread: false,
    },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              type="button"
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              onClick={toggleSidebar}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-lg ml-4 lg:ml-0">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-all duration-200"
                placeholder="Tìm kiếm khóa học, sách..."
              />
            </div>
          </div>

          {/* Quick actions */}
          <div className="hidden md:flex items-center space-x-2 ml-4">
            <button
              type="button"
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Tạo khóa học
            </button>
            <button
              type="button"
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <EyeIcon className="h-4 w-4 mr-1" />
              Xem trang công khai
            </button>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-3 ml-4">
            {/* Earnings quick view */}
            <div className="hidden md:flex items-center px-3 py-1.5 bg-green-50 rounded-lg">
              <CurrencyDollarIcon className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm font-medium text-green-800">₫2,450,000</span>
            </div>

            {/* Theme toggle */}
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md"
              title="Chuyển đổi theme"
            >
              <SunIcon className="h-5 w-5" />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <BellIcon className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-2">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <h3 className="text-sm font-medium text-gray-900">Thông báo</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-4 ${
                            notification.type === 'success' ? 'border-green-500' :
                            notification.type === 'warning' ? 'border-yellow-500' :
                            'border-blue-500'
                          } ${notification.unread ? 'bg-blue-50' : ''}`}
                        >
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              {notification.type === 'success' && (
                                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                              )}
                              {notification.type === 'warning' && (
                                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                              )}
                              {notification.type === 'info' && (
                                <CurrencyDollarIcon className="h-5 w-5 text-blue-500" />
                              )}
                            </div>
                            <div className="ml-3 flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-2 border-t border-gray-200">
                      <button className="text-sm text-green-600 hover:text-green-800">
                        Xem tất cả thông báo
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="relative">
              <button
                type="button"
                className="flex items-center space-x-2 p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">A</span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">Nguyễn Văn A</p>
                  <p className="text-xs text-gray-500">Giảng viên</p>
                </div>
                <ChevronDownIcon className="h-4 w-4" />
              </button>

              {/* User dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <a
                      href="/instructor/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <UserCircleIcon className="mr-3 h-4 w-4" />
                      Hồ sơ của tôi
                    </a>
                    <a
                      href="/instructor/earnings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <CurrencyDollarIcon className="mr-3 h-4 w-4" />
                      Thu nhập
                    </a>
                    <a
                      href="/instructor/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Cog6ToothIcon className="mr-3 h-4 w-4" />
                      Cài đặt
                    </a>
                    <div className="border-t border-gray-100"></div>
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4" />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

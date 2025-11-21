'use client';

import { useState, useEffect, useRef } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid';
import { useNotifications } from '@/hooks/useNotifications';
import { useSignalR } from '@/contexts/SignalRContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface Notification {
  id: number;
  title: string;
  content: string;
  type: number;
  priority: number;
  isRead: boolean;
  createdAt: string;
  relatedId?: number;
  relatedType?: string;
  actionUrl?: string;
}

interface NotificationDropdownProps {
  className?: string;
  buttonClassName?: string;
  showConnectionStatus?: boolean;
}

export default function NotificationDropdown({ 
  className = '', 
  buttonClassName = '',
  showConnectionStatus = false 
}: NotificationDropdownProps) {
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const { data, unreadCount, loading, refetch, markAsRead, markAllAsRead } = useNotifications({ 
    page: 1, 
    pageSize: 10 
  });
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Determine notifications page URL based on current path
  const getNotificationsUrl = () => {
    if (pathname?.startsWith('/dashboard')) {
      return '/dashboard/notifications';
    } else if (pathname?.startsWith('/instructor')) {
      return '/instructor/notifications';
    } else {
      return '/notifications';
    }
  };

  // Convert API data to Notification format
  const notifications: Notification[] = data.map((n: any) => ({
    id: n.id,
    title: n.title,
    content: n.content || n.message || '',
    type: n.type || 0,
    priority: n.priority || 0,
    isRead: n.isRead || false,
    createdAt: n.createdAt,
    relatedId: n.relatedId,
    relatedType: n.relatedType,
    actionUrl: n.actionUrl,
  }));

  // SignalR realtime notification handler - chỉ để hiển thị alert và trigger refetch
  const handleNotificationReceived = (notification: any) => {
    console.log('📨 Received realtime notification:', notification);
    
    // Show toast/alert notification
    const title = notification.title || 'Thông báo mới';
    const message = notification.message || notification.content || '';
    
    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/images/logo.png',
        tag: `notification-${notification.id || Date.now()}`,
      });
    }
    
    // Show toast notification in UI
    showToastNotification(title, message);
    
    // Trigger refetch to get updated notification list from API
    refetch();
  };

  // Show toast notification
  const showToastNotification = (title: string, message: string) => {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-blue-600 text-white px-6 py-4 rounded-lg shadow-lg z-[9999] max-w-sm animate-slide-in';
    toast.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="text-xl">🔔</div>
        <div class="flex-1">
          <div class="font-semibold text-sm">${title}</div>
          <div class="text-sm opacity-90 mt-1">${message}</div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="text-white opacity-70 hover:opacity-100">✕</button>
      </div>
    `;
    document.body.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 5000);
  };

  // Setup SignalR connection
  const { isConnected, connectionState } = useSignalR(handleNotificationReceived);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: number) => {
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: vi });
    } catch {
      return dateString;
    }
  };

  const getNotificationLink = (notification: Notification) => {
    if (notification.actionUrl) {
      return notification.actionUrl;
    }
    
    if (notification.relatedId && notification.relatedType) {
      switch (notification.relatedType.toLowerCase()) {
        case 'course':
          return `/courses/${notification.relatedId}`;
        case 'lesson':
          return `/courses/${notification.relatedId}/lessons/${notification.relatedId}`;
        case 'assignment':
          return `/assignments/${notification.relatedId}`;
        case 'forum':
          return `/forum/${notification.relatedId}`;
        default:
          return '#';
      }
    }
    return '#';
  };

  const getNotificationIcon = (type: number) => {
    const typeIcons: Record<number, string> = {
      1: '🔔', // System
      2: '📚', // Course
      3: '🎥', // Lesson
      4: '📝', // Assignment
      5: '🛒', // Order
      6: '💳', // Payment
      7: '🏆', // Certificate
      8: '💬', // Forum
      9: '⭐', // Review
      10: '📢', // Announcement
      11: '📹', // LiveClass
      12: '🗺️', // LearningPath
      13: '📖', // Book
      14: '❤️', // Wishlist
      15: '🎫', // Coupon
      16: '💭', // LessonDiscussion
      17: '💬', // ForumAnswer
    };
    return typeIcons[type] || '🔔';
  };

  const getNotificationTypeColor = (type: number) => {
    const typeColors: Record<number, string> = {
      1: 'border-gray-500', // System
      2: 'border-green-500', // Course
      3: 'border-blue-500', // Lesson
      4: 'border-orange-500', // Assignment
      5: 'border-yellow-500', // Order
      6: 'border-indigo-500', // Payment
      7: 'border-pink-500', // Certificate
      8: 'border-cyan-500', // Forum
      9: 'border-purple-500', // Review
      10: 'border-red-500', // Announcement
      11: 'border-violet-500', // LiveClass
      12: 'border-teal-500', // LearningPath
      13: 'border-emerald-500', // Book
      14: 'border-rose-500', // Wishlist
      15: 'border-amber-500', // Coupon
      16: 'border-lime-500', // LessonDiscussion
      17: 'border-sky-500', // ForumAnswer
    };
    return typeColors[type] || 'border-gray-500';
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md relative ${buttonClassName}`}
      >
        {unreadCount > 0 ? (
          <BellIconSolid className="h-5 w-5" />
        ) : (
          <BellIcon className="h-5 w-5" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        {showConnectionStatus && (
          <span 
            className={`absolute bottom-0 right-0 h-2 w-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-gray-400'
            }`}
            title={isConnected ? 'Đã kết nối SignalR' : 'Chưa kết nối SignalR'}
          />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-2">
            <div className="px-4 py-2 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">Thông báo</h3>
              <div className="flex items-center gap-2">
                {showConnectionStatus && (
                  <span 
                    className={`h-2 w-2 rounded-full ${
                      isConnected ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                    title={connectionState}
                  />
                )}
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Đánh dấu tất cả đã đọc
                  </button>
                )}
              </div>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  Đang tải...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <BellIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Chưa có thông báo</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <Link
                      key={notification.id}
                      href={getNotificationLink(notification)}
                      onClick={() => {
                        if (!notification.isRead) {
                          handleMarkAsRead(notification.id);
                        }
                        setIsOpen(false);
                      }}
                      className={`block px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-4 ${
                        getNotificationTypeColor(notification.type)
                      } ${!notification.isRead ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-xl flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`text-sm font-medium ${
                              !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </h4>
                            {!notification.isRead && (
                              <div className="h-2 w-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.content}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {formatDate(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            {notifications.length > 0 && (
              <div className="px-4 py-2 border-t border-gray-200 text-center">
                <Link
                  href={getNotificationsUrl()}
                  className="text-sm text-blue-600 hover:text-blue-800"
                  onClick={() => setIsOpen(false)}
                >
                  Xem tất cả thông báo
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


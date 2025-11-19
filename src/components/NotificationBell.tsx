'use client';

import { useState, useEffect, useRef } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNotifications } from '@/hooks/useNotifications';
import { useSignalR } from '@/contexts/SignalRContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
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

export default function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const { data, unreadCount, loading, refetch, markAsRead, markAllAsRead } = useNotifications({ 
    page: 1, 
    pageSize: 10 
  });
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
  useSignalR(handleNotificationReceived);

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
    // Use ActionUrl if available (from backend)
    if (notification.actionUrl) {
      return notification.actionUrl;
    }
    
    // Fallback to relatedId/relatedType logic
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
    switch (type) {
      case 1: // Course
        return '📚';
      case 2: // Assignment
        return '📝';
      case 3: // Lesson
        return '🎥';
      case 4: // Forum
        return '💬';
      default:
        return '🔔';
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg relative p-2"
      >
        <div className="relative flex items-center justify-center w-5 h-5">
          {unreadCount > 0 ? (
            <BellIconSolid className={`h-5 w-5 text-gray-700 transition-transform ${isOpen ? 'scale-95' : ''}`} />
          ) : (
            <BellIcon className="h-5 w-5 text-gray-700" />
          )}
          {unreadCount > 0 && (
            <span 
              className="absolute -top-2 -right-2 h-5 min-w-[20px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-r from-red-500 via-rose-500 to-red-600 rounded-full border-2 border-white shadow-lg pointer-events-none z-10"
              style={{
                animation: 'cart-badge-pulse 2s ease-in-out infinite',
                boxShadow: '0 6px 18px rgba(244, 63, 94, 0.45)',
              }}
            >
              {unreadCount > 99 ? '99+' : unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-80 lg:w-96 shadow-xl border border-gray-200 rounded-xl overflow-hidden z-50">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-900">Thông báo</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Đánh dấu tất cả đã đọc
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
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
                      className={`block p-4 hover:bg-gray-50 transition-colors ${
                        !notification.isRead ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl flex-shrink-0">
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
              <div className="p-3 border-t bg-gray-50 text-center">
                <Link
                  href="/notifications"
                  className="text-sm text-blue-600 hover:text-blue-800"
                  onClick={() => setIsOpen(false)}
                >
                  Xem tất cả thông báo
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}


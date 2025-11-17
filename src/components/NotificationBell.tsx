'use client';

import { useState, useEffect, useRef } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
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
  const { user, isAuthenticated } = useAuth();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user]);

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

  const fetchNotifications = async () => {
    if (!isAuthenticated || !user) return;

    try {
      setLoading(true);
      const response = await authenticatedFetch('/api/notifications?page=1&pageSize=10');
      
      if (!response.ok) {
        // Don't show error for 401, just silently fail (user might not be authenticated yet)
        if (response.status === 401) {
          setNotifications([]);
          setUnreadCount(0);
          return;
        }
        throw new Error(`Failed to fetch notifications: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('NotificationBell - Received data:', data);
      
      // Handle both Result.Items and Result.Data (backend may return either)
      const itemsArray = data.Result?.Data || data.Result?.Items || [];
      console.log('NotificationBell - Items array:', itemsArray);
      
      if (Array.isArray(itemsArray) && itemsArray.length > 0) {
        const items = itemsArray.map((n: any) => ({
          id: n.Id || n.id,
          title: n.Title || n.title,
          content: n.Message || n.Content || n.content || n.message || '',
          type: n.Type || n.type || 0,
          priority: n.Priority || n.priority || 0,
          isRead: n.IsRead || n.isRead || false,
          createdAt: n.CreatedAt || n.createdAt,
          relatedId: n.RelatedId || n.relatedId,
          relatedType: n.RelatedType || n.relatedType,
          actionUrl: n.ActionUrl || n.actionUrl,
        }));
        setNotifications(items);
        
        // Use UnreadCount from API if available, otherwise calculate from items
        const apiUnreadCount = data.Result?.UnreadCount;
        console.log('NotificationBell - UnreadCount from API:', apiUnreadCount);
        if (apiUnreadCount !== undefined && apiUnreadCount !== null) {
          setUnreadCount(apiUnreadCount);
        } else {
          const calculatedUnread = items.filter((n: Notification) => !n.isRead).length;
          console.log('NotificationBell - Calculated unread count:', calculatedUnread);
          setUnreadCount(calculatedUnread);
        }
        console.log('NotificationBell - Final notifications:', items);
        console.log('NotificationBell - Final unread count:', apiUnreadCount !== undefined && apiUnreadCount !== null ? apiUnreadCount : items.filter((n: Notification) => !n.isRead).length);
      } else {
        // No notifications
        setNotifications([]);
        setUnreadCount(data.Result?.UnreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await authenticatedFetch(`/api/notifications/${id}/mark-read`, {
        method: 'PUT',
      });
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await authenticatedFetch('/api/notifications/mark-all-read', {
        method: 'PUT',
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
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
        className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg relative"
      >
        <div className="relative flex items-center justify-center">
          {unreadCount > 0 ? (
            <BellIconSolid className={`h-5 w-5 text-gray-700 transition-transform ${isOpen ? 'scale-95' : ''}`} />
          ) : (
            <BellIcon className="h-5 w-5 text-gray-700" />
          )}
          {unreadCount > 0 && (
            <span 
              className="absolute -top-1.5 -right-1.5 h-4 min-w-[18px] px-1 flex items-center justify-center text-[9px] font-bold text-white bg-gradient-to-r from-red-500 via-rose-500 to-red-600 rounded-full border border-white shadow-lg pointer-events-none"
              style={{
                animation: 'cart-badge-pulse 2s ease-in-out infinite',
                boxShadow: '0 4px 12px rgba(244, 63, 94, 0.35)',
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
                  onClick={markAllAsRead}
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
                          markAsRead(notification.id);
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


'use client';

import { useState, useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Bell, BellOff, CheckCircle2, Filter, Search, Plus, CheckCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const notificationTypeLabels: Record<number, { label: string; color: string }> = {
  1: { label: 'Hệ thống', color: 'bg-blue-100 text-blue-800' },
  2: { label: 'Khóa học', color: 'bg-green-100 text-green-800' },
  3: { label: 'Bài học', color: 'bg-purple-100 text-purple-800' },
  4: { label: 'Bài tập', color: 'bg-orange-100 text-orange-800' },
  5: { label: 'Đơn hàng', color: 'bg-yellow-100 text-yellow-800' },
  6: { label: 'Thanh toán', color: 'bg-indigo-100 text-indigo-800' },
  7: { label: 'Chứng chỉ', color: 'bg-pink-100 text-pink-800' },
  8: { label: 'Diễn đàn', color: 'bg-cyan-100 text-cyan-800' },
  9: { label: 'Đánh giá', color: 'bg-teal-100 text-teal-800' },
  10: { label: 'Thông báo', color: 'bg-gray-100 text-gray-800' },
  11: { label: 'Lớp học trực tiếp', color: 'bg-red-100 text-red-800' },
  12: { label: 'Lộ trình học', color: 'bg-violet-100 text-violet-800' },
  13: { label: 'Sách', color: 'bg-amber-100 text-amber-800' },
  14: { label: 'Yêu thích', color: 'bg-rose-100 text-rose-800' },
};

const priorityLabels: Record<number, { label: string; color: string }> = {
  1: { label: 'Cao', color: 'bg-red-100 text-red-800' },
  2: { label: 'Trung bình', color: 'bg-yellow-100 text-yellow-800' },
  3: { label: 'Thấp', color: 'bg-gray-100 text-gray-800' },
};

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRead, setFilterRead] = useState<boolean | undefined>(undefined);
  const [filterType, setFilterType] = useState<number | undefined>(undefined);
  const [filterPriority, setFilterPriority] = useState<number | undefined>(undefined);
  const [markingAll, setMarkingAll] = useState(false);

  const { data, total, unreadCount, loading, markAsRead, markAllAsRead, refetch } = useNotifications({
    page,
    pageSize: 20,
    isRead: filterRead,
    type: filterType,
    priority: filterPriority,
  });

  // Filter notifications by search query
  const filteredData = data.filter((n) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      n.title.toLowerCase().includes(query) ||
      (n.content && n.content.toLowerCase().includes(query))
    );
  });

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAll(true);
      await markAllAsRead();
      await refetch(); // Refresh to update UI
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id);
      await refetch(); // Refresh to update UI
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const canCreateNotification = user?.role === 'admin' || user?.role === 'instructor';

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Thông báo</h1>
          <p className="text-sm text-gray-600 mt-1">
            {unreadCount > 0 ? (
              <span className="text-blue-600 font-medium">{unreadCount} thông báo chưa đọc</span>
            ) : (
              'Tất cả thông báo đã được đọc'
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={handleMarkAllAsRead}
              disabled={markingAll}
              className="flex items-center gap-2"
              title="Đánh dấu tất cả thông báo chưa đọc là đã đọc"
            >
              {markingAll ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCheck className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Đánh dấu tất cả đã đọc</span>
              <span className="sm:hidden">Tất cả</span>
            </Button>
          )}
          {canCreateNotification && (
            <Button onClick={() => router.push('/dashboard/notifications/create')} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Tạo thông báo</span>
              <span className="sm:hidden">Tạo</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filters - Collapsible */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Bộ lọc và tìm kiếm
            </CardTitle>
            <p className="text-xs text-gray-500">
              {filterRead !== undefined || filterType !== undefined || filterPriority !== undefined || searchQuery
                ? 'Đang lọc'
                : 'Tất cả thông báo'}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm theo tiêu đề hoặc nội dung..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={filterRead === undefined ? 'all' : filterRead ? 'read' : 'unread'}
              onValueChange={(value) => {
                if (value === 'all') setFilterRead(undefined);
                else setFilterRead(value === 'read');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái đọc" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="unread">Chưa đọc ({unreadCount})</SelectItem>
                <SelectItem value="read">Đã đọc</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filterType === undefined ? 'all' : String(filterType)}
              onValueChange={(value) => {
                if (value === 'all') setFilterType(undefined);
                else setFilterType(Number(value));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Loại thông báo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                {Object.entries(notificationTypeLabels).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 items-center">
            {(filterRead !== undefined || filterType !== undefined || filterPriority !== undefined || searchQuery) && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilterRead(undefined);
                    setFilterType(undefined);
                    setFilterPriority(undefined);
                    setSearchQuery('');
                  }}
                >
                  Xóa tất cả bộ lọc
                </Button>
                <span className="text-xs text-gray-500">
                  Hiển thị {filteredData.length} / {total} thông báo
                </span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="ml-3 text-gray-600">Đang tải thông báo...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredData.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BellOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Không có thông báo nào</p>
              </CardContent>
            </Card>
          ) : (
            filteredData.map((n) => (
              <Card
                key={n.id}
                className={`transition-all hover:shadow-md ${
                  !n.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50/50' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        {!n.isRead && (
                          <div className="mt-1.5">
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Link
                              href={`/dashboard/notifications/${n.id}`}
                              className="font-semibold text-gray-900 hover:text-blue-600 hover:underline"
                              onClick={async (e) => {
                                // Tự động đánh dấu đã đọc khi click vào link xem chi tiết
                                if (!n.isRead) {
                                  e.preventDefault();
                                  await handleMarkAsRead(n.id);
                                  router.push(`/dashboard/notifications/${n.id}`);
                                }
                              }}
                            >
                              {n.title}
                            </Link>
                            {n.type && notificationTypeLabels[n.type] && (
                              <Badge className={notificationTypeLabels[n.type].color}>
                                {notificationTypeLabels[n.type].label}
                              </Badge>
                            )}
                            {n.priority && priorityLabels[n.priority] && (
                              <Badge variant="outline" className={priorityLabels[n.priority].color}>
                                {priorityLabels[n.priority].label}
                              </Badge>
                            )}
                          </div>
                          {n.content && (
                            <p className="text-sm text-gray-700 line-clamp-2 mb-2">{n.content}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{new Date(n.createdAt).toLocaleString('vi-VN')}</span>
                            {n.isRead && (
                              <span className="flex items-center gap-1 text-green-600">
                                <CheckCircle2 className="w-3 h-3" />
                                Đã đọc
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!n.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(n.id);
                          }}
                          className="flex items-center gap-1"
                          title="Đánh dấu đã đọc (hoặc click vào thông báo)"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Đánh dấu đã đọc</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Trang {page} / {Math.ceil(total / 20)} ({total} thông báo)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={page === 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Trang trước
            </Button>
            <Button
              variant="outline"
              disabled={loading || page * 20 >= total}
              onClick={() => setPage((p) => p + 1)}
            >
              Trang sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

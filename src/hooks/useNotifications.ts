import { useCallback, useEffect, useState } from 'react';
import { notificationApi, NotificationItem, NotificationPagedResponse } from '@/services/notificationApi';

export const useNotifications = (params: { isRead?: boolean; type?: number; priority?: number; page?: number; pageSize?: number } = {}) => {
  const [data, setData] = useState<NotificationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(params.page || 1);
  const [pageSize, setPageSize] = useState(params.pageSize || 20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res: NotificationPagedResponse = await notificationApi.getUserNotifications({ ...params, page, pageSize });
      setData(res.data);
      setTotal(res.total);
      setUnreadCount(res.unreadCount);
    } catch (e: any) {
      setError(e?.message || 'Failed to load notifications');
      console.error('Load notifications error', e);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params), page, pageSize]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id: number) => {
    await notificationApi.markAsRead(id);
    await fetchNotifications();
  }, [fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    await notificationApi.markAllAsRead();
    await fetchNotifications();
  }, [fetchNotifications]);

  return { data, total, unreadCount, page, setPage, pageSize, setPageSize, loading, error, refetch: fetchNotifications, markAsRead, markAllAsRead };
};



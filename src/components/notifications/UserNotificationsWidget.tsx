'use client';

import Link from 'next/link';
import { useNotifications } from '@/hooks/useNotifications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function UserNotificationsWidget() {
  const { data, unreadCount, loading } = useNotifications({ page: 1, pageSize: 5 });

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">Thông báo gần đây</CardTitle>
        <Badge variant="secondary">Chưa đọc: {unreadCount}</Badge>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-slate-500">Đang tải...</div>
        ) : data.length ? (
          <div className="space-y-3">
            {data.slice(0, 5).map((n) => (
              <div key={n.id} className={`p-3 rounded-lg ${n.isRead ? 'bg-slate-50' : 'bg-blue-50'} border border-slate-100`}>
                <div className="text-sm font-semibold text-slate-800">{n.title}</div>
                {n.content && <div className="text-sm text-slate-600 line-clamp-2">{n.content}</div>}
                <div className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
              </div>
            ))}
            <div className="text-right text-sm">
              <Link href="/dashboard/notifications" className="text-blue-600 hover:underline">Xem tất cả</Link>
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-500">Không có thông báo</div>
        )}
      </CardContent>
    </Card>
  );
}



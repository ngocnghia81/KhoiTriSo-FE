'use client';

import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const { data, total, loading, pageSize } = useNotifications({ page, pageSize: 20 });

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Thông báo</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40 text-gray-500">
          <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Đang tải...
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((n) => (
            <Card key={n.id}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">
                  <Link href={`/dashboard/notifications/${n.id}`} className="hover:underline">
                    {n.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {n.content && <p className="text-sm text-gray-700 whitespace-pre-line">{n.content}</p>}
                <div className="mt-2 text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</div>
              </CardContent>
            </Card>
          ))}
          {data.length === 0 && (
            <div className="text-center text-gray-500 py-10">Không có thông báo</div>
          )}
        </div>
      )}

      {/* Simple pagination */}
      {total > pageSize && (
        <div className="flex items-center justify-between mt-6">
          <Button variant="outline" disabled={page === 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))}>Trang trước</Button>
          <div className="text-sm text-gray-500">Trang {page}</div>
          <Button variant="outline" disabled={loading || (page * pageSize) >= total} onClick={() => setPage((p) => p + 1)}>Trang sau</Button>
        </div>
      )}
    </div>
  );
}



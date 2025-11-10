'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { notificationApi, NotificationItem } from '@/services/notificationApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function NotificationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);
  const [item, setItem] = useState<NotificationItem | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const data = await notificationApi.getNotification(id);
        setItem(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (!id) return null;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="mb-4">
        <Button variant="outline" onClick={() => router.back()}>Quay lại</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{loading ? 'Đang tải...' : (item?.title || 'Thông báo')}</CardTitle>
        </CardHeader>
        <CardContent>
          {item && (
            <div className="space-y-3">
              <div className="text-sm text-gray-500">{new Date(item.createdAt).toLocaleString()}</div>
              <div className="whitespace-pre-line text-gray-800">
                {item.content || 'Không có nội dung'}
              </div>
              {item && (item as any).actionUrl && (
                <div>
                  <a href={(item as any).actionUrl} className="text-blue-600 hover:underline">Đi đến hành động</a>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



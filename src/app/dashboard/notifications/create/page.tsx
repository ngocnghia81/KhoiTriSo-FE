'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { notificationApi } from '@/services/notificationApi';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CreateNotificationPage() {
  const { language } = useLanguage();
  const [target, setTarget] = useState<'all' | 'role'>('all');
  const [role, setRole] = useState<'Admin' | 'Instructor' | 'User'>('User');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<number>(1);
  const [priority, setPriority] = useState<number>(2);
  const [actionUrl, setActionUrl] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const templates = [
    {
      key: 'system_update',
      vi: { title: 'Cập nhật hệ thống', message: 'Chúng tôi vừa nâng cấp hệ thống để cải thiện hiệu năng và trải nghiệm. Vui lòng đăng nhập lại nếu gặp sự cố.' },
      en: { title: 'System Update', message: 'We have upgraded the system to improve performance and experience. Please re-login if you encounter issues.' },
      type: 1,
      priority: 2,
    },
    {
      key: 'promotion',
      vi: { title: 'Khuyến mãi đặc biệt', message: 'Ưu đãi lên đến 50% cho các khóa học/sách trong tuần này. Đừng bỏ lỡ!' },
      en: { title: 'Special Promotion', message: 'Up to 50% off on courses/books this week. Don’t miss it!' },
      type: 3,
      priority: 2,
    },
    {
      key: 'class_reminder',
      vi: { title: 'Nhắc lịch lớp học trực tuyến', message: 'Buổi học trực tuyến sẽ diễn ra trong vòng 24 giờ tới. Vui lòng kiểm tra lịch học của bạn.' },
      en: { title: 'Live Class Reminder', message: 'Your live class starts within the next 24 hours. Please check your schedule.' },
      type: 1,
      priority: 1,
    },
    {
      key: 'maintenance',
      vi: { title: 'Bảo trì hệ thống', message: 'Hệ thống sẽ bảo trì từ 00:00 đến 02:00. Một số chức năng có thể bị gián đoạn.' },
      en: { title: 'Scheduled Maintenance', message: 'The system will be under maintenance from 00:00 to 02:00. Some features may be unavailable.' },
      type: 2,
      priority: 1,
    },
    {
      key: 'new_course',
      vi: { title: 'Khóa học mới ra mắt', message: 'Khóa học mới đã sẵn sàng. Hãy khám phá ngay để không bỏ lỡ kiến thức hữu ích!' },
      en: { title: 'New Course Launched', message: 'A new course is now available. Explore it now and don’t miss out!' },
      type: 1,
      priority: 2,
    },
  ];

  const applyTemplate = (key: string) => {
    const tpl = templates.find(t => t.key === key);
    if (!tpl) return;
    const localized = language === 'vi' ? tpl.vi : tpl.en;
    setTitle(localized.title);
    setMessage(localized.message);
    setType(tpl.type);
    setPriority(tpl.priority);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      alert('Vui lòng nhập tiêu đề và nội dung');
      return;
    }
    try {
      setLoading(true);
      const payload = { title, message, type, priority, actionUrl: actionUrl || undefined, sendEmail };
      if (target === 'all') {
        await notificationApi.broadcastAll(payload);
      } else {
        await notificationApi.broadcastRole(role, payload);
      }
      alert('Đã gửi thông báo');
      router.push('/dashboard/notifications');
    } catch (e: any) {
      alert(e?.message || 'Gửi thông báo thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Gửi thông báo</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            {/* Template selector */}
            <div>
              <Label>Mẫu thông báo</Label>
              <Select onValueChange={(v: string) => applyTemplate(v)}>
                <SelectTrigger><SelectValue placeholder={language === 'vi' ? 'Chọn mẫu' : 'Choose a template'} /></SelectTrigger>
                <SelectContent>
                  {templates.map(t => (
                    <SelectItem key={t.key} value={t.key}>
                      {language === 'vi' ? (
                        t.vi.title
                      ) : (
                        t.en.title
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Mục tiêu</Label>
                <Select value={target} onValueChange={(v: any) => setTarget(v)}>
                  <SelectTrigger><SelectValue placeholder="Chọn mục tiêu" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả người dùng</SelectItem>
                    <SelectItem value="role">Theo vai trò</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {target === 'role' && (
                <div>
                  <Label>Vai trò</Label>
                  <Select value={role} onValueChange={(v: any) => setRole(v)}>
                    <SelectTrigger><SelectValue placeholder="Chọn vai trò" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="User">User</SelectItem>
                      <SelectItem value="Instructor">Instructor</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div>
              <Label>Tiêu đề</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tiêu đề thông báo" />
            </div>

            <div>
              <Label>Nội dung</Label>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} placeholder="Nội dung thông báo" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Loại</Label>
                <Select value={String(type)} onValueChange={(v: string) => setType(Number(v))}>
                  <SelectTrigger><SelectValue placeholder="Loại" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Info</SelectItem>
                    <SelectItem value="2">Warning</SelectItem>
                    <SelectItem value="3">Success</SelectItem>
                    <SelectItem value="4">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Độ ưu tiên</Label>
                <Select value={String(priority)} onValueChange={(v: string) => setPriority(Number(v))}>
                  <SelectTrigger><SelectValue placeholder="Ưu tiên" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Cao</SelectItem>
                    <SelectItem value="2">Trung bình</SelectItem>
                    <SelectItem value="3">Thấp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Link hành động (tuỳ chọn)</Label>
                <Input value={actionUrl} onChange={(e) => setActionUrl(e.target.value)} placeholder="/some/url" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="h-4 w-4"
                id="sendEmail"
              />
              <Label htmlFor="sendEmail">Gửi email cho đối tượng</Label>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => history.back()}>Huỷ</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Đang gửi...' : 'Gửi thông báo'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}



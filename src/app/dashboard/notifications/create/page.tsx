'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { notificationApi } from '@/services/notificationApi';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { fetchWithAutoRefresh } from '@/utils/apiHelpers';
import { RichTextEditor } from '@/components/RichTextEditor';

interface Course {
  id: number;
  title: string;
}

export default function CreateNotificationPage() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const router = useRouter();
  
  const isAdmin = user?.role === 'admin';
  const isTeacher = user?.role === 'instructor';

  const [target, setTarget] = useState<'all' | 'role' | 'course'>('all');
  const [role, setRole] = useState<'Admin' | 'Teacher' | 'User'>('User');
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [courseSearch, setCourseSearch] = useState('');
  const [coursePage, setCoursePage] = useState(1);
  const [courseTotal, setCourseTotal] = useState(0);
  const coursePageSize = 20;
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<number>(10); // Default to Announcement
  const [priority, setPriority] = useState<number>(2);
  const [actionUrl, setActionUrl] = useState('');
  const [sendEmail, setSendEmail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load courses for teacher - backend tự động filter theo role
  const loadCourses = async (page: number = 1, search: string = '') => {
    try {
      setLoadingCourses(true);
      
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('pageSize', coursePageSize.toString());
      if (search) {
        queryParams.append('search', search);
      }
      // Backend tự động filter theo role: Teacher chỉ thấy courses của mình, Admin thấy tất cả
      
      const response = await authenticatedFetch(`/api/courses?${queryParams.toString()}`);
      const data = await response.json();
      
      if (response.ok) {
        const result = data?.Result || data;
        const items = result?.Items || result?.items || [];
        const total = result?.Total || result?.total || 0;
        
        const mappedCourses = items.map((c: any) => ({
          id: c.Id || c.id,
          title: c.Title || c.title,
        }));
        
        if (page === 1) {
          setCourses(mappedCourses);
        } else {
          setCourses((prev) => [...prev, ...mappedCourses]);
        }
        setCourseTotal(total);
      } else {
        console.error('Error loading courses:', data);
        if (page === 1) {
          setCourses([]);
        }
        setCourseTotal(0);
      }
    } catch (err) {
      console.error('Error loading courses:', err);
      if (page === 1) {
        setCourses([]);
      }
      setCourseTotal(0);
    } finally {
      setLoadingCourses(false);
    }
  };

  // Load courses when target changes
  useEffect(() => {
    if ((isTeacher || isAdmin) && target === 'course') {
      setCoursePage(1);
      setCourseSearch('');
      loadCourses(1, '');
    } else {
      setCourses([]);
      setSelectedCourseId(null);
      setCoursePage(1);
      setCourseSearch('');
    }
  }, [isTeacher, isAdmin, target]);

  // Debounce search
  useEffect(() => {
    if (target === 'course' && courseSearch !== undefined) {
      const timer = setTimeout(() => {
        setCoursePage(1);
        loadCourses(1, courseSearch);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [courseSearch]);

  // Load more courses when page changes
  useEffect(() => {
    if (target === 'course' && coursePage > 1) {
      loadCourses(coursePage, courseSearch);
    }
  }, [coursePage]);

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
      en: { title: 'Special Promotion', message: "Up to 50% off on courses/books this week. Don't miss it!" },
      type: 10,
      priority: 2,
    },
    {
      key: 'class_reminder',
      vi: { title: 'Nhắc lịch lớp học trực tuyến', message: 'Buổi học trực tuyến sẽ diễn ra trong vòng 24 giờ tới. Vui lòng kiểm tra lịch học của bạn.' },
      en: { title: 'Live Class Reminder', message: 'Your live class starts within the next 24 hours. Please check your schedule.' },
      type: 11,
      priority: 1,
    },
    {
      key: 'new_course',
      vi: { title: 'Khóa học mới ra mắt', message: 'Khóa học mới đã sẵn sàng. Hãy khám phá ngay để không bỏ lỡ kiến thức hữu ích!' },
      en: { title: 'New Course Launched', message: "A new course is now available. Explore it now and don't miss out!" },
      type: 2,
      priority: 2,
    },
    {
      key: 'course_update',
      vi: { title: 'Cập nhật khóa học', message: 'Khóa học của bạn đã được cập nhật với nội dung mới. Hãy kiểm tra ngay!' },
      en: { title: 'Course Update', message: 'Your course has been updated with new content. Check it out now!' },
      type: 2,
      priority: 2,
    },
  ];

  const applyTemplate = (key: string) => {
    const tpl = templates.find((t) => t.key === key);
    if (!tpl) return;
    const localized = language === 'vi' ? tpl.vi : tpl.en;
    setTitle(localized.title);
    setMessage(localized.message);
    setType(tpl.type);
    setPriority(tpl.priority);
  };

  const stripHtml = (html?: string) =>
    html ? html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : '';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title || !stripHtml(message)) {
      setError('Vui lòng nhập tiêu đề và nội dung');
      return;
    }

    // Teacher validation: must select a course if target is 'course'
    if (isTeacher && target === 'course' && !selectedCourseId) {
      setError('Vui lòng chọn khóa học');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title,
        message,
        type,
        priority,
        actionUrl: actionUrl || undefined,
        sendEmail,
      };

      if (target === 'all') {
        // Only admin can broadcast to all
        if (!isAdmin) {
          setError('Bạn không có quyền gửi thông báo cho tất cả người dùng');
          return;
        }
        await notificationApi.broadcastAll(payload);
      } else if (target === 'role') {
        // Only admin can broadcast to role
        if (!isAdmin) {
          setError('Bạn không có quyền gửi thông báo theo vai trò');
          return;
        }
        await notificationApi.broadcastRole(role, payload);
      } else if (target === 'course') {
        // Teacher can send to course students
        if (!selectedCourseId) {
          setError('Vui lòng chọn khóa học');
          return;
        }
        // Use NotificationHubController endpoint
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        const response = await fetchWithAutoRefresh(
          `${API_BASE_URL}/api/notification-hub/send-to-course/${selectedCourseId}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`,
            },
            body: JSON.stringify({
              Title: title,
              Message: message,
              Type: type,
              Priority: priority,
              ActionUrl: actionUrl || undefined,
            }),
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.Message || 'Gửi thông báo thất bại');
        }
      }

      alert('Đã gửi thông báo thành công');
      router.push('/dashboard/notifications');
    } catch (e: any) {
      setError(e?.message || 'Gửi thông báo thất bại');
      console.error('Error sending notification:', e);
    } finally {
      setLoading(false);
    }
  };

  // Determine available targets based on role
  const availableTargets = isAdmin
    ? [
        { value: 'all', label: 'Tất cả người dùng' },
        { value: 'role', label: 'Theo vai trò' },
        { value: 'course', label: 'Học viên khóa học' },
      ]
    : isTeacher
    ? [{ value: 'course', label: 'Học viên khóa học' }]
    : [];

  // Set default target for teacher
  useEffect(() => {
    if (isTeacher && !isAdmin) {
      setTarget('course');
    }
  }, [isTeacher, isAdmin]);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Tạo thông báo mới</h1>
        <p className="text-sm text-gray-600 mt-1">
          {isAdmin
            ? 'Gửi thông báo cho tất cả người dùng, theo vai trò hoặc học viên khóa học'
            : isTeacher
            ? 'Gửi thông báo cho học viên của các khóa học bạn dạy'
            : 'Bạn không có quyền tạo thông báo'}
        </p>
      </div>

      {(!isAdmin && !isTeacher) ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Bạn không có quyền tạo thông báo</AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Thông tin thông báo</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={onSubmit}>
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Template selector */}
              <div>
                <Label>Mẫu thông báo (tùy chọn)</Label>
                <Select onValueChange={(v: string) => applyTemplate(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder={language === 'vi' ? 'Chọn mẫu' : 'Choose a template'} />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => (
                      <SelectItem key={t.key} value={t.key}>
                        {language === 'vi' ? t.vi.title : t.en.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Target selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Đối tượng nhận thông báo</Label>
                  <Select
                    value={target}
                    onValueChange={(v: any) => {
                      setTarget(v);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn đối tượng" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTargets.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {target === 'role' && isAdmin && (
                  <div>
                    <Label>Vai trò</Label>
                    <Select value={role} onValueChange={(v: any) => setRole(v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn vai trò" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="User">Học viên</SelectItem>
                        <SelectItem value="Teacher">Giảng viên</SelectItem>
                        <SelectItem value="Admin">Quản trị viên</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {target === 'course' && (
                  <div className="space-y-2">
                    <Label>Khóa học</Label>
                    {loadingCourses && coursePage === 1 ? (
                      <div className="flex items-center gap-2 p-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-gray-600">Đang tải khóa học...</span>
                      </div>
                    ) : (
                      <>
                        <div className="relative">
                          <Input
                            placeholder="Tìm kiếm khóa học..."
                            value={courseSearch}
                            onChange={(e) => setCourseSearch(e.target.value)}
                            className="mb-2"
                          />
                        </div>
                        {courses.length === 0 ? (
                          <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                            <p className="text-sm text-gray-600">
                              {isTeacher ? 'Bạn chưa có khóa học nào' : 'Không có khóa học'}
                            </p>
                          </div>
                        ) : (
                          <>
                            <Select
                              value={selectedCourseId ? String(selectedCourseId) : undefined}
                              onValueChange={(v) => setSelectedCourseId(v ? Number(v) : null)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn khóa học" />
                              </SelectTrigger>
                              <SelectContent className="max-h-[300px]">
                                {courses.map((course) => (
                                  <SelectItem key={course.id} value={String(course.id)}>
                                    {course.title}
                                  </SelectItem>
                                ))}
                                {coursePage * coursePageSize < courseTotal && (
                                  <div className="p-2 border-t">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="w-full"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setCoursePage((p) => p + 1);
                                      }}
                                      disabled={loadingCourses}
                                    >
                                      {loadingCourses ? (
                                        <>
                                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                          Đang tải...
                                        </>
                                      ) : (
                                        `Tải thêm (${courseTotal - coursePage * coursePageSize} còn lại)`
                                      )}
                                    </Button>
                                  </div>
                                )}
                              </SelectContent>
                            </Select>
                            {courseTotal > coursePageSize && (
                              <p className="text-xs text-gray-500">
                                Hiển thị {courses.length} / {courseTotal} khóa học
                              </p>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              <div>
                <Label>Tiêu đề *</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Tiêu đề thông báo"
                  required
                />
              </div>

              <div>
                <Label>Nội dung *</Label>
                <RichTextEditor
                  value={message}
                  onChange={setMessage}
                  placeholder="Nội dung thông báo"
                  className="min-h-[200px] border border-gray-300 rounded-md p-4"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Loại thông báo</Label>
                  <Select value={String(type)} onValueChange={(v: string) => setType(Number(v))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Loại" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Hệ thống</SelectItem>
                      <SelectItem value="2">Khóa học</SelectItem>
                      <SelectItem value="3">Bài học</SelectItem>
                      <SelectItem value="4">Bài tập</SelectItem>
                      <SelectItem value="5">Đơn hàng</SelectItem>
                      <SelectItem value="6">Thanh toán</SelectItem>
                      <SelectItem value="7">Chứng chỉ</SelectItem>
                      <SelectItem value="8">Diễn đàn</SelectItem>
                      <SelectItem value="9">Đánh giá</SelectItem>
                      <SelectItem value="10">Thông báo</SelectItem>
                      <SelectItem value="11">Lớp học trực tiếp</SelectItem>
                      <SelectItem value="12">Lộ trình học</SelectItem>
                      <SelectItem value="13">Sách</SelectItem>
                      <SelectItem value="14">Yêu thích</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Độ ưu tiên</Label>
                  <Select value={String(priority)} onValueChange={(v: string) => setPriority(Number(v))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Ưu tiên" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Cao</SelectItem>
                      <SelectItem value="2">Trung bình</SelectItem>
                      <SelectItem value="3">Thấp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Link hành động (tùy chọn)</Label>
                  <Input
                    value={actionUrl}
                    onChange={(e) => setActionUrl(e.target.value)}
                    placeholder="/some/url"
                  />
                </div>
              </div>

              {isAdmin && (
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
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Hủy
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    'Gửi thông báo'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

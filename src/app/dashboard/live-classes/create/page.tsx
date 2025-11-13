'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Calendar, Clock, Users, Video, Link as LinkIcon, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Course } from '@/hooks/useCourses';
import { liveClassApiService, CreateLiveClassRequest } from '@/services/liveClassApi';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { RichTextEditor } from '@/components/RichTextEditor';
import { useAuth } from '@/contexts/AuthContext';

export default function CreateLiveClassPage() {
  const router = useRouter();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  const [formData, setFormData] = useState<Omit<CreateLiveClassRequest, 'instructorId'>>({
    courseId: 0,
    title: '',
    description: '',
    meetingUrl: '',
    meetingId: '',
    meetingPassword: '',
    scheduledAt: '',
    durationMinutes: 60,
    maxParticipants: undefined,
    status: 0, // Scheduled
    recordingStatus: 0,
    chatEnabled: true,
    recordingEnabled: true,
  });

  const [sendNotification, setSendNotification] = useState(true);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  useEffect(() => {
    if (!user) {
      setCourses([]);
      setLoadingCourses(false);
      return;
    }
    fetchMyCourses();
  }, [user]);

  const fetchMyCourses = async () => {
    if (!user) return;

    try {
      setLoadingCourses(true);
      // Fetch courses - the API will filter by current user's instructor role
      const response = await authenticatedFetch('/api/courses?page=1&pageSize=100');
      const result = await response.json();

      const items = result.Result?.Items || result.result?.items || [];
      const normalizedCourses: Course[] = items.map((course: any) => ({
        id: course.Id ?? course.id ?? 0,
        title: course.Title ?? course.title ?? 'Khoá học chưa đặt tên',
        description: course.Description ?? course.description,
        thumbnail: course.Thumbnail ?? course.thumbnail,
        categoryId: course.CategoryId ?? course.categoryId,
        category: course.Category
          ? {
              id: course.Category.Id ?? course.Category.id,
              name: course.Category.Name ?? course.Category.name,
            }
          : undefined,
        instructorId: course.InstructorId ?? course.instructorId,
        instructor: course.Instructor
          ? {
              id: course.Instructor.Id ?? course.Instructor.id,
              name: course.Instructor.Name ?? course.Instructor.name,
              avatar: course.Instructor.Avatar ?? course.Instructor.avatar,
              bio: course.Instructor.Bio ?? course.Instructor.bio,
            }
          : undefined,
        level: course.Level ?? course.level,
        isFree: course.IsFree ?? course.isFree,
        price: course.Price ?? course.price,
        estimatedDuration: course.EstimatedDuration ?? course.estimatedDuration,
        totalLessons: course.TotalLessons ?? course.totalLessons,
        totalStudents: course.TotalStudents ?? course.totalStudents,
        rating: course.Rating ?? course.rating,
        totalReviews: course.TotalReviews ?? course.totalReviews,
        approvalStatus: course.ApprovalStatus ?? course.approvalStatus,
        isPublished: course.IsPublished ?? course.isPublished,
        isActive: course.IsActive ?? course.isActive,
        createdAt: course.CreatedAt ?? course.createdAt ?? new Date().toISOString(),
        updatedAt: course.UpdatedAt ?? course.updatedAt,
      })).filter((course: Course) => course.id !== 0);

      const filteredCourses = normalizedCourses.filter((course: Course) => {
        if (!user) return false;
        if (user.role === 'admin') return true;
        const instructorId = course.instructorId ?? course.instructor?.id;
        return instructorId !== undefined && instructorId !== null
          ? instructorId.toString() === user.id.toString()
          : false;
      });

      setCourses(filteredCourses);
    } catch (err: any) {
      console.error('Error fetching courses:', err);
      setError('Không thể tải danh sách khóa học');
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.courseId || formData.courseId === 0) {
      setError('Vui lòng chọn khóa học');
      return;
    }

    if (!courses.some((course) => course.id === formData.courseId)) {
      setError('Bạn chỉ có thể tạo lớp học cho khóa học của mình');
      return;
    }

    if (!formData.title.trim()) {
      setError('Vui lòng nhập tiêu đề lớp học');
      return;
    }

    const plainDescription = formData.description.replace(/<[^>]*>/g, '').trim();
    if (!plainDescription) {
      setError('Vui lòng nhập mô tả lớp học');
      return;
    }

    if (!formData.meetingUrl.trim()) {
      setError('Vui lòng nhập link meeting');
      return;
    }

    if (!formData.meetingId.trim()) {
      setError('Vui lòng nhập Meeting ID');
      return;
    }

    if (!scheduledDate || !scheduledTime) {
      setError('Vui lòng chọn ngày và giờ bắt đầu');
      return;
    }

    // Combine date and time
    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    if (scheduledDateTime < new Date()) {
      setError('Thời gian bắt đầu phải ở tương lai');
      return;
    }

    if (formData.durationMinutes <= 0) {
      setError('Thời lượng phải lớn hơn 0');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const request: CreateLiveClassRequest = {
        ...formData,
        instructorId: 0, // Will be set by backend from token
        scheduledAt: scheduledDateTime.toISOString(),
      };

      // Create live class
      const createdLiveClass = await liveClassApiService.createLiveClass(authenticatedFetch, request);

      // Send notification to enrolled students if requested
      if (sendNotification) {
        try {
          const notificationResponse = await authenticatedFetch(
            `/api/notification-hub/send-to-course/${formData.courseId}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                title: `Lớp học trực tuyến mới: ${formData.title}`,
                message: `Lớp học "${formData.title}" sẽ bắt đầu vào ${scheduledDateTime.toLocaleString('vi-VN')}. Link tham gia: ${formData.meetingUrl}`,
                type: 1, // Info
                priority: 2, // High
                actionUrl: `/live-classes/${createdLiveClass.id}`,
                isRead: false,
                createdAt: new Date().toISOString(),
              }),
            }
          );

          if (!notificationResponse.ok) {
            console.warn('Failed to send notification, but live class was created');
          }
        } catch (notifError) {
          console.error('Error sending notification:', notifError);
          // Don't fail the whole operation if notification fails
        }
      }

      alert('Tạo lớp học thành công!');
      router.push('/dashboard/live-classes');
    } catch (err: any) {
      console.error('Error creating live class:', err);
      setError(err.message || 'Không thể tạo lớp học');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/live-classes')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Tạo lớp học trực tuyến
            </h1>
            <p className="text-gray-600 mt-2">Tạo lớp học trực tuyến mới cho khóa học của bạn</p>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50 mb-6">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit}>
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md mb-6">
            <CardHeader>
              <CardTitle>Thông tin lớp học</CardTitle>
              <CardDescription>
                Điền thông tin để tạo lớp học trực tuyến mới
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Course Selection */}
              <div>
                <Label htmlFor="courseId">Khóa học <span className="text-red-500">*</span></Label>
                {loadingCourses ? (
                  <div className="mt-2 text-sm text-gray-500">Đang tải danh sách khóa học...</div>
                ) : (
                  <Select
                    value={formData.courseId.toString()}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, courseId: parseInt(value) }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Chọn khóa học" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.length === 0 ? (
                        <SelectItem value="0" disabled>
                          Bạn chưa có khóa học nào
                        </SelectItem>
                      ) : (
                        courses.map((course) => (
                          <SelectItem key={course.id} value={course.id.toString()}>
                            {course.title}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Chỉ hiển thị các khóa học mà bạn là giảng viên
                </p>
              </div>

              {/* Title */}
              <div>
                <Label htmlFor="title">Tiêu đề lớp học <span className="text-red-500">*</span></Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Ví dụ: Ôn tập Chương 1: Hàm số"
                  className="mt-1"
                  disabled={saving}
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Mô tả <span className="text-red-500">*</span></Label>
                <div className="mt-1">
                  <RichTextEditor
                    value={formData.description}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, description: value }))
                    }
                    placeholder="Mô tả chi tiết về nội dung lớp học..."
                    className={saving ? 'pointer-events-none opacity-80' : ''}
                  />
                </div>
              </div>

              {/* Schedule */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scheduledDate">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Ngày bắt đầu <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="mt-1"
                    disabled={saving}
                  />
                </div>
                <div>
                  <Label htmlFor="scheduledTime">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Giờ bắt đầu <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="scheduledTime"
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="mt-1"
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Duration */}
              <div>
                <Label htmlFor="durationMinutes">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Thời lượng (phút) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="durationMinutes"
                  type="number"
                  value={formData.durationMinutes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      durationMinutes: parseInt(e.target.value) || 0,
                    }))
                  }
                  min="1"
                  className="mt-1"
                  disabled={saving}
                />
              </div>

              {/* Meeting Info */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Thông tin Meeting</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="meetingUrl">
                      <LinkIcon className="w-4 h-4 inline mr-1" />
                      Link Meeting <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="meetingUrl"
                      type="url"
                      value={formData.meetingUrl}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, meetingUrl: e.target.value }))
                      }
                      placeholder="https://zoom.us/j/123456789"
                      className="mt-1"
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <Label htmlFor="meetingId">
                      <Video className="w-4 h-4 inline mr-1" />
                      Meeting ID <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="meetingId"
                      value={formData.meetingId}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, meetingId: e.target.value }))
                      }
                      placeholder="123-456-789"
                      className="mt-1"
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <Label htmlFor="meetingPassword">
                      <Lock className="w-4 h-4 inline mr-1" />
                      Mật khẩu (tùy chọn)
                    </Label>
                    <Input
                      id="meetingPassword"
                      type="password"
                      value={formData.meetingPassword}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, meetingPassword: e.target.value }))
                      }
                      placeholder="Mật khẩu meeting"
                      className="mt-1"
                      disabled={saving}
                    />
                  </div>
                </div>
              </div>

              {/* Max Participants */}
              <div>
                <Label htmlFor="maxParticipants">
                  <Users className="w-4 h-4 inline mr-1" />
                  Số lượng học viên tối đa (tùy chọn)
                </Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  value={formData.maxParticipants || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      maxParticipants: e.target.value ? parseInt(e.target.value) : undefined,
                    }))
                  }
                  min="1"
                  className="mt-1"
                  disabled={saving}
                />
              </div>

              {/* Options */}
              <div className="border-t pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="chatEnabled">Bật chat</Label>
                    <p className="text-xs text-gray-500">Cho phép học viên chat trong lớp học</p>
                  </div>
                  <Switch
                    id="chatEnabled"
                    checked={formData.chatEnabled}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, chatEnabled: checked }))
                    }
                    disabled={saving}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="recordingEnabled">Ghi lại lớp học</Label>
                    <p className="text-xs text-gray-500">Tự động ghi lại lớp học</p>
                  </div>
                  <Switch
                    id="recordingEnabled"
                    checked={formData.recordingEnabled}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, recordingEnabled: checked }))
                    }
                    disabled={saving}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sendNotification">Gửi thông báo cho học viên</Label>
                    <p className="text-xs text-gray-500">
                      Gửi thông báo cho tất cả học viên đã đăng ký khóa học này
                    </p>
                  </div>
                  <Switch
                    id="sendNotification"
                    checked={sendNotification}
                    onCheckedChange={setSendNotification}
                    disabled={saving}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/live-classes')}
              disabled={saving}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={
                saving ||
                !formData.courseId ||
                !formData.title.trim() ||
                !formData.description.replace(/<[^>]*>/g, '').trim()
              }
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Tạo lớp học
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, Hash, LinkIcon, Users, Video } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { liveClassApiService, LiveClassDTO, LiveClassParticipantDto } from '@/services/liveClassApi';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { RichTextEditor } from '@/components/RichTextEditor';
import { Course } from '@/hooks/useCourses';
import { useAuth } from '@/contexts/AuthContext';

const getStatusLabel = (status: number) => {
  switch (status) {
    case 0: return 'Đã lên lịch';
    case 1: return 'Đang diễn ra';
    case 2: return 'Đã kết thúc';
    case 3: return 'Đã hủy';
    default: return 'Không xác định';
  }
};

const getStatusColor = (status: number) => {
  switch (status) {
    case 0: return 'bg-blue-100 text-blue-800';
    case 1: return 'bg-green-100 text-green-800';
    case 2: return 'bg-gray-100 text-gray-800';
    case 3: return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const DetailSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-6 w-32" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-20 w-full" />
  </div>
);

type EditFormState = {
  courseId: number;
  title: string;
  description: string;
  meetingUrl: string;
  meetingId: string;
  meetingPassword: string;
  durationMinutes: number;
  maxParticipants?: number;
  recordingStatus: number;
  chatEnabled: boolean;
  recordingEnabled: boolean;
};

export default function LiveClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialIsEditing = searchParams?.get('edit') === 'true';
  const { authenticatedFetch } = useAuthenticatedFetch();
  const { user } = useAuth();
  const [liveClass, setLiveClass] = useState<LiveClassDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(initialIsEditing);
  const [saving, setSaving] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [coursesError, setCoursesError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [editData, setEditData] = useState<EditFormState>({
    courseId: 0,
    title: '',
    description: '',
    meetingUrl: '',
    meetingId: '',
    meetingPassword: '',
    durationMinutes: 60,
    maxParticipants: undefined,
    recordingStatus: 0,
    chatEnabled: true,
    recordingEnabled: true,
  });
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [participants, setParticipants] = useState<LiveClassParticipantDto[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [participantsError, setParticipantsError] = useState<string | null>(null);

  const canEdit = useMemo(() => {
    if (!liveClass || !user) return false;
    if (user.role === 'admin') return true;
    return user.id === liveClass.instructorId.toString();
  }, [liveClass, user]);

  const liveClassId = useMemo(() => {
    const rawId = params?.id;
    if (!rawId) return NaN;
    const id = Array.isArray(rawId) ? parseInt(rawId[0], 10) : parseInt(rawId as string, 10);
    return Number.isNaN(id) ? NaN : id;
  }, [params]);

  const updateEditQuery = useCallback((value: boolean) => {
    if (Number.isNaN(liveClassId)) return;
    const basePath = `/instructor/live-classes/${liveClassId}`;
    router.replace(value ? `${basePath}?edit=true` : basePath, { scroll: false });
  }, [liveClassId, router]);

  const fetchDetail = useCallback(async () => {
    if (Number.isNaN(liveClassId)) {
      setError('Không tìm thấy lớp học');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await liveClassApiService.getLiveClassById(authenticatedFetch, liveClassId);
      setLiveClass(result);
    } catch (err: any) {
      console.error('Error fetching live class detail:', err);
      setError(err.message || 'Không thể tải thông tin lớp học');
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch, liveClassId]);

  const fetchParticipants = useCallback(async () => {
    if (Number.isNaN(liveClassId)) {
      return;
    }

    if (!canEdit) {
      return; // Chỉ instructor và admin mới xem được participants
    }

    try {
      setLoadingParticipants(true);
      setParticipantsError(null);
      const result = await liveClassApiService.getParticipants(authenticatedFetch, liveClassId);
      setParticipants(result);
    } catch (err: any) {
      console.error('Error fetching participants:', err);
      setParticipantsError(err.message || 'Không thể tải danh sách người tham gia');
    } finally {
      setLoadingParticipants(false);
    }
  }, [authenticatedFetch, liveClassId, canEdit]);

  const fetchCourses = useCallback(async () => {
    if (!user) return;

    try {
      setLoadingCourses(true);
      setCoursesError(null);

      const response = await authenticatedFetch('/api/courses?page=1&pageSize=100');
      const result = await response.json();

      const items = result.Result?.Items || result.result?.items || [];
      const normalized: Course[] = items.map((course: any) => ({
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
      }));

      const filtered = normalized.filter((course) => {
        if (!user) return false;
        if (user.role === 'admin') return true;
        const instructorId = course.instructorId ?? course.instructor?.id;
        return instructorId !== undefined && instructorId !== null
          ? instructorId.toString() === user.id.toString()
          : false;
      });

      if (liveClass && filtered.every((course) => course.id !== liveClass.courseId)) {
        filtered.unshift({
          id: liveClass.courseId,
          title: `Khoá học #${liveClass.courseId}`,
          description: undefined,
          createdAt: new Date().toISOString(),
          instructorId: liveClass.instructorId,
          instructor: liveClass.instructorId
            ? { id: liveClass.instructorId, name: 'Giảng viên', avatar: undefined, bio: undefined }
            : undefined,
        });
      }

      setCourses(filtered);
    } catch (err) {
      console.error('Error fetching courses for edit:', err);
      setCoursesError('Không thể tải danh sách khóa học');
    } finally {
      setLoadingCourses(false);
    }
  }, [authenticatedFetch, liveClass, user]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  useEffect(() => {
    if (liveClass && canEdit) {
      fetchParticipants();
    }
  }, [liveClass, canEdit, fetchParticipants]);

  useEffect(() => {
    updateEditQuery(isEditing);
  }, [isEditing, updateEditQuery]);

  const resetEditForm = useCallback(() => {
    if (!liveClass) return;

    setEditData({
      courseId: liveClass.courseId,
      title: liveClass.title,
      description: liveClass.description,
      meetingUrl: liveClass.meetingUrl,
      meetingId: liveClass.meetingId,
      meetingPassword: liveClass.meetingPassword ?? '',
      durationMinutes: liveClass.durationMinutes,
      maxParticipants: liveClass.maxParticipants ?? undefined,
      recordingStatus: liveClass.recordingStatus,
      chatEnabled: liveClass.chatEnabled,
      recordingEnabled: liveClass.recordingEnabled,
    });

    const date = new Date(liveClass.scheduledAt);
    const isoString = date.toISOString();
    setScheduledDate(isoString.slice(0, 10));
    setScheduledTime(isoString.slice(11, 16));
  }, [liveClass]);

  useEffect(() => {
    resetEditForm();
  }, [liveClass, resetEditForm]);

  useEffect(() => {
    if (isEditing) {
      fetchCourses();
    }
  }, [fetchCourses, isEditing]);

  useEffect(() => {
    if (!canEdit && isEditing) {
      setIsEditing(false);
      setFormError(null);
      updateEditQuery(false);
    }
  }, [canEdit, isEditing, updateEditQuery]);

  const handleStart = async () => {
    if (Number.isNaN(liveClassId)) return;
    if (!confirm('Bắt đầu lớp học này ngay bây giờ?')) return;

    try {
      await liveClassApiService.startLiveClass(authenticatedFetch, liveClassId);
      await fetchDetail();
    } catch (err: any) {
      alert(err.message || 'Không thể bắt đầu lớp học');
    }
  };

  const handleEnd = async () => {
    if (Number.isNaN(liveClassId)) return;
    if (!confirm('Kết thúc lớp học này? Học viên sẽ không thể tham gia sau khi kết thúc.')) return;

    try {
      await liveClassApiService.endLiveClass(authenticatedFetch, liveClassId);
      await fetchDetail();
    } catch (err: any) {
      alert(err.message || 'Không thể kết thúc lớp học');
    }
  };

  const handleCancelEdit = () => {
    resetEditForm();
    setFormError(null);
    setIsEditing(false);
  };

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (Number.isNaN(liveClassId) || !liveClass) {
      setFormError('Không tìm thấy lớp học.');
      return;
    }

    if (!editData.courseId || editData.courseId === 0) {
      setFormError('Vui lòng chọn khóa học');
      return;
    }

    if (!editData.title.trim()) {
      setFormError('Vui lòng nhập tiêu đề lớp học');
      return;
    }

    const plainDescription = editData.description.replace(/<[^>]*>/g, '').trim();
    if (!plainDescription) {
      setFormError('Vui lòng nhập mô tả lớp học');
      return;
    }

    if (!editData.meetingUrl.trim()) {
      setFormError('Vui lòng nhập link meeting');
      return;
    }

    if (!editData.meetingId.trim()) {
      setFormError('Vui lòng nhập Meeting ID');
      return;
    }

    if (!scheduledDate || !scheduledTime) {
      setFormError('Vui lòng chọn ngày và giờ bắt đầu');
      return;
    }

    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    if (Number.isNaN(scheduledDateTime.getTime())) {
      setFormError('Thời gian bắt đầu không hợp lệ');
      return;
    }

    if (scheduledDateTime < new Date()) {
      setFormError('Thời gian bắt đầu phải ở tương lai');
      return;
    }

    if (editData.durationMinutes <= 0) {
      setFormError('Thời lượng phải lớn hơn 0');
      return;
    }

    try {
      setSaving(true);
      const updated = await liveClassApiService.updateLiveClass(authenticatedFetch, liveClassId, {
        courseId: editData.courseId,
        title: editData.title,
        description: editData.description,
        meetingUrl: editData.meetingUrl,
        meetingId: editData.meetingId,
        meetingPassword: editData.meetingPassword || undefined,
        scheduledAt: scheduledDateTime.toISOString(),
        durationMinutes: editData.durationMinutes,
        maxParticipants: editData.maxParticipants,
        status: liveClass.status,
        recordingStatus: editData.recordingStatus,
        chatEnabled: editData.chatEnabled,
        recordingEnabled: editData.recordingEnabled,
      });

      setLiveClass(updated);
      setIsEditing(false);
      setFormError(null);
    } catch (err: any) {
      console.error('Error updating live class:', err);
      setFormError(err.message || 'Không thể cập nhật lớp học');
    } finally {
      setSaving(false);
    }
  };

  const scheduledInfo = useMemo(() => {
    if (!liveClass?.scheduledAt) return null;
    const date = new Date(liveClass.scheduledAt);
    return {
      date: date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  }, [liveClass]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/instructor/live-classes')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại danh sách
          </Button>
          {loading ? (
            <Skeleton className="h-6 w-24" />
          ) : liveClass ? (
            <Badge className={getStatusColor(liveClass.status)}>
              {getStatusLabel(liveClass.status)}
            </Badge>
          ) : null}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              {loading ? (
                <Skeleton className="h-8 w-64" />
              ) : (
                <span>{liveClass?.title || 'Chi tiết lớp học'}</span>
              )}
              {!loading && liveClass && (
                <div className="flex flex-wrap items-center gap-3">
                  {liveClass.status === 0 && canEdit && (
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
                      onClick={handleStart}
                    >
                      Bắt đầu lớp học
                    </Button>
                  )}
                  {liveClass.status === 1 && (
                    <>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                        asChild
                      >
                        <a href={liveClass.meetingUrl} target="_blank" rel="noopener noreferrer">
                          Tham gia lớp học
                        </a>
                      </Button>
                      {canEdit && (
                        <Button size="sm" variant="outline" onClick={handleEnd}>
                          Kết thúc lớp học
                        </Button>
                      )}
                    </>
                  )}
                  {liveClass.status === 2 && (
                    <span className="text-sm text-gray-500">
                      Lớp học đã kết thúc.
                    </span>
                  )}
                  {canEdit && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (isEditing) {
                          handleCancelEdit();
                        } else {
                          resetEditForm();
                          setFormError(null);
                          setIsEditing(true);
                        }
                      }}
                      disabled={saving}
                    >
                      {isEditing ? 'Hủy chỉnh sửa' : 'Chỉnh sửa'}
                    </Button>
                  )}
                </div>
              )}
            </CardTitle>
            <CardDescription>
              {loading ? (
                <Skeleton className="h-4 w-48" />
              ) : liveClass ? (
                <div
                  className="prose prose-sm text-gray-600 max-w-none"
                  dangerouslySetInnerHTML={{ __html: liveClass.description }}
                />
              ) : (
                'Thông tin chi tiết về lớp học trực tuyến'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <DetailSkeleton />
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
                <Button className="mt-4" onClick={() => router.refresh()}>
                  Thử lại
                </Button>
              </div>
            ) : liveClass ? (
              isEditing ? (
                <form onSubmit={handleEditSubmit} className="space-y-6">
                  {formError && (
                    <Card className="border-red-200 bg-red-50">
                      <CardContent className="pt-4 text-red-600">{formError}</CardContent>
                    </Card>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="courseId">Khóa học <span className="text-red-500">*</span></Label>
                      {loadingCourses ? (
                        <p className="mt-2 text-sm text-gray-500">Đang tải danh sách khóa học...</p>
                      ) : coursesError ? (
                        <p className="mt-2 text-sm text-red-500">{coursesError}</p>
                      ) : (
                        <Select
                          value={editData.courseId ? editData.courseId.toString() : '0'}
                          onValueChange={(value) =>
                            setEditData((prev) => ({ ...prev, courseId: parseInt(value, 10) }))
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Chọn khóa học" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0" disabled>
                              Chọn khóa học
                            </SelectItem>
                            {courses.map((course) => (
                              <SelectItem key={course.id} value={course.id.toString()}>
                                {course.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="durationMinutes">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Thời lượng (phút) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="durationMinutes"
                        type="number"
                        value={editData.durationMinutes}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            durationMinutes: parseInt(e.target.value, 10) || 0,
                          }))
                        }
                        min={1}
                        className="mt-1"
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="title">Tiêu đề lớp học <span className="text-red-500">*</span></Label>
                    <Input
                      id="title"
                      value={editData.title}
                      onChange={(e) =>
                        setEditData((prev) => ({ ...prev, title: e.target.value }))
                      }
                      placeholder="Tiêu đề lớp học"
                      className="mt-1"
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Mô tả <span className="text-red-500">*</span></Label>
                    <div className="mt-1">
                      <RichTextEditor
                        value={editData.description}
                        onChange={(value) =>
                          setEditData((prev) => ({ ...prev, description: value }))
                        }
                        placeholder="Mô tả chi tiết về lớp học..."
                        className={saving ? 'pointer-events-none opacity-80' : ''}
                      />
                    </div>
                  </div>

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

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Thông tin Meeting</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="meetingUrl">
                          <LinkIcon className="w-4 h-4 inline mr-1" />
                          Link Meeting <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="meetingUrl"
                          type="url"
                          value={editData.meetingUrl}
                          onChange={(e) =>
                            setEditData((prev) => ({ ...prev, meetingUrl: e.target.value }))
                          }
                          placeholder="https://..."
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
                          value={editData.meetingId}
                          onChange={(e) =>
                            setEditData((prev) => ({ ...prev, meetingId: e.target.value }))
                          }
                          placeholder="123-456-789"
                          className="mt-1"
                          disabled={saving}
                        />
                      </div>
                      <div>
                        <Label htmlFor="meetingPassword">
                          Mật khẩu meeting
                        </Label>
                        <Input
                          id="meetingPassword"
                          type="text"
                          value={editData.meetingPassword}
                          onChange={(e) =>
                            setEditData((prev) => ({ ...prev, meetingPassword: e.target.value }))
                          }
                          placeholder="Nhập mật khẩu (nếu có)"
                          className="mt-1"
                          disabled={saving}
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxParticipants">
                          <Users className="w-4 h-4 inline mr-1" />
                          Số lượng học viên tối đa
                        </Label>
                        <Input
                          id="maxParticipants"
                          type="number"
                          value={editData.maxParticipants ?? ''}
                          onChange={(e) =>
                            setEditData((prev) => ({
                              ...prev,
                              maxParticipants: e.target.value ? parseInt(e.target.value, 10) : undefined,
                            }))
                          }
                          min={1}
                          className="mt-1"
                          disabled={saving}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="chatEnabled">Bật chat</Label>
                        <p className="text-xs text-gray-500">Cho phép học viên chat trong lớp học</p>
                      </div>
                      <Switch
                        id="chatEnabled"
                        checked={editData.chatEnabled}
                        onCheckedChange={(checked) =>
                          setEditData((prev) => ({ ...prev, chatEnabled: checked }))
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
                        checked={editData.recordingEnabled}
                        onCheckedChange={(checked) =>
                          setEditData((prev) => ({ ...prev, recordingEnabled: checked }))
                        }
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={saving}
                    >
                      Hủy
                    </Button>
                    <Button
                      type="submit"
                      disabled={saving}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </Button>
                  </div>
                </form>
              ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-lg border bg-white/60 p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-2">
                      <Calendar className="w-4 h-4" />
                      Lịch học
                    </div>
                    <p className="text-gray-800 capitalize">{scheduledInfo?.date}</p>
                    <p className="text-sm text-gray-500">
                      {scheduledInfo?.time} ({liveClass.durationMinutes} phút)
                    </p>
                  </div>
                  <div className="rounded-lg border bg-white/60 p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-2">
                      <Users className="w-4 h-4" />
                      Thông tin lớp học
                    </div>
                    <p className="text-gray-800">Mã lớp: {liveClass.meetingId}</p>
                    {liveClass.meetingPassword && (
                      <p className="text-sm text-gray-500">
                        Mật khẩu: <span className="font-medium">{liveClass.meetingPassword}</span>
                      </p>
                    )}
                    {liveClass.maxParticipants && (
                      <p className="text-sm text-gray-500">Số lượng tối đa: {liveClass.maxParticipants}</p>
                    )}
                  </div>
                </div>

                <div className="rounded-lg border bg-white/60 p-4 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                    <Video className="w-4 h-4" />
                    Đường dẫn buổi học
                  </div>
                  <a
                    href={liveClass.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:underline break-all"
                  >
                    <LinkIcon className="w-4 h-4" />
                    {liveClass.meetingUrl}
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-lg border bg-white/60 p-4 shadow-sm">
                    <div className="text-sm font-semibold text-gray-600 flex items-center gap-2 mb-2">
                      <Hash className="w-4 h-4" />
                      Ghi hình
                    </div>
                    <p className="text-gray-800">
                      {liveClass.recordingEnabled ? 'Có' : 'Không'}
                    </p>
                    {liveClass.recordingUrl && (
                      <a
                        href={liveClass.recordingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Xem bản ghi
                      </a>
                    )}
                  </div>
                  <div className="rounded-lg border bg-white/60 p-4 shadow-sm">
                    <div className="text-sm font-semibold text-gray-600 mb-2">Trạng thái chat</div>
                    <p className="text-gray-800">
                      {liveClass.chatEnabled ? 'Được bật' : 'Đang tắt'}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-white/60 p-4 shadow-sm">
                    <div className="text-sm font-semibold text-gray-600 mb-2">Khoá học</div>
                    <p className="text-gray-800">
                      {liveClass.courseTitle ?? `Khoá học #${liveClass.courseId}`}
                    </p>
                    <p className="text-sm text-gray-500">
                      Giảng viên: {liveClass.instructorName ?? `ID: ${liveClass.instructorId}`}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">ID khoá học: {liveClass.courseId}</p>
                  </div>
                </div>

                {/* Participants List - Chỉ hiển thị cho instructor/admin */}
                {canEdit && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Danh sách người tham gia ({participants.length}
                        {liveClass.maxParticipants && ` / ${liveClass.maxParticipants}`})
                      </CardTitle>
                      <CardDescription>
                        Danh sách học viên đã tham gia lớp học này
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loadingParticipants ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="mt-2 text-sm text-gray-600">Đang tải danh sách...</p>
                        </div>
                      ) : participantsError ? (
                        <div className="text-center py-8">
                          <p className="text-red-600 text-sm">{participantsError}</p>
                          <Button
                            onClick={fetchParticipants}
                            variant="outline"
                            size="sm"
                            className="mt-4"
                          >
                            Thử lại
                          </Button>
                        </div>
                      ) : participants.length === 0 ? (
                        <div className="text-center py-8">
                          <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                          <p className="text-gray-600">Chưa có người tham gia</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {participants.map((participant) => (
                            <div
                              key={participant.id}
                              className="flex items-center justify-between p-3 rounded-lg border bg-white/60 hover:bg-white transition-colors"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <div className="relative">
                                  {participant.avatar ? (
                                    <img
                                      src={participant.avatar}
                                      alt={participant.fullName || participant.username}
                                      className="w-10 h-10 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                      {(participant.fullName || participant.username).charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 truncate">
                                    {participant.fullName || participant.username}
                                  </p>
                                  {participant.fullName && (
                                    <p className="text-sm text-gray-500 truncate">
                                      @{participant.username}
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-400 mt-1">
                                    Tham gia: {new Date(participant.joinedAt).toLocaleString('vi-VN', {
                                      year: 'numeric',
                                      month: '2-digit',
                                      day: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                {participant.attendanceDuration > 0 && (
                                  <p className="text-sm font-medium text-gray-700">
                                    {Math.floor(participant.attendanceDuration / 60)} phút
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
              )
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">Không tìm thấy thông tin lớp học.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


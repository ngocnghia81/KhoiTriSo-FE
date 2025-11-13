'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2, Save, AlertCircle, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  learningPathApi,
  LearningPath,
  LearningPathCourse,
  UpdateLearningPathRequest,
  AddCourseToLearningPathRequest,
  UpdateLearningPathCourseRequest,
} from '@/services/learningPathApi';
import { useCategories } from '@/hooks/useCategories';
import { FileUpload } from '@/components/FileUpload';
import { RichTextEditor } from '@/components/RichTextEditor';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { useAuth } from '@/contexts/AuthContext';
import {
  buildUrlWithParams,
  extractMessage,
  extractResult,
  isSuccessfulResponse,
  safeJsonParse,
} from '@/utils/apiHelpers';
import { Course } from '@/hooks/useCourses';

const difficultyOptions = [
  { value: 0, label: 'Nhận biết' },
  { value: 1, label: 'Thông hiểu' },
  { value: 2, label: 'Vận dụng thấp' },
  { value: 3, label: 'Vận dụng cao' },
];

export default function EditLearningPathPage() {
  const router = useRouter();
  const params = useParams();
  const learningPathId = Number(params?.id);
  const { categories, loading: categoriesLoading } = useCategories();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [formData, setFormData] = useState<UpdateLearningPathRequest>({});
  const [error, setError] = useState<string | null>(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [pathCourses, setPathCourses] = useState<LearningPathCourse[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [courseActionLoading, setCourseActionLoading] = useState<number | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [courseSearchTerm, setCourseSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [searchingCourses, setSearchingCourses] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [newCourseOrder, setNewCourseOrder] = useState<number>(1);
  const [newCourseRequired, setNewCourseRequired] = useState<boolean>(true);
  const [addingCourse, setAddingCourse] = useState(false);
  const [pendingOrders, setPendingOrders] = useState<Record<number, number>>({});
  useEffect(() => {
    const fetchLearningPath = async () => {
      if (!learningPathId) return;
      try {
        setLoading(true);
        const data = await learningPathApi.getLearningPathById(learningPathId);
        setLearningPath(data);
        setFormData({
          title: data.title,
          description: data.description,
          thumbnail: data.thumbnail,
          categoryId: data.categoryId,
          estimatedDuration: data.estimatedDuration,
          difficultyLevel: data.difficultyLevel,
          price: data.price,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Không thể tải thông tin lộ trình';
        setError(message);
        console.error('EditLearningPath', err);
      } finally {
        setLoading(false);
      }
    };

    if (Number.isFinite(learningPathId)) {
      fetchLearningPath();
    }
  }, [learningPathId]);

  const fetchLearningPathCourses = useCallback(async () => {
    if (!learningPathId) return;
    try {
      setCoursesLoading(true);
      const courses = await learningPathApi.getLearningPathCourses(learningPathId);
      setPathCourses(courses.sort((a, b) => a.orderIndex - b.orderIndex));
      setPendingOrders({});
    } catch (err) {
      console.error('Fetch learning path courses error:', err);
      setError((prev) =>
        prev ?? (err instanceof Error ? err.message : 'Không thể tải danh sách khóa học')
      );
    } finally {
      setCoursesLoading(false);
    }
  }, [learningPathId]);

  const searchCourses = useCallback(
    async (term: string) => {
      try {
        setSearchingCourses(true);
        const url = buildUrlWithParams('/api/courses', {
          search: term || undefined,
          page: 1,
          pageSize: 10,
          approvalStatus: 2,
        });

        const response = await authenticatedFetch(url);
        const parsed = await safeJsonParse(response);
        if (!isSuccessfulResponse(parsed)) {
          throw new Error(extractMessage(parsed));
        }

        const result = extractResult(parsed);
        const items =
          result?.Items ??
          result?.items ??
          result?.Result?.Items ??
          result?.Result?.items ??
          [];

        const mapped: Course[] = items.map((course: any) => ({
          id: course.Id ?? course.id,
          title: course.Title ?? course.title ?? '',
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
                name: course.Instructor.Name ?? course.Instructor.name ?? '',
                avatar: course.Instructor.Avatar ?? course.Instructor.avatar,
                bio: course.Instructor.Bio ?? course.Instructor.bio,
              }
            : undefined,
          level: course.Level ?? course.level,
          isFree: course.IsFree ?? course.isFree,
          price: course.Price ?? course.price ?? 0,
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

        // Filter: chỉ hiển thị courses của instructor hiện tại (trừ Admin)
        const currentUserId = user?.id ? Number(user.id) : null;
        const isAdmin = user?.role === 'admin';
        
        let filtered = mapped;
        if (!isAdmin && currentUserId) {
          // Chỉ lấy courses của instructor hiện tại
          filtered = mapped.filter(
            (course) => course.instructorId === currentUserId
          );
        }

        // Loại bỏ courses đã có trong lộ trình
        const available = filtered.filter(
          (course) => !pathCourses.some((pc) => pc.courseId === course.id)
        );
        setSearchResults(available);
      } catch (err) {
        console.error('Search courses error:', err);
        setError(err instanceof Error ? err.message : 'Không thể tìm kiếm khóa học');
      } finally {
        setSearchingCourses(false);
      }
    },
    [authenticatedFetch, pathCourses, user]
  );

  useEffect(() => {
    if (!Number.isFinite(learningPathId)) return;
    fetchLearningPathCourses();
  }, [fetchLearningPathCourses, learningPathId]);

  useEffect(() => {
    if (!addDialogOpen) return;
    setCourseSearchTerm('');
    setSelectedCourse(null);
    setNewCourseOrder(pathCourses.length + 1);
    setNewCourseRequired(true);
  }, [addDialogOpen, pathCourses.length]);

  useEffect(() => {
    if (!addDialogOpen) return;
    const handler = setTimeout(() => {
      searchCourses(courseSearchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [addDialogOpen, courseSearchTerm, searchCourses]);

  const handleAddCourse = async () => {
    if (!learningPathId || !selectedCourse) return;
    try {
      setAddingCourse(true);
      const payload: AddCourseToLearningPathRequest = {
        courseId: selectedCourse.id,
        orderIndex:
          Number.isFinite(newCourseOrder) && newCourseOrder > 0
            ? newCourseOrder
            : pathCourses.length + 1,
        isRequired: newCourseRequired,
      };

      const added = await learningPathApi.addCourseToLearningPath(learningPathId, payload);
      setPathCourses((prev) =>
        [...prev, added].sort((a, b) => a.orderIndex - b.orderIndex)
      );
      setLearningPath((prev) =>
        prev ? { ...prev, courseCount: (prev.courseCount ?? 0) + 1 } : prev
      );
      setAddDialogOpen(false);
      searchCourses(courseSearchTerm);
    } catch (err) {
      console.error('Add course to path error:', err);
      setError(err instanceof Error ? err.message : 'Không thể thêm khóa học vào lộ trình');
    } finally {
      setAddingCourse(false);
    }
  };

  const handleUpdateCourse = async (
    courseId: number,
    updates: UpdateLearningPathCourseRequest
  ) => {
    if (!learningPathId) return;
    if (
      updates.orderIndex === undefined &&
      updates.isRequired === undefined
    ) {
      return;
    }

    try {
      setCourseActionLoading(courseId);
      const updated = await learningPathApi.updateLearningPathCourse(
        learningPathId,
        courseId,
        updates
      );
      setPathCourses((prev) =>
        prev
          .map((course) => (course.courseId === courseId ? updated : course))
          .sort((a, b) => a.orderIndex - b.orderIndex)
      );
      setPendingOrders((prev) => {
        const next = { ...prev };
        delete next[courseId];
        return next;
      });
    } catch (err) {
      console.error('Update course in path error:', err);
      setError(err instanceof Error ? err.message : 'Không thể cập nhật khóa học trong lộ trình');
    } finally {
      setCourseActionLoading(null);
    }
  };

  const handleRemoveCourse = async (courseId: number) => {
    if (!learningPathId) return;
    if (!confirm('Bạn có chắc chắn muốn xóa khóa học này khỏi lộ trình?')) return;

    try {
      setCourseActionLoading(courseId);
      await learningPathApi.removeLearningPathCourse(learningPathId, courseId);
      setPathCourses((prev) => prev.filter((course) => course.courseId !== courseId));
      setLearningPath((prev) =>
        prev
          ? { ...prev, courseCount: Math.max(0, (prev.courseCount ?? 1) - 1) }
          : prev
      );
      setPendingOrders((prev) => {
        const next = { ...prev };
        delete next[courseId];
        return next;
      });
    } catch (err) {
      console.error('Remove course from path error:', err);
      setError(err instanceof Error ? err.message : 'Không thể xóa khóa học khỏi lộ trình');
    } finally {
      setCourseActionLoading(null);
    }
  };

  const handleChange = (field: keyof UpdateLearningPathRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!learningPathId) return;

    try {
      setSubmitting(true);
      setError(null);

      const payload: UpdateLearningPathRequest = {
        title: formData.title?.trim() || undefined,
        description: formData.description?.trim() || undefined,
        thumbnail: formData.thumbnail?.trim() || undefined,
        categoryId: formData.categoryId,
        estimatedDuration: formData.estimatedDuration,
        difficultyLevel: formData.difficultyLevel,
        price: formData.price,
      };

      await learningPathApi.updateLearningPath(learningPathId, payload);
      router.push('/dashboard/courses/learning-paths');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể cập nhật lộ trình học';
      setError(message);
      console.error('EditLearningPathSubmit', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center h-64 text-gray-500">
        Đang tải dữ liệu...
      </div>
    );
  }

  if (!learningPath) {
    return (
      <div className="p-4 md:p-6">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
          Không tìm thấy lộ trình học
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Chỉnh sửa lộ trình học</h1>
          <p className="text-gray-500 mt-1">
            Cập nhật thông tin và trạng thái lộ trình{' '}
            <span className="font-semibold">{learningPath.title}</span>
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
            <CardDescription>Điều chỉnh tiêu đề, mô tả và ảnh đại diện</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tên lộ trình *</Label>
              <Input
                id="title"
                value={formData.title ?? ''}
                onChange={(e) => handleChange('title', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả *</Label>
              <RichTextEditor
                value={formData.description ?? ''}
                onChange={(value) => handleChange('description', value)}
                placeholder="Cập nhật mô tả chi tiết cho lộ trình..."
              />
              <p className="text-xs text-gray-500">
                Nội dung HTML sẽ được hiển thị cho học viên như bạn định dạng tại đây.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Ảnh đại diện</Label>
              <div className="grid gap-3">
                <FileUpload
                  accept="image/*"
                  maxSize={5 * 1024 * 1024}
                  folder="learning-paths"
                  accessRole="GUEST"
                  disabled={uploadingThumbnail}
                  onUploadStart={() => setUploadingThumbnail(true)}
                  onUploadComplete={(result) => {
                    handleChange('thumbnail', result.url);
                    setUploadingThumbnail(false);
                  }}
                  onUploadError={(message) => {
                    setUploadingThumbnail(false);
                    alert(message);
                  }}
                />
                {formData.thumbnail && (
                  <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <img
                      src={formData.thumbnail}
                      alt="Learning path thumbnail"
                      className="w-24 h-24 rounded-md object-cover border border-slate-200"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 break-all">{formData.thumbnail}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-red-500"
                        onClick={() => handleChange('thumbnail', undefined)}
                      >
                        Xóa ảnh
                      </Button>
                    </div>
                  </div>
                )}
                {!formData.thumbnail && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <ImageIcon className="w-4 h-4" />
                    JPG hoặc PNG, tối đa 5MB. Bạn cũng có thể dán URL ảnh thủ công.
                  </div>
                )}
                <Input
                  placeholder="Hoặc dán URL ảnh..."
                  value={formData.thumbnail ?? ''}
                  onChange={(e) => handleChange('thumbnail', e.target.value || undefined)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cấu hình lộ trình</CardTitle>
            <CardDescription>Cập nhật danh mục, độ khó và giá bán</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Danh mục *</Label>
              <Select
                value={formData.categoryId ? String(formData.categoryId) : undefined}
                onValueChange={(value) => handleChange('categoryId', Number(value))}
                disabled={categoriesLoading || categories.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem value={String(category.id)} key={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Độ khó *</Label>
              <Select
                value={formData.difficultyLevel !== undefined ? String(formData.difficultyLevel) : undefined}
                onValueChange={(value) => handleChange('difficultyLevel', Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn độ khó" />
                </SelectTrigger>
                <SelectContent>
                  {difficultyOptions.map((option) => (
                    <SelectItem key={option.value} value={String(option.value)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedDuration">Thời lượng dự kiến (giờ)</Label>
              <Input
                id="estimatedDuration"
                type="number"
                min={1}
                value={formData.estimatedDuration ?? ''}
                onChange={(e) =>
                  handleChange(
                    'estimatedDuration',
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Giá bán (VNĐ) *</Label>
              <Input
                id="price"
                type="number"
                min={0}
                step={1000}
                value={formData.price !== undefined ? String(formData.price) : '0'}
                onChange={(e) => handleChange('price', Number(e.target.value) || 0)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting}>
            Hủy
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Lưu thay đổi
              </>
            )}
          </Button>
        </div>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>Khóa học trong lộ trình</CardTitle>
          <CardDescription>Thêm, sắp xếp và quản lý các khóa học thuộc lộ trình này</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-500">
              {coursesLoading
                ? 'Đang tải danh sách khóa học...'
                : `Hiện có ${pathCourses.length} khóa học trong lộ trình`}
            </div>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm khóa học
            </Button>
          </div>

          {coursesLoading ? (
            <div className="flex items-center justify-center h-24 text-gray-500">
              Đang tải dữ liệu...
            </div>
          ) : pathCourses.length === 0 ? (
            <div className="text-sm text-gray-500">
              Lộ trình chưa có khóa học nào. Nhấn "Thêm khóa học" để bắt đầu.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-28">Thứ tự</TableHead>
                    <TableHead>Khóa học</TableHead>
                    <TableHead className="w-32">Bắt buộc</TableHead>
                    <TableHead className="w-32">Giá</TableHead>
                    <TableHead className="w-24 text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pathCourses.map((course) => {
                    const currentOrder =
                      pendingOrders[course.courseId] ?? course.orderIndex;
                    return (
                      <TableRow key={course.id}>
                        <TableCell>
                          <Input
                            type="number"
                            min={1}
                            value={currentOrder}
                            onChange={(e) =>
                              setPendingOrders((prev) => ({
                                ...prev,
                                [course.courseId]: Number(e.target.value),
                              }))
                            }
                            onBlur={(e) => {
                              const value = Number(e.target.value);
                              if (Number.isNaN(value) || value <= 0) {
                                setPendingOrders((prev) => {
                                  const next = { ...prev };
                                  delete next[course.courseId];
                                  return next;
                                });
                                return;
                              }
                              if (value !== course.orderIndex) {
                                handleUpdateCourse(course.courseId, {
                                  orderIndex: value,
                                });
                              }
                            }}
                            disabled={courseActionLoading === course.courseId}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-gray-900">
                            {course.course?.title ?? `Khóa học #${course.courseId}`}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {course.courseId}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={course.isRequired}
                            onCheckedChange={(checked) =>
                              handleUpdateCourse(course.courseId, { isRequired: checked })
                            }
                            disabled={courseActionLoading === course.courseId}
                          />
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {course.course?.price
                            ? `${course.course.price.toLocaleString('vi-VN')} VNĐ`
                            : 'Miễn phí'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => handleRemoveCourse(course.courseId)}
                            disabled={courseActionLoading === course.courseId}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thêm khóa học vào lộ trình</DialogTitle>
            <DialogDescription>
              Tìm kiếm và lựa chọn khóa học để thêm vào lộ trình. Bạn có thể thay đổi thứ tự và trạng thái bắt buộc sau khi thêm.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="courseSearch">Tìm kiếm khóa học</Label>
              <Input
                id="courseSearch"
                placeholder="Nhập tên khóa học..."
                value={courseSearchTerm}
                onChange={(e) => setCourseSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-2">
              {searchingCourses ? (
                <div className="text-sm text-gray-500">Đang tìm kiếm khóa học...</div>
              ) : searchResults.length === 0 ? (
                <div className="text-sm text-gray-500">
                  Không tìm thấy khóa học phù hợp hoặc tất cả khóa học đã có trong lộ trình.
                </div>
              ) : (
                searchResults.map((course) => (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => setSelectedCourse(course)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      selectedCourse?.id === course.id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{course.title}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      ID: {course.id}{' '}
                      {course.category?.name ? `• ${course.category.name}` : ''}
                    </div>
                  </button>
                ))
              )}
            </div>

            {selectedCourse && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newCourseOrder">Thứ tự</Label>
                  <Input
                    id="newCourseOrder"
                    type="number"
                    min={1}
                    value={newCourseOrder}
                    onChange={(e) => setNewCourseOrder(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bắt buộc</Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={newCourseRequired}
                      onCheckedChange={(checked) => setNewCourseRequired(checked)}
                    />
                    <span className="text-sm text-gray-600">
                      {newCourseRequired ? 'Khóa học bắt buộc' : 'Khóa học tự chọn'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleAddCourse}
              disabled={!selectedCourse || addingCourse}
            >
              {addingCourse ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang thêm...
                </>
              ) : (
                'Thêm vào lộ trình'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}



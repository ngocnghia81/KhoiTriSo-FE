'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Save, Upload, AlertCircle, Image as ImageIcon } from 'lucide-react';
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
import { learningPathApi, CreateLearningPathRequest } from '@/services/learningPathApi';
import { useCategories } from '@/hooks/useCategories';
import { FileUpload } from '@/components/FileUpload';
import { RichTextEditor } from '@/components/RichTextEditor';

const difficultyOptions = [
  { value: 0, label: 'Nhận biết' },
  { value: 1, label: 'Thông hiểu' },
  { value: 2, label: 'Vận dụng thấp' },
  { value: 3, label: 'Vận dụng cao' },
];

export default function CreateLearningPathPage() {
  const router = useRouter();
  const { categories, loading: categoriesLoading } = useCategories();

  const [formData, setFormData] = useState<CreateLearningPathRequest>({
    title: '',
    description: '',
    thumbnail: '',
    categoryId: 0,
    estimatedDuration: undefined,
    difficultyLevel: 0,
    price: 0,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  useEffect(() => {
    if (categories.length > 0 && formData.categoryId === 0) {
      setFormData((prev) => ({ ...prev, categoryId: categories[0].id }));
    }
  }, [categories]);

  const handleChange = (field: keyof CreateLearningPathRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const stripHtml = (html?: string) =>
    html ? html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : '';

  const validate = () => {
    if (!formData.title.trim()) {
      setError('Vui lòng nhập tên lộ trình');
      return false;
    }

    if (!stripHtml(formData.description)) {
      setError('Vui lòng nhập mô tả cho lộ trình');
      return false;
    }

    if (!formData.categoryId) {
      setError('Vui lòng chọn danh mục');
      return false;
    }

    if (formData.price < 0) {
      setError('Giá bán không hợp lệ');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      setError(null);

      const payload: CreateLearningPathRequest = {
        ...formData,
        thumbnail: formData.thumbnail?.trim() || undefined,
        estimatedDuration: formData.estimatedDuration || undefined,
      };

      await learningPathApi.createLearningPath(payload);
      router.push('/dashboard/courses/learning-paths');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tạo lộ trình học';
      setError(message);
      console.error('CreateLearningPath', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Tạo lộ trình học mới</h1>
          <p className="text-gray-500 mt-1">
            Xây dựng lộ trình với các khóa học phù hợp dành cho học viên
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
            <CardDescription>Điền các thông tin tổng quan cho lộ trình</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tên lộ trình *</Label>
              <Input
                id="title"
                placeholder="Ví dụ: Lộ trình chinh phục ngữ pháp IELTS trong 90 ngày"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả *</Label>
              <RichTextEditor
                value={formData.description}
                onChange={(value) => handleChange('description', value)}
                placeholder="Mô tả chi tiết về nội dung, mục tiêu và lợi ích của lộ trình..."
              />
              <p className="text-xs text-gray-500">
                Bạn có thể định dạng nội dung (in đậm, danh sách, liên kết, v.v.)
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
                        onClick={() => handleChange('thumbnail', '')}
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
                  onChange={(e) => handleChange('thumbnail', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cấu hình lộ trình</CardTitle>
            <CardDescription>Lựa chọn danh mục, độ khó và thời lượng dự kiến</CardDescription>
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
                value={String(formData.difficultyLevel)}
                onValueChange={(value) => handleChange('difficultyLevel', Number(value))}
              >
                <SelectTrigger>
                  <SelectValue />
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
                placeholder="Ví dụ: 120"
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
                value={Number(formData.price).toString()}
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
                Đang tạo...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Tạo lộ trình
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}



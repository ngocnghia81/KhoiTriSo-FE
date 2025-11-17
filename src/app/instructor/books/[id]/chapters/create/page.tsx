'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/RichTextEditor';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { bookApiService } from '@/services/bookApi';

export default function CreateBookChapterPage() {
  const params = useParams();
  const router = useRouter();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const bookId = params?.id ? parseInt(params.id as string) : null;

  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chapters, setChapters] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    orderIndex: 0,
    isPublished: false,
  });

  useEffect(() => {
    if (!bookId || isNaN(bookId)) {
      setError('ID sách không hợp lệ');
      setLoading(false);
      return;
    }

    fetchBookData();
  }, [bookId]);

  const fetchBookData = async () => {
    if (!bookId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch book details
      const bookData = await bookApiService.getBookById(bookId);
      setBook(bookData);

      // Fetch existing chapters to determine next order index
      const chaptersData = await bookApiService.getBookChapters(bookId);
      setChapters(chaptersData);
      
      // Set default order index to be after the last chapter
      const maxOrderIndex = chaptersData.length > 0 
        ? Math.max(...chaptersData.map(c => c.orderIndex || 0))
        : 0;
      setFormData(prev => ({ ...prev, orderIndex: maxOrderIndex + 1 }));
    } catch (err: any) {
      console.error('Error fetching book data:', err);
      setError(err.message || 'Không thể tải thông tin sách');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookId) {
      setError('ID sách không hợp lệ');
      return;
    }

    if (!formData.title.trim()) {
      setError('Vui lòng nhập tiêu đề chương');
      return;
    }

    if (!formData.content.trim()) {
      setError('Vui lòng nhập nội dung chương');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const requestBody = {
        title: formData.title.trim(),
        description: formData.content.trim(),
        orderIndex: formData.orderIndex,
      };

      const response = await authenticatedFetch(
        `/api/books/${bookId}/chapters`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.Message || errorData.message || 'Không thể tạo chương');
      }

      const result = await response.json();
      console.log('Chapter created successfully:', result);

      // Navigate to the newly created chapter detail page
      const createdChapterId = result.Result?.Id || result.Result?.id || result.result?.Id || result.result?.id;
      if (createdChapterId) {
        router.push(`/instructor/books/${bookId}/chapters/${createdChapterId}`);
      } else {
        // If we can't get the chapter ID, navigate back to book detail
        router.push(`/instructor/books/${bookId}`);
      }
    } catch (err: any) {
      console.error('Error creating chapter:', err);
      setError(err.message || 'Không thể tạo chương');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !book) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
              <Button
                variant="outline"
                onClick={() => router.push(`/instructor/books/${bookId}`)}
                className="mt-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push(`/instructor/books/${bookId}`)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {book?.title && `${book.title} - `}Tạo chương mới
            </h1>
            <p className="text-gray-600 mt-2">Thêm chương mới vào sách</p>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50 mb-6">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Chapter Form */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md mb-6">
          <CardHeader>
            <CardTitle>Thông tin chương</CardTitle>
            <CardDescription>
              Điền thông tin để tạo chương mới
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor="title">Tiêu đề chương</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Nhập tiêu đề chương..."
                className="mt-1"
                disabled={saving}
              />
            </div>

            {/* Content */}
            <div>
              <Label htmlFor="content">Nội dung chương</Label>
              <div className="mt-1">
                <RichTextEditor
                  value={formData.content}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, content: value }))
                  }
                  placeholder="Nhập nội dung chương..."
                  className="bg-white min-h-[300px]"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Bạn có thể sử dụng các công cụ định dạng để làm nổi bật nội dung
              </p>
            </div>

            {/* Order Index */}
            <div>
              <Label htmlFor="orderIndex">Thứ tự chương</Label>
              <Input
                id="orderIndex"
                type="number"
                value={formData.orderIndex}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    orderIndex: parseInt(e.target.value) || 0,
                  }))
                }
                placeholder="Thứ tự"
                className="mt-1"
                min="0"
                disabled={saving}
              />
              <p className="text-xs text-gray-500 mt-1">
                Chương sẽ được sắp xếp theo thứ tự này. Mặc định: {chapters.length + 1}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/instructor/books/${bookId}`)}
            disabled={saving}
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={saving || !formData.title.trim() || !formData.content.trim()}
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
                Tạo chương
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}


'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  BookOpenIcon,
  ArrowLeftIcon,
  PhotoIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  TagIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useBook, useUpdateBook } from '@/hooks/useBooks';
import { useCategories } from '@/hooks/useCategories';
import { UpdateBookRequest } from '@/types/book';

const updateBookSchema = z.object({
  title: z.string().min(1, 'Tiêu đề sách là bắt buộc').max(200, 'Tiêu đề không được quá 200 ký tự'),
  description: z.string().min(1, 'Mô tả sách là bắt buộc').max(2000, 'Mô tả không được quá 2000 ký tự'),
  isbn: z.string().optional(),
  price: z.number().min(0, 'Giá sách phải lớn hơn hoặc bằng 0'),
  categoryId: z.number().min(1, 'Vui lòng chọn danh mục'),
});

type UpdateBookFormData = z.infer<typeof updateBookSchema>;

interface EditBookPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditBookPage({ params }: EditBookPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const bookId = parseInt(resolvedParams.id);
  const [coverImage, setCoverImage] = useState<string>('');

  const { data: book, loading: bookLoading, error: bookError } = useBook(bookId);
  const { updateBook, loading, error } = useUpdateBook();
  const { categories, loading: categoriesLoading } = useCategories();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<UpdateBookFormData>({
    resolver: zodResolver(updateBookSchema),
    defaultValues: {
      title: '',
      description: '',
      isbn: '',
      price: 0,
      categoryId: 0,
    },
  });

  // Set form values when book data is loaded
  useEffect(() => {
    if (book) {
      setValue('title', book.title);
      setValue('description', book.description);
      setValue('isbn', book.isbn || '');
      setValue('price', book.price);
      setValue('categoryId', book.categoryId);
      if (book.coverImage) {
        setCoverImage(book.coverImage);
      }
    }
  }, [book, setValue]);

  const onSubmit = async (data: UpdateBookFormData) => {
    const request: UpdateBookRequest = {
      title: data.title,
      description: data.description,
      isbn: data.isbn || undefined,
      price: data.price,
      categoryId: data.categoryId,
      coverImage: coverImage || undefined,
    };

    const result = await updateBook(bookId, request);
    if (result) {
      router.push(`/dashboard/books/${bookId}`);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (bookLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (bookError || !book) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">{bookError || 'Không tìm thấy sách'}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Chỉnh sửa sách</h1>
            <p className="text-sm text-gray-600">Cập nhật thông tin sách: {book.title}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-lg rounded-xl">
            <div className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Thông tin cơ bản
                  </h3>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tiêu đề sách *
                    </label>
                    <input
                      {...register('title')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập tiêu đề sách..."
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mô tả sách *
                    </label>
                    <textarea
                      {...register('description')}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập mô tả chi tiết về sách..."
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                    )}
                  </div>

                  {/* ISBN */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ISBN (tùy chọn)
                    </label>
                    <input
                      {...register('isbn')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="978-604-0-12345-1"
                    />
                    {errors.isbn && (
                      <p className="mt-1 text-sm text-red-600">{errors.isbn.message}</p>
                    )}
                  </div>
                </div>

                {/* Pricing and Category */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <CurrencyDollarIcon className="h-5 w-5 mr-2 text-green-600" />
                    Giá và phân loại
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giá sách (VNĐ) *
                      </label>
                      <input
                        {...register('price', { valueAsNumber: true })}
                        type="number"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                      />
                      {errors.price && (
                        <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                      )}
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Danh mục *
                      </label>
                      <select
                        {...register('categoryId', { valueAsNumber: true })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={categoriesLoading}
                      >
                        <option value={0}>Chọn danh mục...</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {errors.categoryId && (
                        <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <XCircleIcon className="h-5 w-5 text-red-600 mr-2" />
                      <p className="text-red-800">{error}</p>
                    </div>
                  </div>
                )}

                {/* Submit buttons */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Đang cập nhật...' : 'Cập nhật sách'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Cover Image */}
          <div className="bg-white shadow-lg rounded-xl">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <PhotoIcon className="h-5 w-5 mr-2 text-purple-600" />
                Bìa sách
              </h3>

              <div className="space-y-4">
                {/* Image preview */}
                <div className="aspect-[3/4] bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  {coverImage ? (
                    <img
                      src={coverImage}
                      alt="Book cover preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-center">
                      <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Chưa có hình ảnh</p>
                    </div>
                  )}
                </div>

                {/* Upload button */}
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="cover-upload"
                  />
                  <label
                    htmlFor="cover-upload"
                    className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer text-center block"
                  >
                    Chọn hình ảnh
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Book Info */}
          <div className="bg-white shadow-lg rounded-xl">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircleIcon className="h-5 w-5 mr-2 text-green-600" />
                Thông tin sách
              </h3>

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>ID sách:</span>
                  <span className="font-medium">{book.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Trạng thái:</span>
                  <span className={`font-medium ${
                    book.isActive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {book.isActive ? 'Đang bán' : 'Tạm dừng'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Duyệt:</span>
                  <span className={`font-medium ${
                    book.approvalStatus === 0 ? 'text-yellow-600' :
                    book.approvalStatus === 1 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {book.approvalStatus === 0 ? 'Chờ duyệt' :
                     book.approvalStatus === 1 ? 'Đã duyệt' : 'Từ chối'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Ngày tạo:</span>
                  <span className="font-medium">
                    {new Date(book.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Cập nhật:</span>
                  <span className="font-medium">
                    {new Date(book.updatedAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

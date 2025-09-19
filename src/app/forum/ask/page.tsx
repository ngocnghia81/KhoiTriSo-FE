'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  QuestionMarkCircleIcon,
  TagIcon,
  BookOpenIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface FormData {
  title: string;
  content: string;
  category: string;
  tags: string[];
  isAnonymous: boolean;
}

const categories = [
  { value: 'math', label: 'Toán học', description: 'Đại số, Hình học, Giải tích, Xác suất thống kê' },
  { value: 'physics', label: 'Vật lý', description: 'Cơ học, Điện học, Quang học, Vật lý hiện đại' },
  { value: 'chemistry', label: 'Hóa học', description: 'Hóa vô cơ, Hóa hữu cơ, Hóa phân tích' },
  { value: 'biology', label: 'Sinh học', description: 'Sinh học tế bào, Di truyền học, Sinh thái học' },
  { value: 'literature', label: 'Văn học', description: 'Văn học Việt Nam, Văn học thế giới' },
  { value: 'english', label: 'Tiếng Anh', description: 'Ngữ pháp, Từ vựng, Giao tiếp' },
  { value: 'general', label: 'Tổng quát', description: 'Câu hỏi chung về học tập và phương pháp' }
];

const popularTags = [
  'đạo hàm', 'tích phân', 'phương trình', 'bất phương trình', 'hình học',
  'dao động', 'sóng', 'điện học', 'quang học', 'nhiệt học',
  'phản ứng', 'cân bằng', 'dung dịch', 'hóa hữu cơ', 'kim loại',
  'ngữ pháp', 'từ vựng', 'văn phạm', 'thi THPT', 'ôn tập'
];

export default function AskQuestionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    category: '',
    tags: [],
    isAnonymous: false
  });
  
  const [currentTag, setCurrentTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !formData.tags.includes(trimmedTag) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(currentTag);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Vui lòng nhập tiêu đề câu hỏi';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Tiêu đề phải có ít nhất 10 ký tự';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Vui lòng mô tả chi tiết câu hỏi của bạn';
    } else if (formData.content.length < 20) {
      newErrors.content = 'Mô tả phải có ít nhất 20 ký tự';
    }

    if (!formData.category) {
      newErrors.category = 'Vui lòng chọn danh mục';
    }

    if (formData.tags.length === 0) {
      newErrors.tags = 'Vui lòng thêm ít nhất 1 tag';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real app, this would call API to create question
      console.log('Submitting question:', formData);
      
      // Redirect to forum or the new question page
      router.push('/forum');
    } catch (error) {
      console.error('Error submitting question:', error);
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = categories.find(cat => cat.value === formData.category);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/" className="text-gray-700 hover:text-blue-600">
                  Trang chủ
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <Link href="/forum" className="text-gray-700 hover:text-blue-600">
                    Diễn đàn
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-gray-500">Đặt câu hỏi</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <QuestionMarkCircleIcon className="mx-auto h-12 w-12 text-blue-500 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">Đặt câu hỏi</h1>
            <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
              Chia sẻ thắc mắc của bạn với cộng đồng. Hãy mô tả rõ ràng và chi tiết để nhận được câu trả lời tốt nhất.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề câu hỏi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Ví dụ: Cách tính đạo hàm của hàm số y = x³ + 2x² - 5x + 3"
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Tiêu đề ngắn gọn, rõ ràng và mô tả chính xác vấn đề của bạn
                </p>
              </div>

              {/* Category */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Danh mục <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.category ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                {selectedCategory && (
                  <p className="mt-1 text-sm text-gray-500">{selectedCategory.description}</p>
                )}
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                )}
              </div>

              {/* Content */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                    Mô tả chi tiết <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    <EyeIcon className="w-4 h-4 inline mr-1" />
                    {showPreview ? 'Chỉnh sửa' : 'Xem trước'}
                  </button>
                </div>
                
                {!showPreview ? (
                  <textarea
                    id="content"
                    rows={8}
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder="Mô tả chi tiết câu hỏi của bạn. Bạn có thể:&#10;- Giải thích bối cảnh và những gì bạn đã thử&#10;- Đính kèm hình ảnh nếu cần&#10;- Chỉ ra phần nào bạn không hiểu&#10;- Chia sẻ kết quả mong đợi"
                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      errors.content ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                ) : (
                  <div className="min-h-[200px] p-3 border rounded-md bg-gray-50">
                    <div className="prose prose-sm max-w-none">
                      {formData.content ? (
                        <div className="whitespace-pre-wrap">{formData.content}</div>
                      ) : (
                        <p className="text-gray-500 italic">Chưa có nội dung...</p>
                      )}
                    </div>
                  </div>
                )}
                
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Mô tả càng chi tiết, bạn càng có khả năng nhận được câu trả lời chính xác
                </p>
              </div>

              {/* Tags */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags <span className="text-red-500">*</span>
                </label>
                
                {/* Current tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      <TagIcon className="w-3 h-3 mr-1" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add new tag */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={handleTagKeyPress}
                    placeholder="Nhập tag và nhấn Enter"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    disabled={formData.tags.length >= 5}
                  />
                  <button
                    type="button"
                    onClick={() => addTag(currentTag)}
                    disabled={!currentTag.trim() || formData.tags.length >= 5}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Popular tags */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">Tags phổ biến:</p>
                  <div className="flex flex-wrap gap-1">
                    {popularTags.slice(0, 10).map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => addTag(tag)}
                        disabled={formData.tags.includes(tag) || formData.tags.length >= 5}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {errors.tags && (
                  <p className="mt-1 text-sm text-red-600">{errors.tags}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Tối đa 5 tags. Tags giúp người khác tìm thấy câu hỏi của bạn dễ dàng hơn.
                </p>
              </div>

              {/* Options */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Tùy chọn</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isAnonymous}
                      onChange={(e) => handleInputChange('isAnonymous', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Đặt câu hỏi ẩn danh</span>
                  </label>
                  <p className="text-xs text-gray-500 ml-6">
                    Tên của bạn sẽ không hiển thị công khai với câu hỏi này
                  </p>
                </div>
              </div>

              {/* Submit buttons */}
              <div className="flex justify-between">
                <Link
                  href="/forum"
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Hủy
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Đang đăng...' : 'Đăng câu hỏi'}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Tips */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-4">
                <InformationCircleIcon className="w-5 h-5 mr-2 text-blue-500" />
                Mẹo để có câu trả lời tốt
              </h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Tìm kiếm trước khi đặt câu hỏi để tránh trùng lặp</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Viết tiêu đề rõ ràng, cụ thể về vấn đề</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Mô tả chi tiết những gì bạn đã thử</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Sử dụng tags phù hợp để dễ tìm kiếm</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Đính kèm hình ảnh nếu cần thiết</span>
                </li>
              </ul>
            </div>

            {/* Guidelines */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-4">
                <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-amber-500" />
                Quy tắc cộng đồng
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Tôn trọng mọi người trong cộng đồng</li>
                <li>• Không spam hoặc đăng nội dung không phù hợp</li>
                <li>• Không sao chép bài tập để làm hộ</li>
                <li>• Cung cấp thông tin chính xác và hữu ích</li>
                <li>• Báo cáo nội dung vi phạm khi phát hiện</li>
              </ul>
              <div className="mt-4 p-3 bg-amber-50 rounded-md">
                <p className="text-xs text-amber-800">
                  <strong>Lưu ý:</strong> Câu hỏi vi phạm quy tắc sẽ bị xóa và tài khoản có thể bị khóa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

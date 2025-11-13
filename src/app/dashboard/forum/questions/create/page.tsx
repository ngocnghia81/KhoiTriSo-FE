'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { forumApiService, ForumCategory, ForumTag } from '@/services/forumApi';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { RichTextEditor } from '@/components/RichTextEditor';

export default function CreateQuestionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [tags, setTags] = useState<ForumTag[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    loadCategories();
    loadTags();
  }, [user, router]);

  const loadCategories = async () => {
    try {
      const data = await forumApiService.getCategories();
      setCategories(data.filter(c => c.isActive));
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const loadTags = async () => {
    try {
      const data = await forumApiService.getTags(100);
      setTags(data.filter(t => t.isActive));
    } catch (err) {
      console.error('Error loading tags:', err);
    }
  };

  const handleAddTag = (tagName: string) => {
    if (tagName.trim() && !selectedTags.includes(tagName.trim()) && selectedTags.length < 10) {
      setSelectedTags([...selectedTags, tagName.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || title.length < 10) {
      setError('Tiêu đề phải có ít nhất 10 ký tự');
      return;
    }

    if (!content.trim() || content.length < 20) {
      setError('Nội dung phải có ít nhất 20 ký tự');
      return;
    }

    if (!user?.id) {
      setError('Vui lòng đăng nhập');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const selectedCategoryObj = categories.find(c => c.id === selectedCategory);
      const question = await forumApiService.createQuestion({
        title: title.trim(),
        content: content.trim(),
        userId: parseInt(user.id) || 0,
        userName: user.name || 'User',
        userAvatar: user.avatar,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        categoryId: selectedCategory || undefined,
        categoryName: selectedCategoryObj?.name,
      });

      router.push(`/dashboard/forum/questions/${question.id}`);
    } catch (err: any) {
      setError(err.message || 'Không thể tạo câu hỏi');
      console.error('Error creating question:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard/forum/questions"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Quay lại danh sách
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Đặt câu hỏi mới</h1>
          <p className="mt-2 text-sm text-gray-600">
            Chia sẻ kiến thức và nhận được sự giúp đỡ từ cộng đồng
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Cách giải phương trình bậc 2?"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={10}
            />
            <p className="mt-1 text-xs text-gray-500">
              {title.length}/200 ký tự • Tối thiểu 10 ký tự
            </p>
          </div>

          {/* Content */}
          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung câu hỏi <span className="text-red-500">*</span>
            </label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Mô tả chi tiết câu hỏi của bạn..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Tối thiểu 20 ký tự • Bạn có thể sử dụng định dạng rich text
            </p>
          </div>

          {/* Category */}
          <div className="mb-6">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Danh mục
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Chọn danh mục (tùy chọn)</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="mb-6">
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              Thẻ (Tags)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-blue-900"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag(tagInput);
                  }
                }}
                placeholder="Nhập thẻ và nhấn Enter"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => handleAddTag(tagInput)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Thêm
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Tối đa 10 thẻ • Thẻ giúp người khác tìm thấy câu hỏi của bạn dễ hơn
            </p>

            {/* Popular Tags */}
            {tags.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2">Thẻ phổ biến:</p>
                <div className="flex flex-wrap gap-2">
                  {tags.slice(0, 20).map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleAddTag(tag.name)}
                      disabled={selectedTags.includes(tag.name) || selectedTags.length >= 10}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        selectedTags.includes(tag.name)
                          ? 'bg-blue-600 text-white cursor-not-allowed'
                          : selectedTags.length >= 10
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Bằng cách đăng câu hỏi, bạn đồng ý với{' '}
              <Link href="/terms" className="text-blue-600 hover:text-blue-800">
                Điều khoản sử dụng
              </Link>
            </p>
            <div className="flex gap-3">
              <Link
                href="/dashboard/forum/questions"
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Hủy
              </Link>
              <button
                type="submit"
                disabled={loading || !title.trim() || !content.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang tạo...' : 'Đăng câu hỏi'}
              </button>
            </div>
          </div>
        </form>

        {/* Tips */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Mẹo để có câu hỏi hay:</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Viết tiêu đề rõ ràng và cụ thể</li>
            <li>• Mô tả chi tiết vấn đề bạn gặp phải</li>
            <li>• Thêm mã nguồn, hình ảnh hoặc ví dụ nếu có</li>
            <li>• Chọn đúng danh mục và thẻ để dễ tìm kiếm</li>
            <li>• Kiểm tra lại chính tả và ngữ pháp</li>
          </ul>
        </div>
      </div>
    </div>
  );
}


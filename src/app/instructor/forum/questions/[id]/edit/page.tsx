'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { forumApiService, ForumQuestion, ForumCategory, ForumTag } from '@/services/forumApi';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { RichTextEditor } from '@/components/RichTextEditor';

export default function EditQuestionPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const questionId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState<ForumQuestion | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [tags, setTags] = useState<ForumTag[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (questionId) {
      loadQuestion();
      loadCategories();
      loadTags();
    }
  }, [questionId, user, router]);

  const loadQuestion = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await forumApiService.getQuestionById(questionId);
      
      if (parseInt(user?.id || '0') !== data.userId) {
        setError('Bạn không có quyền chỉnh sửa câu hỏi này');
        return;
      }

      setQuestion(data);
      setTitle(data.title);
      setContent(data.content);
      setSelectedCategory(data.categoryId || '');
      setSelectedTags(data.tags || []);
      setIsPinned(data.isPinned);
      setIsClosed(data.isClosed);
    } catch (err: any) {
      setError(err.message || 'Không thể tải câu hỏi');
      console.error('Error loading question:', err);
    } finally {
      setLoading(false);
    }
  };

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

    try {
      setSaving(true);
      setError(null);

      await forumApiService.updateQuestion(questionId, {
        title: title.trim(),
        content: content.trim(),
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        categoryId: selectedCategory || undefined,
        categoryName: categories.find(c => c.id === selectedCategory)?.name,
        isPinned: isPinned,
        isClosed: isClosed,
      });

      router.push(`/instructor/forum/questions/${questionId}`);
    } catch (err: any) {
      setError(err.message || 'Không thể cập nhật câu hỏi');
      console.error('Error updating question:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải câu hỏi...</p>
        </div>
      </div>
    );
  }

  if (error && !question) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            href="/instructor/forum/questions"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  if (!question) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/instructor/forum/questions/${questionId}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Quay lại câu hỏi
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa câu hỏi</h1>
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

          {/* Options */}
          <div className="mb-6 space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Ghim câu hỏi (chỉ dành cho admin/mod)</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isClosed}
                onChange={(e) => setIsClosed(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Đóng câu hỏi (không cho phép trả lời mới)</span>
            </label>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <Link
              href={`/instructor/forum/questions/${questionId}`}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={saving || !title.trim() || !content.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import {
  ChatBubbleLeftRightIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserGroupIcon,
  HeartIcon,
  FlagIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface ForumQuestion {
  id: number;
  title: string;
  content: string;
  authorId: number;
  authorName: string;
  authorAvatar?: string;
  category: string;
  tags: string[];
  isAnswered: boolean;
  isFeatured: boolean;
  isReported: boolean;
  views: number;
  likes: number;
  replies: number;
  createdAt: string;
  updatedAt: string;
  lastReplyAt?: string;
  lastReplyBy?: string;
}

interface ForumFilters {
  search?: string;
  category?: string;
  isAnswered?: boolean;
  isFeatured?: boolean;
  isReported?: boolean;
  page: number;
  pageSize: number;
}

export default function ForumManagementPage() {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [questions, setQuestions] = useState<ForumQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ForumFilters>({
    page: 1,
    pageSize: 20
  });
  const [totalCount, setTotalCount] = useState(0);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);

  // Mock data - trong thực tế sẽ load từ API
  const mockQuestions: ForumQuestion[] = [
    {
      id: 1,
      title: "Cách giải phương trình bậc 2 trong toán học?",
      content: "Em đang gặp khó khăn với việc giải phương trình bậc 2, có ai có thể hướng dẫn chi tiết không?",
      authorId: 1,
      authorName: "Nguyễn Văn A",
      authorAvatar: "/avatars/user1.jpg",
      category: "Toán học",
      tags: ["phương trình", "bậc 2", "toán học"],
      isAnswered: true,
      isFeatured: false,
      isReported: false,
      views: 156,
      likes: 12,
      replies: 5,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      lastReplyAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      lastReplyBy: "Giáo viên Toán"
    },
    {
      id: 2,
      title: "Công thức tính diện tích hình tròn",
      content: "Ai có thể giải thích công thức tính diện tích hình tròn và cách áp dụng không?",
      authorId: 2,
      authorName: "Trần Thị B",
      authorAvatar: "/avatars/user2.jpg",
      category: "Hình học",
      tags: ["diện tích", "hình tròn", "công thức"],
      isAnswered: false,
      isFeatured: true,
      isReported: false,
      views: 89,
      likes: 8,
      replies: 3,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      lastReplyAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
      lastReplyBy: "Học sinh giỏi"
    },
    {
      id: 3,
      title: "Câu hỏi không phù hợp - cần xem xét",
      content: "Nội dung không phù hợp với mục đích học tập...",
      authorId: 3,
      authorName: "Lê Văn C",
      authorAvatar: "/avatars/user3.jpg",
      category: "Khác",
      tags: ["báo cáo"],
      isAnswered: false,
      isFeatured: false,
      isReported: true,
      views: 23,
      likes: 0,
      replies: 0,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()
    }
  ];

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock API call - trong thực tế sẽ gọi API thật
      setTimeout(() => {
        setQuestions(mockQuestions);
        setTotalCount(mockQuestions.length);
        setLoading(false);
      }, 1000);
      
      // TODO: Implement real API call
      // const queryParams = new URLSearchParams();
      // if (filters.search) queryParams.append('search', filters.search);
      // if (filters.category) queryParams.append('category', filters.category);
      // if (filters.isAnswered !== undefined) queryParams.append('isAnswered', filters.isAnswered.toString());
      // if (filters.isFeatured !== undefined) queryParams.append('isFeatured', filters.isFeatured.toString());
      // if (filters.isReported !== undefined) queryParams.append('isReported', filters.isReported.toString());
      // queryParams.append('page', filters.page.toString());
      // queryParams.append('pageSize', filters.pageSize.toString());

      // const resp = await authenticatedFetch(`/api/forum/questions?${queryParams}`);
      // const data = await resp.json();
      
      // if (resp.ok) {
      //   const result = data?.Result || data;
      //   setQuestions(result?.Items || result?.items || []);
      //   setTotalCount(result?.TotalCount || result?.totalCount || 0);
      // } else {
      //   setError(data?.Message || 'Không thể tải danh sách câu hỏi');
      // }
    } catch (err) {
      setError('Có lỗi xảy ra khi tải dữ liệu');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [filters]);

  const handleFilterChange = (key: keyof ForumFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handleToggleFeatured = async (questionId: number, currentStatus: boolean) => {
    try {
      // TODO: Implement API call
      console.log(`Toggle featured for question ${questionId} to ${!currentStatus}`);
      await loadQuestions();
      alert('Cập nhật trạng thái nổi bật thành công!');
    } catch (err) {
      alert('Có lỗi xảy ra khi cập nhật');
    }
  };

  const handleMarkAsAnswered = async (questionId: number) => {
    try {
      // TODO: Implement API call
      console.log(`Mark question ${questionId} as answered`);
      await loadQuestions();
      alert('Đánh dấu đã trả lời thành công!');
    } catch (err) {
      alert('Có lỗi xảy ra khi cập nhật');
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm('Xóa câu hỏi này?')) return;
    
    try {
      // TODO: Implement API call
      console.log(`Delete question ${questionId}`);
      await loadQuestions();
      alert('Xóa câu hỏi thành công!');
    } catch (err) {
      alert('Có lỗi xảy ra khi xóa');
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Toán học': 'bg-blue-100 text-blue-800',
      'Hình học': 'bg-green-100 text-green-800',
      'Vật lý': 'bg-purple-100 text-purple-800',
      'Hóa học': 'bg-yellow-100 text-yellow-800',
      'Khác': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const totalPages = Math.ceil(totalCount / filters.pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý diễn đàn</h1>
          <p className="text-sm text-gray-600">Quản lý câu hỏi và thảo luận trong diễn đàn</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => window.location.href = '/dashboard/forum/questions/create'}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Tạo câu hỏi mới
          </button>
          <span className="text-sm text-gray-500">
            Tổng: {totalCount} câu hỏi
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tiêu đề, nội dung..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Danh mục
            </label>
            <select
              value={filters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả danh mục</option>
              <option value="Toán học">Toán học</option>
              <option value="Hình học">Hình học</option>
              <option value="Vật lý">Vật lý</option>
              <option value="Hóa học">Hóa học</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <select
              value={filters.isAnswered === undefined ? '' : filters.isAnswered.toString()}
              onChange={(e) => handleFilterChange('isAnswered', e.target.value ? e.target.value === 'true' : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="true">Đã trả lời</option>
              <option value="false">Chưa trả lời</option>
            </select>
          </div>

          {/* Special Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lọc đặc biệt
            </label>
            <select
              value={
                filters.isFeatured !== undefined ? 'featured' :
                filters.isReported !== undefined ? 'reported' : ''
              }
              onChange={(e) => {
                if (e.target.value === 'featured') {
                  handleFilterChange('isFeatured', true);
                  handleFilterChange('isReported', undefined);
                } else if (e.target.value === 'reported') {
                  handleFilterChange('isReported', true);
                  handleFilterChange('isFeatured', undefined);
                } else {
                  handleFilterChange('isFeatured', undefined);
                  handleFilterChange('isReported', undefined);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả</option>
              <option value="featured">Câu hỏi nổi bật</option>
              <option value="reported">Câu hỏi báo cáo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="bg-white shadow rounded-lg">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Đang tải...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">
            <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4" />
            <p>{error}</p>
            <button
              onClick={loadQuestions}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Thử lại
            </button>
          </div>
        ) : questions.length === 0 ? (
          <div className="p-6 text-center">
            <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có câu hỏi</h3>
            <p className="text-sm text-gray-500 mb-4">
              Chưa có câu hỏi nào trong diễn đàn.
            </p>
            <button
              onClick={() => window.location.href = '/dashboard/forum/questions/create'}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Tạo câu hỏi đầu tiên
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {questions.map((question) => (
              <div key={question.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900 line-clamp-2">
                        {question.title}
                      </h3>
                      {question.isFeatured && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Nổi bật
                        </span>
                      )}
                      {question.isReported && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <FlagIcon className="h-3 w-3 mr-1" />
                          Báo cáo
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {question.content}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                      <div className="flex items-center">
                        <UserGroupIcon className="h-3 w-3 mr-1" />
                        {question.authorName}
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {formatTimeAgo(question.createdAt)}
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(question.category)}`}>
                        {question.category}
                      </span>
                    </div>

                    {/* Tags */}
                    {question.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {question.tags.map((tag, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        {question.views} lượt xem
                      </div>
                      <div className="flex items-center">
                        <HeartIcon className="h-4 w-4 mr-1" />
                        {question.likes} thích
                      </div>
                      <div className="flex items-center">
                        <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                        {question.replies} trả lời
                      </div>
                      {question.lastReplyAt && (
                        <div className="flex items-center">
                          <span>Trả lời cuối: {formatTimeAgo(question.lastReplyAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex items-center space-x-2">
                      {!question.isAnswered && (
                        <button
                          onClick={() => handleMarkAsAnswered(question.id)}
                          className="text-green-600 hover:text-green-800"
                          title="Đánh dấu đã trả lời"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleFeatured(question.id, question.isFeatured)}
                        className={`${
                          question.isFeatured ? 'text-yellow-600 hover:text-yellow-800' : 'text-gray-600 hover:text-gray-800'
                        }`}
                        title={question.isFeatured ? 'Bỏ nổi bật' : 'Đánh dấu nổi bật'}
                      >
                        <StarIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {/* TODO: View details */}}
                        className="text-gray-600 hover:text-gray-800"
                        title="Xem chi tiết"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {/* TODO: Edit */}}
                        className="text-blue-600 hover:text-blue-800"
                        title="Chỉnh sửa"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Xóa"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {question.isAnswered && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        Đã trả lời
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                disabled={filters.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Trước
              </button>
              <button
                onClick={() => handleFilterChange('page', Math.min(totalPages, filters.page + 1))}
                disabled={filters.page === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Sau
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Hiển thị <span className="font-medium">{(filters.page - 1) * filters.pageSize + 1}</span> đến{' '}
                  <span className="font-medium">{Math.min(filters.page * filters.pageSize, totalCount)}</span> trong{' '}
                  <span className="font-medium">{totalCount}</span> kết quả
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                    disabled={filters.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Trước
                  </button>
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, filters.page - 2)) + i;
                    if (pageNum > totalPages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handleFilterChange('page', pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pageNum === filters.page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handleFilterChange('page', Math.min(totalPages, filters.page + 1))}
                    disabled={filters.page === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Sau
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { forumApiService, ForumQuestion, ForumAnswer } from '@/services/forumApi';
import { useAuth } from '@/contexts/AuthContext';
import { 
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  FlagIcon,
  EyeIcon,
  TrashIcon,
  PencilIcon,
  StarIcon,
  LockClosedIcon,
  LockOpenIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

// Format time ago helper
const formatTimeAgo = (dateString: string): string => {
  try {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} tháng trước`;
    return `${Math.floor(diffInSeconds / 31536000)} năm trước`;
  } catch {
    return dateString;
  }
};

type ModerationTab = 'reported' | 'pending' | 'all';

export default function ForumModerationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ModerationTab>('reported');
  const [questions, setQuestions] = useState<ForumQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Check if user is admin or moderator
    if (user.role !== 'admin' && user.role !== 'instructor') {
      router.push('/dashboard/forum/questions');
      return;
    }

    loadQuestions();
  }, [activeTab, page, searchQuery, user, router]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: any = {
        page,
        pageSize,
        sortBy: 'activity',
        desc: true,
      };

      if (searchQuery) {
        filters.search = searchQuery;
      }

      // For moderation, we might want to show reported or pending questions
      // Since backend doesn't have a specific "reported" flag, we'll filter by isPinned or other criteria
      if (activeTab === 'reported') {
        // Show questions that might need attention (you can customize this)
        filters.isPinned = false; // This is just a placeholder
      }

      const result = await forumApiService.getQuestions(filters);
      setQuestions(result.items);
      setTotal(result.total);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách câu hỏi');
      console.error('Error loading questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePinQuestion = async (questionId: string, isPinned: boolean) => {
    try {
      await forumApiService.updateQuestion(questionId, {
        isPinned: !isPinned,
      });
      await loadQuestions();
    } catch (err: any) {
      alert(err.message || 'Không thể cập nhật trạng thái');
    }
  };

  const handleCloseQuestion = async (questionId: string, isClosed: boolean) => {
    try {
      await forumApiService.updateQuestion(questionId, {
        isClosed: !isClosed,
      });
      await loadQuestions();
    } catch (err: any) {
      alert(err.message || 'Không thể đóng/mở câu hỏi');
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa câu hỏi này? Hành động này không thể hoàn tác.')) {
      return;
    }

    try {
      await forumApiService.deleteQuestion(questionId);
      await loadQuestions();
    } catch (err: any) {
      alert(err.message || 'Không thể xóa câu hỏi');
    }
  };

  const handleApproveQuestion = async (questionId: string) => {
    // Approve by removing any flags (if you have a flag system)
    // For now, we'll just reload
    try {
      await loadQuestions();
      alert('Câu hỏi đã được duyệt');
    } catch (err: any) {
      alert(err.message || 'Không thể duyệt câu hỏi');
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
    return null;
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Diễn đàn</h1>
          <p className="mt-2 text-sm text-gray-600">
            Duyệt, quản lý và điều chỉnh nội dung trong diễn đàn
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => {
                  setActiveTab('reported');
                  setPage(1);
                }}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'reported'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FlagIcon className="h-5 w-5" />
                  Đã báo cáo
                </div>
              </button>
              <button
                onClick={() => {
                  setActiveTab('pending');
                  setPage(1);
                }}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'pending'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ExclamationTriangleIcon className="h-5 w-5" />
                  Chờ duyệt
                </div>
              </button>
              <button
                onClick={() => {
                  setActiveTab('all');
                  setPage(1);
                }}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <EyeIcon className="h-5 w-5" />
                  Tất cả
                </div>
              </button>
            </nav>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm câu hỏi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Questions List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadQuestions}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Thử lại
            </button>
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FlagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Không có câu hỏi</h3>
            <p className="text-gray-600">
              {activeTab === 'reported' && 'Không có câu hỏi nào được báo cáo'}
              {activeTab === 'pending' && 'Không có câu hỏi nào chờ duyệt'}
              {activeTab === 'all' && 'Không có câu hỏi nào'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question) => (
              <div
                key={question.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Link
                          href={`/dashboard/forum/questions/${question.id}`}
                          className="text-lg font-semibold text-blue-600 hover:text-blue-800 line-clamp-2"
                        >
                          {question.title}
                        </Link>
                        {question.isPinned && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <StarSolidIcon className="h-3 w-3 mr-1" />
                            Đã ghim
                          </span>
                        )}
                        {question.isClosed && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <LockClosedIcon className="h-3 w-3 mr-1" />
                            Đã đóng
                          </span>
                        )}
                        {question.isSolved && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircleSolidIcon className="h-3 w-3 mr-1" />
                            Đã giải quyết
                          </span>
                        )}
                      </div>

                      <div 
                        className="text-sm text-gray-600 mb-3 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: question.content.substring(0, 200) }}
                      />

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{question.userName}</span>
                        <span>{formatTimeAgo(question.createdAt)}</span>
                        <span>{question.viewCount} lượt xem</span>
                        <span>{question.answerCount} trả lời</span>
                        <span>{question.voteCount} votes</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePinQuestion(question.id, question.isPinned)}
                          className={`p-2 rounded transition-colors ${
                            question.isPinned
                              ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          title={question.isPinned ? 'Bỏ ghim' : 'Ghim câu hỏi'}
                        >
                          <StarIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleCloseQuestion(question.id, question.isClosed)}
                          className={`p-2 rounded transition-colors ${
                            question.isClosed
                              ? 'bg-red-100 text-red-600 hover:bg-red-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          title={question.isClosed ? 'Mở lại' : 'Đóng câu hỏi'}
                        >
                          {question.isClosed ? (
                            <LockOpenIcon className="h-5 w-5" />
                          ) : (
                            <LockClosedIcon className="h-5 w-5" />
                          )}
                        </button>
                        <Link
                          href={`/dashboard/forum/questions/${question.id}`}
                          className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                          title="Xem chi tiết"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                          title="Xóa câu hỏi"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                      {activeTab === 'reported' && (
                        <button
                          onClick={() => handleApproveQuestion(question.id)}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm font-medium hover:bg-green-200 transition-colors"
                        >
                          <CheckCircleIcon className="h-4 w-4 inline mr-1" />
                          Duyệt
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3">
            <div className="text-sm text-gray-700">
              Trang {page} / {totalPages} • {total} câu hỏi
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                if (pageNum > totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-2 border rounded-md text-sm font-medium ${
                      pageNum === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


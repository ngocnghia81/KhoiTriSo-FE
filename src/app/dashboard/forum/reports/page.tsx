'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { forumApiService, ForumQuestion } from '@/services/forumApi';
import { useAuth } from '@/contexts/AuthContext';
import {
  FlagIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

const formatTimeAgo = (value: string) => {
  try {
    const now = new Date();
    const date = new Date(value);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} ngày trước`;
    if (diff < 31536000) return `${Math.floor(diff / 2592000)} tháng trước`;
    return `${Math.floor(diff / 31536000)} năm trước`;
  } catch {
    return value;
  }
};

export default function ForumReportsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [questions, setQuestions] = useState<ForumQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [total, setTotal] = useState(0);

  const canModerate = user?.role === 'admin' || user?.role === 'instructor';

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (!canModerate) {
      router.push('/dashboard/forum/questions');
      return;
    }

    loadReports();
  }, [user, canModerate, router, page, search]);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: replace temporary filter with actual "reported" flag once backend supports it.
      const result = await forumApiService.getQuestions({
        page,
        pageSize,
        search: search || undefined,
        sortBy: 'activity',
        desc: true,
      });

      setQuestions(result.items);
      setTotal(result.total);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = useMemo(() => Math.ceil(total / pageSize), [total, pageSize]);

  if (!user || !canModerate) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FlagIcon className="h-8 w-8 text-red-500" />
            Báo cáo nội dung
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Theo dõi và xử lý các câu hỏi/ trả lời bị người dùng báo cáo.
            Hiện tại chưa có hệ thống flag thực tế, tạm thời hiển thị danh sách câu hỏi gần đây để hỗ trợ kiểm tra thủ công.
          </p>
        </header>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Tìm kiếm theo tiêu đề, nội dung..."
                className="w-full px-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="p-4 bg-orange-50 border-b border-orange-200 text-sm text-orange-700 flex items-start gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Tính năng đang phát triển</p>
              <p>
                Backend chưa cung cấp trường đánh dấu báo cáo. Khi backend sẵn sàng,
                trang này sẽ gọi API để lấy danh sách báo cáo thực tế (ví dụ: `isFlagged = true`,
                `reportsCount &gt; 0`). Hiện tại bạn có thể dùng trang này như instructor để kiểm tra nhanh các câu hỏi mới.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500">Đang tải...</div>
          ) : error ? (
            <div className="p-12 text-center text-red-600">
              {error}
              <div>
                <button
                  onClick={loadReports}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Thử lại
                </button>
              </div>
            </div>
          ) : questions.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <FlagIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              Hiện chưa có báo cáo nào.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {questions.map((question) => (
                <li key={question.id} className="p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Link
                          href={`/dashboard/forum/questions/${question.id}`}
                          className="text-lg font-semibold text-blue-600 hover:text-blue-800 line-clamp-2"
                        >
                          {question.title}
                        </Link>
                        {question.isClosed && (
                          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">Đã khóa</span>
                        )}
                        {question.isPinned && (
                          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">Đã ghim</span>
                        )}
                      </div>
                      <div
                        className="text-sm text-gray-600 line-clamp-2 mb-3"
                        dangerouslySetInnerHTML={{ __html: question.content.substring(0, 220) }}
                      />
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                        <span>{question.userName}</span>
                        <span>{formatTimeAgo(question.updatedAt || question.createdAt)}</span>
                        <span className="flex items-center gap-1">
                          <EyeIcon className="h-4 w-4" />
                          {question.viewCount} lượt xem
                        </span>
                        <span className="flex items-center gap-1">
                          <ChatBubbleLeftRightIcon className="h-4 w-4" />
                          {question.answerCount} trả lời
                        </span>
                        <span>{question.voteCount} votes</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link
                        href={`/dashboard/forum/questions/${question.id}`}
                        className="px-4 py-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-md text-sm font-medium text-center"
                      >
                        Xem chi tiết
                      </Link>
                      <button
                        onClick={() => alert('Tính năng xử lý báo cáo sẽ có khi backend hỗ trợ.')}
                        className="px-4 py-2 bg-green-100 text-green-600 hover:bg-green-200 rounded-md text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                        Đánh dấu đã xử lý
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {totalPages > 1 && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-4 py-3 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Trang {page}/{totalPages} • {total} kết quả
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Trước
              </button>
              {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + idx;
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
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
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


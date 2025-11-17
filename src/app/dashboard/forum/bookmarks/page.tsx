'use client';

import { useState, useEffect, useCallback } from 'react';
import { forumApiService, ForumBookmark } from '@/services/forumApi';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BookmarkIcon,
  BookmarkSlashIcon,
  ArrowLeftIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

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

export default function BookmarksPage() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<ForumBookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadBookmarks = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError(null);
      const userId = parseInt(user.id) || 0;
      const result = await forumApiService.getBookmarks(userId, page, pageSize);
      setBookmarks(result.items);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải bookmarks';
      setError(errorMessage);
      console.error('Error loading bookmarks:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, page, pageSize]);

  useEffect(() => {
    if (user?.id) {
      loadBookmarks();
    } else {
      setLoading(false);
      setError('Vui lòng đăng nhập để xem bookmarks');
    }
  }, [user?.id, loadBookmarks]);

  const handleRemoveBookmark = async (questionId: string) => {
    if (!user?.id) return;
    try {
      const userId = parseInt(user.id) || 0;
      await forumApiService.removeBookmark(questionId, userId);
      setBookmarks(prev => prev.filter(b => b.questionId !== questionId));
      setTotal(prev => Math.max(0, prev - 1));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể xóa bookmark';
      alert(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải bookmarks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard/forum/questions"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Quay lại danh sách
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bookmarks của tôi</h1>
              <p className="mt-2 text-sm text-gray-600">
                {total} câu hỏi đã bookmark
              </p>
            </div>
          </div>
        </div>

        {error ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadBookmarks}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Thử lại
            </button>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <BookmarkIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có bookmark</h3>
            <p className="text-gray-600 mb-6">Hãy bookmark các câu hỏi bạn quan tâm!</p>
            <Link
              href="/dashboard/forum/questions"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Xem danh sách câu hỏi
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookmarks.map((bookmark) => {
              const question = bookmark.question;
              if (!question) return null;

              return (
                <div
                  key={bookmark.questionId}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4 p-4">
                    {/* Stats Column */}
                    <div className="flex flex-col items-center gap-2 min-w-[80px] pt-2">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-700">{question.voteCount}</div>
                        <div className="text-xs text-gray-500">votes</div>
                      </div>
                      <div className={`text-center ${question.isSolved ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className="text-lg font-semibold">{question.answerCount}</div>
                        <div className="text-xs">answers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-600">{question.viewCount}</div>
                        <div className="text-xs text-gray-500">views</div>
                      </div>
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <Link
                            href={`/dashboard/forum/questions/${question.id}`}
                            className={`text-lg font-semibold text-blue-600 hover:text-blue-800 line-clamp-2 ${
                              question.isDeleted ? 'line-through opacity-60' : ''
                            }`}
                          >
                            {question.isPinned && (
                              <span className="inline-block mr-2 text-yellow-500">📌</span>
                            )}
                            {question.isClosed && (
                              <span className="inline-block mr-2 text-red-500">🔒</span>
                            )}
                            {question.isDeleted && (
                              <span className="inline-block mr-2 text-red-500">🗑️</span>
                            )}
                            {question.title}
                          </Link>
                          {question.isSolved && (
                            <div className="inline-flex items-center gap-1 ml-2 text-green-600">
                              <span className="text-xs font-medium">✓ Đã giải quyết</span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveBookmark(bookmark.questionId)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Xóa bookmark"
                        >
                          <BookmarkSlashIcon className="h-5 w-5" />
                        </button>
                      </div>

                      <div 
                        className={`text-sm text-gray-700 mb-3 line-clamp-2 ${
                          question.isDeleted ? 'line-through opacity-60' : ''
                        }`}
                        dangerouslySetInnerHTML={{ __html: question.content.substring(0, 200) }}
                      />

                      {/* Meta */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-4">
                          <span>{question.userName}</span>
                          <span className="flex items-center gap-1">
                            <ClockIcon className="h-3 w-3" />
                            {formatTimeAgo(question.updatedAt || question.createdAt)}
                          </span>
                          {question.categoryName && (
                            <span className="px-2 py-1 bg-gray-100 rounded">{question.categoryName}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <BookmarkSolidIcon className="h-3 w-3 text-yellow-500" />
                            Bookmarked {formatTimeAgo(bookmark.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!error && totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Hiển thị <span className="font-medium">{(page - 1) * pageSize + 1}</span> đến{' '}
                  <span className="font-medium">{Math.min(page * pageSize, total)}</span> trong tổng số{' '}
                  <span className="font-medium">{total}</span> kết quả
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Trước</span>
                    ←
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          page === pageNum
                            ? 'z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Sau</span>
                    →
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


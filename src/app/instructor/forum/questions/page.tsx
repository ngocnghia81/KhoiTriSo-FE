'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { forumApiService, ForumQuestion, ForumQuestionFilters, ForumCategory, ForumTag } from '@/services/forumApi';
import { useAuth } from '@/contexts/AuthContext';
import { 
  MagnifyingGlassIcon, 
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  TagIcon,
  FunnelIcon,
  BookmarkIcon,
  BookmarkSlashIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon, BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
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

export default function ForumQuestionsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [questions, setQuestions] = useState<ForumQuestion[]>([]);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [tags, setTags] = useState<ForumTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [userVotes, setUserVotes] = useState<Record<string, number>>({}); // questionId -> voteType
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  
  const [filters, setFilters] = useState<ForumQuestionFilters>({
    page: 1,
    pageSize: 20,
    sortBy: 'activity',
    desc: true,
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [showUnanswered, setShowUnanswered] = useState(false);
  const [showPinned, setShowPinned] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'votes' | 'activity' | 'unanswered'>('activity');

  // Load data
  useEffect(() => {
    loadCategories();
    loadTags();
    if (user?.id) {
      loadBookmarks();
    }
  }, [user?.id]);

  useEffect(() => {
    loadQuestions();
  }, [filters]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await forumApiService.getQuestions(filters);
      setQuestions(result.items);
      setTotal(result.total);
      setPage(result.page);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách câu hỏi');
      console.error('Error loading questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categories = await forumApiService.getCategories(false); // Only active
      setCategories(categories);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const loadTags = async () => {
    try {
      const tags = await forumApiService.getTags(50, false); // Only active
      setTags(tags);
    } catch (err) {
      console.error('Error loading tags:', err);
    }
  };

  const loadBookmarks = async () => {
    if (!user?.id) return;
    try {
      const bookmarksList = await forumApiService.getBookmarks(parseInt(user.id) || 0);
      setBookmarks(new Set(bookmarksList.map(b => b.questionId)));
    } catch (err) {
      console.error('Error loading bookmarks:', err);
    }
  };

  // Update filters when search/filter changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        search: searchQuery || undefined,
        categoryId: selectedCategory || undefined,
        tag: selectedTag || undefined,
        isSolved: showUnanswered ? false : undefined,
        isPinned: showPinned ? true : undefined,
        sortBy: sortBy,
        desc: sortBy !== 'oldest',
        page: 1,
      }));
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedCategory, selectedTag, showUnanswered, showPinned, sortBy]);

  const handleVote = async (questionId: string, voteType: number) => {
    if (!user?.id) {
      alert('Vui lòng đăng nhập để vote');
      return;
    }

    try {
      const currentVote = userVotes[questionId];
      // If clicking the same vote type, remove vote (toggle)
      const newVoteType = currentVote === voteType ? 0 : voteType;
      
      if (newVoteType !== 0) {
        await forumApiService.vote({
          targetId: questionId,
          targetType: 1, // Question
          userId: parseInt(user.id) || 0,
          voteType: newVoteType,
        });
      } else {
        // Remove vote by voting opposite
        await forumApiService.vote({
          targetId: questionId,
          targetType: 1,
          userId: parseInt(user.id) || 0,
          voteType: -voteType, // Opposite to cancel
        });
      }
      
      // Update local state
      setUserVotes(prev => {
        const updated = { ...prev };
        if (newVoteType === 0) {
          delete updated[questionId];
        } else {
          updated[questionId] = newVoteType;
        }
        return updated;
      });
      
      await loadQuestions();
    } catch (err: any) {
      alert(err.message || 'Không thể vote');
    }
  };

  const handleBookmark = async (questionId: string, isBookmarked: boolean) => {
    if (!user?.id) {
      alert('Vui lòng đăng nhập để bookmark');
      return;
    }

    try {
      const userId = parseInt(user.id) || 0;
      if (isBookmarked) {
        await forumApiService.removeBookmark(questionId, userId);
        setBookmarks(prev => {
          const newSet = new Set(prev);
          newSet.delete(questionId);
          return newSet;
        });
      } else {
        await forumApiService.addBookmark(questionId, userId);
        setBookmarks(prev => new Set(prev).add(questionId));
      }
    } catch (err: any) {
      alert(err.message || 'Không thể bookmark');
    }
  };


  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Diễn đàn Hỏi & Đáp</h1>
              <p className="mt-2 text-sm text-gray-600">
                {total} câu hỏi • {questions.filter(q => !q.isSolved).length} chưa trả lời
              </p>
            </div>
            <Link
              href="/instructor/forum/questions/create"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Đặt câu hỏi
            </Link>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1 max-w-md">
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm câu hỏi..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="activity">Hoạt động</option>
                    <option value="newest">Mới nhất</option>
                    <option value="oldest">Cũ nhất</option>
                    <option value="votes">Nhiều vote nhất</option>
                    <option value="unanswered">Chưa trả lời</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowUnanswered(!showUnanswered)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      showUnanswered
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Chưa trả lời
                  </button>
                  <button
                    onClick={() => setShowPinned(!showPinned)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      showPinned
                        ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Ghim
                  </button>
                </div>
              </div>
            </div>

            {/* Questions List */}
            {loading ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Đang tải câu hỏi...</p>
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
                <ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có câu hỏi</h3>
                <p className="text-gray-600 mb-6">Hãy là người đầu tiên đặt câu hỏi!</p>
                <Link
                  href="/instructor/forum/questions/create"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Đặt câu hỏi
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {questions.map((question) => (
                  <div
                    key={question.id}
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
                              href={`/instructor/forum/questions/${question.id}`}
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
                                <CheckCircleSolidIcon className="h-4 w-4" />
                                <span className="text-xs font-medium">Đã giải quyết</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div 
                          className={`text-sm text-gray-700 mb-3 line-clamp-2 ${
                            question.isDeleted ? 'line-through opacity-60' : ''
                          }`}
                          dangerouslySetInnerHTML={{ __html: question.content.substring(0, 200) }}
                        />

                        {/* Tags */}
                        {question.tags && question.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {question.tags.map((tag, idx) => (
                              <button
                                key={idx}
                                onClick={() => setSelectedTag(tag)}
                                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                              >
                                <TagIcon className="h-3 w-3 mr-1" />
                                {tag}
                              </button>
                            ))}
                          </div>
                        )}

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
                          {user && (
                            <button
                              onClick={() => handleBookmark(question.id, bookmarks.has(question.id))}
                              className="text-gray-400 hover:text-yellow-500 transition-colors"
                              title={bookmarks.has(question.id) ? 'Bỏ bookmark' : 'Bookmark'}
                            >
                              {bookmarks.has(question.id) ? (
                                <BookmarkSolidIcon className="h-4 w-4 text-yellow-500" />
                              ) : (
                                <BookmarkIcon className="h-4 w-4" />
                              )}
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
                    onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, page - 1) }))}
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
                        onClick={() => setFilters(prev => ({ ...prev, page: pageNum }))}
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
                    onClick={() => setFilters(prev => ({ ...prev, page: Math.min(totalPages, page + 1) }))}
                    disabled={page === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-64 space-y-4">
            {/* Categories */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Danh mục</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    !selectedCategory
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Tất cả
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Tags */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Thẻ phổ biến</h3>
              <div className="flex flex-wrap gap-2">
                {tags.slice(0, 20).map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => setSelectedTag(selectedTag === tag.name ? '' : tag.name)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      selectedTag === tag.name
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

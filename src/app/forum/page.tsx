'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  MessageSquare, 
  ChevronUp, 
  ChevronDown, 
  Eye, 
  Tag, 
  Calendar, 
  Search, 
  Filter,
  Plus,
  CheckCircle2,
  Clock,
  TrendingUp,
  User,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ForumQuestion {
  id: string;
  title: string;
  content: string;
  userId: number;
  userName: string;
  userAvatar?: string;
  categoryId?: string;
  categoryName?: string;
  tags?: string[];
  views: number;
  voteCount: number;
  answerCount: number;
  isSolved: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt?: string;
  lastActivityAt?: string;
  acceptedAnswerId?: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  questionCount?: number;
}

interface Tag {
  id: string;
  name: string;
  description?: string;
  questionCount?: number;
}

interface ForumStats {
  totalQuestions: number;
  totalAnswers: number;
  totalUsers: number;
  solvedQuestions: number;
}

export default function ForumPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const { user } = useAuth();

  const [questions, setQuestions] = useState<ForumQuestion[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [stats, setStats] = useState<ForumStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState(searchParams?.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams?.get('category') || 'all');
  const [tagFilter, setTagFilter] = useState(searchParams?.get('tag') || '');
  const [sortBy, setSortBy] = useState(searchParams?.get('sortBy') || 'createdAt');
  const [desc, setDesc] = useState(searchParams?.get('desc') === 'true' || true);
  const [isSolvedFilter, setIsSolvedFilter] = useState<string>(searchParams?.get('isSolved') || 'all');
  const [page, setPage] = useState(parseInt(searchParams?.get('page') || '1'));
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchData();
  }, [page, sortBy, desc, categoryFilter, tagFilter, isSolvedFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch questions
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoryFilter && categoryFilter !== 'all') params.append('categoryId', categoryFilter);
      if (tagFilter) params.append('tag', tagFilter);
      if (isSolvedFilter !== 'all') params.append('isSolved', isSolvedFilter === 'solved' ? 'true' : 'false');
      params.append('page', page.toString());
      params.append('pageSize', '20');
      params.append('sortBy', sortBy);
      params.append('desc', desc.toString());

      const questionsRes = await authenticatedFetch(`/api/forum/questions?${params.toString()}`);
      const questionsData = await questionsRes.json();

      if (questionsData.Result?.Items) {
        const items = questionsData.Result.Items.map((q: any) => ({
          id: q.Id || q.id,
          title: q.Title || q.title,
          content: q.Content || q.content,
          userId: q.UserId || q.userId,
          userName: q.UserName || q.userName,
          userAvatar: q.UserAvatar || q.userAvatar,
          categoryId: q.CategoryId || q.categoryId,
          categoryName: q.CategoryName || q.categoryName,
          tags: q.Tags || q.tags || [],
          views: q.Views || q.views || 0,
          voteCount: q.Votes || q.votes || q.VoteCount || q.voteCount || 0,
          answerCount: q.AnswersCount || q.answersCount || q.AnswerCount || q.answerCount || 0,
          isSolved: q.IsSolved || q.isSolved || false,
          isPinned: q.IsPinned || q.isPinned || false,
          createdAt: q.CreatedAt || q.createdAt,
          updatedAt: q.UpdatedAt || q.updatedAt,
          lastActivityAt: q.LastActivityAt || q.lastActivityAt,
          acceptedAnswerId: q.AcceptedAnswerId || q.acceptedAnswerId,
        }));
        setQuestions(items);
        setTotal(questionsData.Result.Total || 0);
        setTotalPages(questionsData.Result.TotalPages || 1);
      }

      // Fetch categories
      const categoriesRes = await authenticatedFetch('/api/forum/categories');
      const categoriesData = await categoriesRes.json();
      if (categoriesData.Result) {
        const cats = (Array.isArray(categoriesData.Result) ? categoriesData.Result : []).map((c: any) => ({
          id: c.Id || c.id,
          name: c.Name || c.name,
          description: c.Description || c.description,
          color: c.Color || c.color,
          icon: c.Icon || c.icon,
          questionCount: c.QuestionCount || c.questionCount,
        }));
        setCategories(cats);
      }

      // Fetch tags
      const tagsRes = await authenticatedFetch('/api/forum/tags?limit=30');
      const tagsData = await tagsRes.json();
      if (tagsData.Result) {
        const tagList = (Array.isArray(tagsData.Result) ? tagsData.Result : []).map((t: any) => ({
          id: t.Id || t.id,
          name: t.Name || t.name,
          description: t.Description || t.description,
          questionCount: t.QuestionCount || t.questionCount,
        }));
        setTags(tagList);
      }

      // Fetch stats
      const statsRes = await authenticatedFetch('/api/forum/stats');
      const statsData = await statsRes.json();
      if (statsData.Result) {
        setStats({
          totalQuestions: statsData.Result.totalQuestions || statsData.Result.TotalQuestions || 0,
          totalAnswers: statsData.Result.totalAnswers || statsData.Result.TotalAnswers || 0,
          totalUsers: statsData.Result.totalUsers || statsData.Result.TotalUsers || 0,
          solvedQuestions: statsData.Result.solvedQuestions || statsData.Result.SolvedQuestions || 0,
        });
      }
    } catch (err: any) {
      console.error('Error fetching forum data:', err);
      setError(err.message || 'Không thể tải dữ liệu diễn đàn');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (categoryFilter && categoryFilter !== 'all') params.set('category', categoryFilter);
    if (tagFilter) params.set('tag', tagFilter);
    if (isSolvedFilter !== 'all') params.set('isSolved', isSolvedFilter);
    params.set('sortBy', sortBy);
    params.set('desc', desc.toString());
    router.push(`/forum?${params.toString()}`);
    fetchData();
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: vi });
    } catch {
      return dateString;
    }
  };

  const stripHtml = (html: string) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').substring(0, 200);
  };

  const handleVote = async (questionId: string, voteType: number) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để vote');
      return;
    }

    try {
      const response = await authenticatedFetch('/api/forum/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetId: questionId,
          targetType: 1, // Question
          userId: user.id,
          voteType,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Vote thành công');
        fetchData();
      } else {
        toast.error(data.Message || 'Lỗi khi vote');
      }
    } catch (err: any) {
      toast.error('Lỗi khi vote');
    }
  };

  const sortedQuestions = useMemo(() => {
    return [...questions].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
  }, [questions]);

  if (loading && questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Diễn đàn học tập</h1>
              <p className="mt-1 text-gray-600">Nơi chia sẻ kiến thức và giải đáp thắc mắc</p>
            </div>
            <Link href="/forum/ask">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Đặt câu hỏi
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4">
            {/* Search and Filters */}
            <Card className="bg-white">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Tìm kiếm câu hỏi..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-10"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={isSolvedFilter} onValueChange={setIsSolvedFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="solved">Đã giải quyết</SelectItem>
                      <SelectItem value="unsolved">Chưa giải quyết</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleSearch} variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Lọc
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Sort Options */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sắp xếp:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Mới nhất</SelectItem>
                    <SelectItem value="voteCount">Nhiều vote</SelectItem>
                    <SelectItem value="answerCount">Nhiều trả lời</SelectItem>
                    <SelectItem value="views">Nhiều lượt xem</SelectItem>
                    <SelectItem value="lastActivityAt">Hoạt động gần đây</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <span className="text-sm text-gray-500">
                {total} câu hỏi
              </span>
            </div>

            {/* Questions List */}
            {error ? (
              <Card className="bg-white">
                <CardContent className="p-6 text-center">
                  <p className="text-red-600">{error}</p>
                </CardContent>
              </Card>
            ) : sortedQuestions.length === 0 ? (
              <Card className="bg-white">
                <CardContent className="p-12 text-center">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Không tìm thấy câu hỏi nào</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {sortedQuestions.map((question) => (
                  <Card 
                    key={question.id} 
                    className={`bg-white border hover:border-blue-300 transition-colors ${question.isPinned ? 'border-blue-500 bg-blue-50' : ''}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Vote Section */}
                        <div className="flex flex-col items-center gap-1 min-w-[60px]">
                          <div className="text-center">
                            <div className="text-lg font-semibold text-gray-700">
                              {question.voteCount}
                            </div>
                            <div className="text-xs text-gray-500">votes</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-lg font-semibold ${question.answerCount > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                              {question.answerCount}
                            </div>
                            <div className="text-xs text-gray-500">answers</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-500">
                              {question.views}
                            </div>
                            <div className="text-xs text-gray-500">views</div>
                          </div>
                        </div>

                        {/* Question Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 mb-2">
                            {question.isPinned && (
                              <Badge className="bg-blue-600 text-white text-xs">Ghim</Badge>
                            )}
                            {question.isSolved && (
                              <Badge className="bg-green-600 text-white text-xs">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Đã giải quyết
                              </Badge>
                            )}
                            <Link
                              href={`/forum/${question.id}`}
                              className="text-lg font-semibold text-gray-900 hover:text-blue-600 line-clamp-2 flex-1"
                            >
                              {question.title}
                            </Link>
                          </div>

                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {stripHtml(question.content)}
                          </p>

                          {/* Tags */}
                          {question.tags && question.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {question.tags.map((tag) => (
                                <Link
                                  key={tag}
                                  href={`/forum?tag=${encodeURIComponent(tag)}`}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-blue-50 text-blue-700 hover:bg-blue-100"
                                >
                                  <Tag className="w-3 h-3" />
                                  {tag}
                                </Link>
                              ))}
                            </div>
                          )}

                          {/* Meta */}
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                <span>{question.userName}</span>
                              </div>
                              {question.categoryName && (
                                <Link
                                  href={`/forum?category=${question.categoryId}`}
                                  className="hover:text-blue-600"
                                >
                                  {question.categoryName}
                                </Link>
                              )}
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{formatDate(question.lastActivityAt || question.updatedAt || question.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Trước
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
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
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? 'default' : 'outline'}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Sau
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Categories */}
            <Card className="bg-white">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Danh mục</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/forum?category=${category.id}`}
                      className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {category.color && (
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                        )}
                        <span className="text-sm text-gray-700">{category.name}</span>
                      </div>
                      {category.questionCount !== undefined && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {category.questionCount}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Popular Tags */}
            <Card className="bg-white">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Tags phổ biến</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.slice(0, 20).map((tag) => (
                    <Link
                      key={tag.id || tag.name}
                      href={`/forum?tag=${encodeURIComponent(tag.name)}`}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                    >
                      <Tag className="w-3 h-3" />
                      {tag.name}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            {stats && (
              <Card className="bg-white">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Thống kê</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tổng câu hỏi</span>
                      <span className="font-semibold">{stats.totalQuestions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Đã giải quyết</span>
                      <span className="font-semibold text-green-600">{stats.solvedQuestions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tổng trả lời</span>
                      <span className="font-semibold">{stats.totalAnswers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Thành viên</span>
                      <span className="font-semibold">{stats.totalUsers}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

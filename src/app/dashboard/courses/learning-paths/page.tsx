'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  BarChart3,
  Users,
  BookOpen,
  BookmarkCheck,
  TrendingUp,
  Calendar,
  Edit,
  Trash2,
  Info,
  Layers,
  CheckCircle,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { learningPathApi, LearningPath } from '@/services/learningPathApi';
import { cn } from '@/lib/utils';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import RejectLearningPathModal from '@/components/modals/RejectLearningPathModal';

const difficultyColors: Record<string, string> = {
  NhanBiet: 'bg-sky-100 text-sky-700',
  ThongHieu: 'bg-emerald-100 text-emerald-700',
  VanDungThap: 'bg-amber-100 text-amber-700',
  VanDungCao: 'bg-purple-100 text-purple-700',
};

export default function LearningPathsPage() {
  const router = useRouter();

  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<'createdAt' | 'title' | 'price'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pathToDelete, setPathToDelete] = useState<LearningPath | null>(null);
  const [processing, setProcessing] = useState(false);
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedPathForReject, setSelectedPathForReject] = useState<LearningPath | null>(null);

  const fetchLearningPaths = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await learningPathApi.getLearningPaths({
        page,
        pageSize,
        sortBy,
        sortOrder,
      });
      setLearningPaths(result.items);
      setTotal(result.total);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải danh sách lộ trình học';
      setError(message);
      console.error('LearningPathsPage', err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortBy, sortOrder]);

  useEffect(() => {
    fetchLearningPaths();
  }, [fetchLearningPaths]);

  // Filter by active tab (client-side filter)
  const filteredLearningPaths = useMemo(() => {
    let filtered = learningPaths;

    // Filter by isActive
    if (activeTab === 'active') {
      filtered = filtered.filter(lp => lp.isActive === true);
    } else if (activeTab === 'inactive') {
      filtered = filtered.filter(lp => lp.isActive === false);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((lp) => {
        return (
          lp.title.toLowerCase().includes(term) ||
          lp.instructor?.name?.toLowerCase().includes(term) ||
          lp.category?.name?.toLowerCase().includes(term)
        );
      });
    }

    return filtered;
  }, [learningPaths, searchTerm, activeTab]);

  const handleTabChange = (tab: 'all' | 'active' | 'inactive') => {
    setActiveTab(tab);
    setPage(1); // Reset to first page when changing tab
  };

  const handleRestore = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn khôi phục lộ trình học này?')) return;

    try {
      setProcessing(true);
      await learningPathApi.restoreLearningPath(id);
      await fetchLearningPaths();
      alert('Khôi phục lộ trình học thành công!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể khôi phục lộ trình học';
      alert(message);
      console.error('Restore learning path', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleApproveLearningPath = async (pathId: number) => {
    if (!confirm('Bạn có chắc muốn duyệt lộ trình học này?')) return;
    
    try {
      setProcessing(true);
      const resp = await authenticatedFetch(`/api/admin/learning-paths/${pathId}/approve`, {
        method: 'POST'
      });
      
      if (resp.ok) {
        alert('Đã duyệt lộ trình học thành công!');
        await fetchLearningPaths();
      } else {
        const data = await resp.json();
        alert(data?.Message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      alert('Có lỗi xảy ra khi duyệt lộ trình học');
      console.error('Approve learning path error:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectLearningPath = async (reason: string) => {
    if (!selectedPathForReject) return;
    
    try {
      setProcessing(true);
      const resp = await authenticatedFetch(`/api/admin/learning-paths/${selectedPathForReject.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Reason: reason })
      });
      
      if (resp.ok) {
        alert('Đã từ chối lộ trình học. Giảng viên sẽ nhận được thông báo với lý do từ chối.');
        setRejectModalOpen(false);
        setSelectedPathForReject(null);
        await fetchLearningPaths();
      } else {
        const data = await resp.json();
        alert(data?.Message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      alert('Có lỗi xảy ra khi từ chối lộ trình học');
      console.error('Reject learning path error:', err);
    } finally {
      setProcessing(false);
    }
  };

  const openRejectModal = (path: LearningPath) => {
    setSelectedPathForReject(path);
    setRejectModalOpen(true);
  };

  const analytics = useMemo(() => {
    if (!learningPaths.length) {
      return {
        totalPaths: 0,
        publishedPaths: 0,
        pendingPaths: 0,
        totalEnrollments: 0,
        avgCourses: 0,
        topByEnrollment: [] as LearningPath[],
      };
    }

    const totalPaths = total;
    const publishedPaths = learningPaths.filter((lp) => lp.isPublished).length;
    const pendingPaths = learningPaths.filter((lp) => lp.approvalStatusName !== 'Approved').length;
    const totalEnrollments = learningPaths.reduce((sum, lp) => sum + (lp.enrollmentCount || 0), 0);
    const avgCourses =
      learningPaths.reduce((sum, lp) => sum + (lp.courseCount || 0), 0) / learningPaths.length;

    const topByEnrollment = [...learningPaths]
      .sort((a, b) => (b.enrollmentCount ?? 0) - (a.enrollmentCount ?? 0))
      .slice(0, 5);

    return {
      totalPaths,
      publishedPaths,
      pendingPaths,
      totalEnrollments,
      avgCourses: Number.isFinite(avgCourses) ? avgCourses : 0,
      topByEnrollment,
    };
  }, [learningPaths, total]);

  const handleOpenDetail = async (path: LearningPath) => {
    setSelectedPath(path);
    setDetailDialogOpen(true);
    setDetailLoading(true);
    try {
      // Fetch full details including courses
      const fullDetails = await learningPathApi.getLearningPathById(path.id);
      
      // If courses are not included, fetch them separately
      if (!fullDetails.courses || fullDetails.courses.length === 0) {
        try {
          const courses = await learningPathApi.getLearningPathCourses(path.id);
          fullDetails.courses = courses;
        } catch (courseErr) {
          console.error('Failed to fetch courses:', courseErr);
          // Continue without courses
        }
      }
      
      setSelectedPath(fullDetails);
    } catch (err) {
      console.error('Failed to fetch learning path details:', err);
      // Keep the original path data if fetch fails
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!pathToDelete) return;
    try {
      setProcessing(true);
      await learningPathApi.deleteLearningPath(pathToDelete.id);
      setDeleteDialogOpen(false);
      setPathToDelete(null);
      fetchLearningPaths();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể xóa lộ trình học';
      alert(message);
      console.error('Delete learning path', err);
    } finally {
      setProcessing(false);
    }
  };

  const difficultyBadge = (name: string) => {
    const color = difficultyColors[name] ?? 'bg-slate-100 text-slate-700';
    return <Badge className={cn('font-medium', color)}>{name}</Badge>;
  };

  const renderStatus = (path: LearningPath) => {
    if (!path.isPublished) {
      return (
        <Badge variant="secondary" className="font-medium">
          Bản nháp
        </Badge>
      );
    }
    if (path.approvalStatusName !== 'Approved') {
      return (
        <Badge variant="secondary" className="font-medium text-amber-600">
          Chờ duyệt
        </Badge>
      );
    }
    return (
      <Badge className="font-medium bg-emerald-100 text-emerald-700">Đang hiển thị</Badge>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý lộ trình học</h1>
          <p className="text-gray-500 mt-1">
            Theo dõi hiệu quả và quản trị các lộ trình học tập trong hệ thống
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/dashboard/courses/learning-paths/create')}>
            <Plus className="w-4 h-4 mr-2" />
            Tạo lộ trình
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Tổng lộ trình</CardTitle>
            <Layers className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{analytics.totalPaths}</div>
            <p className="text-xs text-gray-500">Số lượng lộ trình đang có trong hệ thống</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Đang hiển thị</CardTitle>
            <BookmarkCheck className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{analytics.publishedPaths}</div>
            <p className="text-xs text-gray-500">Lộ trình đã duyệt và đang mở cho học viên</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Đang chờ duyệt</CardTitle>
            <Calendar className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{analytics.pendingPaths}</div>
            <p className="text-xs text-gray-500">Lộ trình cần xem xét hoặc cập nhật</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Học viên tham gia</CardTitle>
            <Users className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{analytics.totalEnrollments.toLocaleString('vi-VN')}</div>
            <p className="text-xs text-gray-500">
              Trung bình {analytics.avgCourses.toFixed(1)} khóa học mỗi lộ trình
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Phân tích nhanh</CardTitle>
          <CardDescription>Top lộ trình theo lượt tham gia trong trang hiện tại</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.topByEnrollment.length === 0 ? (
            <div className="text-sm text-gray-500">Chưa có dữ liệu thống kê</div>
          ) : (
            <div className="space-y-3">
              {analytics.topByEnrollment.map((path) => {
                const maxEnroll =
                  analytics.topByEnrollment[0]?.enrollmentCount || 1;
                const percent = maxEnroll === 0 ? 0 : (path.enrollmentCount / maxEnroll) * 100;
                return (
                  <div key={path.id}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{path.title}</span>
                      <span className="text-sm text-gray-500">
                        {path.enrollmentCount.toLocaleString('vi-VN')} học viên
                      </span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <CardHeader className="pb-0">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              <button
                onClick={() => handleTabChange('all')}
                className={`flex items-center px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === 'all'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Layers className="h-5 w-5 mr-2" />
                Tất cả
              </button>
              <button
                onClick={() => handleTabChange('active')}
                className={`flex items-center px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === 'active'
                    ? 'border-green-500 text-green-600 bg-green-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Đang hoạt động
              </button>
              <button
                onClick={() => handleTabChange('inactive')}
                className={`flex items-center px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === 'inactive'
                    ? 'border-red-500 text-red-600 bg-red-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <XCircle className="h-5 w-5 mr-2" />
                Đã vô hiệu
              </button>
            </nav>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách lộ trình học ({filteredLearningPaths.length})</CardTitle>
          <CardDescription>Quản lý nội dung, trạng thái và hiệu suất lộ trình</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm theo tên lộ trình, giảng viên hoặc danh mục..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSortBy('createdAt');
                  setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                }}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Mới nhất
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSortBy('title');
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                }}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Tên A-Z
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40 text-gray-500">
              Đang tải dữ liệu...
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md text-sm">
              {error}
            </div>
          ) : filteredLearningPaths.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              Không có lộ trình nào
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lộ trình</TableHead>
                    <TableHead>Giảng viên</TableHead>
                    <TableHead>Khóa học</TableHead>
                    <TableHead>Học viên</TableHead>
                    <TableHead>Độ khó</TableHead>
                    <TableHead>Giá</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLearningPaths.map((path) => (
                    <TableRow key={path.id}>
                      <TableCell className="max-w-xs">
                        <div className="space-y-1">
                          <div className="font-semibold text-gray-900 line-clamp-2">
                            {path.title}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-2">
                            <BookOpen className="w-3 h-3" />
                            {path.category?.name || 'Chưa phân loại'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium text-gray-700">
                          {path.instructor?.name || 'Ẩn danh'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-700">{path.courseCount}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-700">
                          {path.enrollmentCount.toLocaleString('vi-VN')}
                        </div>
                      </TableCell>
                      <TableCell>{difficultyBadge(path.difficultyLevelName)}</TableCell>
                      <TableCell>
                        <div className="text-sm font-semibold text-gray-800">
                          {path.price === 0 ? 'Miễn phí' : `${path.price.toLocaleString('vi-VN')} VNĐ`}
                        </div>
                      </TableCell>
                      <TableCell>{renderStatus(path)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Info className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleOpenDetail(path)}>
                              <Info className="w-4 h-4 mr-2" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/dashboard/courses/learning-paths/${path.id}/edit`)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            {path.approvalStatusName === 'Pending' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleApproveLearningPath(path.id)}
                                  className="text-green-600 focus:text-green-600"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Duyệt
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openRejectModal(path)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Từ chối
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
                            {path.isActive === false ? (
                              <DropdownMenuItem
                                onClick={() => handleRestore(path.id)}
                                className="text-green-600 focus:text-green-600"
                              >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Khôi phục
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => {
                                  setPathToDelete(path);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Xóa lộ trình
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {filteredLearningPaths.length > pageSize && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Trang {page} / {Math.ceil(filteredLearningPaths.length / pageSize)}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1 || loading}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  Trang trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={loading || page * pageSize >= total}
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  Trang sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={detailDialogOpen}
        onOpenChange={(open) => {
          setDetailDialogOpen(open);
          if (!open) {
            // Reset when closing
            setSelectedPath(null);
            setDetailLoading(false);
          }
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Chi tiết lộ trình học</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về cấu trúc và hiệu suất của lộ trình
            </DialogDescription>
          </DialogHeader>

          {selectedPath && (
            <div className="space-y-6">
              {detailLoading ? (
                <div className="flex items-center justify-center h-40 text-gray-500">
                  Đang tải chi tiết...
                </div>
              ) : (
                <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Thông tin chung</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-gray-700">
                    <div className="font-semibold text-lg text-gray-900">{selectedPath.title}</div>
                    {selectedPath.description ? (
                      <div
                        className="prose prose-sm max-w-none text-gray-700"
                        dangerouslySetInnerHTML={{ __html: selectedPath.description }}
                      />
                    ) : (
                      <div className="text-gray-500 text-sm">Chưa có mô tả</div>
                    )}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {difficultyBadge(selectedPath.difficultyLevelName)}
                      <Badge variant="outline">
                        {selectedPath.category?.name ?? 'Chưa phân loại'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Hiệu suất</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-xs text-gray-500">Số khóa học</div>
                      <div className="text-lg font-semibold text-gray-900">{selectedPath.courseCount}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Học viên tham gia</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {selectedPath.enrollmentCount.toLocaleString('vi-VN')}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Trạng thái</div>
                      <div className="mt-1">{renderStatus(selectedPath)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Ngày tạo</div>
                      <div className="text-sm text-gray-700">
                        {new Date(selectedPath.createdAt).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Danh sách khóa học (
                    {selectedPath.courses && selectedPath.courses.length > 0
                      ? selectedPath.courses.length
                      : selectedPath.courseCount}
                    )
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedPath.courses && selectedPath.courses.length > 0 ? (
                    <div className="space-y-3">
                      {selectedPath.courses
                        .sort((a, b) => a.orderIndex - b.orderIndex)
                        .map((course) => (
                          <div
                            key={course.id}
                            className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
                          >
                            <div className="flex items-start gap-4">
                              {course.course?.thumbnail ? (
                                <img
                                  src={course.course.thumbnail}
                                  alt={course.course.title}
                                  className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                                />
                              ) : (
                                <div className="w-20 h-20 bg-slate-100 rounded-md flex items-center justify-center flex-shrink-0">
                                  <BookOpen className="w-8 h-8 text-slate-400" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                        #{course.orderIndex}
                                      </span>
                                      {course.isRequired ? (
                                        <Badge variant="outline" className="text-xs">
                                          Bắt buộc
                                        </Badge>
                                      ) : (
                                        <Badge variant="secondary" className="text-xs">
                                          Tùy chọn
                                        </Badge>
                                      )}
                                    </div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                                      {course.course?.title ?? `Khóa học #${course.courseId}`}
                                    </h4>
                                    {course.course?.id && (
                                      <div className="text-xs text-gray-500">
                                        ID: {course.course.id}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <div className="text-sm font-semibold text-gray-900">
                                      {course.course?.price
                                        ? course.course.price === 0
                                          ? 'Miễn phí'
                                          : `${course.course.price.toLocaleString('vi-VN')} VNĐ`
                                        : '—'}
                                    </div>
                                  </div>
                                </div>
                                {course.course?.id && (
                                  <div className="mt-3 pt-3 border-t border-slate-100">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        router.push(`/dashboard/courses/${course.course?.id}/edit`)
                                      }
                                      className="w-full"
                                    >
                                      <Edit className="w-3 h-3 mr-2" />
                                      Xem chi tiết khóa học
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">Lộ trình chưa có khóa học nào.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa lộ trình học</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa lộ trình{' '}
              <span className="font-semibold text-gray-900">{pathToDelete?.title}</span>? Hành động
              này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={processing}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={processing}>
              {processing ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Learning Path Modal */}
      <RejectLearningPathModal
        isOpen={rejectModalOpen}
        pathTitle={selectedPathForReject?.title || ''}
        onClose={() => {
          setRejectModalOpen(false);
          setSelectedPathForReject(null);
        }}
        onConfirm={handleRejectLearningPath}
      />
    </div>
  );
}



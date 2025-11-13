'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Video, Calendar, Clock, Users, Search, Filter, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { liveClassApiService, LiveClassDTO } from '@/services/liveClassApi';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';

const getStatusLabel = (status: number) => {
  switch (status) {
    case 0: return 'Đã lên lịch';
    case 1: return 'Đang diễn ra';
    case 2: return 'Đã kết thúc';
    case 3: return 'Đã hủy';
    default: return 'Không xác định';
  }
};

const getStatusColor = (status: number) => {
  switch (status) {
    case 0: return 'bg-blue-100 text-blue-800';
    case 1: return 'bg-green-100 text-green-800';
    case 2: return 'bg-gray-100 text-gray-800';
    case 3: return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function LiveClassesPage() {
  const router = useRouter();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [liveClasses, setLiveClasses] = useState<LiveClassDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | 'all'>('all');
  const [upcomingFilter, setUpcomingFilter] = useState<boolean | 'all'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchLiveClasses();
  }, [page, statusFilter, upcomingFilter]);

  const fetchLiveClasses = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page,
        pageSize: 20,
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (upcomingFilter !== 'all') {
        params.upcoming = upcomingFilter;
      }

      const result = await liveClassApiService.getLiveClasses(authenticatedFetch, params);
      setLiveClasses(result.items);
      setTotal(result.total);
      setTotalPages(result.totalPages || Math.ceil(result.total / result.pageSize));
    } catch (err: any) {
      console.error('Error fetching live classes:', err);
      setError(err.message || 'Không thể tải danh sách lớp học');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa lớp học này?')) return;

    try {
      await liveClassApiService.deleteLiveClass(authenticatedFetch, id);
      await fetchLiveClasses();
    } catch (err: any) {
      alert(err.message || 'Không thể xóa lớp học');
    }
  };

  const handleStart = async (id: number) => {
    if (!confirm('Bắt đầu lớp học này ngay bây giờ?')) return;

    try {
      await liveClassApiService.startLiveClass(authenticatedFetch, id);
      await fetchLiveClasses();
    } catch (err: any) {
      alert(err.message || 'Không thể bắt đầu lớp học');
    }
  };

  const handleEnd = async (id: number) => {
    if (!confirm('Kết thúc lớp học này? Học viên sẽ không thể tham gia sau khi kết thúc.')) return;

    try {
      await liveClassApiService.endLiveClass(authenticatedFetch, id);
      await fetchLiveClasses();
    } catch (err: any) {
      alert(err.message || 'Không thể kết thúc lớp học');
    }
  };

  const filteredClasses = liveClasses.filter(lc => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return lc.title.toLowerCase().includes(query) || 
             lc.description.toLowerCase().includes(query);
    }
    return true;
  });

  const stats = {
    total: total,
    scheduled: liveClasses.filter(lc => lc.status === 0).length,
    live: liveClasses.filter(lc => lc.status === 1).length,
    ended: liveClasses.filter(lc => lc.status === 2).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Quản lý lớp học trực tuyến
              </h1>
              <p className="text-gray-600 mt-2">Quản lý các buổi học trực tuyến của bạn</p>
            </div>
            <Button
              onClick={() => router.push('/dashboard/live-classes/create')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tạo lớp học mới
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Video className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Tổng lớp học</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Đã lên lịch</p>
                  <p className="text-2xl font-bold">{stats.scheduled}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Video className="w-8 h-8 text-red-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Đang diễn ra</p>
                  <p className="text-2xl font-bold">{stats.live}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Đã kết thúc</p>
                  <p className="text-2xl font-bold">{stats.ended}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm lớp học..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={statusFilter === 'all' ? 'all' : statusFilter.toString()}
                onValueChange={(value) => setStatusFilter(value === 'all' ? 'all' : parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Lọc theo trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="0">Đã lên lịch</SelectItem>
                  <SelectItem value="1">Đang diễn ra</SelectItem>
                  <SelectItem value="2">Đã kết thúc</SelectItem>
                  <SelectItem value="3">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={upcomingFilter === 'all' ? 'all' : upcomingFilter.toString()}
                onValueChange={(value) => setUpcomingFilter(value === 'all' ? 'all' : value === 'true')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Lọc theo thời gian" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="true">Sắp diễn ra</SelectItem>
                  <SelectItem value="false">Đã qua</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Live Classes List */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách lớp học</CardTitle>
            <CardDescription>
              {loading ? 'Đang tải...' : `Hiển thị ${filteredClasses.length} lớp học`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Đang tải...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
                <Button onClick={fetchLiveClasses} className="mt-4" variant="outline">
                  Thử lại
                </Button>
              </div>
            ) : filteredClasses.length === 0 ? (
              <div className="text-center py-12">
                <Video className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">Chưa có lớp học nào</p>
                <Button
                  onClick={() => router.push('/dashboard/live-classes/create')}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo lớp học đầu tiên
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredClasses.map((liveClass) => (
                  <div
                    key={liveClass.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{liveClass.title}</h3>
                          <Badge className={getStatusColor(liveClass.status)}>
                            {getStatusLabel(liveClass.status)}
                          </Badge>
                        </div>
                        <div
                          className="prose prose-sm text-gray-600 mb-3 max-w-none"
                          dangerouslySetInnerHTML={{ __html: liveClass.description }}
                        />
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(liveClass.scheduledAt).toLocaleDateString('vi-VN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(liveClass.scheduledAt).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })} ({liveClass.durationMinutes} phút)
                          </div>
                          {liveClass.maxParticipants && (
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              Tối đa {liveClass.maxParticipants} học viên
                            </div>
                          )}
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          {liveClass.status === 0 && (
                            <Button
                              size="sm"
                              onClick={() => handleStart(liveClass.id)}
                              className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
                            >
                              Bắt đầu lớp học
                            </Button>
                          )}
                          {liveClass.status === 1 && (
                            <>
                              <a
                                href={liveClass.meetingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-semibold text-green-700 hover:underline"
                              >
                                Tham gia lớp học →
                              </a>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEnd(liveClass.id)}
                              >
                                Kết thúc lớp học
                              </Button>
                            </>
                          )}
                          {liveClass.status === 2 && (
                            <span className="text-sm text-gray-500">
                              Lớp học đã kết thúc. Học viên không thể tham gia nữa.
                            </span>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/live-classes/${liveClass.id}`)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/live-classes/${liveClass.id}?edit=true`)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(liveClass.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Trang {page} / {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Trước
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


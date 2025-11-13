'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Calendar,
  Loader2,
  Info,
  RefreshCcw,
  Check,
  Clock,
  PauseCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { couponApi, Coupon } from '@/services/couponApi';
import { cn } from '@/lib/utils';

export default function CouponsPage() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(20);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const result = await couponApi.getCoupons({
        page,
        pageSize,
        isActive: filterActive,
        search: searchTerm || undefined
      });
      setCoupons(result.items);
      setTotal(result.total);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      alert(error instanceof Error ? error.message : 'Lỗi khi tải danh sách mã giảm giá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [page, filterActive]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        fetchCoupons();
      } else {
        setPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleDelete = async () => {
    if (!couponToDelete) return;
    
    try {
      setDeleting(true);
      await couponApi.deleteCoupon(couponToDelete.id);
      setDeleteDialogOpen(false);
      setCouponToDelete(null);
      fetchCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      alert(error instanceof Error ? error.message : 'Lỗi khi xóa mã giảm giá');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (coupon: Coupon, isActive: boolean) => {
    try {
      setTogglingId(coupon.id);
      const updated = await couponApi.updateCoupon(coupon.id, { isActive });
      setCoupons(prev =>
        prev.map(item => (item.id === coupon.id ? { ...item, ...updated } : item))
      );
    } catch (error) {
      console.error('Error updating coupon status:', error);
      alert(error instanceof Error ? error.message : 'Không thể cập nhật trạng thái mã giảm giá');
    } finally {
      setTogglingId(null);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchCoupons();
    } finally {
      setRefreshing(false);
    }
  };

  const openDetailDialog = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setDetailDialogOpen(true);
  };

  const couponStats = useMemo(() => {
    const now = new Date();
    const active = coupons.filter(coupon => coupon.isActive).length;
    const upcoming = coupons.filter(coupon => new Date(coupon.validFrom) > now).length;
    const expired = coupons.filter(coupon => new Date(coupon.validTo) < now).length;
    const totalUsage = coupons.reduce((sum, coupon) => sum + (coupon.usedCount || 0), 0);
    const totalLimit = coupons.reduce(
      (sum, coupon) => sum + (coupon.usageLimit ?? 0),
      0
    );

    return {
      active,
      upcoming,
      expired,
      totalUsage,
      totalLimit,
      usageRate: totalLimit > 0 ? Math.min(100, Math.round((totalUsage / totalLimit) * 100)) : null
    };
  }, [coupons]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discountType === 0) {
      return `${coupon.discountValue}%`;
    } else {
      return `${coupon.discountValue.toLocaleString('vi-VN')} VNĐ`;
    }
  };

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return 'Không giới hạn';
    return `${value.toLocaleString('vi-VN')} VNĐ`;
  };

  const renderApplicableTypes = (coupon: Coupon) => {
    if (!coupon.applicableItemTypes?.length) return 'Tất cả sản phẩm';
    return coupon.applicableItemTypes
      .map(type => {
        switch (type) {
          case 0:
            return 'Sách';
          case 1:
            return 'Khóa học';
          default:
            return 'Khác';
        }
      })
      .join(', ');
  };

  const renderUsage = (coupon: Coupon) => {
    if (!coupon.usageLimit) {
      return `${coupon.usedCount} lần`;
    }
    return `${coupon.usedCount} / ${coupon.usageLimit} lần`;
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý mã giảm giá</h1>
          <p className="text-gray-500 mt-1">Tạo và quản lý các mã giảm giá cho khách hàng</p>
        </div>
        <Button onClick={() => router.push('/dashboard/coupons/create')}>
          <Plus className="w-4 h-4 mr-2" />
          Tạo mã giảm giá
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Mã đang hoạt động</CardTitle>
            <Check className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{couponStats.active}</div>
            <p className="text-xs text-gray-500">Đang hiển thị trên trang thanh toán</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Sắp diễn ra</CardTitle>
            <Clock className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{couponStats.upcoming}</div>
            <p className="text-xs text-gray-500">Chưa tới ngày hiệu lực</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Đã hết hạn</CardTitle>
            <PauseCircle className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{couponStats.expired}</div>
            <p className="text-xs text-gray-500">Cần gia hạn để sử dụng lại</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Mức sử dụng</CardTitle>
            <RefreshCcw className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {couponStats.totalUsage.toLocaleString('vi-VN')}
            </div>
            <p className="text-xs text-gray-500">
              {couponStats.usageRate !== null
                ? `Đạt ${couponStats.usageRate}% giới hạn`
                : 'Không giới hạn số lần'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tìm kiếm & Lọc</CardTitle>
          <CardDescription>Tìm kiếm theo mã hoặc tên mã giảm giá</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm theo mã hoặc tên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterActive === undefined ? 'default' : 'outline'}
                onClick={() => setFilterActive(undefined)}
              >
                Tất cả
              </Button>
              <Button
                variant={filterActive === true ? 'default' : 'outline'}
                onClick={() => setFilterActive(true)}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Đang hoạt động
              </Button>
              <Button
                variant={filterActive === false ? 'default' : 'outline'}
                onClick={() => setFilterActive(false)}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Đã tắt
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleRefresh} disabled={loading || refreshing}>
                <RefreshCcw className={cn('w-4 h-4 mr-2', refreshing && 'animate-spin')} />
                Làm mới
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách mã giảm giá ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-40 text-gray-500">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Đang tải...
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              Không có mã giảm giá nào
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã</TableHead>
                    <TableHead>Tên</TableHead>
                    <TableHead>Loại giảm giá</TableHead>
                    <TableHead>Giá trị</TableHead>
                    <TableHead>Hiệu lực</TableHead>
                    <TableHead>Sử dụng</TableHead>
                    <TableHead>Loại áp dụng</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell className="font-mono font-semibold">
                        {coupon.code}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{coupon.name}</div>
                          {coupon.description && (
                            <div className="text-sm text-gray-500">{coupon.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {coupon.discountType === 0 ? 'Phần trăm' : 'Số tiền'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatDiscount(coupon)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(coupon.validFrom)}
                          </div>
                          <div className="flex items-center gap-1 text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {formatDate(coupon.validTo)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {coupon.usedCount} / {coupon.usageLimit ?? '∞'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {renderApplicableTypes(coupon)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={coupon.isActive}
                            onCheckedChange={(checked) => handleToggleActive(coupon, checked)}
                            disabled={togglingId === coupon.id}
                          />
                          <Badge variant={coupon.isActive ? 'default' : 'secondary'}>
                            {coupon.isActive ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Hoạt động
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 mr-1" />
                                Đã tắt
                              </>
                            )}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Info className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => openDetailDialog(coupon)}>
                              <Info className="w-4 h-4 mr-2" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/coupons/${coupon.id}/edit`)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => {
                                setCouponToDelete(coupon);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Xóa mã giảm giá
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {total > pageSize && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Trang {page} / {Math.ceil(total / pageSize)}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Trang trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={loading || (page * pageSize) >= total}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Trang sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Thông tin mã giảm giá</DialogTitle>
            <DialogDescription>
              Chi tiết cấu hình và lịch sử sử dụng của mã{' '}
              <span className="font-semibold">{selectedCoupon?.code}</span>
            </DialogDescription>
          </DialogHeader>
          {selectedCoupon && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Tên mã</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-base font-semibold text-gray-900">{selectedCoupon.name}</p>
                    {selectedCoupon.description && (
                      <p className="text-sm text-gray-500 mt-1">{selectedCoupon.description}</p>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Giá trị giảm</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-lg font-semibold">{formatDiscount(selectedCoupon)}</div>
                    <div className="text-sm text-gray-500">
                      Giảm tối đa: {formatCurrency(selectedCoupon.maxDiscountAmount)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Đơn hàng tối thiểu: {formatCurrency(selectedCoupon.minOrderAmount)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Hiệu lực</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <div>Ngày bắt đầu: {formatDateTime(selectedCoupon.validFrom)}</div>
                    <div>Ngày kết thúc: {formatDateTime(selectedCoupon.validTo)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Trạng thái</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Badge variant={selectedCoupon.isActive ? 'default' : 'secondary'}>
                      {selectedCoupon.isActive ? 'Đang hoạt động' : 'Đã tắt'}
                    </Badge>
                    <div className="text-sm text-gray-500">
                      Sử dụng: {renderUsage(selectedCoupon)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Đối tượng áp dụng</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div>Loại sản phẩm: {renderApplicableTypes(selectedCoupon)}</div>
                    {selectedCoupon.applicableItemIds?.length ? (
                      <div>
                        <div className="font-medium text-gray-700">ID áp dụng cụ thể:</div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {selectedCoupon.applicableItemIds.map(id => (
                            <Badge key={id} variant="outline">{id}</Badge>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>Áp dụng cho tất cả sản phẩm thuộc loại đã chọn</div>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Lần cập nhật</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div>Ngày tạo: {formatDateTime(selectedCoupon.createdAt)}</div>
                    <div>
                      Cập nhật gần nhất:{' '}
                      {selectedCoupon.updatedAt ? formatDateTime(selectedCoupon.updatedAt) : 'Chưa cập nhật'}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa mã giảm giá</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa mã giảm giá "{couponToDelete?.name}"? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                'Xóa'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


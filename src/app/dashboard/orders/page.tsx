'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { orderApi, Order } from '@/services/orderApi';
import { useAuth } from '@/contexts/AuthContext';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const orderStatusLabels: Record<number, { label: string; color: string }> = {
  0: { label: 'Chờ thanh toán', color: 'bg-yellow-100 text-yellow-800' },
  1: { label: 'Đã thanh toán', color: 'bg-green-100 text-green-800' },
  2: { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-800' },
  3: { label: 'Đã hoàn thành', color: 'bg-green-100 text-green-800' },
  4: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
  5: { label: 'Hoàn tiền', color: 'bg-gray-100 text-gray-800' },
};

export default function OrdersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  const [searchInput, setSearchInput] = useState('');

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await orderApi.getOrders({
        page,
        pageSize,
        status: statusFilter,
        search: search || undefined,
      });
      setOrders(result.items);
      setTotal(result.total);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải danh sách đơn hàng');
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter, search]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('vi-VN');
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý đơn hàng</h1>
          <p className="text-sm text-gray-600 mt-1">
            {user?.role === 'instructor'
              ? 'Danh sách đơn hàng của các khóa học và sách bạn tạo'
              : 'Quản lý và theo dõi tất cả đơn hàng trong hệ thống'}
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/orders/analytics')} variant="outline">
          Thống kê đơn hàng
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FunnelIcon className="w-5 h-5" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm theo mã đơn hàng, tên người dùng..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={statusFilter === undefined ? 'all' : String(statusFilter)}
              onValueChange={(value) => {
                if (value === 'all') setStatusFilter(undefined);
                else setStatusFilter(Number(value));
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái đơn hàng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {Object.entries(orderStatusLabels).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="ml-3 text-gray-600">Đang tải đơn hàng...</p>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <XCircleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Không có đơn hàng nào</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{order.orderCode}</h3>
                      {order.status !== undefined && orderStatusLabels[order.status] && (
                        <Badge className={orderStatusLabels[order.status].color}>
                          {orderStatusLabels[order.status].label}
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Khách hàng</p>
                        <p className="font-medium text-gray-900">
                          {order.user?.fullName || order.user?.username || 'N/A'}
                        </p>
                        {order.user?.email && (
                          <p className="text-gray-600 text-xs">{order.user.email}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-gray-500">Thời gian</p>
                        <p className="font-medium text-gray-900">{formatDate(order.createdAt)}</p>
                        {order.paidAt && (
                          <p className="text-green-600 text-xs">Đã thanh toán: {formatDate(order.paidAt)}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-gray-500">Sản phẩm</p>
                        <div className="space-y-1">
                          {order.orderItems?.slice(0, 3).map((item, idx) => (
                            <p key={idx} className="text-gray-900 text-xs">
                              {item.itemName} x{item.quantity}
                            </p>
                          ))}
                          {order.orderItems && order.orderItems.length > 3 && (
                            <p className="text-gray-500 text-xs">
                              +{order.orderItems.length - 3} sản phẩm khác
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-500">Tổng tiền</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatCurrency(order.finalAmount)}
                        </p>
                        {order.discountAmount > 0 && (
                          <p className="text-green-600 text-xs">
                            Đã giảm: {formatCurrency(order.discountAmount)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                      className="flex items-center gap-2"
                    >
                      <EyeIcon className="w-4 h-4" />
                      Chi tiết
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > pageSize && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Trang {page} / {Math.ceil(total / pageSize)} ({total} đơn hàng)
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" disabled={page === 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Trang trước
            </Button>
            <Button
              variant="outline"
              disabled={loading || page * pageSize >= total}
              onClick={() => setPage((p) => p + 1)}
            >
              Trang sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { orderApi, OrderAnalytics } from '@/services/orderApi';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function OrderAnalyticsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<OrderAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await orderApi.getOrderAnalytics();
      setData(result);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải thống kê đơn hàng');
      console.error('Error loading order analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatMonth = (year: number, month: number) => {
    return `Tháng ${month}/${year}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <XCircleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return <div>Không có dữ liệu</div>;
  }

  const maxRevenue = Math.max(...data.monthlyRevenues.map((r) => r.revenue), 1);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Thống kê đơn hàng</h1>
        <p className="text-sm text-gray-600 mt-1">
          {user?.role === 'instructor'
            ? 'Thống kê đơn hàng của các khóa học và sách bạn tạo'
            : 'Tổng quan về đơn hàng và doanh thu trong hệ thống'}
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                <ShoppingCartIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
                <p className="text-2xl font-semibold text-gray-900">{data.totalOrders.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(data.totalRevenue)}</p>
                <p className="text-xs text-gray-500 mt-1">{data.completedOrders} đơn đã thanh toán</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Đơn chờ xử lý</p>
                <p className="text-2xl font-semibold text-gray-900">{data.pendingOrders.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Giá trị TB/đơn</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(data.averageOrderValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Phân bố trạng thái đơn hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.statusCounts.map((status) => (
                <div key={status.status}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {orderStatusLabels[status.status]?.label || status.statusName}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">{status.count.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(status.count / Math.max(...data.statusCounts.map((s) => s.count), 1)) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Doanh thu theo tháng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.monthlyRevenues.slice(-12).map((revenue) => (
                <div key={`${revenue.year}-${revenue.month}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {formatMonth(revenue.year, revenue.month)}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(revenue.revenue)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(revenue.revenue / maxRevenue) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              {data.monthlyRevenues.length === 0 && (
                <p className="text-gray-500 text-center py-8">Chưa có dữ liệu doanh thu</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Đơn đã hoàn thành</p>
                <p className="text-2xl font-semibold text-gray-900">{data.completedOrders.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <XCircleIcon className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Đơn đã hủy</p>
                <p className="text-2xl font-semibold text-gray-900">{data.cancelledOrders.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <ArrowTrendingUpIcon className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Tỷ lệ hoàn thành</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {data.totalOrders > 0
                    ? ((data.completedOrders / data.totalOrders) * 100).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const orderStatusLabels: Record<number, { label: string; color: string }> = {
  0: { label: 'Chờ thanh toán', color: 'bg-yellow-100 text-yellow-800' },
  1: { label: 'Đã thanh toán', color: 'bg-green-100 text-green-800' },
  2: { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-800' },
  3: { label: 'Đã hoàn thành', color: 'bg-green-100 text-green-800' },
  4: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
  5: { label: 'Hoàn tiền', color: 'bg-gray-100 text-gray-800' },
};


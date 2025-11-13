'use client';

import { useState, useEffect } from 'react';
import { orderApi, RevenueAnalyticsResponse } from '@/services/orderApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, TrendingUp, DollarSign, ShoppingCart, Calendar, BarChart3, Users, Package } from 'lucide-react';

const itemTypeLabels: Record<number, string> = {
  0: 'Sách',
  1: 'Khóa học',
  2: 'Lộ trình học',
  3: 'Bài tập',
};

export default function RevenuePage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<RevenueAnalyticsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    loadRevenue();
  }, [days]);

  const loadRevenue = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await orderApi.getRevenueAnalytics(days);
      setData(result);
    } catch (err: any) {
      setError(err?.message || 'Failed to load revenue analytics');
      console.error('Error loading revenue analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="ml-3 text-gray-600">Đang tải dữ liệu thống kê doanh thu...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center py-10">{error}</div>;
  }

  if (!data) {
    return <div className="text-gray-500 text-center py-10">Không có dữ liệu thống kê doanh thu</div>;
  }

  const maxDailyRevenue = data.dailyRevenues.length > 0 
    ? Math.max(...data.dailyRevenues.map(r => r.revenue))
    : 0;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Thống kê doanh thu</h1>
          <p className="text-sm text-gray-600 mt-1">Tổng quan về doanh thu và hiệu suất bán hàng.</p>
        </div>
        <Select value={String(days)} onValueChange={(value) => setDays(Number(value))}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Chọn khoảng thời gian" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 ngày qua</SelectItem>
            <SelectItem value="30">30 ngày qua</SelectItem>
            <SelectItem value="90">90 ngày qua</SelectItem>
            <SelectItem value="365">1 năm qua</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(data.overview.totalRevenue)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Doanh thu hôm nay</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(data.overview.todayRevenue)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Doanh thu tháng này</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(data.overview.thisMonthRevenue)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-orange-100 rounded-lg p-3">
              <ShoppingCart className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Giá trị TB/đơn</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(data.overview.averageOrderValue)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
              <p className="text-2xl font-semibold text-gray-900">{data.overview.totalOrders.toLocaleString()}</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-gray-400" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đơn hàng hôm nay</p>
              <p className="text-2xl font-semibold text-gray-900">{data.overview.todayOrders.toLocaleString()}</p>
            </div>
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Doanh thu TB/ngày</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(data.overview.averageDailyRevenue)}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-gray-400" />
          </div>
        </Card>
      </div>

      {/* Daily Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Doanh thu theo ngày ({days} ngày qua)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.dailyRevenues.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Không có dữ liệu doanh thu theo ngày.</p>
          ) : (
            <div className="space-y-3">
              {data.dailyRevenues.map((daily) => (
                <div key={daily.date} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {new Date(daily.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-500">{daily.orderCount} đơn</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(daily.revenue)}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${maxDailyRevenue > 0 ? (daily.revenue / maxDailyRevenue) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Item Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Doanh thu theo loại sản phẩm
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.revenueByItemType.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Không có dữ liệu doanh thu theo loại sản phẩm.</p>
            ) : (
              <div className="space-y-4">
                {data.revenueByItemType.map((item) => {
                  const totalRevenue = data.revenueByItemType.reduce((sum, i) => sum + i.revenue, 0);
                  const percentage = totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0;
                  return (
                    <div key={item.itemType} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{itemTypeLabels[item.itemType] || item.itemTypeName}</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(item.revenue)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{item.orderCount} đơn hàng</span>
                        <span>•</span>
                        <span>{item.itemCount} sản phẩm</span>
                        <span className="ml-auto">{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue by Instructor */}
        {data.revenueByInstructor.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Doanh thu theo giảng viên (Top 10)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.revenueByInstructor.map((instructor) => (
                  <div key={instructor.instructorId} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      {instructor.avatar ? (
                        <img src={instructor.avatar} alt={instructor.instructorName} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <Users className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{instructor.instructorName}</p>
                        <p className="text-xs text-gray-500">
                          {instructor.courseCount} khóa học • {instructor.bookCount} sách
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(instructor.revenue)}</p>
                      <p className="text-xs text-gray-500">{instructor.orderCount} đơn</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Selling Items */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Sản phẩm bán chạy nhất (Top 20)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.topSellingItems.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Không có dữ liệu sản phẩm bán chạy.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">Sản phẩm</th>
                      <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">Loại</th>
                      <th className="text-right py-2 px-4 text-sm font-medium text-gray-600">Doanh thu</th>
                      <th className="text-right py-2 px-4 text-sm font-medium text-gray-600">Đơn hàng</th>
                      <th className="text-right py-2 px-4 text-sm font-medium text-gray-600">Số lượng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topSellingItems.map((item) => (
                      <tr key={`${item.itemId}-${item.itemType}`} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{item.itemName}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{itemTypeLabels[item.itemType] || item.itemTypeName}</td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-900">{formatCurrency(item.revenue)}</td>
                        <td className="py-3 px-4 text-right text-sm text-gray-600">{item.orderCount}</td>
                        <td className="py-3 px-4 text-right text-sm text-gray-600">{item.quantitySold}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


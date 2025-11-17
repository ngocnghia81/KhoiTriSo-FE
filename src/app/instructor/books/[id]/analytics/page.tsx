'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Star, Coins, Key, Loader2 } from 'lucide-react';
import { fetchWithAutoRefresh } from '@/utils/apiHelpers';
import { bookApiService } from '@/services/bookApi';

type BookAnalytics = {
  BookId: number;
  Title: string;
  TotalActivationCodes: number;
  UsedActivationCodes: number;
  ConversionRate: number;
  TotalRevenue: number;
  Rating: number;
  SalesTrend: { Date: string; Amount: number }[];
};

export default function BookAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params?.id ? parseInt(params.id as string) : null;
  
  const [book, setBook] = useState<any>(null);
  const [data, setData] = useState<BookAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookId) {
      setError('ID sách không hợp lệ');
      setLoading(false);
      return;
    }

    fetchBookAndAnalytics();
  }, [bookId]);

  const fetchBookAndAnalytics = async () => {
    if (!bookId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch book details
      const bookData = await bookApiService.getBookById(bookId);
      setBook(bookData);

      // Fetch analytics
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const res = await fetchWithAutoRefresh(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/analytics/books/${bookId}?period=30d`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.Message || json.message || 'Không thể tải dữ liệu thống kê');
      }
      
      const result = json.Result || json.result;
      if (result) {
        setData(result);
      } else {
        throw new Error('Không có dữ liệu thống kê');
      }
    } catch (e: any) {
      console.error('Error fetching analytics:', e);
      setError(e?.message || 'Không thể tải dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Đang tải dữ liệu thống kê...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        <Button
          onClick={() => router.push(`/instructor/books/${bookId}`)}
          variant="ghost"
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        <Button
          onClick={() => router.push(`/instructor/books/${bookId}`)}
          variant="ghost"
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600">Không có dữ liệu thống kê</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button
          onClick={() => router.push(`/instructor/books/${bookId}`)}
          variant="ghost"
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
        <h1 className="text-3xl font-bold mb-2">Thống kê Sách</h1>
        <p className="text-gray-600">{data.Title}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Tổng mã kích hoạt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              <Key className="w-6 h-6 text-blue-600" />
              {data.TotalActivationCodes.toLocaleString('vi-VN')}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Đã sử dụng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {data.UsedActivationCodes.toLocaleString('vi-VN')}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {data.TotalActivationCodes > 0 
                ? `${((data.UsedActivationCodes / data.TotalActivationCodes) * 100).toFixed(1)}% tổng mã`
                : '0%'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Tỷ lệ chuyển đổi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {data.ConversionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">Mã đã sử dụng / Tổng mã</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Tổng doanh thu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2 text-green-600">
              <Coins className="w-6 h-6" />
              {data.TotalRevenue.toLocaleString('vi-VN')} VNĐ
            </div>
            <p className="text-xs text-gray-500 mt-1">Từ đơn hàng đã thanh toán</p>
          </CardContent>
        </Card>
      </div>

      {/* Rating */}
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            Đánh giá trung bình
          </CardTitle>
          <CardDescription>Đánh giá từ người dùng</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-5xl font-bold">{data.Rating.toFixed(1)}</div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-6 h-6 ${
                    star <= Math.round(data.Rating)
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Trend */}
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Xu hướng sử dụng mã kích hoạt
          </CardTitle>
          <CardDescription>Thống kê 6 tháng gần nhất</CardDescription>
        </CardHeader>
        <CardContent>
          {data.SalesTrend.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Chưa có dữ liệu xu hướng</p>
            </div>
          ) : (
            <div className="flex items-end gap-4 h-64 pb-4">
              {data.SalesTrend.map((point, idx) => {
                const maxAmount = Math.max(...data.SalesTrend.map(p => p.Amount), 1);
                const height = (point.Amount / maxAmount) * 100;
                return (
                  <div key={idx} className="flex flex-col items-center justify-end flex-1">
                    <div
                      className="bg-gradient-to-t from-purple-600 to-purple-400 w-full rounded-t transition-all hover:opacity-80"
                      style={{ height: `${Math.max(20, height)}%` }}
                      title={`${point.Date}: ${point.Amount} mã`}
                    />
                    <div className="text-xs text-gray-500 mt-2 text-center">
                      <div className="font-semibold">{point.Amount}</div>
                      <div className="text-[10px]">{point.Date}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


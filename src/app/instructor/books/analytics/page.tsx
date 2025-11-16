'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TrendingUp, Star, Coins, Key, Search, BookOpen, Loader2 } from 'lucide-react';
import { useBooks } from '@/hooks/useBooks';
import { fetchWithAutoRefresh } from '@/utils/apiHelpers';
import { useAuth } from '@/contexts/AuthContext';

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

export default function BooksAnalyticsPage() {
  const { isAuthenticated, user } = useAuth();
  const userRole = String(user?.role ?? '').toLowerCase();
  const isTeacher = userRole === 'instructor';
  const authorId = isTeacher && user?.id ? Number(user.id) : undefined;

  const [bookQuery, setBookQuery] = useState('');
  const [bookPage, setBookPage] = useState(1);
  const { books: searchBooks, loading: searchLoading, pagination } = useBooks({ 
    page: bookPage, 
    pageSize: 10, 
    search: bookQuery,
    authorId
  }, { enabled: !!isAuthenticated && (!isTeacher || !!authorId) });
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [data, setData] = useState<BookAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPages = pagination?.totalPages || 1;

  useEffect(() => {
    if (selectedBookId) {
      fetchAnalytics(selectedBookId);
    } else {
      setData(null);
    }
  }, [selectedBookId]);

  const fetchAnalytics = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const res = await fetchWithAutoRefresh(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/analytics/books/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.Message || json.message || 'Không thể tải dữ liệu');
      }
      const result = json.Result || json.result;
      setData(result);
    } catch (e: any) {
      setError(e?.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const selectedBook = searchBooks.find(b => b.id === selectedBookId);

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Thống kê Sách</h1>

      {/* Book Search */}
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Tìm & Chọn Sách
          </CardTitle>
          <CardDescription>Tìm theo tiêu đề để xem thống kê</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Nhập từ khóa tên sách..."
                value={bookQuery}
                onChange={(e) => { setBookQuery(e.target.value); setBookPage(1); }}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-gray-500 flex items-center">{searchLoading ? 'Đang tìm...' : `Kết quả: ${searchBooks.length}`}</div>
          </div>

          <div className="mt-4 max-h-80 overflow-y-auto rounded-lg border border-gray-200 bg-white">
            {searchLoading ? (
              <div className="p-4 text-gray-500 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Đang tải...
              </div>
            ) : searchBooks.length === 0 ? (
              <div className="p-4 text-gray-500">Không có kết quả</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {searchBooks.map((b) => (
                  <li key={b.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedBookId(b.id)}
                      className={`w-full text-left p-3 hover:bg-blue-50 ${selectedBookId === b.id ? 'bg-blue-50' : ''}`}
                    >
                      <div className="font-medium text-gray-900">{b.title}</div>
                      <div className="text-xs text-gray-500">ID: {b.id}{b.authorName ? ` • Tác giả: ${b.authorName}` : ''}</div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-3">
            <Button 
              variant="outline" 
              disabled={bookPage === 1 || searchLoading} 
              onClick={() => setBookPage((p) => Math.max(1, p - 1))}
            >
              Trang trước
            </Button>
            <div className="text-sm text-gray-500">
              Trang {bookPage} / {totalPages}
            </div>
            <Button 
              variant="outline" 
              disabled={searchLoading || bookPage >= totalPages} 
              onClick={() => setBookPage((p) => Math.min(totalPages, p + 1))}
            >
              Trang sau
            </Button>
          </div>

          {selectedBook && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Sách đã chọn:</span> {selectedBook.title}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {loading && (
        <div className="text-gray-500">Đang tải...</div>
      )}

      {error && (
        <div className="text-red-600">{error}</div>
      )}

      {data && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold">Thống kê sách: {data.Title}</h1>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Tổng mã</CardTitle></CardHeader>
              <CardContent className="text-2xl font-bold flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-600" /> {data.TotalActivationCodes}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Đã sử dụng</CardTitle></CardHeader>
              <CardContent className="text-2xl font-bold">{data.UsedActivationCodes}</CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Chuyển đổi</CardTitle></CardHeader>
              <CardContent className="text-2xl font-bold">{data.ConversionRate}%</CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Doanh thu</CardTitle></CardHeader>
              <CardContent className="text-2xl font-bold flex items-center gap-2">
                <Coins className="w-5 h-5 text-green-600" /> {data.TotalRevenue.toLocaleString('vi-VN')} VNĐ
              </CardContent>
            </Card>
          </div>

          {/* Rating */}
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Star className="w-4 h-4 text-yellow-500" /> Đánh giá trung bình</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">{data.Rating}</CardContent>
          </Card>

          {/* Sales Trend */}
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4 text-purple-600" /> Xu hướng sử dụng mã (6 tháng)</CardTitle></CardHeader>
            <CardContent>
              {data.SalesTrend.length === 0 ? (
                <div className="text-gray-500">Chưa có dữ liệu</div>
              ) : (
                <div className="flex items-end gap-3 h-40">
                  {data.SalesTrend.map((p, idx) => (
                    <div key={idx} className="flex flex-col items-center justify-end">
                      <div className="bg-blue-500 w-8" style={{ height: `${Math.max(8, Number(p.Amount) * 8)}px` }} />
                      <div className="text-xs text-gray-500 mt-1">{p.Date}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}



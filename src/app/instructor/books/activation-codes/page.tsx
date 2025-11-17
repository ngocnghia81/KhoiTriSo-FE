'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Key,
  Plus,
  Download,
  Copy,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Calendar,
  BookOpen,
  Loader2
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { bookApiService, Book } from '@/services/bookApi';
import { useBooks } from '@/hooks/useBooks';
import { useAuth } from '@/contexts/AuthContext';
interface ActivationCode {
  id: number;
  bookId: number;
  code: string;
  isUsed: boolean;
  usedBy?: number;
  usedByName?: string;
  usedAt?: string;
  createdAt: string;
}

const mapActivationCode = (data: any): ActivationCode => ({
  id: data.Id || data.id,
  bookId: data.BookId || data.bookId,
  code: data.ActivationCode || data.code || data.activationCode,
  isUsed: data.IsUsed ?? data.isUsed ?? false,
  usedBy: data.UsedById || data.usedBy,
  usedByName: data.UsedByFullName || data.usedByName || data.UsedBy?.fullName,
  usedAt: data.UsedAt || data.usedAt,
  createdAt: data.CreatedAt || data.createdAt
});

export default function ActivationCodesPage() {
  const router = useRouter();
  const { books, loading: booksLoading } = useBooks({ pageSize: 100 });
  const { isAuthenticated, user } = useAuth();
  const isTeacher = user?.role === 'instructor' ;
  const authorId = isTeacher && user?.id ? Number(user.id) : undefined;
  const [bookQuery, setBookQuery] = useState('');
  const [bookPage, setBookPage] = useState(1);
  const { books: searchBooks, loading: searchLoading, refetch: refetchBooks } = useBooks({ page: bookPage, pageSize: 10, search: bookQuery, authorId: authorId },{ enabled: !!isAuthenticated && (!isTeacher || !!authorId) });
  
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [codes, setCodes] = useState<ActivationCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Generate dialog state
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [generateCount, setGenerateCount] = useState(1);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (selectedBookId) {
      fetchCodes();
    } else {
      setCodes([]);
      setTotal(0);
    }
  }, [selectedBookId, page]);

  const fetchCodes = async () => {
    if (!selectedBookId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/books/${selectedBookId}/activation-codes?page=${page}&pageSize=20`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`
          }
        }
      );
      const result = await response.json();
      const extracted = result.Result || result.result || {};
      const items = extracted.Items || extracted.items || extracted.Data || extracted.data || [];
      const mappedCodes = Array.isArray(items) ? items.map(mapActivationCode) : [];
      setCodes(mappedCodes);
      setTotal(extracted.Total || extracted.total || mappedCodes.length);
    } catch (err: any) {
      console.error('Error fetching codes:', err);
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCodes = async () => {
    if (!selectedBookId || generateCount < 1) {
      alert('Vui lòng chọn sách và nhập số lượng hợp lệ');
      return;
    }

    try {
      setGenerating(true);
      await bookApiService.generateActivationCodes(selectedBookId, {
        Quantity: generateCount  // Backend expects 'Quantity' (PascalCase)
      });
      
      setIsGenerateDialogOpen(false);
      setGenerateCount(1);
      await fetchCodes();
      alert(`Đã tạo thành công ${generateCount} mã kích hoạt!`);
    } catch (err: any) {
      console.error('Error generating codes:', err);
      alert(err.message || 'Không thể tạo mã kích hoạt');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert('Đã sao chép mã: ' + code);
  };

  const handleExportCodes = () => {
    if (filteredCodes.length === 0) {
      alert('Không có mã để xuất');
      return;
    }

    const csvContent = [
      ['Mã kích hoạt', 'Trạng thái', 'Người dùng', 'Ngày sử dụng', 'Ngày tạo'],
      ...filteredCodes.map(code => [
        code.code,
        code.isUsed ? 'Đã sử dụng' : 'Chưa sử dụng',
        code.usedByName || '',
        code.usedAt ? new Date(code.usedAt).toLocaleString('vi-VN') : '',
        new Date(code.createdAt).toLocaleString('vi-VN')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `activation-codes-${selectedBookId}-${Date.now()}.csv`;
    link.click();
  };

  // Filter codes
  const filteredCodes = codes.filter(code => {
    const matchesSearch = !search || 
      (code.code?.toLowerCase().includes(search.toLowerCase())) ||
      (code.usedByName?.toLowerCase().includes(search.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'used' && code.isUsed) ||
      (statusFilter === 'unused' && !code.isUsed);

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: codes.length,
    used: codes.filter(c => c.isUsed).length,
    unused: codes.filter(c => !c.isUsed).length,
  };

  const selectedBook = books.find(b => b.id === selectedBookId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 -left-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"
          animate={{ y: [0, -50, 0], x: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 -right-20 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"
          animate={{ y: [0, 50, 0], x: [0, -30, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                <Key className="w-10 h-10 text-blue-600" />
                Quản Lý Mã Kích Hoạt
              </h1>
              <p className="text-gray-600 mt-2">Chọn sách để xem và quản lý mã kích hoạt</p>
            </div>
          </div>
        </div>

        {/* Book Search & Select (optimized for large datasets) */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Tìm & Chọn Sách
            </CardTitle>
            <CardDescription>Tìm theo tiêu đề để chọn sách có mã kích hoạt</CardDescription>
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
                <div className="p-4 text-gray-500">Đang tải...</div>
              ) : searchBooks.length === 0 ? (
                <div className="p-4 text-gray-500">Không có kết quả</div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {searchBooks.map((b) => (
                    <li key={b.id}>
                      <button
                        type="button"
                        onClick={() => { setSelectedBookId(b.id); setPage(1); }}
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

            {/* Simple pagination for book search */}
            <div className="flex items-center justify-between mt-3">
              <Button variant="outline" disabled={bookPage === 1 || searchLoading} onClick={() => setBookPage((p) => Math.max(1, p - 1))}>Trang trước</Button>
              <div className="text-sm text-gray-500">Trang {bookPage}</div>
              <Button variant="outline" disabled={searchLoading || searchBooks.length < 10} onClick={() => setBookPage((p) => p + 1)}>Trang sau</Button>
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

        {selectedBookId && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Tổng mã', value: stats.total, color: 'from-blue-500 to-cyan-500', icon: Key },
                { label: 'Đã sử dụng', value: stats.used, color: 'from-green-500 to-emerald-500', icon: CheckCircle },
                { label: 'Chưa sử dụng', value: stats.unused, color: 'from-yellow-500 to-orange-500', icon: XCircle },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 font-medium mb-1">{stat.label}</p>
                          <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {stat.value}
                          </p>
                        </div>
                        <div className={`p-4 bg-gradient-to-br ${stat.color} rounded-xl`}>
                          <stat.icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2 mb-6">
              <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo Mã Mới
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tạo mã kích hoạt mới</DialogTitle>
                    <DialogDescription>
                      Tạo mã kích hoạt mới cho sách: {selectedBook?.title}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="count">Số lượng mã</Label>
                      <Input
                        id="count"
                        type="number"
                        min="1"
                        max="1000"
                        value={generateCount}
                        onChange={(e) => setGenerateCount(Math.max(1, parseInt(e.target.value) || 1))}
                        placeholder="Nhập số lượng mã cần tạo"
                      />
                      <p className="text-xs text-gray-500">Tối đa 1000 mã mỗi lần</p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>
                      Hủy
                    </Button>
                    <Button onClick={handleGenerateCodes} disabled={generating}>
                      {generating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Đang tạo...
                        </>
                      ) : (
                        'Tạo mã'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button
                onClick={handleExportCodes}
                variant="outline"
                disabled={codes.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Xuất CSV
              </Button>
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-blue-600" />
                  Bộ Lọc & Tìm Kiếm
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative md:col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Tìm kiếm theo mã hoặc người dùng..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant={statusFilter === 'all' ? 'default' : 'outline'} onClick={() => setStatusFilter('all')}>Tất cả</Button>
                    <Button size="sm" variant={statusFilter === 'used' ? 'default' : 'outline'} onClick={() => setStatusFilter('used')}>Đã sử dụng</Button>
                    <Button size="sm" variant={statusFilter === 'unused' ? 'default' : 'outline'} onClick={() => setStatusFilter('unused')}>Chưa sử dụng</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Codes Table */}
            <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-6 h-6 text-blue-600" />
                  Danh Sách Mã ({filteredCodes.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : error ? (
                  <div className="text-center py-12 text-red-600">
                    <p>{error}</p>
                  </div>
                ) : filteredCodes.length === 0 ? (
                  <div className="text-center py-12">
                    <Key className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {codes.length === 0 ? 'Chưa có mã kích hoạt nào' : 'Không tìm thấy mã nào'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Mã</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Người dùng</TableHead>
                            <TableHead>Ngày sử dụng</TableHead>
                            <TableHead>Ngày tạo</TableHead>
                            <TableHead className="text-right">Hành động</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredCodes.map((code) => (
                            <TableRow key={code.id}>
                              <TableCell className="font-mono font-semibold">
                                {code.code}
                              </TableCell>
                              <TableCell>
                                {code.isUsed ? (
                                  <Badge className="bg-green-100 text-green-700">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Đã sử dụng
                                  </Badge>
                                ) : (
                                  <Badge className="bg-yellow-100 text-yellow-700">
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Chưa sử dụng
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {code.usedByName || '-'}
                              </TableCell>
                              <TableCell>
                                {code.usedAt ? (
                                  <div className="flex items-center gap-1 text-sm">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(code.usedAt).toLocaleString('vi-VN')}
                                  </div>
                                ) : (
                                  '-'
                                )}
                              </TableCell>
                              <TableCell className="text-sm text-gray-600">
                                {new Date(code.createdAt).toLocaleString('vi-VN')}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopyCode(code.code)}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Pagination */}
                    {total > 20 && (
                      <div className="flex items-center justify-between mt-6">
                        <Button
                          variant="outline"
                          disabled={page === 1 || loading}
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                          Trang trước
                        </Button>
                        <div className="text-sm text-gray-500">
                          Trang {page} / {Math.ceil(total / 20)}
                        </div>
                        <Button
                          variant="outline"
                          disabled={loading || (page * 20) >= total}
                          onClick={() => setPage((p) => p + 1)}
                        >
                          Trang sau
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {!selectedBookId && (
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md">
            <CardContent className="py-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Vui lòng chọn sách để xem mã kích hoạt</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


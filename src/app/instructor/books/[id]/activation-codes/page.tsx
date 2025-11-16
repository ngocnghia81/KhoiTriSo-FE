'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Key,
  Plus,
  Download,
  Trash2,
  Copy,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Search,
  Filter,
  Calendar,
  User
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { bookApiService } from '@/services/bookApi';

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

// Mapper function to convert API response to our interface
const mapActivationCode = (data: any): ActivationCode => ({
  id: data.Id || data.id,
  bookId: data.BookId || data.bookId,
  code: data.ActivationCode || data.code,
  isUsed: data.IsUsed ?? data.isUsed ?? false,
  usedBy: data.UsedById || data.usedBy,
  usedByName: data.UsedByFullName || data.usedByName,
  usedAt: data.UpdatedAt || data.usedAt,
  createdAt: data.CreatedAt || data.createdAt
});

export default function ActivationCodesPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params?.id ? parseInt(params.id as string) : null;

  const [codes, setCodes] = useState<ActivationCode[]>([]);
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Generate dialog state
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [generateCount, setGenerateCount] = useState(1);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!bookId) {
      setError('ID sách không hợp lệ');
      setLoading(false);
      return;
    }

    fetchData();
  }, [bookId]);

  const fetchData = async () => {
    if (!bookId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch book info
      const bookData = await bookApiService.getBookById(bookId);
      setBook(bookData);

      // Fetch activation codes
      const codesData = await bookApiService.getActivationCodes(bookId);
      const mappedCodes = codesData.map(mapActivationCode);
      setCodes(mappedCodes);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCodes = async () => {
    if (!bookId || generateCount < 1) return;

    try {
      setGenerating(true);
      await bookApiService.generateActivationCodes(bookId, {
        quantity: generateCount  // Backend expects 'Quantity' field (PascalCase)
      });
      
      setIsGenerateDialogOpen(false);
      setGenerateCount(1);
      await fetchData();
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
    // You can add a toast notification here
    alert('Đã sao chép mã: ' + code);
  };

  const handleExportCodes = () => {
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
    link.download = `activation-codes-${bookId}-${Date.now()}.csv`;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <XCircle className="w-6 h-6" />
              Lỗi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/instructor/books')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <Button
            onClick={() => router.push(`/instructor/books/${bookId}`)}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                <Key className="w-10 h-10 text-blue-600" />
                Mã Kích Hoạt
              </h1>
              {book && (
                <p className="text-gray-600 mt-2">
                  Sách: <span className="font-semibold">{book.title}</span>
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleExportCodes}
                variant="outline"
                disabled={codes.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Xuất CSV
              </Button>
              
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
                      Tạo mã kích hoạt mới cho sách này
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
                        onChange={(e) => setGenerateCount(parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>
                      Hủy
                    </Button>
                    <Button onClick={handleGenerateCodes} disabled={generating}>
                      {generating ? 'Đang tạo...' : 'Tạo mã'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

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
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="used">Đã sử dụng</SelectItem>
                  <SelectItem value="unused">Chưa sử dụng</SelectItem>
                </SelectContent>
              </Select>
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
            {filteredCodes.length === 0 ? (
              <div className="text-center py-12">
                <Key className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">
                  {codes.length === 0 ? 'Chưa có mã kích hoạt nào' : 'Không tìm thấy mã nào'}
                </p>
              </div>
            ) : (
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

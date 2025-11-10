'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Key,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  MoreVertical
} from 'lucide-react';
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/RichTextEditor';
import { useRouter } from 'next/navigation';
import { useBooks, useDeleteBook } from '@/hooks/useBooks';
import { bookApiService } from '@/services/bookApi';

interface Book {
  id: number;
  title: string;
  description?: string;
  authorId: number;
  authorName?: string;
  categoryId?: number;
  categoryName?: string;
  coverImage?: string;
  price: number;
  isFree: boolean;
  approvalStatus: number;
  totalQuestions?: number;
  totalChapters?: number;
  createdAt: string;
  updatedAt?: string;
}

const approvalStatusConfig = {
  0: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  1: { label: 'Đã duyệt', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  2: { label: 'Từ chối', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export default function BooksManagementPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    isbn: '',
    price: 0,
    categoryId: undefined as number | undefined,
  });

  // Use hooks for books data
  const { books, pagination, loading, error, refetch } = useBooks({
    page,
    pageSize: 10,
    search: search || undefined,
    categoryId: categoryFilter !== 'all' ? parseInt(categoryFilter) : undefined,
    approvalStatus: statusFilter !== 'all' ? parseInt(statusFilter) : undefined,
  });

  // Update totalPages from pagination
  const totalPages = pagination?.totalPages || 1;

  // Reset to page 1 when filters change (but not when page changes)
  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, categoryFilter, statusFilter]);

  // Force enable Select components
  useEffect(() => {
    const enableSelects = () => {
      const triggers = document.querySelectorAll('[data-slot="select-trigger"]');
      triggers.forEach((trigger) => {
        const el = trigger as HTMLElement;
        el.style.pointerEvents = 'auto';
        el.style.opacity = '1';
        el.style.cursor = 'pointer';
        el.removeAttribute('disabled');
        el.setAttribute('aria-disabled', 'false');
        el.classList.remove('disabled');
      });
    };
    
    // Run immediately and after a delay
    enableSelects();
    const timeout = setTimeout(enableSelects, 100);
    
    return () => clearTimeout(timeout);
  }, [loading, books]);

  // Debug logging
  useEffect(() => {
    console.log('Dashboard Books - Data:', {
      books: books?.length || 0,
      loading,
      error,
      filters: { page, search, categoryFilter, statusFilter },
      pagination
    });
    console.log('Loading state:', loading, 'Type:', typeof loading);
  }, [books, loading, error, pagination]);

  // Use hook for delete
  const { deleteBook, loading: deleteLoading } = useDeleteBook();

  // Calculate stats from books data
  const stats = {
    total: books.length,
    pending: books.filter(b => b.approvalStatus === 0).length,
    approved: books.filter(b => b.approvalStatus === 1).length,
    rejected: books.filter(b => b.approvalStatus === 2).length,
  };

  // TODO: Implement when backend stats API is ready
  // const fetchStats = async () => {
  //   try {
  //     const [totalRes, pendingRes, approvedRes, rejectedRes] = await Promise.all([
  //       fetch('http://localhost:5214/api/books?pageSize=1'),
  //       fetch('http://localhost:5214/api/books?approvalStatus=0&pageSize=1'),
  //       fetch('http://localhost:5214/api/books?approvalStatus=1&pageSize=1'),
  //       fetch('http://localhost:5214/api/books?approvalStatus=2&pageSize=1'),
  //     ]);
  //     const [total, pending, approved, rejected] = await Promise.all([
  //       totalRes.json(),
  //       pendingRes.json(),
  //       approvedRes.json(),
  //       rejectedRes.json(),
  //     ]);
  //     setStats({
  //       total: total.result?.totalItems || 0,
  //       pending: pending.result?.totalItems || 0,
  //       approved: approved.result?.totalItems || 0,
  //       rejected: rejected.result?.totalItems || 0,
  //     });
  //   } catch (error) {
  //     console.error('Error fetching stats:', error);
  //   }
  // };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sách này?')) return;

    try {
      await deleteBook(id);
      refetch(); // Stats will auto-update from books data
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Không thể xóa sách!');
    }
  };

  const handleEditClick = (book: Book) => {
    setEditingBook(book);
    setEditFormData({
      title: book.title || '',
      description: book.description || '',
      isbn: '', // ISBN không có trong Book interface, sẽ để trống
      price: book.isFree ? 0 : book.price || 0,
      categoryId: book.categoryId,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingBook) return;

    try {
      setSaving(true);
      await bookApiService.updateBook(editingBook.id, {
        title: editFormData.title,
        description: editFormData.description,
        isbn: editFormData.isbn || undefined,
        price: editFormData.price > 0 ? editFormData.price : undefined,
        categoryId: editFormData.categoryId,
      });
      
      setIsEditModalOpen(false);
      setEditingBook(null);
      refetch(); // Refresh the list
    } catch (error: any) {
      console.error('Error updating book:', error);
      alert(error.message || 'Không thể cập nhật sách!');
    } finally {
      setSaving(false);
    }
  };

  const StatusBadge = ({ status }: { status: number }) => {
    const config = approvalStatusConfig[status as keyof typeof approvalStatusConfig];
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6 relative overflow-hidden">
      {/* Floating Background */}
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
      
      <div className="relative z-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
              <BookOpen className="w-10 h-10 text-blue-600" />
              Quản lý Sách
            </h1>
            <p className="text-gray-600 mt-2">Quản lý toàn bộ sách điện tử trong hệ thống</p>
          </div>
          <Button
            onClick={() => router.push('/dashboard/books/create')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm Sách Mới
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Tổng Sách', value: stats.total, color: 'from-blue-500 to-cyan-500', icon: BookOpen },
            { label: 'Chờ Duyệt', value: stats.pending, color: 'from-yellow-500 to-orange-500', icon: Clock },
            { label: 'Đã Duyệt', value: stats.approved, color: 'from-green-500 to-emerald-500', icon: CheckCircle },
            { label: 'Từ Chối', value: stats.rejected, color: 'from-red-500 to-pink-500', icon: XCircle },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium mb-1">{stat.label}</p>
                      <motion.p 
                        className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                      >
                        {stat.value}
                      </motion.p>
                    </div>
                    <motion.div 
                      className={`p-4 bg-gradient-to-br ${stat.color} rounded-xl shadow-lg`}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <stat.icon className="w-6 h-6 text-white" />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md mb-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Filter className="w-5 h-5 text-white" />
              </div>
              Bộ Lọc & Tìm Kiếm
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm sách..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger 
                  className="!cursor-pointer !pointer-events-auto !opacity-100"
                  style={{ pointerEvents: 'auto', opacity: 1, cursor: 'pointer' }}
                >
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="0">Chờ duyệt</SelectItem>
                  <SelectItem value="1">Đã duyệt</SelectItem>
                  <SelectItem value="2">Từ chối</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger 
                  className="!cursor-pointer !pointer-events-auto !opacity-100"
                  style={{ pointerEvents: 'auto', opacity: 1, cursor: 'pointer' }}
                >
                  <SelectValue placeholder="Danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  <SelectItem value="1">Toán học</SelectItem>
                  <SelectItem value="2">Vật lý</SelectItem>
                  <SelectItem value="3">Hóa học</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => {
                  refetch();
                }}
                disabled={loading}
              >
                {loading ? 'Đang tải...' : 'Làm Mới'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Books Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-md overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30" />
          <CardHeader className="relative border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
            <CardTitle className="text-2xl flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
              Danh Sách Sách
            </CardTitle>
            <CardDescription className="text-base">
              Hiển thị <span className="font-semibold text-blue-600">{books.length}</span> sách • 
              Trang <span className="font-semibold">{page}</span> / {totalPages}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Đang tải...</p>
              </div>
            ) : books.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Không có sách nào</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên Sách</TableHead>
                        <TableHead>Tác Giả</TableHead>
                        <TableHead>Danh Mục</TableHead>
                        <TableHead>Giá</TableHead>
                        <TableHead>Trạng Thái</TableHead>
                        <TableHead>Câu Hỏi</TableHead>
                        <TableHead>Chương</TableHead>
                        <TableHead className="text-right">Hành Động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {books.map((book) => (
                        <TableRow key={book.id} className="hover:bg-blue-50/50 transition-colors">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              {book.coverImage ? (
                                <img 
                                  src={book.coverImage} 
                                  alt={book.title}
                                  className="w-10 h-10 object-cover rounded"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                                  <BookOpen className="w-5 h-5 text-white" />
                                </div>
                              )}
                              <span>{book.title}</span>
                            </div>
                          </TableCell>
                          <TableCell>{book.authorName || 'N/A'}</TableCell>
                          <TableCell>{book.categoryName || 'N/A'}</TableCell>
                          <TableCell>
                            {book.isFree ? (
                              <Badge className="bg-green-100 text-green-700">Miễn phí</Badge>
                            ) : (
                              <span>{book.price.toLocaleString('vi-VN')} đ</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={book.approvalStatus} />
                          </TableCell>
                          <TableCell>{book.totalQuestions || 0}</TableCell>
                          <TableCell>{book.totalChapters || 0}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => router.push(`/dashboard/books/${book.id}`)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Xem
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditClick(book)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Sửa
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push(`/dashboard/books/${book.id}/activation-codes`)}>
                                  <Key className="w-4 h-4 mr-2" />
                                  Mã Kích Hoạt
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(book.id)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Xóa
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-600 font-medium">
                    Trang <span className="text-blue-600 font-bold">{page}</span> / {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 disabled:opacity-50"
                    >
                      Trước
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 disabled:opacity-50"
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
      </div>

      {/* Edit Book Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin sách</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin cơ bản của sách "{editingBook?.title}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-title">Tên sách *</Label>
              <Input
                id="edit-title"
                value={editFormData.title}
                onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Nhập tên sách..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="edit-description">Mô tả</Label>
              <div className="mt-1">
                <RichTextEditor
                  value={editFormData.description}
                  onChange={(value) => setEditFormData(prev => ({ ...prev, description: value }))}
                  placeholder="Nhập mô tả sách..."
                  className="bg-white min-h-[120px]"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Bạn có thể sử dụng các công cụ định dạng để làm nổi bật nội dung
              </p>
            </div>

            <div>
              <Label htmlFor="edit-isbn">ISBN</Label>
              <Input
                id="edit-isbn"
                value={editFormData.isbn}
                onChange={(e) => setEditFormData(prev => ({ ...prev, isbn: e.target.value }))}
                placeholder="Nhập ISBN..."
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-price">Giá (VNĐ)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={editFormData.price}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                  className="mt-1"
                  min={0}
                />
              </div>

              <div>
                <Label htmlFor="edit-category">Danh mục</Label>
                <Select
                  value={editFormData.categoryId?.toString() || 'all'}
                  onValueChange={(value) => setEditFormData(prev => ({ 
                    ...prev, 
                    categoryId: value !== 'all' ? parseInt(value) : undefined 
                  }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Không có danh mục</SelectItem>
                    <SelectItem value="1">Toán học</SelectItem>
                    <SelectItem value="2">Vật lý</SelectItem>
                    <SelectItem value="3">Hóa học</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingBook(null);
              }}
              disabled={saving}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={saving || !editFormData.title.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

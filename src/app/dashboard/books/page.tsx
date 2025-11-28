'use client';

import React, { useState, useEffect } from 'react';
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
  MoreVertical,
  RotateCcw,
  Power,
  PowerOff,
  AlertCircle
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
import { bookApiService, Book } from '@/services/bookApi';
import { toast } from 'sonner';

const approvalStatusConfig = {
  0: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
  1: { label: 'Đã duyệt', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
  2: { label: 'Từ chối', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
};

export default function BooksManagementPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(1);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    isbn: '',
    price: 0,
    categoryId: undefined as number | undefined,
  });

  // Use hooks for books data - fetch all books (Admin can see inactive)
  const { books: allBooks, pagination, loading, error, refetch } = useBooks({
    page,
    pageSize: 10,
    search: search || undefined,
    categoryId: categoryFilter !== 'all' ? parseInt(categoryFilter) : undefined,
    approvalStatus: statusFilter !== 'all' ? parseInt(statusFilter) : undefined,
  });

  // Filter books by active tab (client-side filter)
  const books = React.useMemo(() => {
    if (activeTab === 'active') {
      return allBooks.filter(b => b.isActive === true);
    } else if (activeTab === 'inactive') {
      return allBooks.filter(b => b.isActive === false);
    }
    return allBooks;
  }, [allBooks, activeTab]);

  const totalPages = pagination?.totalPages || 1;

  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, statusFilter, activeTab]);

  const { deleteBook, loading: deleteLoading } = useDeleteBook();

  const stats = {
    total: books.length,
    pending: books.filter(b => b.approvalStatus === 0).length,
    approved: books.filter(b => b.approvalStatus === 1).length,
    rejected: books.filter(b => b.approvalStatus === 2).length,
    active: books.filter(b => b.isActive === true).length,
    inactive: books.filter(b => b.isActive === false).length,
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sách này?')) return;

    try {
      await deleteBook(id);
      toast.success('Xóa sách thành công');
      refetch();
    } catch (error) {
      console.error('Error deleting book:', error);
      toast.error('Không thể xóa sách!');
    }
  };

  const handleDisable = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn vô hiệu hóa sách này?')) return;

    try {
      setProcessingId(id);
      await bookApiService.disableBook(id);
      toast.success('Vô hiệu hóa sách thành công');
      refetch();
    } catch (error: any) {
      console.error('Error disabling book:', error);
      toast.error(error.message || 'Không thể vô hiệu hóa sách!');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRestore = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn khôi phục sách này?')) return;

    try {
      setProcessingId(id);
      await bookApiService.restoreBook(id);
      toast.success('Khôi phục sách thành công');
      refetch();
    } catch (error: any) {
      console.error('Error restoring book:', error);
      toast.error(error.message || 'Không thể khôi phục sách!');
    } finally {
      setProcessingId(null);
    }
  };

  const handleTabChange = (tab: 'all' | 'active' | 'inactive') => {
    setActiveTab(tab);
  };

  const handleEditClick = (book: Book) => {
    setEditingBook(book);
    setEditFormData({
      title: book.title || '',
      description: book.description || '',
      isbn: '',
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
      toast.success('Cập nhật sách thành công');
      refetch();
    } catch (error: any) {
      console.error('Error updating book:', error);
      toast.error(error.message || 'Không thể cập nhật sách!');
    } finally {
      setSaving(false);
    }
  };

  const StatusBadge = ({ status }: { status: number }) => {
    const config = approvalStatusConfig[status as keyof typeof approvalStatusConfig];
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} flex items-center gap-1 border`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              Quản lý Sách
            </h1>
            <p className="text-gray-600 mt-2">Quản lý toàn bộ sách điện tử trong hệ thống</p>
          </div>
          <Button
            onClick={() => router.push('/dashboard/books/create')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm Sách Mới
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Tổng Sách</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Đang hoạt động</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Đã vô hiệu</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{stats.inactive}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Chờ Duyệt</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Đã Duyệt</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{stats.approved}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Từ Chối</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{stats.rejected}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Card className="border border-gray-200 shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => handleTabChange('all')}
                className={`flex items-center px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'all'
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Tất cả ({allBooks.length})
              </button>
              <button
                onClick={() => handleTabChange('active')}
                className={`flex items-center px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'active'
                    ? 'border-green-600 text-green-600 bg-green-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Đang hoạt động ({stats.active})
              </button>
              <button
                onClick={() => handleTabChange('inactive')}
                className={`flex items-center px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'inactive'
                    ? 'border-red-600 text-red-600 bg-red-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Đã vô hiệu ({stats.inactive})
              </button>
            </nav>
          </div>
        </Card>

        {/* Filters and Search */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="w-5 h-5 text-gray-600" />
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
                <SelectTrigger>
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
                <SelectTrigger>
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
                onClick={() => refetch()}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Đang tải...' : 'Làm Mới'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Books Table */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-xl flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Danh Sách Sách
            </CardTitle>
            <CardDescription>
              Hiển thị <span className="font-semibold text-gray-900">{books.length}</span> sách • 
              Trang <span className="font-semibold">{page}</span> / {totalPages}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
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
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold">Tên Sách</TableHead>
                        <TableHead className="font-semibold">Tác Giả</TableHead>
                        <TableHead className="font-semibold">Danh Mục</TableHead>
                        <TableHead className="font-semibold">Giá</TableHead>
                        <TableHead className="font-semibold">Trạng Thái</TableHead>
                        <TableHead className="font-semibold">Câu Hỏi</TableHead>
                        <TableHead className="font-semibold">Chương</TableHead>
                        <TableHead className="text-right font-semibold">Hành Động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {books.map((book) => (
                        <TableRow 
                          key={book.id} 
                          className={`hover:bg-gray-50 transition-colors ${
                            !book.isActive ? 'opacity-60' : ''
                          }`}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              {book.coverImage ? (
                                <img 
                                  src={book.coverImage} 
                                  alt={book.title}
                                  className="w-10 h-10 object-cover rounded border border-gray-200"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center border border-blue-200">
                                  <BookOpen className="w-5 h-5 text-blue-600" />
                                </div>
                              )}
                              <div>
                                <span className="font-medium text-gray-900">{book.title}</span>
                                {!book.isActive && (
                                  <Badge variant="outline" className="ml-2 text-xs border-red-200 text-red-600">
                                    Đã vô hiệu
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-600">{book.authorName || 'N/A'}</TableCell>
                          <TableCell className="text-gray-600">{book.categoryName || 'N/A'}</TableCell>
                          <TableCell>
                            {book.isFree ? (
                              <Badge className="bg-green-100 text-green-700 border-green-200">Miễn phí</Badge>
                            ) : (
                              <span className="text-gray-900 font-medium">{book.price.toLocaleString('vi-VN')} đ</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={book.approvalStatus} />
                          </TableCell>
                          <TableCell className="text-gray-600">{book.totalQuestions || 0}</TableCell>
                          <TableCell className="text-gray-600">{book.totalChapters || 0}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" disabled={processingId === book.id}>
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => router.push(`/dashboard/books/${book.id}`)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Xem chi tiết
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditClick(book)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Chỉnh sửa
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push(`/dashboard/books/${book.id}/activation-codes`)}>
                                  <Key className="w-4 h-4 mr-2" />
                                  Mã Kích Hoạt
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {book.isActive === false ? (
                                  <DropdownMenuItem 
                                    onClick={() => handleRestore(book.id)}
                                    className="text-green-600 focus:text-green-600"
                                    disabled={processingId === book.id}
                                  >
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    Khôi phục
                                  </DropdownMenuItem>
                                ) : (
                                  <>
                                    <DropdownMenuItem 
                                      onClick={() => handleDisable(book.id)}
                                      className="text-orange-600 focus:text-orange-600"
                                      disabled={processingId === book.id}
                                    >
                                      <PowerOff className="w-4 h-4 mr-2" />
                                      Vô hiệu hóa
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleDelete(book.id)}
                                      className="text-red-600 focus:text-red-600"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Xóa
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Trang <span className="font-semibold text-gray-900">{page}</span> / {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1 || loading}
                    >
                      Trước
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages || loading}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
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
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

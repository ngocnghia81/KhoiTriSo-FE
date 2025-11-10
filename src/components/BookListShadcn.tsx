'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Search, Filter, Eye, ShoppingCart } from 'lucide-react';
import { useBooks, BookFilters } from '../hooks/useBooks';
import { Book } from '../services/bookApi';
import { useAddToCart } from '../hooks/useCart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface BookListProps {
  onBookSelect?: (book: Book) => void;
  showFilters?: boolean;
  categoryId?: number;
}

const BookList: React.FC<BookListProps> = ({ onBookSelect, showFilters = true, categoryId }) => {
  const [filters, setFilters] = useState<BookFilters>({
    page: 1,
    pageSize: 20,
    search: '',
    categoryId,
    approvalStatus: 1,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const [searchInput, setSearchInput] = useState('');
  const [loadingBooks, setLoadingBooks] = useState<Set<number>>(new Set());
  const { books, loading, error, refetch } = useBooks(filters);
  const { addToCart } = useAddToCart();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleSearchInputChange = (value: string) => {
    setSearchInput(value);
  };

  const handleFilterChange = (key: keyof BookFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleBookClick = (book: Book) => {
    onBookSelect?.(book);
  };

  const handleAddToCart = async (book: Book) => {
    if (book.isFree) {
      toast.info('Sách miễn phí không cần thêm vào giỏ hàng');
      return;
    }

    setLoadingBooks(prev => new Set(prev).add(book.id));

    try {
      await addToCart({ ItemId: book.id, ItemType: 1 }); 
      toast.success(`Đã thêm "${book.title}" vào giỏ hàng`);
    } catch (error) {
      // Check if it's the "already in cart" case
      if (error instanceof Error && error.message.includes('đã có trong giỏ hàng')) {
        toast.info(`"${book.title}" đã có trong giỏ hàng`);
      } else {
        toast.error('Không thể thêm sách vào giỏ hàng');
      }
    } finally {
      setLoadingBooks(prev => {
        const newSet = new Set(prev);
        newSet.delete(book.id);
        return newSet;
      });
    }
  };

  const formatPrice = (price: number, isFree: boolean) => {
    if (isFree) return 'Miễn phí';
    return `${price.toLocaleString('vi-VN')} VNĐ`;
  };

  const getApprovalStatusTag = (status: number) => {
    switch (status) {
      case 0: return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Chờ duyệt</Badge>;
      case 1: return <Badge variant="secondary" className="bg-green-100 text-green-800">Đã duyệt</Badge>;
      case 2: return <Badge variant="destructive">Từ chối</Badge>;
      default: return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-red-600 text-center">
            <p className="font-medium">Lỗi tải dữ liệu</p>
            <p className="text-sm mt-1">{error}</p>
            <Button 
              onClick={() => refetch()} 
              variant="outline" 
              className="mt-4 border-red-300 text-red-600 hover:bg-red-100"
            >
              Thử lại
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="p-0">

      {/* Filters */}
      {showFilters && (
        <Card className="mb-8 border-0 shadow-lg bg-white/90 backdrop-blur-sm rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Search className="text-blue-600 h-5 w-5" />
              <h3 className="text-lg font-semibold text-gray-800">Tìm kiếm & Lọc</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Tìm kiếm</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Tìm sách..."
                    value={searchInput}
                    onChange={(e) => handleSearchInputChange(e.target.value)}
                    className="pl-10 h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Sắp xếp</label>
                <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                  <SelectTrigger className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Sắp xếp theo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Ngày tạo</SelectItem>
                    <SelectItem value="title">Tên sách</SelectItem>
                    <SelectItem value="price">Giá</SelectItem>
                    <SelectItem value="rating">Đánh giá</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Thứ tự</label>
                <Select value={filters.sortOrder} onValueChange={(value) => handleFilterChange('sortOrder', value)}>
                  <SelectTrigger className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Thứ tự" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Giảm dần</SelectItem>
                    <SelectItem value="asc">Tăng dần</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {books.map((book) => (
          <Card 
            key={book.id} 
            className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden rounded-2xl"
          >
            {/* Book Cover */}
            <div className="relative overflow-hidden rounded-t-2xl">
              <img
                alt={book.title}
                src={book.coverImage || '/placeholder-book.jpg'}
                className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-700"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-book.jpg';
                }}
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Status Badges */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                {getApprovalStatusTag(book.approvalStatus)}
                {book.isFree && (
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg border-0">
                    Miễn phí
                  </Badge>
                )}
              </div>
            </div>

            {/* Book Info */}
            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <CardTitle className="text-xl font-bold line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors duration-300 leading-tight">
                  {book.title}
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 line-clamp-2 mt-2 leading-relaxed">
                  {book.description}
                </CardDescription>
              </div>

              {/* Author */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {(book.authorName || 'K').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Tác giả</p>
                  <p className="text-sm font-semibold text-gray-800">{book.authorName || 'Không rõ'}</p>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <span className="text-sm font-medium text-gray-600">Giá bán</span>
                <span className={`text-2xl font-bold ${book.isFree ? 'text-green-600' : 'text-blue-600'}`}>
                  {formatPrice(book.price, book.isFree)}
                </span>
              </div>

              {/* Category */}
              {book.categoryName && (
                <div className="flex items-center justify-center">
                  <Badge variant="outline" className="text-xs px-3 py-1 border-blue-200 text-blue-600 bg-blue-50">
                    {book.categoryName}
                  </Badge>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="px-6 pb-6">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBookClick(book)}
                  className="flex-1 border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 font-semibold rounded-xl transition-all duration-300"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Chi tiết
                </Button>
                <Button
                  size="sm"
                  onClick={() => book.isFree ? handleBookClick(book) : handleAddToCart(book)}
                  disabled={loadingBooks.has(book.id)}
                  className={`flex-1 font-semibold rounded-xl transition-all duration-300 ${
                    book.isFree 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg' 
                      : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg'
                  }`}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {book.isFree ? 'Đọc ngay' : 'Thêm giỏ'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {books.length === 0 && (
        <Card className="border-gray-200">
          <CardContent className="py-12 text-center">
            <BookOpen className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy sách</h3>
            <p className="text-gray-500 mb-4">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            <Button 
              onClick={() => setFilters(prev => ({ ...prev, search: '', page: 1 }))}
              variant="outline"
            >
              Xóa bộ lọc
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BookList;

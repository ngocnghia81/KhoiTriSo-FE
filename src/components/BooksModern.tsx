'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Search, 
  Filter, 
  ShoppingCart,
  Star,
  ChevronLeft,
  ChevronRight,
  Grid,
  List,
  SlidersHorizontal,
  X,
  Tag,
  TrendingUp,
  Clock,
  Heart
} from 'lucide-react';
import { useBooks, BookFilters } from '../hooks/useBooks';
import { Book } from '../services/bookApi';
import { useAddToCart } from '../hooks/useCart';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import Image from 'next/image';

export default function BooksModern() {
  const router = useRouter();
  const [filters, setFilters] = useState<BookFilters>({
    page: 1,
    pageSize: 12,
    search: '',
    approvalStatus: 1,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const [searchInput, setSearchInput] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [loadingBooks, setLoadingBooks] = useState<Set<number>>(new Set());
  
  const { books, loading, error, refetch, pagination } = useBooks(filters);
  const { addToCart } = useAddToCart();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleAddToCart = async (book: Book, e: React.MouseEvent) => {
    e.stopPropagation();
    if (book.isFree) {
      toast.info('Sách miễn phí không cần thêm vào giỏ hàng');
      return;
    }

    setLoadingBooks(prev => new Set(prev).add(book.id));
    try {
      await addToCart({ ItemId: book.id, ItemType: 1 }); 
      toast.success(`Đã thêm "${book.title}" vào giỏ hàng`);
    } catch (error) {
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

  const handleBookClick = (bookId: number) => {
    router.push(`/books/${bookId}`);
  };

  const formatPrice = (price: number, isFree: boolean) => {
    if (isFree) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = pagination?.totalPages || 1;
  const currentPage = pagination?.currentPage || 1;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  if (loading && !books) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <motion.div 
          className="flex flex-col items-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600"></div>
            <BookOpen className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-blue-600" />
          </div>
          <p className="text-slate-700 font-semibold text-lg">Đang tải sách...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="h-10 w-10 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Không thể tải sách</h3>
              <p className="text-slate-600 mb-6">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl"
              >
                Thử lại
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Floating Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Thư viện sách
              </h1>
              <p className="text-slate-600 text-lg">
                Khám phá {pagination?.totalItems || 0} cuốn sách chất lượng cao
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-blue-600' : ''}
              >
                <Grid className="h-5 w-5" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-blue-600' : ''}
              >
                <List className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-3xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Tìm kiếm sách theo tên, tác giả..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-12 h-12 rounded-2xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                  {searchInput && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setSearchInput('')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Sort */}
                <Select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onValueChange={(value) => {
                    const [sortBy, sortOrder] = value.split('-');
                    setFilters(prev => ({ ...prev, sortBy, sortOrder, page: 1 }));
                  }}
                >
                  <SelectTrigger className="w-full md:w-64 h-12 rounded-2xl border-slate-200">
                    <SelectValue placeholder="Sắp xếp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt-desc">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        Mới nhất
                      </div>
                    </SelectItem>
                    <SelectItem value="createdAt-asc">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        Cũ nhất
                      </div>
                    </SelectItem>
                    <SelectItem value="price-asc">
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-2" />
                        Giá thấp đến cao
                      </div>
                    </SelectItem>
                    <SelectItem value="price-desc">
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-2" />
                        Giá cao đến thấp
                      </div>
                    </SelectItem>
                    <SelectItem value="title-asc">
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Tên A-Z
                      </div>
                    </SelectItem>
                    <SelectItem value="title-desc">
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Tên Z-A
                      </div>
                    </SelectItem>
                    <SelectItem value="rating-desc">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-2" />
                        Đánh giá cao nhất
                      </div>
                    </SelectItem>
                    <SelectItem value="rating-asc">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-2" />
                        Đánh giá thấp nhất
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Filter Toggle */}
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-12 rounded-2xl border-slate-200"
                >
                  <SlidersHorizontal className="h-5 w-5 mr-2" />
                  Bộ lọc
                </Button>
              </div>

              {/* Extended Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <Separator className="my-6" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Category Filter */}
                      <Select
                        value={filters.categoryId?.toString() || 'all'}
                        onValueChange={(value) => setFilters(prev => ({ 
                          ...prev, 
                          categoryId: value === 'all' ? undefined : parseInt(value), 
                          page: 1 
                        }))}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Danh mục" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả danh mục</SelectItem>
                          <SelectItem value="1">Toán học</SelectItem>
                          <SelectItem value="2">Vật lý</SelectItem>
                          <SelectItem value="3">Hóa học</SelectItem>
                          <SelectItem value="4">Sinh học</SelectItem>
                          <SelectItem value="5">Văn học</SelectItem>
                          <SelectItem value="6">Tiếng Anh</SelectItem>
                          <SelectItem value="7">Lịch sử</SelectItem>
                          <SelectItem value="8">Địa lý</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Approval Status Filter */}
                      <Select
                        value={filters.approvalStatus?.toString() || '1'}
                        onValueChange={(value) => setFilters(prev => ({ 
                          ...prev, 
                          approvalStatus: value === 'all' ? undefined : parseInt(value), 
                          page: 1 
                        }))}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Đã duyệt</SelectItem>
                          <SelectItem value="0">Chờ duyệt</SelectItem>
                          <SelectItem value="2">Từ chối</SelectItem>
                          <SelectItem value="all">Tất cả</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Page Size */}
                      <Select
                        value={filters.pageSize?.toString()}
                        onValueChange={(value) => setFilters(prev => ({ ...prev, pageSize: parseInt(value), page: 1 }))}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Số lượng hiển thị" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12">12 sách/trang</SelectItem>
                          <SelectItem value="24">24 sách/trang</SelectItem>
                          <SelectItem value="36">36 sách/trang</SelectItem>
                          <SelectItem value="48">48 sách/trang</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Books Grid/List */}
        <AnimatePresence mode="wait">
          {books && books.length > 0 ? (
            <motion.div
              key={viewMode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-6'}
            >
              {books.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden group cursor-pointer h-full flex flex-col"
                    onClick={() => handleBookClick(book.id)}
                  >
                    <CardContent className="p-0 flex flex-col h-full">
                      {viewMode === 'grid' ? (
                        // Grid View
                        <div className="flex flex-col h-full">
                          <div className="relative h-64 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                            {book.coverImage ? (
                              <Image
                                src={book.coverImage}
                                alt={book.title}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="h-20 w-20 text-slate-400" />
                              </div>
                            )}
                            {book.isFree && (
                              <Badge className="absolute top-4 right-4 bg-green-500 text-white shadow-lg">
                                Miễn phí
                              </Badge>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                              <div className="flex items-center space-x-2 text-white text-sm">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span>4.5</span>
                              </div>
                            </div>
                          </div>
                          <div className="p-5 flex flex-col flex-1">
                            <h3 className="font-bold text-lg text-slate-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                              {book.title}
                            </h3>
                            <p className="text-slate-600 text-sm line-clamp-2 mb-4 flex-1">
                              {book.description}
                            </p>
                            <div className="flex items-center justify-between mt-auto">
                              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {formatPrice(book.price, book.isFree)}
                              </span>
                              {!book.isFree && (
                                <Button
                                  size="sm"
                                  onClick={(e) => handleAddToCart(book, e)}
                                  disabled={loadingBooks.has(book.id)}
                                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg"
                                >
                                  {loadingBooks.has(book.id) ? (
                                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                  ) : (
                                    <>
                                      <ShoppingCart className="h-4 w-4 mr-1" />
                                      Thêm
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        // List View
                        <div className="flex items-start space-x-6 p-6">
                          <div className="relative w-32 h-40 flex-shrink-0 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl overflow-hidden">
                            {book.coverImage ? (
                              <Image    
                                src={book.coverImage}
                                alt={book.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="h-12 w-12 text-slate-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-xl text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                              {book.title}
                            </h3>
                            <p className="text-slate-600 text-sm line-clamp-3 mb-4">
                              {book.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {formatPrice(book.price, book.isFree)}
                              </span>
                              {!book.isFree && (
                                <Button
                                  onClick={(e) => handleAddToCart(book, e)}
                                  disabled={loadingBooks.has(book.id)}
                                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg px-6"
                                >
                                  {loadingBooks.has(book.id) ? (
                                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                  ) : (
                                    <>
                                      <ShoppingCart className="h-5 w-5 mr-2" />
                                      Thêm vào giỏ hàng
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-20 w-20 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Không tìm thấy sách</h3>
                  <p className="text-slate-600">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {books && books.length > 0 && totalPages > 1 && (
          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-3xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="text-slate-600">
                    Hiển thị <span className="font-semibold text-slate-800">{((currentPage - 1) * filters.pageSize!) + 1}</span> - <span className="font-semibold text-slate-800">{Math.min(currentPage * filters.pageSize!, pagination?.totalItems || 0)}</span> trong tổng số <span className="font-semibold text-slate-800">{pagination?.totalItems || 0}</span> sách
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="rounded-xl"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>

                    {getPageNumbers().map((page, index) => (
                      page === '...' ? (
                        <span key={`ellipsis-${index}`} className="px-2 text-slate-400">...</span>
                      ) : (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          onClick={() => handlePageChange(page as number)}
                          className={`rounded-xl min-w-[40px] ${
                            currentPage === page 
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                              : ''
                          }`}
                        >
                          {page}
                        </Button>
                      )
                    ))}

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="rounded-xl"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

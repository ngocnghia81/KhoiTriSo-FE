'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Search, 
  ShoppingCart,
  Star,
  Grid,
  List,
  SlidersHorizontal,
  X,
  Tag,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useBooks, BookFilters, PaginationInfo } from '@/hooks/useBooks';
import { Book } from '@/services/bookApi';
import { useAddToCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { safeJsonParse, isSuccessfulResponse, extractResult } from '@/utils/apiHelpers';

interface BooksListClientProps {
  initialBooks?: Book[];
  initialPagination?: PaginationInfo;
}

export default function BooksListClient({ initialBooks, initialPagination }: BooksListClientProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { authenticatedFetch } = useAuthenticatedFetch();
  
  const [filters, setFilters] = useState<BookFilters>({
    page: 1,
    pageSize: 1000, // Hiển thị tất cả sách
    search: '',
    // Không gửi approvalStatus - backend sẽ tự động filter cho người dùng thường
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const [searchInput, setSearchInput] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loadingBooks, setLoadingBooks] = useState<Set<number>>(new Set());
  const [purchasedBookIds, setPurchasedBookIds] = useState<Set<number>>(new Set());
  
  // Check if filters are in default state (no filters/search applied)
  const isDefaultState = !filters.categoryId && !filters.search && filters.page === 1 && filters.sortBy === 'createdAt' && filters.sortOrder === 'desc';
  
  // Use initialBooks if in default state and available, otherwise fetch
  const shouldUseInitial = isDefaultState && initialBooks && initialBooks.length > 0;
  
  const { books: fetchedBooks, loading, error, refetch, pagination: fetchedPagination } = useBooks(filters, { enabled: !shouldUseInitial });
  const { addToCart } = useAddToCart();

  // Use initial data if available and in default state, otherwise use fetched data
  const books = shouldUseInitial ? (initialBooks || []) : fetchedBooks;
  const pagination = shouldUseInitial ? (initialPagination || { currentPage: 1, totalPages: 1, totalItems: 0, pageSize: 1000 }) : fetchedPagination;

  // Fetch purchased books
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'student') {
      setPurchasedBookIds(new Set());
      return;
    }

    const fetchPurchasedBooks = async () => {
      try {
        const response = await authenticatedFetch('/api/books/my-books?page=1&pageSize=1000');
        const result = await safeJsonParse(response);

        if (isSuccessfulResponse(result)) {
          const data = extractResult(result);
          let booksArray = [];
          
          if (Array.isArray(data)) {
            booksArray = data;
          } else if (data?.Items || data?.items) {
            booksArray = data.Items || data.items;
          }

          const purchasedIds = new Set<number>();
          booksArray.forEach((b: any) => {
            const rawBook = b.Book || b.book || null;
            const bookId = rawBook?.Id || rawBook?.id || b.BookId || b.bookId || b.Id || b.id;
            if (bookId) {
              purchasedIds.add(bookId);
            }
          });

          setPurchasedBookIds(purchasedIds);
        }
      } catch (err) {
        console.error('Error fetching purchased books:', err);
        // Silently fail, just don't show purchased status
      }
    };

    fetchPurchasedBooks();
  }, [isAuthenticated, user, authenticatedFetch]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleAddToCart = async (book: Book, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Check if already purchased
    if (purchasedBookIds.has(book.id)) {
      toast.info('Bạn đã sở hữu sách này');
      return;
    }
    
    if (book.isFree) {
      toast.info('Sách miễn phí không cần thêm vào giỏ hàng');
      return;
    }

    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để thêm sách vào giỏ hàng');
      router.push('/auth/login');
      return;
    }

    setLoadingBooks(prev => new Set(prev).add(book.id));
    try {
      // ItemType: 0 = Book, 1 = Course
      await addToCart({ ItemId: book.id, ItemType: 0 }); 
      toast.success(`Đã thêm "${book.title}" vào giỏ hàng`);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('đã có trong giỏ hàng')) {
          toast.info(`"${book.title}" đã có trong giỏ hàng`);
        } else if (error.message.includes('đã sở hữu')) {
          toast.info('Bạn đã sở hữu sách này');
          // Update purchased list
          setPurchasedBookIds(prev => new Set(prev).add(book.id));
        } else {
          toast.error('Không thể thêm sách vào giỏ hàng');
        }
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


  if (loading && !books) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div 
          className="flex flex-col items-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 border-t-blue-600"></div>
            <BookOpen className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-blue-600" />
          </div>
          <p className="text-gray-700 font-semibold text-lg">Đang tải sách...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="w-full max-w-md bg-white border border-gray-200 shadow-lg rounded-xl">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="h-10 w-10 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Không thể tải sách</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Thư viện sách
              </h1>
              <p className="text-gray-600 text-lg">
                Khám phá {pagination?.totalItems || 0} cuốn sách chất lượng cao
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                <Grid className="h-5 w-5" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                <List className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Tìm kiếm sách theo tên, tác giả..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-12 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  {searchInput && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-gray-100"
                      onClick={() => setSearchInput('')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Category Filter */}
                <Select
                  value={filters.categoryId?.toString() || 'all'}
                  onValueChange={(value) => setFilters(prev => ({ 
                    ...prev, 
                    categoryId: value === 'all' ? undefined : parseInt(value), 
                    page: 1 
                  }))}
                >
                  <SelectTrigger className="w-full md:w-56 h-12 border-gray-300">
                    <div className="flex items-center">
                      <Tag className="h-4 w-4 mr-2 text-gray-500" />
                      <SelectValue placeholder="Danh mục" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-2" />
                        Tất cả danh mục
                      </div>
                    </SelectItem>
                    <SelectItem value="1">
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-2 text-blue-500" />
                        Toán học
                      </div>
                    </SelectItem>
                    <SelectItem value="2">
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-2 text-purple-500" />
                        Vật lý
                      </div>
                    </SelectItem>
                    <SelectItem value="3">
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-2 text-green-500" />
                        Hóa học
                      </div>
                    </SelectItem>
                    <SelectItem value="4">
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-2 text-yellow-500" />
                        Sinh học
                      </div>
                    </SelectItem>
                    <SelectItem value="5">
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-2 text-red-500" />
                        Văn học
                      </div>
                    </SelectItem>
                    <SelectItem value="6">
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-2 text-indigo-500" />
                        Tiếng Anh
                      </div>
                    </SelectItem>
                    <SelectItem value="7">
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-2 text-orange-500" />
                        Lịch sử
                      </div>
                    </SelectItem>
                    <SelectItem value="8">
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-2 text-pink-500" />
                        Địa lý
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onValueChange={(value) => {
                    const [sortBy, sortOrder] = value.split('-');
                    setFilters(prev => ({ ...prev, sortBy, sortOrder, page: 1 }));
                  }}
                >
                  <SelectTrigger className="w-full md:w-56 h-12 border-gray-300">
                    <div className="flex items-center">
                      <SlidersHorizontal className="h-4 w-4 mr-2 text-gray-500" />
                      <SelectValue placeholder="Sắp xếp" />
                    </div>
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
              </div>
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
              {books.map((book, index) => {
                const isPurchased = purchasedBookIds.has(book.id);
                return (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    className={`bg-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group cursor-pointer h-full flex flex-col ${
                      isPurchased 
                        ? 'border-2 border-green-500 ring-2 ring-green-100' 
                        : 'border border-gray-200'
                    }`}
                    onClick={() => handleBookClick(book.id)}
                  >
                    <CardContent className="p-0 flex flex-col h-full">
                      {viewMode === 'grid' ? (
                        // Grid View
                        <div className="flex flex-col h-full">
                          <div className="relative h-64 bg-gray-100 overflow-hidden">
                            {book.coverImage ? (
                              <Image
                                src={book.coverImage}
                                alt={book.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="h-20 w-20 text-gray-400" />
                              </div>
                            )}
                            <div className="absolute top-4 right-4 flex flex-col gap-2">
                              {isPurchased && (
                                <Badge className="bg-green-600 text-white shadow-md flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  Đã sở hữu
                                </Badge>
                              )}
                              {book.isFree && !isPurchased && (
                                <Badge className="bg-blue-600 text-white shadow-md">
                                  Miễn phí
                                </Badge>
                              )}
                            </div>
                            {(book.rating !== undefined && book.rating !== null) && (
                              <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-4">
                                <div className="flex items-center space-x-2 text-white text-sm">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span>{book.rating.toFixed(1)}</span>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="p-5 flex flex-col flex-1">
                            <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                              {book.title}
                            </h3>
                            <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-1">
                              {book.description}
                            </p>
                            <div className="flex items-center justify-between mt-auto">
                              <span className="text-2xl font-bold text-blue-600">
                                {formatPrice(book.price, book.isFree)}
                              </span>
                              {isPurchased ? (
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/books/${book.id}`);
                                  }}
                                  className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Xem ngay
                                </Button>
                              ) : !book.isFree ? (
                                <Button
                                  size="sm"
                                  onClick={(e) => handleAddToCart(book, e)}
                                  disabled={loadingBooks.has(book.id)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
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
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/books/${book.id}`);
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                >
                                  <BookOpen className="h-4 w-4 mr-1" />
                                  Đọc ngay
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        // List View
                        <div className="flex items-start space-x-6 p-6">
                          <div className="relative w-32 h-40 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                            {book.coverImage ? (
                              <Image    
                                src={book.coverImage}
                                alt={book.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="h-12 w-12 text-gray-400" />
                              </div>
                            )}
                            {isPurchased && (
                              <Badge className="absolute top-2 right-2 bg-green-600 text-white shadow-md flex items-center gap-1 text-xs">
                                <CheckCircle className="h-3 w-3" />
                                Đã sở hữu
                              </Badge>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors flex-1">
                                {book.title}
                              </h3>
                              {isPurchased && (
                                <Badge className="bg-green-600 text-white ml-2">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Đã sở hữu
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                              {book.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-3xl font-bold text-blue-600">
                                {formatPrice(book.price, book.isFree)}
                              </span>
                              {isPurchased ? (
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/books/${book.id}`);
                                  }}
                                  className="bg-green-600 hover:bg-green-700 text-white shadow-sm px-6"
                                >
                                  <CheckCircle className="h-5 w-5 mr-2" />
                                  Xem ngay
                                </Button>
                              ) : !book.isFree ? (
                                <Button
                                  onClick={(e) => handleAddToCart(book, e)}
                                  disabled={loadingBooks.has(book.id)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm px-6"
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
                              ) : (
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/books/${book.id}`);
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm px-6"
                                >
                                  <BookOpen className="h-5 w-5 mr-2" />
                                  Đọc ngay
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );})}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy sách</h3>
                  <p className="text-gray-600">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}


'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  BookOpenIcon,
  StarIcon,
  ShoppingCartIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  FunnelIcon,
  TagIcon,
  UserIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { 
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid 
} from '@heroicons/react/24/solid';

interface Book {
  id: string;
  title: string;
  description: string;
  author: {
    name: string;
    id: string;
  };
  category: {
    name: string;
    slug: string;
  };
  coverImage: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  totalQuestions: number;
  rating: number;
  reviewsCount: number;
  isActive: boolean;
  publishedAt: string;
  tags: string[];
  slug: string;
  isNew?: boolean;
  isBestseller?: boolean;
}

const categories = [
  { id: 'all', name: 'Tất cả', count: 24 },
  { id: 'toan-hoc', name: 'Toán học', count: 8 },
  { id: 'vat-ly', name: 'Vật lý', count: 6 },
  { id: 'hoa-hoc', name: 'Hóa học', count: 4 },
  { id: 'sinh-hoc', name: 'Sinh học', count: 3 },
  { id: 'ngu-van', name: 'Ngữ văn', count: 3 },
];

const grades = ['Tất cả', 'Lớp 10', 'Lớp 11', 'Lớp 12'];
const sortOptions = [
  { value: 'popular', label: 'Phổ biến nhất' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price-low', label: 'Giá thấp đến cao' },
  { value: 'price-high', label: 'Giá cao đến thấp' },
  { value: 'rating', label: 'Đánh giá cao nhất' },
  { value: 'bestseller', label: 'Bán chạy nhất' },
];

const books: Book[] = [
  {
    id: '1',
    title: 'Sách Toán học lớp 12 - Nâng cao (Kèm video giải bài tập)',
    description: 'Sách Toán học lớp 12 nâng cao được biên soạn theo chương trình mới nhất, kèm video giải bài tập chi tiết.',
    author: {
      name: 'PGS. TS. Nguyễn Văn Toán',
      id: 'nguyen-van-toan'
    },
    category: {
      name: 'Toán học',
      slug: 'toan-hoc'
    },
    coverImage: '/images/books/toan-12-cover.jpg',
    price: 299000,
    originalPrice: 399000,
    discountPercent: 25,
    totalQuestions: 850,
    rating: 4.8,
    reviewsCount: 234,
    isActive: true,
    publishedAt: '2024-01-01',
    tags: ['Toán 12', 'THPT Quốc gia', 'Nâng cao'],
    slug: 'toan-hoc-lop-12-nang-cao',
    isBestseller: true
  },
  {
    id: '2',
    title: 'Sách Vật lý lớp 12 - Nâng cao (Có video thí nghiệm)',
    description: 'Sách Vật lý lớp 12 với video thí nghiệm thực tế, giúp học sinh hiểu sâu các hiện tượng vật lý.',
    author: {
      name: 'TS. Phạm Văn Lý',
      id: 'pham-van-ly'
    },
    category: {
      name: 'Vật lý',
      slug: 'vat-ly'
    },
    coverImage: '/images/books/vat-ly-12-cover.jpg',
    price: 279000,
    originalPrice: 349000,
    discountPercent: 20,
    totalQuestions: 720,
    rating: 4.7,
    reviewsCount: 189,
    isActive: true,
    publishedAt: '2024-01-15',
    tags: ['Vật lý 12', 'Thí nghiệm', 'THPT'],
    slug: 'vat-ly-lop-12-nang-cao',
    isNew: true
  },
  {
    id: '3',
    title: 'Sách Hóa học lớp 12 - Cơ bản và Nâng cao',
    description: 'Tổng hợp kiến thức Hóa học lớp 12 từ cơ bản đến nâng cao với phương pháp học hiệu quả.',
    author: {
      name: 'PGS. Trần Thị Hóa',
      id: 'tran-thi-hoa'
    },
    category: {
      name: 'Hóa học',
      slug: 'hoa-hoc'
    },
    coverImage: '/images/books/hoa-hoc-12-cover.jpg',
    price: 289000,
    originalPrice: 359000,
    discountPercent: 19,
    totalQuestions: 680,
    rating: 4.6,
    reviewsCount: 156,
    isActive: true,
    publishedAt: '2024-02-01',
    tags: ['Hóa học 12', 'Cơ bản', 'Nâng cao'],
    slug: 'hoa-hoc-lop-12-co-ban-nang-cao'
  },
  {
    id: '4',
    title: 'Sách Toán học lớp 11 - Cơ bản (Video HD)',
    description: 'Kiến thức Toán học lớp 11 cơ bản với video giảng dạy HD, phù hợp cho mọi trình độ học sinh.',
    author: {
      name: 'TS. Lê Văn Số',
      id: 'le-van-so'
    },
    category: {
      name: 'Toán học',
      slug: 'toan-hoc'
    },
    coverImage: '/images/books/toan-11-cover.jpg',
    price: 259000,
    totalQuestions: 620,
    rating: 4.5,
    reviewsCount: 123,
    isActive: true,
    publishedAt: '2024-02-15',
    tags: ['Toán 11', 'Cơ bản', 'Video HD'],
    slug: 'toan-hoc-lop-11-co-ban'
  },
  {
    id: '5',
    title: 'Sách Sinh học lớp 12 - Tổng hợp kiến thức',
    description: 'Tổng hợp toàn bộ kiến thức Sinh học lớp 12 với sơ đồ tư duy và bài tập thực hành.',
    author: {
      name: 'ThS. Nguyễn Thị Sinh',
      id: 'nguyen-thi-sinh'
    },
    category: {
      name: 'Sinh học',
      slug: 'sinh-hoc'
    },
    coverImage: '/images/books/sinh-hoc-12-cover.jpg',
    price: 269000,
    originalPrice: 319000,
    discountPercent: 16,
    totalQuestions: 580,
    rating: 4.4,
    reviewsCount: 98,
    isActive: true,
    publishedAt: '2024-03-01',
    tags: ['Sinh học 12', 'Sơ đồ tư duy', 'Thực hành'],
    slug: 'sinh-hoc-lop-12-tong-hop'
  },
  {
    id: '6',
    title: 'Sách Ngữ văn lớp 12 - Phân tích tác phẩm',
    description: 'Phương pháp phân tích tác phẩm văn học lớp 12 với kỹ thuật làm bài thi hiệu quả.',
    author: {
      name: 'TS. Phạm Văn Văn',
      id: 'pham-van-van'
    },
    category: {
      name: 'Ngữ văn',
      slug: 'ngu-van'
    },
    coverImage: '/images/books/ngu-van-12-cover.jpg',
    price: 249000,
    totalQuestions: 450,
    rating: 4.3,
    reviewsCount: 87,
    isActive: true,
    publishedAt: '2024-03-15',
    tags: ['Ngữ văn 12', 'Phân tích', 'Kỹ thuật'],
    slug: 'ngu-van-lop-12-phan-tich'
  }
];

export default function BooksPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGrade, setSelectedGrade] = useState('Tất cả');
  const [sortBy, setSortBy] = useState('popular');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  const filteredAndSortedBooks = useMemo(() => {
    const filtered = books.filter(book => {
      // Category filter
      if (selectedCategory !== 'all' && book.category.slug !== selectedCategory) {
        return false;
      }
      
      // Grade filter (extracted from tags)
      if (selectedGrade !== 'Tất cả') {
        const gradeNumber = selectedGrade.replace('Lớp ', '');
        const hasGrade = book.tags.some(tag => tag.includes(gradeNumber));
        if (!hasGrade) return false;
      }
      
      // Search filter
      if (searchTerm && !book.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !book.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !book.author.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Price range filter
      if (book.price < priceRange[0] || book.price > priceRange[1]) {
        return false;
      }
      
      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'bestseller':
          return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
        case 'popular':
        default:
          return b.reviewsCount - a.reviewsCount;
      }
    });

    return filtered;
  }, [selectedCategory, selectedGrade, sortBy, searchTerm, priceRange]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const toggleFavorite = (bookId: string) => {
    setFavorites(prev => 
      prev.includes(bookId) 
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };

  const addToCart = (bookId: string) => {
    console.log('Added to cart:', bookId);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIconSolid
            key={star}
            className={`h-4 w-4 ${
              star <= Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/" className="text-gray-700 hover:text-blue-600">
                  Trang chủ
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-gray-500">Sách điện tử</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <BookOpenIcon className="h-16 w-16 mx-auto mb-6 opacity-80" />
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Sách điện tử tương tác
            </h1>
            <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
              Khám phá thư viện sách điện tử phong phú với video giải bài tập chi tiết. 
              Mỗi câu hỏi đều có mã ID riêng để tra cứu nhanh chóng.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm sách, tác giả..."
                  className="w-full px-6 py-4 pr-14 text-gray-900 bg-white rounded-xl focus:ring-4 focus:ring-white/20 focus:outline-none text-lg"
                />
                <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600">
                  <MagnifyingGlassIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-8">
              {/* Mobile Filter Toggle */}
              <div className="lg:hidden mb-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  <FunnelIcon className="h-5 w-5 mr-2" />
                  Bộ lọc
                </button>
              </div>

              <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Categories */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Danh mục
                  </h3>
                  <ul className="space-y-2">
                    {categories.map((category) => (
                      <li key={category.id}>
                        <button
                          onClick={() => setSelectedCategory(category.id)}
                          className={`w-full text-left flex justify-between items-center py-2 px-3 rounded-lg transition-colors ${
                            selectedCategory === category.id
                              ? 'bg-blue-100 text-blue-700 font-semibold'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <span>{category.name}</span>
                          <span className="text-sm bg-gray-200 px-2 py-1 rounded">
                            {category.count}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Grade Filter */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Lớp học
                  </h3>
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {grades.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Khoảng giá
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="price"
                        value="under-200k"
                        checked={priceRange[1] === 200000}
                        onChange={() => setPriceRange([0, 200000])}
                        className="text-blue-600"
                      />
                      <label className="text-gray-600">Dưới 200.000đ</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="price"
                        value="200k-300k"
                        checked={priceRange[0] === 200000 && priceRange[1] === 300000}
                        onChange={() => setPriceRange([200000, 300000])}
                        className="text-blue-600"
                      />
                      <label className="text-gray-600">200.000đ - 300.000đ</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="price"
                        value="300k-400k"
                        checked={priceRange[0] === 300000 && priceRange[1] === 400000}
                        onChange={() => setPriceRange([300000, 400000])}
                        className="text-blue-600"
                      />
                      <label className="text-gray-600">300.000đ - 400.000đ</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="price"
                        value="all"
                        checked={priceRange[1] === 500000}
                        onChange={() => setPriceRange([0, 500000])}
                        className="text-blue-600"
                      />
                      <label className="text-gray-600">Tất cả</label>
                    </div>
                  </div>
                </div>

                {/* Popular Tags */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Tags phổ biến
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {['THPT Quốc gia', 'Nâng cao', 'Cơ bản', 'Video HD', 'Thí nghiệm'].map((tag, index) => (
                      <button
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full hover:bg-blue-200 transition-colors"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Sách điện tử ({filteredAndSortedBooks.length})
                </h2>
                <p className="text-gray-600 mt-1">
                  Tìm thấy {filteredAndSortedBooks.length} cuốn sách phù hợp
                </p>
              </div>
              
              <div className="mt-4 sm:mt-0">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Books Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAndSortedBooks.map((book) => (
                <div key={book.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                  {/* Book Cover */}
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Link href={`/books/${book.slug}`}>
                      <Image
                        src={book.coverImage}
                        alt={book.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        quality={100}
                        unoptimized={true}
                      />
                    </Link>
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {book.isNew && (
                        <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                          Mới
                        </span>
                      )}
                      {book.isBestseller && (
                        <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                          Bán chạy
                        </span>
                      )}
                      {book.discountPercent && (
                        <span className="px-2 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                          -{book.discountPercent}%
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() => toggleFavorite(book.id)}
                        className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                      >
                        {favorites.includes(book.id) ? (
                          <HeartIconSolid className="h-4 w-4 text-red-500" />
                        ) : (
                          <HeartIcon className="h-4 w-4 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Book Info */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-blue-600 font-semibold">
                        {book.category.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {book.totalQuestions} câu hỏi
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      <Link href={`/books/${book.slug}`} className="hover:text-blue-600 transition-colors">
                        {book.title}
                      </Link>
                    </h3>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {book.description}
                    </p>

                    <div className="flex items-center mb-4">
                      <UserIcon className="h-4 w-4 text-gray-400 mr-1" />
                      <Link
                        href={`/authors/${book.author.id}`}
                        className="text-sm text-gray-700 hover:text-blue-600 transition-colors"
                      >
                        {book.author.name}
                      </Link>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center mb-4">
                      {renderStars(book.rating)}
                      <span className="text-sm text-gray-600 ml-2">
                        {book.rating} ({book.reviewsCount} đánh giá)
                      </span>
                    </div>

                    {/* Price & Actions */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-blue-600">
                            {formatPrice(book.price)}
                          </span>
                          {book.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(book.originalPrice)}
                            </span>
                          )}
                        </div>
                        {book.originalPrice && (
                          <div className="text-xs text-green-600 font-semibold">
                            Tiết kiệm {formatPrice(book.originalPrice - book.price)}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => addToCart(book.id)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <ShoppingCartIcon className="h-4 w-4 mr-1" />
                        Mua
                      </button>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {book.tags.slice(0, 2).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredAndSortedBooks.length === 0 && (
              <div className="text-center py-16">
                <BookOpenIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Không tìm thấy sách
                </h3>
                <p className="text-gray-600 mb-6">
                  Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedGrade('Tất cả');
                    setSearchTerm('');
                    setPriceRange([0, 500000]);
                  }}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}

            {/* Load More */}
            {filteredAndSortedBooks.length > 0 && (
              <div className="text-center mt-12">
                <button className="px-8 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors">
                  Xem thêm sách
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Bạn đã có sách giấy?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Kích hoạt mã truy cập để xem video giải bài tập chi tiết trong 2 năm
          </p>
          <Link
            href="/books/activation"
            className="inline-flex items-center px-8 py-4 bg-white text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-colors shadow-lg"
          >
            Kích hoạt sách ngay
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

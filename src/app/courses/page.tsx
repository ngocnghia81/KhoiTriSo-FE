'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ClockIcon, 
  UserGroupIcon, 
  StarIcon,
  PlayCircleIcon,
  BookOpenIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  FunnelIcon,
  HeartIcon,
  ShoppingCartIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid, HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorId: string;
  thumbnail: string;
  price: number;
  originalPrice?: number;
  isFree: boolean;
  level: string;
  duration: string;
  lessons: number;
  students: number;
  rating: number;
  reviews: number;
  category: string;
  isPopular?: boolean;
  tags: string[];
  isNew?: boolean;
  discountPercent?: number;
}

const categories = [
  { id: 'all', name: 'Tất cả', count: 24 },
  { id: 'free', name: 'Miễn phí', count: 8 },
  { id: 'paid', name: 'Trả phí', count: 16 },
  { id: 'math', name: 'Toán học', count: 6 },
  { id: 'physics', name: 'Vật lý', count: 4 },
  { id: 'chemistry', name: 'Hóa học', count: 4 },
  { id: 'english', name: 'Tiếng Anh', count: 3 },
  { id: 'literature', name: 'Văn học', count: 3 },
];

const levels = ['Tất cả', 'Lớp 10', 'Lớp 11', 'Lớp 12', 'Đại học'];
const sortOptions = [
  { value: 'popular', label: 'Phổ biến nhất' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price-low', label: 'Giá thấp đến cao' },
  { value: 'price-high', label: 'Giá cao đến thấp' },
  { value: 'rating', label: 'Đánh giá cao nhất' },
];

const courses: Course[] = [
  {
    id: 'toan-lop-12-free',
    title: 'Toán lớp 12 miễn phí - Chuẩn bị THPT Quốc gia',
    description: 'Khóa học Toán lớp 12 miễn phí được thiết kế đặc biệt cho học sinh chuẩn bị thi THPT Quốc gia với phương pháp giảng dạy hiệu quả.',
    instructor: 'Thầy Nguyễn Văn A',
    instructorId: 'nguyen-van-a',
    thumbnail: '/images/course/course-1/1.png',
    price: 0,
    isFree: true,
    level: 'Lớp 12',
    duration: '12 giờ',
    lessons: 40,
    students: 1234,
    rating: 4.9,
    reviews: 456,
    category: 'math',
    isPopular: true,
    tags: ['Miễn phí', 'THPT Quốc gia', 'Đại số', 'Hình học'],
  },
  {
    id: 'vat-ly-lop-12-free',
    title: 'Vật lý lớp 12 miễn phí - Phương pháp sinh động',
    description: 'Khóa học Vật lý lớp 12 với phương pháp giảng dạy sinh động và dễ hiểu, giúp học sinh nắm vững kiến thức cơ bản.',
    instructor: 'Cô Trần Thị B',
    instructorId: 'tran-thi-b',
    thumbnail: '/images/course/course-1/2.png',
    price: 0,
    isFree: true,
    level: 'Lớp 12',
    duration: '10 giờ',
    lessons: 35,
    students: 987,
    rating: 4.8,
    reviews: 321,
    category: 'physics',
    tags: ['Miễn phí', 'Vật lý', 'Thí nghiệm'],
  },
  {
    id: 'hoa-hoc-lop-12-premium',
    title: 'Hóa học lớp 12 - Khóa học nâng cao Premium',
    description: 'Khóa học Hóa học lớp 12 nâng cao với nhiều bài tập thực hành và video thí nghiệm chi tiết.',
    instructor: 'Thầy Lê Văn C',
    instructorId: 'le-van-c',
    thumbnail: '/images/course/course-1/3.png',
    price: 899000,
    originalPrice: 1299000,
    discountPercent: 31,
    isFree: false,
    level: 'Lớp 12',
    duration: '15 giờ',
    lessons: 50,
    students: 567,
    rating: 4.7,
    reviews: 189,
    category: 'chemistry',
    isNew: true,
    tags: ['Premium', 'Thí nghiệm', 'Nâng cao'],
  },
  {
    id: 'tieng-anh-lop-12',
    title: 'Tiếng Anh lớp 12 - Luyện thi THPT Quốc gia',
    description: 'Khóa học Tiếng Anh lớp 12 tập trung vào kỹ năng làm bài thi THPT Quốc gia với nhiều đề thi thử.',
    instructor: 'Cô Phạm Thị D',
    instructorId: 'pham-thi-d',
    thumbnail: '/images/course/course-1/4.png',
    price: 699000,
    originalPrice: 999000,
    discountPercent: 30,
    isFree: false,
    level: 'Lớp 12',
    duration: '20 giờ',
    lessons: 60,
    students: 789,
    rating: 4.9,
    reviews: 234,
    category: 'english',
    tags: ['THPT Quốc gia', 'Luyện thi', 'Kỹ năng'],
  },
  {
    id: 'van-hoc-lop-12',
    title: 'Văn học lớp 12 - Phân tích tác phẩm',
    description: 'Khóa học Văn học lớp 12 với phương pháp phân tích tác phẩm hiệu quả và kỹ thuật làm bài thi.',
    instructor: 'Cô Nguyễn Thị E',
    instructorId: 'nguyen-thi-e',
    thumbnail: '/images/course/course-1/5.png',
    price: 599000,
    isFree: false,
    level: 'Lớp 12',
    duration: '18 giờ',
    lessons: 45,
    students: 432,
    rating: 4.6,
    reviews: 156,
    category: 'literature',
    tags: ['Phân tích', 'Tác phẩm', 'Kỹ thuật'],
  },
  {
    id: 'toan-lop-11-nang-cao',
    title: 'Toán lớp 11 nâng cao - Chuẩn bị vào lớp 12',
    description: 'Khóa học Toán lớp 11 nâng cao giúp học sinh củng cố kiến thức và chuẩn bị tốt cho lớp 12.',
    instructor: 'Thầy Hoàng Văn F',
    instructorId: 'hoang-van-f',
    thumbnail: '/images/course/course-1/6.png',
    price: 799000,
    originalPrice: 1199000,
    discountPercent: 33,
    isFree: false,
    level: 'Lớp 11',
    duration: '14 giờ',
    lessons: 42,
    students: 345,
    rating: 4.8,
    reviews: 123,
    category: 'math',
    isNew: true,
    tags: ['Nâng cao', 'Lớp 11', 'Chuẩn bị'],
  }
];

export default function CoursesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('Tất cả');
  const [sortBy, setSortBy] = useState('popular');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 2000000]);
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  const filteredAndSortedCourses = useMemo(() => {
    const filtered = courses.filter(course => {
      // Category filter
      if (selectedCategory !== 'all' && course.category !== selectedCategory) {
        return false;
      }
      
      // Level filter
      if (selectedLevel !== 'Tất cả' && course.level !== selectedLevel) {
        return false;
      }
      
      // Search filter
      if (searchTerm && !course.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !course.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !course.instructor.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Price range filter
      if (course.price < priceRange[0] || course.price > priceRange[1]) {
        return false;
      }
      
      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return a.isNew ? -1 : 1;
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'popular':
        default:
          return b.students - a.students;
      }
    });

    return filtered;
  }, [selectedCategory, selectedLevel, sortBy, searchTerm, priceRange]);

  const formatPrice = (price: number) => {
    if (price === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const toggleFavorite = (courseId: string) => {
    setFavorites(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const addToCart = (courseId: string) => {
    // Implement add to cart logic
    console.log('Added to cart:', courseId);
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
                  <span className="text-gray-500">Khóa học</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Khóa học trực tuyến
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Khám phá hàng trăm khóa học chất lượng cao từ các giảng viên hàng đầu. 
              Học mọi lúc, mọi nơi với phương pháp hiện đại và hiệu quả.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm khóa học, giảng viên..."
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

                {/* Level Filter */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Cấp độ
                  </h3>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {levels.map((level) => (
                      <option key={level} value={level}>
                        {level}
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
                        value="free"
                        checked={priceRange[1] === 0}
                        onChange={() => setPriceRange([0, 0])}
                        className="text-blue-600"
                      />
                      <label className="text-gray-600">Miễn phí</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="price"
                        value="under-500k"
                        checked={priceRange[1] === 500000}
                        onChange={() => setPriceRange([0, 500000])}
                        className="text-blue-600"
                      />
                      <label className="text-gray-600">Dưới 500.000đ</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="price"
                        value="500k-1m"
                        checked={priceRange[0] === 500000 && priceRange[1] === 1000000}
                        onChange={() => setPriceRange([500000, 1000000])}
                        className="text-blue-600"
                      />
                      <label className="text-gray-600">500.000đ - 1.000.000đ</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="price"
                        value="all"
                        checked={priceRange[1] === 2000000}
                        onChange={() => setPriceRange([0, 2000000])}
                        className="text-blue-600"
                      />
                      <label className="text-gray-600">Tất cả</label>
                    </div>
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
                  Khóa học ({filteredAndSortedCourses.length})
                </h2>
                <p className="text-gray-600 mt-1">
                  Tìm thấy {filteredAndSortedCourses.length} khóa học phù hợp
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

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAndSortedCourses.map((course) => (
                <div key={course.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                  {/* Course Image */}
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      quality={100}
                      unoptimized={true}
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                      {course.isFree && (
                        <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                          Miễn phí
                        </span>
                      )}
                      {course.isNew && (
                        <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                          Mới
                        </span>
                      )}
                      {course.isPopular && (
                        <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full">
                          Phổ biến
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="absolute top-3 right-3 flex gap-2">
                      <button
                        onClick={() => toggleFavorite(course.id)}
                        className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                      >
                        {favorites.includes(course.id) ? (
                          <HeartIconSolid className="h-4 w-4 text-red-500" />
                        ) : (
                          <HeartIcon className="h-4 w-4 text-gray-600" />
                        )}
                      </button>
                    </div>

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Link
                        href={`/courses/${course.id}`}
                        className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                      >
                        <PlayCircleIcon className="h-8 w-8 text-blue-600" />
                      </Link>
                    </div>
                  </div>

                  {/* Course Info */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-blue-600 font-semibold">
                        {categories.find(c => c.id === course.category)?.name}
                      </span>
                      <span className="text-sm text-gray-500">{course.level}</span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      <Link href={`/courses/${course.id}`} className="hover:text-blue-600 transition-colors">
                        {course.title}
                      </Link>
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="flex items-center mb-4">
                      <Link
                        href={`/teachers/${course.instructorId}`}
                        className="text-sm text-gray-700 hover:text-blue-600 transition-colors"
                      >
                        {course.instructor}
                      </Link>
                    </div>

                    {/* Course Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center">
                          <BookOpenIcon className="h-4 w-4 mr-1" />
                          <span>{course.lessons} bài</span>
                        </div>
                        <div className="flex items-center">
                          <UserGroupIcon className="h-4 w-4 mr-1" />
                          <span>{course.students.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center mb-4">
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIconSolid
                            key={star}
                            className={`h-4 w-4 ${
                              star <= Math.floor(course.rating)
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 ml-2">
                        {course.rating} ({course.reviews} đánh giá)
                      </span>
                    </div>

                    {/* Price & Actions */}
                    <div className="flex items-center justify-between">
                      <div>
                        {course.isFree ? (
                          <span className="text-lg font-bold text-green-600">
                            Miễn phí
                          </span>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-blue-600">
                              {formatPrice(course.price)}
                            </span>
                            {course.originalPrice && (
                              <span className="text-sm text-gray-500 line-through">
                                {formatPrice(course.originalPrice)}
                              </span>
                            )}
                            {course.discountPercent && (
                              <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold">
                                -{course.discountPercent}%
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {!course.isFree && (
                        <button
                          onClick={() => addToCart(course.id)}
                          className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <ShoppingCartIcon className="h-4 w-4 mr-1" />
                          Thêm
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredAndSortedCourses.length === 0 && (
              <div className="text-center py-16">
                <BookOpenIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Không tìm thấy khóa học
                </h3>
                <p className="text-gray-600 mb-6">
                  Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedLevel('Tất cả');
                    setSearchTerm('');
                    setPriceRange([0, 2000000]);
                  }}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}

            {/* Load More */}
            {filteredAndSortedCourses.length > 0 && (
              <div className="text-center mt-12">
                <button className="px-8 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors">
                  Xem thêm khóa học
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Bạn là giảng viên?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Tham gia cùng chúng tôi để chia sẻ kiến thức và kiếm thu nhập từ việc giảng dạy
          </p>
          <Link
            href="/become-instructor"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
          >
            Trở thành giảng viên
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
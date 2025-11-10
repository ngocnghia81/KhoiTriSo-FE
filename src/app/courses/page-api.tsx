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
import { useCourses } from '@/hooks/useCourses';

const categories = [
  { id: null, name: 'Tất cả', count: 0 },
];

const levels = [
  { value: null, label: 'Tất cả' },
  { value: 1, label: 'Dễ' },
  { value: 2, label: 'Trung bình' },
  { value: 3, label: 'Khó' },
];

const sortOptions = [
  { value: 'totalStudents_desc', label: 'Phổ biến nhất' },
  { value: 'createdAt_desc', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá thấp đến cao' },
  { value: 'price_desc', label: 'Giá cao đến thấp' },
  { value: 'rating_desc', label: 'Đánh giá cao nhất' },
];

function CourseCard({ course }: { course: any }) {
  const [favorited, setFavorited] = useState(false);

  const formatPrice = (price: number) => {
    if (price === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDuration = (hours?: number) => {
    if (!hours) return 'N/A';
    return `${hours} giờ`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
      {/* Course Image */}
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={course.thumbnail || '/images/course/course-placeholder.png'}
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
          {course.approvalStatus === 2 && (
            <span className="px-2 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
              Đã duyệt
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={() => setFavorited(!favorited)}
            className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
          >
            {favorited ? (
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
            {course.category?.name || 'Chưa phân loại'}
          </span>
          <span className="text-sm text-gray-500">
            {course.level === 1 ? 'Dễ' : course.level === 2 ? 'Trung bình' : course.level === 3 ? 'Khó' : 'N/A'}
          </span>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          <Link href={`/courses/${course.id}`} className="hover:text-blue-600 transition-colors">
            {course.title}
          </Link>
        </h3>

        {course.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {course.description}
          </p>
        )}

        {course.instructor && (
          <div className="flex items-center mb-4">
            <Link
              href={`/instructors/${course.instructor.id}`}
              className="text-sm text-gray-700 hover:text-blue-600 transition-colors"
            >
              {course.instructor.name}
            </Link>
          </div>
        )}

        {/* Course Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            {course.estimatedDuration && (
              <div className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                <span>{formatDuration(course.estimatedDuration)}</span>
              </div>
            )}
            {course.totalLessons !== undefined && (
              <div className="flex items-center">
                <BookOpenIcon className="h-4 w-4 mr-1" />
                <span>{course.totalLessons} bài</span>
              </div>
            )}
            {course.totalStudents !== undefined && (
              <div className="flex items-center">
                <UserGroupIcon className="h-4 w-4 mr-1" />
                <span>{course.totalStudents.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Rating */}
        {course.rating !== undefined && course.totalReviews !== undefined && (
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
              {course.rating.toFixed(1)} ({course.totalReviews.toLocaleString()} đánh giá)
            </span>
          </div>
        )}

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
              </div>
            )}
          </div>

          {!course.isFree && (
            <button
              className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ShoppingCartIcon className="h-4 w-4 mr-1" />
              Thêm
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('totalStudents_desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const [sortField, sortOrder] = sortBy.split('_');
  const isDesc = sortOrder === 'desc';

  const { courses, loading, error, pagination } = useCourses({
    category: selectedCategory || undefined,
    level: selectedLevel || undefined,
    search: searchTerm || undefined,
    page,
    pageSize: 20,
    sortBy: sortField === 'totalStudents' ? 'totalStudents' : 
            sortField === 'createdAt' ? 'createdAt' : 
            sortField === 'price' ? 'price' : 
            sortField === 'rating' ? 'rating' : undefined,
    sortOrder: isDesc ? 'desc' : 'asc',
    approvalStatus: 2, // Only show approved courses
  });

  const formatPrice = (price: number) => {
    if (price === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
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
                {/* Level Filter */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Cấp độ
                  </h3>
                  <select
                    value={selectedLevel || ''}
                    onChange={(e) => setSelectedLevel(e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {levels.map((level) => (
                      <option key={level.value || 'all'} value={level.value || ''}>
                        {level.label}
                      </option>
                    ))}
                  </select>
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
                  Khóa học ({pagination.total})
                </h2>
                <p className="text-gray-600 mt-1">
                  Tìm thấy {pagination.total} khóa học phù hợp
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

            {/* Loading State */}
            {loading && (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Đang tải...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Course Grid */}
            {!loading && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {courses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>

                {/* Empty State */}
                {courses.length === 0 && !loading && (
                  <div className="text-center py-16">
                    <BookOpenIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Không tìm thấy khóa học
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                    </p>
                  </div>
                )}

                {/* Pagination */}
                {courses.length > 0 && pagination.total > pagination.pageSize && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Trước
                    </button>
                    <span className="px-4 py-2 text-gray-700">
                      Trang {pagination.page} / {Math.ceil(pagination.total / pagination.pageSize)}
                    </span>
                    <button
                      onClick={() => setPage(p => p + 1)}
                      disabled={page >= Math.ceil(pagination.total / pagination.pageSize)}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Sau
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Bạn muốn trở thành giảng viên?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Liên hệ với admin để được cấp quyền giảng viên và tham gia cùng chúng tôi chia sẻ kiến thức
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
          >
            Liên hệ Admin
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}


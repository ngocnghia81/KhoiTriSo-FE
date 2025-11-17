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

  // Strip HTML tags from text (works on both server and client)
  const stripHtml = (html: string | undefined | null): string => {
    if (!html) return '';
    // Remove HTML tags using regex
    return html.replace(/<[^>]*>/g, '').trim();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100 hover:border-blue-200 h-full flex flex-col">
      {/* Course Image */}
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 flex-shrink-0">
        <Image
          src={course.thumbnail || '/images/course/course-placeholder.png'}
          alt={course.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          quality={100}
          unoptimized={true}
        />
        
        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Badges - Only show Free badge */}
        <div className="absolute top-3 left-3 z-10">
          {course.isFree && (
            <span className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-full shadow-lg">
              ✨ Miễn phí
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="absolute top-3 right-3 z-10 flex gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setFavorited(!favorited);
            }}
            className="w-9 h-9 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-md hover:scale-110"
          >
            {favorited ? (
              <HeartIconSolid className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5 text-gray-700" />
            )}
          </button>
        </div>

        {/* Play Button Overlay - More prominent */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Link
            href={`/courses/${course.id}`}
            className="w-20 h-20 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-2xl"
          >
            <PlayCircleIcon className="h-10 w-10 text-blue-600 ml-1" />
          </Link>
        </div>

        {/* Quick Stats Overlay on Hover */}
        {course.totalStudents !== undefined && (
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-4 text-xs">
              <div className="flex items-center text-gray-700">
                <UserGroupIcon className="h-4 w-4 mr-1 text-blue-600" />
                <span className="font-semibold">{course.totalStudents.toLocaleString()}+ học viên</span>
              </div>
              {course.rating !== undefined && (
                <div className="flex items-center text-gray-700">
                  <StarIconSolid className="h-4 w-4 mr-1 text-yellow-400" />
                  <span className="font-semibold">{course.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Course Info */}
      <div className="p-6 flex flex-col flex-1">
        {/* Category & Level */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
            {stripHtml(course.category?.name) || 'Chưa phân loại'}
          </span>
          {course.level ? (
            <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
              {course.level === 1 ? '⭐ Dễ' : course.level === 2 ? '⭐⭐ Trung bình' : course.level === 3 ? '⭐⭐⭐ Khó' : ''}
            </span>
          ) : (
            <span className="text-xs text-transparent">Placeholder</span>
          )}
        </div>

        {/* Title - Fixed height */}
        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 min-h-[3.5rem] group-hover:text-blue-600 transition-colors">
          <Link href={`/courses/${course.id}`}>
            {stripHtml(course.title)}
          </Link>
        </h3>

        {/* Instructor - Fixed height */}
        <div className="flex items-center mb-3 min-h-[1.5rem]">
          {course.instructor ? (
            <>
              <AcademicCapIcon className="h-4 w-4 text-gray-400 mr-1.5" />
              <Link
                href={`/instructors/${course.instructor.id}`}
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                {stripHtml(course.instructor.name)}
              </Link>
            </>
          ) : (
            <div className="h-4"></div>
          )}
        </div>

        {/* Rating - Fixed height */}
        <div className="mb-4 min-h-[2.5rem]">
          {course.rating !== undefined && course.totalReviews !== undefined ? (
            <div className="flex items-center bg-yellow-50 rounded-lg px-3 py-2">
              <div className="flex items-center space-x-1 mr-2">
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
              <span className="text-sm font-bold text-gray-900 mr-1">
                {course.rating.toFixed(1)}
              </span>
              <span className="text-xs text-gray-600">
                ({course.totalReviews.toLocaleString()})
              </span>
            </div>
          ) : null}
        </div>

        {/* Course Stats - Compact - Fixed height */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100 min-h-[1.75rem]">
          {course.totalLessons !== undefined && (
            <div className="flex items-center">
              <BookOpenIcon className="h-4 w-4 mr-1 text-blue-500" />
              <span>{course.totalLessons} bài học</span>
            </div>
          )}
          {course.estimatedDuration && (
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-1 text-purple-500" />
              <span>{formatDuration(course.estimatedDuration)}</span>
            </div>
          )}
          {!course.totalLessons && !course.estimatedDuration && (
            <div className="h-4"></div>
          )}
        </div>

        {/* Price & CTA - More Prominent - Push to bottom */}
        <div className="flex items-center justify-between mt-auto">
          <div>
            {course.isFree ? (
              <div>
                <span className="text-2xl font-bold text-green-600">
                  Miễn phí
                </span>
                <p className="text-xs text-gray-500 mt-0.5">Bắt đầu học ngay</p>
              </div>
            ) : (
              <div>
                <span className="text-2xl font-bold text-blue-600">
                  {formatPrice(course.price)}
                </span>
                <p className="text-xs text-gray-500 mt-0.5">Một lần thanh toán</p>
              </div>
            )}
          </div>

          {!course.isFree ? (
            <Link
              href={`/courses/${course.id}`}
              className="flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg hover:scale-105"
            >
              <PlayCircleIcon className="h-4 w-4 mr-1.5" />
              Học ngay
            </Link>
          ) : (
            <Link
              href={`/courses/${course.id}`}
              className="flex items-center px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg hover:scale-105"
            >
              <PlayCircleIcon className="h-4 w-4 mr-1.5" />
              Học ngay
            </Link>
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

      {/* Hero Section - More Engaging */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white py-20 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Khám phá khóa học của bạn
            </h1>
            <p className="text-xl lg:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto font-medium">
              Hàng trăm khóa học chất lượng cao từ giảng viên hàng đầu. 
              Học mọi lúc, mọi nơi với phương pháp hiện đại.
            </p>
            
            {/* Search Bar - Enhanced */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="🔍 Tìm kiếm khóa học, giảng viên, chủ đề..."
                  className="w-full px-6 py-5 pr-16 text-gray-900 bg-white rounded-2xl focus:ring-4 focus:ring-white/30 focus:outline-none text-lg shadow-2xl border-2 border-transparent focus:border-white/50 transition-all"
                />
                <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-700 transition-colors">
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
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8 items-stretch">
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

      {/* CTA Section - More Engaging */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Bạn muốn trở thành giảng viên?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Chia sẻ kiến thức của bạn với hàng nghìn học viên. 
            Tham gia cùng chúng tôi và kiếm thu nhập từ đam mê giảng dạy.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-10 py-5 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-2xl hover:shadow-3xl hover:scale-105 text-lg"
          >
            Liên hệ Admin
            <ArrowRightIcon className="ml-2 h-6 w-6" />
          </Link>
        </div>
      </section>
    </div>
  );
}


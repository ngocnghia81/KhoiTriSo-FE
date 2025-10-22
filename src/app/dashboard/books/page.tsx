'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpenIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  UserGroupIcon,
  ClockIcon,
  CurrencyDollarIcon,
  KeyIcon,
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useBooks, useDeleteBook } from '@/hooks/useBooks';
import { useCategories } from '@/hooks/useCategories';
import { BookFilters } from '@/types/book';

export default function BooksPage() {
  console.log('BooksPage: Component rendered');
  const router = useRouter();
  const [filters, setFilters] = useState<BookFilters>({
    page: 1,
    pageSize: 20,
    search: '',
    categoryId: undefined,
    approvalStatus: undefined,
    authorId: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  console.log('BooksPage: About to call useBooks with filters:', filters);
  const { data: booksData, loading, error, refetch } = useBooks(filters);
  console.log('BooksPage: useBooks returned:', { booksData, loading, error });
  const { categories } = useCategories();
  const { deleteBook, loading: deleteLoading } = useDeleteBook();

  // Debug logs
  console.log('Books data:', booksData);
  console.log('Loading:', loading);
  console.log('Error:', error);
  console.log('Categories:', categories);
  console.log('Filters:', filters);

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search, page: 1 }));
  };

  const handleCategoryFilter = (categoryId: number | undefined) => {
    setFilters(prev => ({ ...prev, categoryId, page: 1 }));
  };

  const handleStatusFilter = (approvalStatus: number | undefined) => {
    setFilters(prev => ({ ...prev, approvalStatus, page: 1 }));
  };

  const handleSort = (sortBy: string, sortOrder: string) => {
    setFilters(prev => ({ ...prev, sortBy, sortOrder, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleDeleteBook = async (bookId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sách này?')) {
      const success = await deleteBook(bookId);
      if (success) {
        refetch();
      }
    }
  };

  const handleEditBook = (bookId: number) => {
    router.push(`/dashboard/books/${bookId}/edit`);
  };

  const handleViewBook = (bookId: number) => {
    router.push(`/dashboard/books/${bookId}`);
  };

  const handleManageCodes = (bookId: number) => {
    router.push(`/dashboard/books/${bookId}/activation-codes`);
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <StarIconSolid
            key={i}
            className={`h-4 w-4 ${
              i < fullStars ? 'text-yellow-400' : 'text-gray-200'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">{rating}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">{error}</div>
      </div>
    );
  }

  const books = booksData?.items || [];
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý sách điện tử</h1>
          <p className="mt-2 text-sm text-gray-700">
            Quản lý sách điện tử, mã kích hoạt và nội dung số
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none space-x-3">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
          >
            <KeyIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
            Tạo mã kích hoạt
          </button>
          <button
            onClick={() => router.push('/dashboard/books/create')}
            type="button"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
            Thêm sách mới
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow-lg rounded-xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <BookOpenIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <dl>
                <dt className="text-sm font-medium text-gray-500">Tổng sách</dt>
                <dd className="text-2xl font-bold text-gray-900">{booksData?.total || 0}</dd>
                <dd className="text-sm text-gray-600">Trong hệ thống</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <KeyIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <dl>
                <dt className="text-sm font-medium text-gray-500">Sách đang bán</dt>
                <dd className="text-2xl font-bold text-gray-900">
                  {books.filter(book => book.isActive).length}
                </dd>
                <dd className="text-sm text-green-600">Hoạt động</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <DocumentTextIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <dl>
                <dt className="text-sm font-medium text-gray-500">Chờ duyệt</dt>
                <dd className="text-2xl font-bold text-gray-900">
                  {books.filter(book => book.approvalStatus === 0).length}
                </dd>
                <dd className="text-sm text-yellow-600">Cần xem xét</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="ml-4">
              <dl>
                <dt className="text-sm font-medium text-gray-500">Tổng giá trị</dt>
                <dd className="text-2xl font-bold text-gray-900">
                  ₫{books.reduce((sum, book) => sum + book.price, 0).toLocaleString()}
                </dd>
                <dd className="text-sm text-blue-600">Tất cả sách</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and search */}
      <div className="bg-white shadow-lg rounded-xl">
        <div className="p-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="sm:flex sm:items-center sm:space-x-4">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={filters.search || ''}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
                  placeholder="Tìm kiếm sách..."
                />
              </div>

              {/* Category filter */}
              <select 
                value={filters.categoryId || ''} 
                onChange={(e) => handleCategoryFilter(e.target.value ? parseInt(e.target.value) : undefined)}
                className="mt-2 sm:mt-0 block w-full sm:w-auto pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-xl bg-gray-50"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              {/* Status filter */}
              <select 
                value={filters.approvalStatus || ''} 
                onChange={(e) => handleStatusFilter(e.target.value ? parseInt(e.target.value) : undefined)}
                className="mt-2 sm:mt-0 block w-full sm:w-auto pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-xl bg-gray-50"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="0">Chờ duyệt</option>
                <option value="1">Đã duyệt</option>
                <option value="2">Từ chối</option>
              </select>
            </div>

            <div className="mt-4 sm:mt-0">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FunnelIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
                Lọc nâng cao
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Books grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {books.map((book) => (
          <div key={book.id} className="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-all duration-300">
            {/* Book cover */}
            <div className="aspect-[3/4] bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden">
              {book.coverImage ? (
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    (e.currentTarget.nextElementSibling as HTMLElement)?.style.setProperty('display', 'flex');
                  }}
                />
              ) : null}
              <div className="absolute inset-0 flex items-center justify-center" style={{ display: book.coverImage ? 'none' : 'flex' }}>
                <BookOpenIcon className="h-20 w-20 text-white opacity-80" />
              </div>
              
              {/* Status badges */}
              <div className="absolute top-3 left-3 flex flex-col space-y-2">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  book.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {book.isActive ? 'Đang bán' : 'Tạm dừng'}
                </span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  book.approvalStatus === 0 ? 'bg-yellow-100 text-yellow-800' :
                  book.approvalStatus === 1 ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {book.approvalStatus === 0 ? 'Chờ duyệt' :
                   book.approvalStatus === 1 ? 'Đã duyệt' : 'Từ chối'}
                </span>
              </div>

              {/* Actions */}
              <div className="absolute top-3 right-3">
                <div className="flex flex-col space-y-1">
                  <button 
                    onClick={() => handleViewBook(book.id)}
                    className="p-2 bg-white/90 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-white transition-all"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleEditBook(book.id)}
                    className="p-2 bg-white/90 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-white transition-all"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleManageCodes(book.id)}
                    className="p-2 bg-white/90 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-white transition-all"
                  >
                    <KeyIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Book content */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-blue-600 font-medium">{book.category?.name || 'Chưa phân loại'}</span>
                {book.isbn && (
                  <span className="text-sm text-gray-500">ISBN: {book.isbn}</span>
                )}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {book.title}
              </h3>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {book.description}
              </p>

              {/* Author */}
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                  <span className="text-sm font-medium text-white">
                    {book.author?.fullName?.charAt(0) || 'A'}
                  </span>
                </div>
                <span className="text-sm text-gray-700">{book.author?.fullName || 'Tác giả'}</span>
              </div>

              {/* Rating and price */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {renderStars(book.rating || 0)}
                  <span className="ml-2 text-sm text-gray-500">({book.totalReviews})</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-gray-900">
                    {book.price.toLocaleString()}₫
                  </span>
                </div>
              </div>

              {/* Content types */}
              <div className="flex items-center justify-center space-x-4 mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center text-xs text-gray-600">
                  <DocumentTextIcon className="h-4 w-4 mr-1 text-blue-500" />
                  Văn bản
                </div>
                <div className="flex items-center text-xs text-gray-600">
                  <PhotoIcon className="h-4 w-4 mr-1 text-green-500" />
                  Hình ảnh
                </div>
                <div className="flex items-center text-xs text-gray-600">
                  <VideoCameraIcon className="h-4 w-4 mr-1 text-red-500" />
                  Video
                </div>
              </div>
            </div>

            {/* Actions footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleViewBook(book.id)}
                    className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    Xem chi tiết
                  </button>
                  <button 
                    onClick={() => handleManageCodes(book.id)}
                    className="px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    Quản lý mã
                  </button>
                </div>
                <div className="flex space-x-1">
                  <button 
                    onClick={() => handleEditBook(book.id)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteBook(book.id)}
                    disabled={deleteLoading}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {booksData && booksData.total > 0 && (
        <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-xl shadow-lg">
          <div className="flex-1 flex justify-between sm:hidden">
            <button 
              onClick={() => handlePageChange(filters.page - 1)}
              disabled={filters.page <= 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <button 
              onClick={() => handlePageChange(filters.page + 1)}
              disabled={filters.page >= Math.ceil(booksData.total / filters.pageSize)}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Hiển thị <span className="font-medium">{(filters.page - 1) * filters.pageSize + 1}</span> đến{' '}
                <span className="font-medium">{Math.min(filters.page * filters.pageSize, booksData.total)}</span> trong{' '}
                <span className="font-medium">{booksData.total}</span> kết quả
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px">
                <button 
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page <= 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                {Array.from({ length: Math.min(5, Math.ceil(booksData.total / filters.pageSize)) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pageNum === filters.page
                          ? 'bg-blue-50 text-blue-600 border-blue-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button 
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page >= Math.ceil(booksData.total / filters.pageSize)}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

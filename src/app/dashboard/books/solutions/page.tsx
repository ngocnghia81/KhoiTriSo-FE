'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpenIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useBooks } from '@/hooks/useBooks';

export default function BookSolutionsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  // Fetch all books for selection
  const { data: booksData, loading: booksLoading } = useBooks({
    page: 1,
    pageSize: 100,
    search: '',
    categoryId: undefined,
    approvalStatus: undefined,
    authorId: undefined,
    sortBy: 'title',
    sortOrder: 'asc'
  });

  const books = booksData?.items || [];
  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportSolutions = () => {
    if (!selectedBookId) return;
    
    // Mock data for now - replace with real API call
    const csvContent = [
      'Câu hỏi,Đáp án,Giải thích,Ngày tạo',
      'Câu hỏi 1,Đáp án A,Giải thích chi tiết,2025-10-22',
      'Câu hỏi 2,Đáp án B,Giải thích chi tiết,2025-10-22'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solutions-book-${selectedBookId}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Quản lý giải pháp</h1>
            <p className="text-sm text-gray-600">Xem và quản lý giải pháp/bài giải của sách</p>
          </div>
        </div>
        {selectedBookId && (
          <div className="flex space-x-3">
            <button
              onClick={exportSolutions}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
              Xuất CSV
            </button>
            <button
              onClick={() => router.push(`/dashboard/books/${selectedBookId}/solutions/create`)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Thêm giải pháp
            </button>
          </div>
        )}
      </div>

      {/* Book Selection */}
      <div className="bg-white shadow-lg rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Chọn sách</h3>
        
        <div className="mb-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm sách..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {booksLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedBookId === book.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => {
                  console.log('SolutionsPage: Selecting book with ID:', book.id);
                  setSelectedBookId(book.id);
                  setPage(1);
                }}
              >
                <div className="flex items-center space-x-3">
                  {book.coverImage ? (
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-12 h-16 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        (e.currentTarget.nextElementSibling as HTMLElement)?.style.setProperty('display', 'flex');
                      }}
                    />
                  ) : null}
                  <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center" style={{ display: book.coverImage ? 'none' : 'flex' }}>
                    <BookOpenIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {book.title}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">
                      {book.author?.fullName || 'Không có tác giả'}
                    </p>
                    <p className="text-xs text-gray-500">
                      ID: {book.id}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Solutions */}
      {selectedBookId && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <BookOpenIcon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500">Tổng giải pháp</dt>
                    <dd className="text-2xl font-bold text-gray-900">0</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500">Đã duyệt</dt>
                    <dd className="text-2xl font-bold text-gray-900">0</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Solutions Table */}
          <div className="bg-white shadow-lg rounded-xl">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Danh sách giải pháp</h3>
            </div>
            
            <div className="p-6 text-center text-gray-500">
              <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Chưa có giải pháp nào</p>
              <p className="text-sm mb-4">Hãy thêm giải pháp cho sách này</p>
              <button
                onClick={() => router.push(`/dashboard/books/${selectedBookId}/solutions/create`)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Thêm giải pháp đầu tiên
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

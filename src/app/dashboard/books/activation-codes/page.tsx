'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  KeyIcon,
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
import { useBooks, useActivationCodes, useGenerateActivationCodes } from '@/hooks/useBooks';

export default function AllActivationCodesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateQuantity, setGenerateQuantity] = useState(10);

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

  // Fetch activation codes for selected book
  const { data: codesData, loading: codesLoading, error, refetch } = useActivationCodes(
    selectedBookId || 0, 
    page, 
    pageSize
  );
  const { generateCodes, loading: generateLoading } = useGenerateActivationCodes();

  console.log('ActivationCodesPage: selectedBookId =', selectedBookId);
  console.log('ActivationCodesPage: codes data =', { codesData, loading: codesLoading, error });

  const books = booksData?.items || [];
  const codes = codesData?.items || [];
  const totalCodes = codesData?.total || 0;
  const usedCodes = codes.filter(code => code.isUsed).length;
  const unusedCodes = totalCodes - usedCodes;

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleGenerateCodes = async () => {
    if (!selectedBookId) return;
    
    const request = {
      quantity: generateQuantity,
    };

    console.log('AllActivationCodesPage: Generating codes with request:', request);
    const result = await generateCodes(selectedBookId, request);
    console.log('AllActivationCodesPage: Generate result:', result);
    
    if (result) {
      setShowGenerateModal(false);
      setGenerateQuantity(10);
      refetch();
    }
  };

  const exportCodes = () => {
    if (!codes.length) return;
    
    const csvContent = [
      'Mã kích hoạt,Trạng thái,Người sử dụng,Ngày tạo',
      ...codes.map(code => [
        code.activationCode,
        code.isUsed ? 'Đã sử dụng' : 'Chưa sử dụng',
        code.usedBy?.fullName || '',
        new Date(code.createdAt).toLocaleDateString('vi-VN')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activation-codes-book-${selectedBookId}.csv`;
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
            <h1 className="text-2xl font-semibold text-gray-900">Quản lý mã kích hoạt</h1>
            <p className="text-sm text-gray-600">Xem và quản lý mã kích hoạt của tất cả sách</p>
          </div>
        </div>
        {selectedBookId && (
          <div className="flex space-x-3">
            {codes.length > 0 && (
              <button
                onClick={exportCodes}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                Xuất CSV
              </button>
            )}
            <button
              onClick={() => setShowGenerateModal(true)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Tạo mã mới
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
                  console.log('ActivationCodesPage: Selecting book with ID:', book.id);
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
                    <KeyIcon className="h-6 w-6 text-gray-400" />
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

      {/* Activation Codes */}
      {selectedBookId && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <KeyIcon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500">Tổng mã</dt>
                    <dd className="text-2xl font-bold text-gray-900">{totalCodes}</dd>
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
                    <dt className="text-sm font-medium text-gray-500">Đã sử dụng</dt>
                    <dd className="text-2xl font-bold text-gray-900">{usedCodes}</dd>
                    <dd className="text-sm text-gray-600">{totalCodes > 0 ? Math.round((usedCodes / totalCodes) * 100) : 0}%</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <ClockIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500">Chưa sử dụng</dt>
                    <dd className="text-2xl font-bold text-gray-900">{unusedCodes}</dd>
                    <dd className="text-sm text-gray-600">{totalCodes > 0 ? Math.round((unusedCodes / totalCodes) * 100) : 0}%</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Codes Table */}
          <div className="bg-white shadow-lg rounded-xl">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Danh sách mã kích hoạt</h3>
            </div>
            
            {codesLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="p-6 text-center text-red-600">{error}</div>
            ) : codes.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                Không có mã kích hoạt nào cho sách này
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mã kích hoạt
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trạng thái
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Người sử dụng
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ngày tạo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {codes.map((code) => (
                        <tr key={code.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                {code.activationCode}
                              </code>
                              <button
                                onClick={() => copyToClipboard(code.activationCode)}
                                className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                title="Sao chép mã"
                              >
                                <DocumentDuplicateIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              code.isUsed
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {code.isUsed ? (
                                <>
                                  <CheckCircleIcon className="h-3 w-3 mr-1" />
                                  Đã sử dụng
                                </>
                              ) : (
                                <>
                                  <ClockIcon className="h-3 w-3 mr-1" />
                                  Chưa sử dụng
                                </>
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {code.usedBy ? (
                              <div className="flex items-center">
                                <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-900">{code.usedBy.fullName}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-900">
                                {new Date(code.createdAt).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => copyToClipboard(code.activationCode)}
                                className="text-blue-600 hover:text-blue-900 transition-colors"
                              >
                                Sao chép
                              </button>
                              <button
                                onClick={() => router.push(`/dashboard/books/${selectedBookId}/activation-codes`)}
                                className="text-gray-600 hover:text-gray-900 transition-colors"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalCodes > 0 && (
                  <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Hiển thị <span className="font-medium">{(page - 1) * pageSize + 1}</span> đến{' '}
                          <span className="font-medium">{Math.min(page * pageSize, totalCodes)}</span> trong{' '}
                          <span className="font-medium">{totalCodes}</span> kết quả
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setPage(page - 1)}
                          disabled={page <= 1}
                          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Trước
                        </button>
                        <button
                          onClick={() => setPage(page + 1)}
                          disabled={page >= Math.ceil(totalCodes / pageSize)}
                          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Sau
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tạo mã kích hoạt mới</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số lượng mã cần tạo
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={generateQuantity}
                  onChange={(e) => setGenerateQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleGenerateCodes}
                  disabled={generateLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generateLoading ? 'Đang tạo...' : 'Tạo mã'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

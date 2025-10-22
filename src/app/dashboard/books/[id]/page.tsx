'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpenIcon,
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  KeyIcon,
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  StarIcon,
  UserIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  TagIcon,
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useBook, useDeleteBook, useBookChapters, useBookQuestions } from '@/hooks/useBooks';
import { BookChapterDto, BookQuestionDto } from '@/types/book';

interface BookDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function BookDetailPage({ params }: BookDetailPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const bookId = parseInt(resolvedParams.id);
  const [activeTab, setActiveTab] = useState<'overview' | 'chapters' | 'questions'>('overview');

  console.log('BookDetailPage: bookId =', bookId);
  const { data: book, loading, error, refetch } = useBook(bookId);
  console.log('BookDetailPage: book data =', { book, loading, error });
  const { deleteBook, loading: deleteLoading } = useDeleteBook();
  const { data: chaptersData, loading: chaptersLoading } = useBookChapters(bookId);
  const { data: questionsData, loading: questionsLoading } = useBookQuestions(bookId);

  const handleDeleteBook = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sách này?')) {
      const success = await deleteBook(bookId);
      if (success) {
        router.push('/dashboard/books');
      }
    }
  };

  const handleEditBook = () => {
    router.push(`/dashboard/books/${bookId}/edit`);
  };

  const handleManageCodes = () => {
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

  if (error || !book) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">{error || 'Không tìm thấy sách'}</div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-semibold text-gray-900">{book.title}</h1>
            <p className="text-sm text-gray-600">Chi tiết sách điện tử</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleManageCodes}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
          >
            <KeyIcon className="h-4 w-4 mr-2" />
            Quản lý mã
          </button>
          <button
            onClick={handleEditBook}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Chỉnh sửa
          </button>
          <button
            onClick={handleDeleteBook}
            disabled={deleteLoading}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Xóa
          </button>
        </div>
      </div>

      {/* Book Info Card */}
      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Book Cover */}
            <div className="lg:col-span-1">
              <div className="aspect-[3/4] bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center overflow-hidden">
                {book.coverImage ? (
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="flex items-center justify-center" style={{ display: book.coverImage ? 'none' : 'flex' }}>
                  <BookOpenIcon className="h-20 w-20 text-white opacity-80" />
                </div>
              </div>
            </div>

            {/* Book Details */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {/* Title and Status */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{book.title}</h2>
                    <p className="text-gray-600 mt-1">{book.description}</p>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      book.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {book.isActive ? 'Đang bán' : 'Tạm dừng'}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      book.approvalStatus === 0 ? 'bg-yellow-100 text-yellow-800' :
                      book.approvalStatus === 1 ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {book.approvalStatus === 0 ? 'Chờ duyệt' :
                       book.approvalStatus === 1 ? 'Đã duyệt' : 'Từ chối'}
                    </span>
                  </div>
                </div>

                {/* Author and Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Tác giả</p>
                      <p className="font-medium text-gray-900">{book.author?.fullName || 'Chưa xác định'}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <TagIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Danh mục</p>
                      <p className="font-medium text-gray-900">{book.category?.name || 'Chưa phân loại'}</p>
                    </div>
                  </div>
                </div>

                {/* Price and Rating */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Giá</p>
                      <p className="font-medium text-gray-900">{book.price.toLocaleString()} VNĐ</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <StarIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Đánh giá</p>
                      <div className="flex items-center">
                        {renderStars(book.rating || 0)}
                        <span className="ml-2 text-sm text-gray-600">({book.totalReviews} đánh giá)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ISBN and Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {book.isbn && (
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">ISBN</p>
                        <p className="font-medium text-gray-900">{book.isbn}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Ngày tạo</p>
                      <p className="font-medium text-gray-900">
                        {new Date(book.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow-lg rounded-xl">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tổng quan
            </button>
            <button
              onClick={() => setActiveTab('chapters')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'chapters'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Chương sách ({chaptersData?.chapters.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'questions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Câu hỏi ({questionsData?.total || 0})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Thông tin chi tiết</h3>
              <div className="prose max-w-none">
                <p className="text-gray-700">{book.description}</p>
              </div>
            </div>
          )}

          {activeTab === 'chapters' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Danh sách chương</h3>
                <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Thêm chương
                </button>
              </div>
              
              {chaptersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : chaptersData?.chapters.length ? (
                <div className="space-y-3">
                  {chaptersData.chapters.map((chapter, index) => (
                    <div key={chapter.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Chương {chapter.orderIndex}: {chapter.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {chapter.content}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">
                            {chapter.questionCount} câu hỏi
                          </span>
                          <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Chưa có chương nào</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Danh sách câu hỏi</h3>
                <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Thêm câu hỏi
                </button>
              </div>
              
              {questionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : questionsData?.items.length ? (
                <div className="space-y-3">
                  {questionsData.items.map((question, index) => (
                    <div key={question.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-2">
                            Câu {question.orderIndex}: {question.questionText}
                          </h4>
                          <div className="space-y-2">
                            {question.questionOptions.map((option, optionIndex) => (
                              <div key={option.id} className="flex items-center">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium mr-3 ${
                                  option.isCorrect 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {String.fromCharCode(65 + optionIndex)}
                                </span>
                                <span className={`text-sm ${
                                  option.isCorrect ? 'text-green-800 font-medium' : 'text-gray-600'
                                }`}>
                                  {option.optionText}
                                </span>
                                {option.isCorrect && (
                                  <CheckCircleIcon className="h-4 w-4 text-green-600 ml-2" />
                                )}
                              </div>
                            ))}
                          </div>
                          {question.explanation && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm text-blue-800">
                                <strong>Giải thích:</strong> {question.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors ml-4">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Chưa có câu hỏi nào</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

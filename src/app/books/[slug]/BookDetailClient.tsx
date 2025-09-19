'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  BookOpenIcon,
  StarIcon,
  ShoppingCartIcon,
  HeartIcon,
  ShareIcon,
  PlayCircleIcon,
  DocumentTextIcon,
  KeyIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  MinusIcon,
  PlusIcon,
  TagIcon,
  UserIcon,
  CalendarIcon
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
    avatar: string;
    bio: string;
  };
  category: {
    name: string;
    slug: string;
  };
  isbn: string;
  coverImage: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  totalQuestions: number;
  rating: number;
  reviewsCount: number;
  isActive: boolean;
  publishedAt: string;
  features: string[];
  chapters: BookChapter[];
  reviews: BookReview[];
  relatedBooks: RelatedBook[];
  tags: string[];
  activationInfo: {
    accessDuration: string;
    videoContent: boolean;
    textSolutions: boolean;
    imageSolutions: boolean;
  };
}

interface BookChapter {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  orderIndex: number;
}

interface BookReview {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  isVerified: boolean;
}

interface RelatedBook {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  price: number;
  originalPrice?: number;
  rating: number;
  slug: string;
}

interface BookDetailClientProps {
  book: Book;
}

export default function BookDetailClient({ book }: BookDetailClientProps) {
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIconSolid
            key={star}
            className={`h-5 w-5 ${
              star <= Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const addToCart = () => {
    // Implementation for add to cart
    console.log(`Added ${quantity} of ${book.title} to cart`);
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
                  <Link href="/books" className="text-gray-700 hover:text-blue-600">
                    Sách điện tử
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <Link 
                    href={`/books/category/${book.category.slug}`}
                    className="text-gray-700 hover:text-blue-600"
                  >
                    {book.category.name}
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-gray-500">Chi tiết sách</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Book Cover */}
          <div className="space-y-4">
            <div className="aspect-[3/4] bg-white rounded-2xl shadow-lg overflow-hidden">
              <Image
                src={book.coverImage}
                alt={book.title}
                width={600}
                height={800}
                className="w-full h-full object-cover"
                quality={100}
                unoptimized={true}
              />
            </div>
            
            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((index) => (
                <div key={index} className="aspect-[3/4] bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all">
                  <Image
                    src={`/images/books/toan-12-thumb-${index}.jpg`}
                    alt={`${book.title} - Ảnh ${index}`}
                    width={150}
                    height={200}
                    className="w-full h-full object-cover"
                    quality={100}
                    unoptimized={true}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Book Info */}
          <div className="space-y-6">
            {/* Category & Tags */}
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                {book.category.name}
              </span>
              {book.discountPercent && (
                <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded-full">
                  -{book.discountPercent}%
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
              {book.title}
            </h1>

            {/* Author */}
            <div className="flex items-center space-x-3">
              <Image
                src={book.author.avatar}
                alt={book.author.name}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover"
                quality={100}
                unoptimized={true}
              />
              <div>
                <Link
                  href={`/authors/${book.author.id}`}
                  className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                >
                  {book.author.name}
                </Link>
                <p className="text-sm text-gray-600">Tác giả</p>
              </div>
            </div>

            {/* Rating & Reviews */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {renderStars(book.rating)}
                <span className="text-lg font-semibold text-gray-900">{book.rating}</span>
              </div>
              <span className="text-gray-600">
                ({book.reviewsCount} đánh giá)
              </span>
              <span className="text-gray-600">
                {book.totalQuestions} câu hỏi
              </span>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold text-blue-600">
                  {formatPrice(book.price)}
                </span>
                {book.originalPrice && (
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(book.originalPrice)}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">
                * Giá đã bao gồm VAT. Miễn phí vận chuyển toàn quốc.
              </p>
            </div>

            {/* Key Features */}
            <div className="bg-blue-50 rounded-2xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <KeyIcon className="h-5 w-5 mr-2 text-blue-600" />
                Tính năng đặc biệt
              </h3>
              <ul className="space-y-2">
                {book.features.slice(0, 4).map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quantity & Actions */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-gray-600">Số lượng</span>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={addToCart}
                  className="flex-1 flex items-center justify-center px-6 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                >
                  <ShoppingCartIcon className="h-5 w-5 mr-2" />
                  Thêm vào giỏ hàng
                </button>
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${
                    isFavorite ? 'text-red-500 border-red-300' : 'text-gray-600'
                  }`}
                >
                  {isFavorite ? (
                    <HeartIconSolid className="h-6 w-6" />
                  ) : (
                    <HeartIcon className="h-6 w-6" />
                  )}
                </button>
                <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-600">
                  <ShareIcon className="h-6 w-6" />
                </button>
              </div>

              <Link
                href="/books/activation"
                className="block w-full text-center px-6 py-3 border-2 border-green-600 text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-colors"
              >
                Đã có sách? Kích hoạt ngay
              </Link>
            </div>

            {/* Book Info */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t">
              <div>
                <span className="text-sm text-gray-600">ISBN:</span>
                <p className="font-semibold">{book.isbn}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Xuất bản:</span>
                <p className="font-semibold">{formatDate(book.publishedAt)}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Truy cập:</span>
                <p className="font-semibold">{book.activationInfo.accessDuration}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Câu hỏi:</span>
                <p className="font-semibold">{book.totalQuestions} câu</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
          {/* Tab Headers */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              {[
                { id: 'description', label: 'Mô tả' },
                { id: 'chapters', label: 'Nội dung' },
                { id: 'reviews', label: `Đánh giá (${book.reviewsCount})` },
                { id: 'author', label: 'Tác giả' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'description' && (
              <div className="prose prose-lg max-w-none">
                <div dangerouslySetInnerHTML={{ 
                  __html: book.description
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n/g, '<br/>')
                }} />
                
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Tính năng nổi bật
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {book.features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <CheckCircleIcon className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {book.tags.map((tag, index) => (
                      <Link
                        key={index}
                        href={`/books/tag/${tag}`}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'chapters' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Nội dung sách ({book.chapters.length} chương)
                </h3>
                <div className="space-y-4">
                  {book.chapters.map((chapter, index) => (
                    <div key={chapter.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            {chapter.title}
                          </h4>
                          <p className="text-gray-600 mb-3">
                            {chapter.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{chapter.questionCount} câu hỏi</span>
                            <span>•</span>
                            <span>Video HD</span>
                            <span>•</span>
                            <span>Lời giải chi tiết</span>
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <span className="text-2xl font-bold text-blue-600">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Đánh giá từ khách hàng
                  </h3>
                  <div className="flex items-center space-x-2">
                    {renderStars(book.rating)}
                    <span className="text-lg font-semibold">{book.rating}</span>
                    <span className="text-gray-600">({book.reviewsCount} đánh giá)</span>
                  </div>
                </div>

                <div className="space-y-6">
                  {book.reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <div className="flex items-start space-x-4">
                        <Image
                          src={review.user.avatar}
                          alt={review.user.name}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full object-cover"
                          quality={100}
                          unoptimized={true}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-gray-900">
                                {review.user.name}
                              </h4>
                              {review.isVerified && (
                                <CheckCircleIcon className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                            <span className="text-sm text-gray-500">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 mb-3">
                            {renderStars(review.rating)}
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <button className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                    Xem thêm đánh giá
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'author' && (
              <div className="space-y-6">
                <div className="flex items-start space-x-6">
                  <Image
                    src={book.author.avatar}
                    alt={book.author.name}
                    width={120}
                    height={120}
                    className="w-30 h-30 rounded-2xl object-cover"
                    quality={100}
                    unoptimized={true}
                  />
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {book.author.name}
                    </h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      {book.author.bio}
                    </p>
                    <div className="mt-4">
                      <Link
                        href={`/authors/${book.author.id}`}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Xem thêm tác phẩm
                        <ArrowRightIcon className="ml-2 h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Books */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Sách liên quan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {book.relatedBooks.map((relatedBook) => (
              <Link
                key={relatedBook.id}
                href={`/books/${relatedBook.slug}`}
                className="group"
              >
                <div className="bg-gray-50 rounded-2xl p-6 hover:shadow-md transition-shadow">
                  <div className="aspect-[3/4] bg-white rounded-lg overflow-hidden mb-4">
                    <Image
                      src={relatedBook.coverImage}
                      alt={relatedBook.title}
                      width={200}
                      height={267}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      quality={100}
                      unoptimized={true}
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {relatedBook.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{relatedBook.author}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      {renderStars(relatedBook.rating)}
                      <span className="text-sm text-gray-600 ml-1">
                        ({relatedBook.rating})
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        {formatPrice(relatedBook.price)}
                      </div>
                      {relatedBook.originalPrice && (
                        <div className="text-sm text-gray-500 line-through">
                          {formatPrice(relatedBook.originalPrice)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


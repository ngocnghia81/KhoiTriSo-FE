'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import {
  ShoppingCartIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  TagIcon,
  GiftIcon,
  CreditCardIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface CartItem {
  id: string;
  type: 'course' | 'book';
  title: string;
  instructor?: string;
  author?: string;
  image: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  slug: string;
}

interface PromoCode {
  code: string;
  discount: number; // percentage
  type: 'percentage' | 'fixed';
}

// Mock data - sẽ được thay thế bằng state management (Redux, Zustand, etc.)
const mockCartItems: CartItem[] = [
  {
    id: '1',
    type: 'course',
    title: 'Complete React Development Course',
    instructor: 'Nguyễn Văn A',
    image: '/images/course/course-1/1.png',
    price: 599000,
    originalPrice: 899000,
    quantity: 1,
    slug: 'complete-react-development'
  },
  {
    id: '2',
    type: 'book',
    title: 'Sách Toán học lớp 12 - Nâng cao',
    author: 'PGS. Trần Văn B',
    image: '/images/product/cart-1.png',
    price: 299000,
    quantity: 1,
    slug: 'toan-hoc-lop-12-nang-cao'
  },
  {
    id: '3',
    type: 'course',
    title: 'Advanced JavaScript Concepts',
    instructor: 'Lê Thị C',
    image: '/images/course/course-1/2.png',
    price: 799000,
    originalPrice: 1299000,
    quantity: 1,
    slug: 'advanced-javascript-concepts'
  }
];

const validPromoCodes: PromoCode[] = [
  { code: 'WELCOME10', discount: 10, type: 'percentage' },
  { code: 'STUDENT20', discount: 20, type: 'percentage' },
  { code: 'SAVE50K', discount: 50000, type: 'fixed' }
];

const suggestedItems = [
  {
    id: '4',
    title: 'Python for Beginners',
    instructor: 'Phạm Văn D',
    image: '/images/course/course-1/3.png',
    price: 499000,
    originalPrice: 699000,
    rating: 4.8,
    students: 1250,
    type: 'course' as const
  },
  {
    id: '5',
    title: 'Sách Vật lý lớp 12',
    author: 'TS. Nguyễn Thị E',
    image: '/images/product/cart-2.png',
    price: 259000,
    rating: 4.9,
    reviews: 89,
    type: 'book' as const
  }
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(mockCartItems);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(id);
      return;
    }
    
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const applyPromoCode = () => {
    const validPromo = validPromoCodes.find(
      promo => promo.code.toLowerCase() === promoCode.toLowerCase()
    );

    if (validPromo) {
      setAppliedPromo(validPromo);
      setPromoError('');
    } else {
      setPromoError('Mã giảm giá không hợp lệ');
      setAppliedPromo(null);
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setPromoCode('');
    setPromoError('');
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateDiscount = () => {
    if (!appliedPromo) return 0;
    
    const subtotal = calculateSubtotal();
    if (appliedPromo.type === 'percentage') {
      return subtotal * (appliedPromo.discount / 100);
    }
    return appliedPromo.discount;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const addToCart = (item: { id: string; title: string; price: number; type: 'course' | 'book'; thumbnail?: string; author?: string; instructor?: string; image?: string; originalPrice?: number }) => {
    const newItem: CartItem = {
      id: item.id,
      type: item.author ? 'book' : 'course',
      title: item.title,
      instructor: item.instructor,
      author: item.author,
      image: item.image || '',
      price: item.price,
      originalPrice: item.originalPrice || item.price,
      quantity: 1,
      slug: item.title.toLowerCase().replace(/\s+/g, '-')
    };

    setCartItems(prev => [...prev, newItem]);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li><Link href="/" className="hover:text-blue-600">Trang chủ</Link></li>
              <li>/</li>
              <li className="text-gray-900">Giỏ hàng</li>
            </ol>
          </nav>

          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCartIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Giỏ hàng trống
            </h1>
            <p className="text-gray-600 mb-8">
              Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá các khóa học và sách của chúng tôi.
            </p>
            <div className="space-x-4">
              <Link
                href="/courses"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Xem khóa học
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/books"
                className="inline-flex items-center px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
              >
                Xem sách điện tử
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><Link href="/" className="hover:text-blue-600">Trang chủ</Link></li>
            <li>/</li>
            <li className="text-gray-900">Giỏ hàng</li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Giỏ hàng của bạn
          </h1>
          <p className="text-gray-600">
            Bạn có {cartItems.length} sản phẩm trong giỏ hàng
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={120}
                      height={80}
                      className="w-30 h-20 object-cover rounded-lg"
                      quality={100}
                      unoptimized={true}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          <Link 
                            href={`/${item.type === 'course' ? 'courses' : 'books'}/${item.slug}`}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {item.title}
                          </Link>
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {item.type === 'course' ? `Giảng viên: ${item.instructor}` : `Tác giả: ${item.author}`}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-blue-600">
                            {formatPrice(item.price)}
                          </span>
                          {item.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(item.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Số lượng:</span>
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 hover:bg-gray-100 transition-colors"
                          >
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          <span className="px-4 py-2 font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-gray-100 transition-colors"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="text-lg font-bold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue Shopping */}
            <div className="flex justify-between items-center">
              <Link
                href="/courses"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Tóm tắt đơn hàng
              </h2>

              {/* Promo Code */}
              <div className="mb-6">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Nhập mã giảm giá"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={applyPromoCode}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Áp dụng
                  </button>
                </div>
                {promoError && (
                  <p className="text-red-500 text-sm mt-2">{promoError}</p>
                )}
                {appliedPromo && (
                  <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg mt-2">
                    <div className="flex items-center space-x-2">
                      <TagIcon className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-700">
                        {appliedPromo.code}
                      </span>
                    </div>
                    <button
                      onClick={removePromoCode}
                      className="text-green-600 hover:text-green-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span className="font-semibold">
                    {formatPrice(calculateSubtotal())}
                  </span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá ({appliedPromo.code}):</span>
                    <span className="font-semibold">
                      -{formatPrice(calculateDiscount())}
                    </span>
                  </div>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng:</span>
                    <span className="text-blue-600">
                      {formatPrice(calculateTotal())}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                className="w-full flex items-center justify-center px-6 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors mb-4"
              >
                Tiến hành thanh toán
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>

              {/* Security Badge */}
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <ShieldCheckIcon className="h-4 w-4" />
                <span>Thanh toán an toàn & bảo mật</span>
              </div>

              {/* Payment Methods */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600 mb-3 text-center">
                  Phương thức thanh toán
                </p>
                <div className="flex justify-center space-x-4">
                  <div className="w-8 h-6 bg-blue-600 rounded flex items-center justify-center">
                    <CreditCardIcon className="h-4 w-4 text-white" />
                  </div>
                  <div className="w-8 h-6 bg-red-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">M</span>
                  </div>
                  <div className="w-8 h-6 bg-yellow-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">V</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Suggested Items */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Có thể bạn quan tâm
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {suggestedItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex space-x-4">
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={100}
                    height={80}
                    className="w-25 h-20 object-cover rounded-lg flex-shrink-0"
                    quality={100}
                    unoptimized={true}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {item.instructor ? `Giảng viên: ${item.instructor}` : `Tác giả: ${item.author}`}
                    </p>
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-lg font-bold text-blue-600">
                        {formatPrice(item.price)}
                      </span>
                      {item.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(item.originalPrice)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => addToCart(item)}
                      className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Thêm vào giỏ hàng
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

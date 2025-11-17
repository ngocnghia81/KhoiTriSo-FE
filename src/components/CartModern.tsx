'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ShoppingCart,
  Trash2,
  X,
  BookOpen,
  GraduationCap,
  Map,
  Star,
  Users,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { toast } from 'sonner';

const stripHtml = (html: string | undefined | null) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
};

const formatPrice = (price: number | undefined | null) => {
  if (price === null || price === undefined || isNaN(price)) return 'Miễn phí';
  if (price === 0) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

const getItemTypeLabel = (itemType: number) => {
  switch (itemType) {
    case 0:
      return 'Sách';
    case 1:
      return 'Khóa học';
    case 2:
      return 'Lộ trình';
    default:
      return 'Sản phẩm';
  }
};

const getItemTypeIcon = (itemType: number) => {
  switch (itemType) {
    case 0:
      return <BookOpen className="h-5 w-5" />;
    case 1:
      return <GraduationCap className="h-5 w-5" />;
    case 2:
      return <Map className="h-5 w-5" />;
    default:
      return <ShoppingCart className="h-5 w-5" />;
  }
};

const getItemLink = (itemType: number, itemId: number) => {
  switch (itemType) {
    case 0:
      return `/books/${itemId}`;
    case 1:
      return `/courses/${itemId}`;
    case 2:
      return `/learning-paths/${itemId}`;
    default:
      return '#';
  }
};

export default function CartModern() {
  const router = useRouter();
  const { cart, loading, error, removeFromCart, refreshCart } = useCart();
  const [removingItemId, setRemovingItemId] = useState<number | null>(null);

  const handleRemoveItem = async (itemId: number) => {
    try {
      setRemovingItemId(itemId);
      await removeFromCart(itemId);
      toast.success('Đã xóa khỏi giỏ hàng');
    } catch (err) {
      toast.error('Không thể xóa sản phẩm');
      console.error('Error removing item:', err);
    } finally {
      setRemovingItemId(null);
    }
  };

  const handleCheckout = () => {
    if (!cart || cart.CartItems.length === 0) {
      toast.error('Giỏ hàng trống');
      return;
    }
    router.push('/checkout');
  };

  const totalAmount = cart?.TotalAmount || 0;
  const totalItems = cart?.TotalItems || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải giỏ hàng...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-900">Lỗi khi tải giỏ hàng</h3>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!cart || cart.CartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="max-w-2xl mx-auto text-center py-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="h-12 w-12 text-gray-400" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Giỏ hàng của bạn trống</h1>
              <p className="text-gray-600 mb-8">
                Hãy khám phá các khóa học, sách và lộ trình học tập tuyệt vời
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Link href="/courses">
                    Khám phá khóa học <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/books">Xem sách điện tử</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Giỏ hàng</h1>
          <p className="text-gray-600">
            {totalItems} {totalItems === 1 ? 'sản phẩm' : 'sản phẩm'} trong giỏ hàng
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.CartItems.map((item) => {
              const itemData = item.Item;
              const itemLink = getItemLink(item.ItemType, item.ItemId);
              const thumbnail = itemData.Thumbnail || itemData.thumbnail;
              const isRemoving = removingItemId === item.Id;

              return (
                <motion.div
                  key={item.Id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isRemoving ? 0.5 : 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="border border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {/* Thumbnail */}
                        <Link href={itemLink} className="flex-shrink-0">
                          <div className="relative w-32 h-20 bg-gray-200 rounded-lg overflow-hidden">
                            {thumbnail && thumbnail.startsWith('http') ? (
                              <Image
                                src={thumbnail}
                                alt={stripHtml(itemData.Title || itemData.title)}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                {getItemTypeIcon(item.ItemType)}
                              </div>
                            )}
                          </div>
                        </Link>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-xs">
                                  {getItemTypeLabel(item.ItemType)}
                                </Badge>
                              </div>
                              <Link href={itemLink}>
                                <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                                  {stripHtml(itemData.Title || itemData.title)}
                                </h3>
                              </Link>

                              {/* Course/Book Info */}
                              {item.ItemType === 1 && itemData.Instructor && (
                                <p className="text-sm text-gray-600 mb-2">
                                  Giảng viên: {(itemData.Instructor as any).Name || (itemData.Instructor as any).name}
                                </p>
                              )}
                              {item.ItemType === 0 && itemData.Author && (
                                <p className="text-sm text-gray-600 mb-2">
                                  Tác giả: {(itemData.Author as any).FullName || (itemData.Author as any).fullName}
                                </p>
                              )}

                              {/* Stats */}
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                {item.ItemType === 1 && itemData.Rating && (
                                  <div className="flex items-center gap-1">
                                    <StarIconSolid className="h-4 w-4 text-yellow-400" />
                                    <span className="font-medium">{(itemData.Rating as number).toFixed(1)}</span>
                                    {itemData.TotalReviews && (
                                      <span>({(itemData.TotalReviews as number).toLocaleString()})</span>
                                    )}
                                  </div>
                                )}
                                {item.ItemType === 1 && itemData.TotalStudents && (
                                  <div className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    <span>{(itemData.TotalStudents as number).toLocaleString()} học viên</span>
                                  </div>
                                )}
                                {item.ItemType === 1 && itemData.TotalLessons && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{(itemData.TotalLessons as number)} bài học</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Price and Actions */}
                            <div className="flex flex-col items-end gap-3">
                              <div className="text-right">
                                <div className="text-xl font-bold text-gray-900">
                                  {formatPrice(itemData.Price || itemData.price)}
                                </div>
                                {itemData.IsFree || (itemData.Price || itemData.price) === 0 ? (
                                  <Badge className="bg-green-600 text-white mt-1">Miễn phí</Badge>
                                ) : null}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveItem(item.Id)}
                                disabled={isRemoving}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Xóa
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Order Summary - Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="border border-gray-200">
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="text-xl">Tóm tắt đơn hàng</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Subtotal */}
                    <div className="flex justify-between text-gray-700">
                      <span>Tạm tính:</span>
                      <span className="font-medium">{formatPrice(totalAmount)}</span>
                    </div>

                    {/* Discount (if any) */}
                    {/* <div className="flex justify-between text-green-600">
                      <span>Giảm giá:</span>
                      <span className="font-medium">-{formatPrice(0)}</span>
                    </div> */}

                    <Separator />

                    {/* Total */}
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Tổng cộng:</span>
                      <span className="text-blue-600">{formatPrice(totalAmount)}</span>
                    </div>

                    {/* Checkout Button */}
                    <Button
                      onClick={handleCheckout}
                      size="lg"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-base"
                    >
                      Thanh toán
                    </Button>

                    {/* Trust Badges */}
                    <div className="pt-4 space-y-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <span>Đảm bảo hoàn tiền trong 30 ngày</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <span>Truy cập trọn đời</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <span>Hỗ trợ 24/7</span>
                      </div>
                    </div>

                    {/* Continue Shopping */}
                    <div className="pt-4 border-t">
                      <Button
                        asChild
                        variant="outline"
                        className="w-full"
                        onClick={() => router.push('/courses')}
                      >
                        <Link href="/courses">Tiếp tục mua sắm</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

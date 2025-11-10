'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Trash2, 
  X,
  ShoppingBag,
  BookOpen,
  CreditCard,
  Sparkles,
  ArrowRight,
  Heart,
  Star,
  Package,
  Tag,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { CartItem } from '../types/cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import Image from 'next/image';

export default function Cart() {
  const { cart, loading, error, removeFromCart, clearCart } = useCart();

  const handleRemoveItem = async (itemId: number) => {
    try {
      await removeFromCart(itemId);
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể xóa sản phẩm';
      // Check if it's actually a success message (contains SUCCESS in MessageCode)
      if (errorMessage.includes('thành công') || errorMessage.includes('SUCCESS')) {
        toast.success(errorMessage);
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      toast.success('Đã xóa toàn bộ giỏ hàng');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể xóa giỏ hàng';
      // Check if it's actually a success message (contains SUCCESS in MessageCode)
      if (errorMessage.includes('thành công') || errorMessage.includes('SUCCESS')) {
        toast.success(errorMessage);
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading && !cart) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-slate-600 font-medium">Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-200 bg-red-50/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <Alert className="border-red-200 bg-red-50/50">
              <AlertDescription className="text-red-600">
                {error}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!cart || cart.CartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Modern Empty Cart */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            {/* Floating Animation Container */}
            <div className="relative mb-12">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white/20">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <ShoppingCart className="h-12 w-12 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-4">
                  Giỏ hàng trống
                </h1>
                <p className="text-slate-600 text-lg mb-8">
                  Hãy khám phá và thêm những cuốn sách hay vào giỏ hàng của bạn
                </p>
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  onClick={() => window.location.href = '/books'}
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  Khám phá sách
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Modern Header */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 border-0 shadow-2xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                    <ShoppingCart className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      Giỏ hàng của bạn
                    </h1>
                    <p className="text-blue-100 text-lg">
                      {cart.TotalItems} sản phẩm
                    </p>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      size="lg"
                      className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    >
                      <X className="mr-2 h-5 w-5" />
                      Xóa tất cả
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-xl font-bold text-slate-800">
                        Xác nhận xóa giỏ hàng
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-slate-600">
                        Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng? Hành động này không thể hoàn tác.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl">
                        Hủy
                      </AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleClearCart}
                        className="bg-red-500 hover:bg-red-600 text-white rounded-xl"
                      >
                        Xóa tất cả
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modern Cart Items */}
        <div className="space-y-6 mb-8">
          {cart.CartItems.map((item) => (
            <Card 
              key={item.Id} 
              className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 rounded-3xl overflow-hidden group"
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-6">
                  {/* Modern Image */}
                  <div className="relative">
                    <div className="w-32 h-40 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300">
                      {item.Item?.Thumbnail ? (
                        <Image
                          src={item.Item.Thumbnail}
                          alt={item.Item.Title}
                          width={128}
                          height={160}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="h-12 w-12 text-slate-400" />
                        </div>
                      )}
                    </div>
                    {/* Floating Badge */}
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      Sách
                    </div>
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                          {item.Item?.Title}
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">
                          {item.Item?.Description}
                        </p>
                        
                        {/* Modern Tags */}
                        <div className="flex items-center space-x-3 mb-4">
                          <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-1 rounded-full shadow-lg">
                            {formatPrice(item.Item?.Price || 0)}
                          </Badge>
                          <Badge variant="secondary" className="bg-slate-100 text-slate-700 px-4 py-1 rounded-full">
                            Loại: Sách
                          </Badge>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white/50 hover:bg-white border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl transition-all duration-300 hover:shadow-lg"
                          >
                            <Heart className="mr-2 h-4 w-4" />
                            Yêu thích
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white/50 hover:bg-white border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl transition-all duration-300 hover:shadow-lg"
                          >
                            <Star className="mr-2 h-4 w-4" />
                            Đánh giá
                          </Button>
                        </div>
                      </div>

                      {/* Price & Remove */}
                      <div className="text-right ml-6">
                        <div className="text-2xl font-bold text-green-600 mb-4">
                          {formatPrice(item.Item?.Price || 0)}
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-lg font-bold text-slate-800">
                                Xác nhận xóa sản phẩm
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-slate-600">
                                Bạn có chắc chắn muốn xóa "{item.Item?.Title}" khỏi giỏ hàng?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl">
                                Hủy
                              </AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleRemoveItem(item.Id)}
                                className="bg-red-500 hover:bg-red-600 text-white rounded-xl"
                              >
                                Xóa
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modern Checkout Section */}
        <Card className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 border-0 shadow-2xl overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Tổng cộng
                  </h2>
                  <p className="text-green-100 text-lg">
                    {cart.TotalItems} sản phẩm
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-white mb-4">
                  {formatPrice(cart.TotalAmount)}
                </div>
                <Button 
                  size="lg"
                  className="bg-white hover:bg-white/90 text-green-600 px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 font-bold text-lg"
                >
                  <CreditCard className="mr-3 h-6 w-6" />
                  Thanh toán ngay
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
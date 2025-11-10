'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Trash2, 
  X,
  BookOpen,
  CreditCard,
  Sparkles,
  ArrowRight,
  Package,
  Tag,
  Shield,
  Zap,
  ChevronRight,
  Gift
} from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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

export default function CartModern() {
  const router = useRouter();
  const { cart, loading, error, removeFromCart, clearCart } = useCart();

  const handleItemClick = (itemId: number) => {
    router.push(`/books/${itemId}`);
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await removeFromCart(itemId);
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể xóa sản phẩm';
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <motion.div 
          className="flex flex-col items-center space-y-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600"></div>
            <ShoppingCart className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-blue-600" />
          </div>
          <p className="text-slate-700 font-semibold text-lg">Đang tải giỏ hàng...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="w-full max-w-md border-red-200 bg-red-50/80 backdrop-blur-sm shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-red-800 mb-2">Có lỗi xảy ra</h3>
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!cart || cart.CartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <div className="container mx-auto px-4 py-16">
          <motion.div 
            className="max-w-2xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="relative mb-12">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
              <Card className="relative bg-white/90 backdrop-blur-xl rounded-3xl border-0 shadow-2xl overflow-hidden">
                <CardContent className="p-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.6 }}
                    className="w-32 h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl"
                  >
                    <ShoppingCart className="h-16 w-16 text-white" />
                  </motion.div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                    Giỏ hàng trống
                  </h1>
                  <p className="text-slate-600 text-xl mb-8 leading-relaxed">
                    Khám phá hàng ngàn cuốn sách hay và thêm vào giỏ hàng của bạn
                  </p>
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white px-10 py-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 text-lg font-bold"
                    onClick={() => window.location.href = '/books'}
                  >
                    <BookOpen className="mr-3 h-6 w-6" />
                    Khám phá sách ngay
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative container mx-auto px-4 py-8 max-w-7xl">
        {/* Header with Breadcrumb */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center space-x-2 text-sm text-slate-600 mb-4">
            <span>Trang chủ</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-blue-600 font-semibold">Giỏ hàng</span>
          </div>
          
          <Card className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 border-0 shadow-2xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-6">
                  <motion.div 
                    className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-xl"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <ShoppingCart className="h-10 w-10 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-2">
                      Giỏ hàng của bạn
                    </h1>
                    <div className="flex items-center space-x-4 text-white/90">
                      <span className="flex items-center">
                        <Package className="h-5 w-5 mr-2" />
                        {cart.TotalItems} sản phẩm
                      </span>
                      <Separator orientation="vertical" className="h-6 bg-white/30" />
                      <span className="flex items-center">
                        <Tag className="h-5 w-5 mr-2" />
                        {formatPrice(cart.TotalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      size="lg"
                      className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 px-8 py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
                    >
                      <Trash2 className="mr-2 h-5 w-5" />
                      Xóa tất cả
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white/95 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-2xl font-bold text-slate-800">
                        Xác nhận xóa giỏ hàng
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-slate-600 text-base">
                        Bạn có chắc chắn muốn xóa tất cả {cart.TotalItems} sản phẩm khỏi giỏ hàng? Hành động này không thể hoàn tác.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl px-6 py-3">
                        Hủy bỏ
                      </AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleClearCart}
                        className="bg-red-500 hover:bg-red-600 text-white rounded-xl px-6 py-3"
                      >
                        Xóa tất cả
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence>
              {cart.CartItems.map((item, index) => (
                <motion.div
                  key={item.Id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden group cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-6">
                        {/* Image */}
                        <motion.div 
                          className="relative flex-shrink-0"
                          whileHover={{ scale: 1.05 }}
                          onClick={() => handleItemClick(item.Item?.Id || 0)}
                        >
                          <div className="w-32 h-40 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl overflow-hidden shadow-lg">
                            {item.Item?.Thumbnail ? (
                              <Image
                                src={item.Item.Thumbnail}
                                alt={item.Item.Title}
                                width={128}
                                height={160}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="h-12 w-12 text-slate-400" />
                              </div>
                            )}
                          </div>
                          <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                            Sách
                          </Badge>
                        </motion.div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-3">
                            <div 
                              className="flex-1 pr-4 cursor-pointer"
                              onClick={() => handleItemClick(item.Item?.Id || 0)}
                            >
                              <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                                {item.Item?.Title}
                              </h3>
                              <p className="text-slate-600 text-sm leading-relaxed line-clamp-2 mb-3">
                                {item.Item?.Description}
                              </p>
                            </div>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-white/95 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-xl font-bold text-slate-800">
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

                          <div className="flex items-center justify-between">
                            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                              {formatPrice(item.Item?.Price || 0)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Checkout Summary - 1/3 width - Sticky */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="sticky top-8 space-y-6">
              {/* Order Summary */}
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-3xl overflow-hidden">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                    <Sparkles className="h-6 w-6 mr-2 text-yellow-500" />
                    Tóm tắt đơn hàng
                  </h2>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Tạm tính ({cart.TotalItems} sản phẩm)</span>
                      <span className="font-semibold">{formatPrice(cart.TotalAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Phí vận chuyển</span>
                      <span className="font-semibold text-green-600">Miễn phí</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-lg font-bold">
                      <span>Tổng cộng</span>
                      <span className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {formatPrice(cart.TotalAmount)}
                      </span>
                    </div>
                  </div>

                  <Button 
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white py-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 font-bold text-lg"
                  >
                    <CreditCard className="mr-3 h-6 w-6" />
                    Thanh toán ngay
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>

              {/* Benefits */}
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-lg rounded-3xl overflow-hidden">
                <CardContent className="p-6">
                  <h3 className="font-bold text-slate-800 mb-4">Ưu đãi khi mua hàng</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Shield className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-700">Bảo mật thanh toán</p>
                        <p className="text-xs text-slate-600">100% an toàn</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Zap className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-700">Giao hàng nhanh</p>
                        <p className="text-xs text-slate-600">2-3 ngày làm việc</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Gift className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-700">Quà tặng hấp dẫn</p>
                        <p className="text-xs text-slate-600">Cho đơn hàng lớn</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

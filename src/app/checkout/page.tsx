'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ShoppingCart,
  BookOpen,
  GraduationCap,
  Map,
  Tag,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';

const formatPrice = (price: number | undefined | null) => {
  if (price === null || price === undefined || isNaN(price)) return 'Miễn phí';
  if (price === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

const stripHtml = (html: string | undefined | null) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
};

const getItemTypeLabel = (itemType: number) => {
  switch (itemType) {
    case 0: return 'Sách';
    case 1: return 'Khóa học';
    case 2: return 'Lộ trình';
    default: return 'Sản phẩm';
  }
};

const getItemTypeIcon = (itemType: number) => {
  switch (itemType) {
    case 0: return <BookOpen className="h-5 w-5" />;
    case 1: return <GraduationCap className="h-5 w-5" />;
    case 2: return <Map className="h-5 w-5" />;
    default: return <ShoppingCart className="h-5 w-5" />;
  }
};

const getItemLink = (itemType: number, itemId: number) => {
  switch (itemType) {
    case 0: return `/books/${itemId}`;
    case 1: return `/courses/${itemId}`;
    case 2: return `/learning-paths/${itemId}`;
    default: return '#';
  }
};

interface CouponValidationResult {
  isValid: boolean;
  discountAmount?: number;
  discountType?: number;
  discountValue?: number;
  maxDiscountAmount?: number;
  message?: string;
  coupon?: {
    code: string;
    name: string;
    description?: string;
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { cart, loading: cartLoading, error: cartError, refreshCart, clearCart } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [hasCheckedCart, setHasCheckedCart] = useState(false);

  // Refresh cart when component mounts (only once)
  useEffect(() => {
    if (isAuthenticated && !hasCheckedCart) {
      console.log('Checkout - Refreshing cart on mount...');
      refreshCart().then(() => {
        console.log('Checkout - Cart refresh completed');
      }).catch((err) => {
        console.error('Checkout - Error refreshing cart:', err);
      });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    console.log('Checkout - useEffect triggered:', {
      isAuthenticated,
      cartLoading,
      hasCheckedCart,
      cart: cart ? {
        hasCart: true,
        cartItemsLength: cart.CartItems?.length,
        totalItems: cart.TotalItems,
        totalAmount: cart.TotalAmount,
        cartItems: cart.CartItems,
        cartItemsType: typeof cart.CartItems,
        isArray: Array.isArray(cart.CartItems)
      } : null,
      cartError
    });

    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/checkout');
      return;
    }

    // Only check cart after loading is complete
    // Don't redirect while cart is still loading
    if (cartLoading) {
      console.log('Checkout - Cart is still loading, waiting...');
      return;
    }

    // If cart is still null after loading, don't check yet (wait for cart to load)
    if (!cart) {
      console.log('Checkout - Cart is null, but loading is false. Waiting for cart to load...');
      return;
    }

    // If already checked and cart is valid, skip
    if (hasCheckedCart) {
      console.log('Checkout - Already checked cart, skipping...');
      return;
    }

    // If there's an error fetching cart, show error but don't redirect immediately
    if (cartError) {
      console.error('Checkout - Error fetching cart:', cartError);
      toast.error('Không thể tải giỏ hàng. Vui lòng thử lại.');
      setHasCheckedCart(true);
      return;
    }

    // Check if cart is empty or has no valid items
    console.log('Checkout - Checking cart:', {
      cart: cart ? 'exists' : 'null',
      cartItems: cart?.CartItems,
      cartItemsType: typeof cart?.CartItems,
      isArray: Array.isArray(cart?.CartItems),
      cartItemsLength: cart?.CartItems?.length,
      totalItems: cart?.TotalItems,
      fullCart: JSON.stringify(cart, null, 2)
    });

    if (!cart.CartItems) {
      console.log('Checkout - Cart.CartItems is undefined/null, redirecting to cart...');
      toast.error('Giỏ hàng trống');
      router.push('/cart');
      setHasCheckedCart(true);
      return;
    }

    if (!Array.isArray(cart.CartItems)) {
      console.log('Checkout - Cart.CartItems is not an array:', typeof cart.CartItems, cart.CartItems);
      toast.error('Giỏ hàng trống');
      router.push('/cart');
      setHasCheckedCart(true);
      return;
    }

    if (cart.CartItems.length === 0) {
      console.log('Checkout - Cart.CartItems is empty array, redirecting to cart...');
      toast.error('Giỏ hàng trống');
      router.push('/cart');
      setHasCheckedCart(true);
      return;
    }

    console.log('Checkout - Cart is valid, proceeding with checkout:', {
      itemsCount: cart.CartItems.length,
      totalItems: cart.TotalItems,
      totalAmount: cart.TotalAmount
    });
    setHasCheckedCart(true);
  }, [isAuthenticated, cart, cartLoading, cartError, router]);

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Vui lòng nhập mã giảm giá');
      return;
    }

    if (!cart || !cart.CartItems || cart.CartItems.length === 0) {
      toast.error('Giỏ hàng trống');
      return;
    }

    try {
      setValidatingCoupon(true);

      // Prepare items for validation
      const items = cart.CartItems.map(item => ({
        ItemId: item.ItemId,
        ItemType: item.ItemType,
        Price: item.Price || 0,
        Quantity: 1,
      }));

      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          CouponCode: couponCode.trim(),
          Items: items,
        }),
      });

      const data = await response.json();

      if (data.Result && data.Result.IsValid) {
        setAppliedCoupon({
          isValid: true,
          discountAmount: data.Result.DiscountAmount || 0,
          discountType: data.Result.DiscountType,
          discountValue: data.Result.DiscountValue,
          maxDiscountAmount: data.Result.MaxDiscountAmount,
          coupon: {
            code: data.Result.CouponCode || couponCode.trim(),
            name: data.Result.CouponName || '',
            description: data.Result.CouponDescription,
          },
        });
        toast.success('Áp dụng mã giảm giá thành công!');
      } else {
        setAppliedCoupon(null);
        toast.error(data.Message || 'Mã giảm giá không hợp lệ');
      }
    } catch (error: any) {
      console.error('Error validating coupon:', error);
      setAppliedCoupon(null);
      toast.error('Không thể kiểm tra mã giảm giá');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.info('Đã xóa mã giảm giá');
  };

  const handleCheckout = async () => {
    if (!cart || !cart.CartItems || cart.CartItems.length === 0) {
      toast.error('Giỏ hàng trống');
      return;
    }

    try {
      setProcessingPayment(true);

      // Step 1: Create order (Backend flow: POST /api/orders)
      const cartItemIds = cart.CartItems.map(item => item.Id);
      const subtotal = cart.TotalAmount || 0;
      const discountAmount = appliedCoupon?.discountAmount || 0;
      const finalTotal = Math.max(0, subtotal - discountAmount);
      
      console.log('Creating order with:', {
        CartItemIds: cartItemIds,
        CouponCode: appliedCoupon?.coupon?.code || null,
        PaymentMethod: finalTotal === 0 ? 'FREE' : 'VNPAY',
        PaymentGateway: finalTotal === 0 ? 'FREE' : 'VNPAY',
        FinalTotal: finalTotal,
      });

      const createOrderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          CartItemIds: cartItemIds,
          CouponCode: appliedCoupon?.coupon?.code || null,
          PaymentMethod: finalTotal === 0 ? 'FREE' : 'VNPAY',
          PaymentGateway: finalTotal === 0 ? 'FREE' : 'VNPAY',
          BillingAddress: null,
          OrderNotes: null,
        }),
      });

      if (!createOrderResponse.ok) {
        const errorData = await createOrderResponse.json();
        throw new Error(errorData.Message || `HTTP ${createOrderResponse.status}: Không thể tạo đơn hàng`);
      }

      const orderData = await createOrderResponse.json();

      if (!orderData.Result || !orderData.Result.Id) {
        throw new Error(orderData.Message || 'Không thể tạo đơn hàng');
      }

      const orderId = orderData.Result.Id;
      const orderCode = orderData.Result.OrderCode;

      console.log('Order created successfully:', { orderId, orderCode });

      // Backend should have removed cart items when creating the order
      // But refresh cart immediately to update UI
      try {
        await refreshCart();
      } catch (err) {
        console.warn('Error refreshing cart after order creation:', err);
        // Continue even if cart refresh fails
      }

      // Step 2: Check if order is free
      if (finalTotal === 0) {
        // Free order - Process payment directly (Backend flow: POST /api/orders/{id}/payment)
        console.log('Processing free order payment...');
        
        const paymentResponse = await fetch(`/api/orders/${orderId}/payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            PaymentMethod: 'FREE',
            PaymentGateway: 'FREE',
            TransactionId: `FREE-${orderCode}-${Date.now()}`,
            PaymentNotes: 'Đơn hàng miễn phí - Tự động hoàn thành',
          }),
        });

        if (!paymentResponse.ok) {
          const errorData = await paymentResponse.json();
          throw new Error(errorData.Message || `HTTP ${paymentResponse.status}: Không thể hoàn thành đơn hàng miễn phí`);
        }

        const paymentData = await paymentResponse.json();

        if (!paymentData.Result) {
          throw new Error(paymentData.Message || 'Không thể hoàn thành đơn hàng miễn phí');
        }

        console.log('Free order payment processed successfully');

        // Clear cart items that were in the order (backend should have deleted them, but refresh to be sure)
        try {
          // Wait a bit for backend to process
          await new Promise(resolve => setTimeout(resolve, 500));
          await refreshCart();
        } catch (err) {
          console.warn('Error refreshing cart after order:', err);
          // Continue even if cart refresh fails
        }
      
      // Redirect to success page
        toast.success('Đơn hàng đã được hoàn thành thành công!');
        router.push(`/checkout/success?orderCode=${orderCode}`);
        return;
      }

      // Step 3: Create VNPAY payment URL for paid orders (Backend flow: POST /api/vnpay/create-payment)
      console.log('Creating VNPAY payment URL for order:', orderId);
      
      const vnpayResponse = await fetch('/api/vnpay/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          OrderId: orderId,
          OrderDescription: `Thanh toan don hang ${orderCode}`,
        }),
      });

      if (!vnpayResponse.ok) {
        const errorData = await vnpayResponse.json();
        throw new Error(errorData.Message || `HTTP ${vnpayResponse.status}: Không thể tạo URL thanh toán VNPAY`);
      }

      const vnpayData = await vnpayResponse.json();

      if (!vnpayData.Result || !vnpayData.Result.PaymentUrl) {
        throw new Error(vnpayData.Message || 'Không thể tạo URL thanh toán');
      }

      console.log('VNPAY payment URL created, redirecting...');

      // Step 4: Redirect to VNPAY (Backend will handle callback at /api/vnpay/callback)
      window.location.href = vnpayData.Result.PaymentUrl;
    } catch (error: any) {
      console.error('Error during checkout:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi thanh toán');
      setProcessingPayment(false);
    }
  };

  // Show loading while checking authentication or fetching cart
  if (!isAuthenticated || cartLoading || !hasCheckedCart) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Show error if cart fetch failed
  if (cartError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Không thể tải giỏ hàng</h2>
          <p className="text-gray-600 mb-4">{cartError}</p>
          <Button onClick={() => {
            refreshCart();
            setHasCheckedCart(false);
          }}>
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  // If cart is empty (after checking), show empty state
  // Note: This should rarely be reached because useEffect redirects to /cart
  if (!cart || !cart.CartItems || cart.CartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Giỏ hàng trống</h2>
          <p className="text-gray-600 mb-4">Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán</p>
          <Button onClick={() => router.push('/cart')}>
            Quay lại giỏ hàng
          </Button>
        </div>
      </div>
    );
  }

  const subtotal = cart.TotalAmount || 0;
  const discountAmount = appliedCoupon?.discountAmount || 0;
  const total = Math.max(0, subtotal - discountAmount);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Thanh toán</h1>
          <p className="text-gray-600 mt-2">Hoàn tất đơn hàng của bạn</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Items */}
            <Card>
              <CardHeader>
                <CardTitle>Sản phẩm trong giỏ hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cart.CartItems.map((item) => {
                    // Backend returns CoverImage, Title, Price directly on CartItemDTO
                    // And also includes full Item object
                    const itemData = item.Item as any || {};
                    const itemLink = getItemLink(item.ItemType, item.ItemId);
                    const thumbnail = item.CoverImage || (itemData as any)?.Thumbnail || (itemData as any)?.thumbnail || (itemData as any)?.CoverImage || (itemData as any)?.coverImage;

                    return (
                      <div key={item.Id} className="flex gap-4 pb-4 border-b last:border-0">
                        <Link href={itemLink} className="flex-shrink-0">
                          <div className="relative w-24 h-16 bg-gray-200 rounded-lg overflow-hidden">
                            {thumbnail && thumbnail.startsWith('http') ? (
                              <Image
                                src={thumbnail}
                                alt={stripHtml((itemData as any)?.Title || (itemData as any)?.title || item.Title || '')}
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
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <Badge variant="outline" className="text-xs mb-1">
                                {getItemTypeLabel(item.ItemType)}
                              </Badge>
                              <Link href={itemLink}>
                                <h3 className="text-sm font-semibold text-gray-900 hover:text-blue-600 line-clamp-2">
                                  {stripHtml(item.Title || (itemData as any)?.Title || (itemData as any)?.title || '')}
                                </h3>
                              </Link>
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-sm font-bold text-gray-900">
                                {formatPrice(item.Price || (itemData as any)?.Price || (itemData as any)?.price || 0)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  </div>
              </CardContent>
            </Card>

            {/* Coupon Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Mã giảm giá
                </CardTitle>
              </CardHeader>
              <CardContent>
                {appliedCoupon ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <div>
                          <div className="font-semibold text-green-900">
                            {appliedCoupon.coupon?.code}
                        </div>
                          {appliedCoupon.coupon?.name && (
                            <div className="text-sm text-green-700">
                              {appliedCoupon.coupon.name}
                        </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveCoupon}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-sm text-gray-600">
                      Giảm: {formatPrice(appliedCoupon.discountAmount || 0)}
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nhập mã giảm giá"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleValidateCoupon();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleValidateCoupon}
                      disabled={validatingCoupon || !couponCode.trim()}
                      variant="outline"
                    >
                      {validatingCoupon ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Áp dụng'
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
                  </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="text-xl">Tóm tắt đơn hàng</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between text-gray-700">
                      <span>Tạm tính:</span>
                      <span className="font-medium">{formatPrice(subtotal)}</span>
                    </div>

                    {appliedCoupon && (
                      <div className="flex justify-between text-green-600">
                        <span>Giảm giá:</span>
                        <span className="font-medium">-{formatPrice(discountAmount)}</span>
                      </div>
                    )}

                    <Separator />

                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Tổng cộng:</span>
                      <span className="text-blue-600">{formatPrice(total)}</span>
                    </div>

                    <Button
                      onClick={handleCheckout}
                      disabled={processingPayment}
                      size="lg"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-base"
                    >
                      {processingPayment ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Đang xử lý...
                        </>
                      ) : total === 0 ? (
                        'Hoàn tất đơn hàng'
                      ) : (
                        'Thanh toán VNPAY'
                      )}
                    </Button>

                    <div className="pt-4 space-y-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <span>Thanh toán an toàn với VNPAY</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <span>Đảm bảo hoàn tiền trong 30 ngày</span>
                      </div>
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

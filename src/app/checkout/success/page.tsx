'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshCart } = useCart();
  const [orderCode, setOrderCode] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('orderCode');
    setOrderCode(code);
    
    // Refresh cart to ensure it's up to date after order completion
    // Backend should have removed cart items when order was created
    const refreshCartData = async () => {
      try {
        // Wait a bit to ensure backend has processed the order
        await new Promise(resolve => setTimeout(resolve, 1000));
        await refreshCart();
      } catch (err) {
        console.warn('Error refreshing cart on success page:', err);
        // Continue even if cart refresh fails
      }
    };
    
    refreshCartData();
  }, [searchParams, refreshCart]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Thanh toán thành công!
            </h1>
            <p className="text-gray-600">
              Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xử lý thành công.
            </p>
            {orderCode && (
              <p className="text-sm text-gray-500 mt-2">
                Mã đơn hàng: <span className="font-semibold">{orderCode}</span>
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full" size="lg">
              <Link href="/my-purchases">
                Xem khóa học/Sách đã mua
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/courses">Tiếp tục mua sắm</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';

export default function PaymentResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshCart } = useCart();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!searchParams) return;

    const processPaymentResult = async () => {
      try {
        // Check if this is a direct callback from VNPAY (has vnp_ prefix) or already processed by backend
        const hasVnpParams = Array.from(searchParams.keys()).some(key => key.startsWith('vnp_'));
        
        if (hasVnpParams) {
          // This is direct from VNPAY, need to call backend to process
          console.log('PaymentResult - Direct VNPAY callback, calling backend...');
          
          const queryParams = new URLSearchParams();
          searchParams.forEach((value, key) => {
            queryParams.append(key, value);
          });

          const callbackUrl = `/api/vnpay/callback?${queryParams.toString()}`;
          
          const response = await fetch(callbackUrl, {
            method: 'GET',
            redirect: 'manual',
          });

          // Backend will redirect to /payment-result with processed params
          if (response.status >= 300 && response.status < 400) {
            const location = response.headers.get('location');
            if (location) {
              const url = new URL(location, window.location.origin);
              router.push(url.pathname + url.search);
              return;
            }
          }

          // If no redirect, try to parse response
          const data = await response.text();
          try {
            const jsonData = JSON.parse(data);
            if (jsonData.RedirectUrl || jsonData.redirectUrl) {
              const redirectUrl = jsonData.RedirectUrl || jsonData.redirectUrl;
              const url = new URL(redirectUrl, window.location.origin);
              router.push(url.pathname + url.search);
              return;
            }
          } catch {
            // Not JSON
          }
        }

        // This is already processed by backend (has success param, not vnp_ params)
        const success = searchParams.get('success') === 'true';
        const code = searchParams.get('orderCode');
        const responseCode = searchParams.get('responseCode');
        const transactionStatus = searchParams.get('transactionStatus');
        const msg = searchParams.get('message');
        const err = searchParams.get('error');

        setOrderCode(code);
        setMessage(msg);
        setError(err);

        if (success && responseCode === '00' && transactionStatus === '00') {
          setStatus('success');
          // Refresh cart after successful payment
          setTimeout(() => {
            refreshCart();
          }, 1000);
        } else {
          setStatus('error');
        }
      } catch (error: any) {
        console.error('PaymentResult - Error processing payment result:', error);
        setStatus('error');
        setError('Có lỗi xảy ra khi xử lý kết quả thanh toán. Vui lòng thử lại.');
      }
    };

    processPaymentResult();
  }, [router, searchParams, refreshCart]);

  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Đang xử lý...
              </h1>
              <p className="text-gray-600">
                Đang xử lý kết quả thanh toán của bạn
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
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
              <p className="text-gray-600 mb-4">
                {message || 'Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xử lý thành công.'}
              </p>
              {orderCode && (
                <p className="text-sm text-gray-500">
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

  // Error state
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Thanh toán thất bại
            </h1>
            <p className="text-gray-600 mb-4">
              {error || 'Giao dịch không thành công. Vui lòng thử lại.'}
            </p>
            {orderCode && (
              <p className="text-sm text-gray-500">
                Mã đơn hàng: <span className="font-semibold">{orderCode}</span>
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full" size="lg">
              <Link href="/checkout">
                Thử lại thanh toán
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/cart">Quay lại giỏ hàng</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutFailurePage() {
  const router = useRouter();

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
            <p className="text-gray-600">
              Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.
            </p>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full" size="lg">
              <Link href="/checkout">
                Thử lại thanh toán
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/cart">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại giỏ hàng
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


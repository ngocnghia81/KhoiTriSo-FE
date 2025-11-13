'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { orderApi, Order } from '@/services/orderApi';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Loader2, CheckCircleIcon, XCircleIcon, ClockIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const orderStatusLabels: Record<number, { label: string; color: string }> = {
  0: { label: 'Chờ thanh toán', color: 'bg-yellow-100 text-yellow-800' },
  1: { label: 'Đã thanh toán', color: 'bg-green-100 text-green-800' },
  2: { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-800' },
  3: { label: 'Đã hoàn thành', color: 'bg-green-100 text-green-800' },
  4: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
  5: { label: 'Hoàn tiền', color: 'bg-gray-100 text-gray-800' },
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const orderId = Number(params?.id);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderApi.getOrderById(orderId);
      setOrder(data);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải chi tiết đơn hàng');
      console.error('Error loading order:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('vi-VN');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="ml-3 text-gray-600">Đang tải chi tiết đơn hàng...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-4 md:p-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <XCircleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-600">{error || 'Không tìm thấy đơn hàng'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900 mt-4">Chi tiết đơn hàng</h1>
          <p className="text-sm text-gray-600 mt-1">Mã đơn hàng: {order.orderCode}</p>
        </div>
        {order.status !== undefined && orderStatusLabels[order.status] && (
          <Badge className={orderStatusLabels[order.status].color}>
            {orderStatusLabels[order.status].label}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Sản phẩm trong đơn hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.orderItems && order.orderItems.length > 0 ? (
                  order.orderItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.itemName}</p>
                        <p className="text-sm text-gray-500">
                          {item.itemTypeName} • Số lượng: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(item.subTotal)}</p>
                        <p className="text-sm text-gray-500">{formatCurrency(item.price)}/sản phẩm</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">Không có sản phẩm</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Notes */}
          {order.orderNotes && (
            <Card>
              <CardHeader>
                <CardTitle>Ghi chú đơn hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-line">{order.orderNotes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin khách hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Tên</p>
                <p className="font-medium text-gray-900">{order.user?.fullName || order.user?.username || 'N/A'}</p>
              </div>
              {order.user?.email && (
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{order.user.email}</p>
                </div>
              )}
              {order.user?.username && (
                <div>
                  <p className="text-sm text-gray-500">Username</p>
                  <p className="font-medium text-gray-900">{order.user.username}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin thanh toán</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Phương thức thanh toán</p>
                <p className="font-medium text-gray-900">{order.paymentMethod || 'N/A'}</p>
              </div>
              {order.paymentGateway && (
                <div>
                  <p className="text-sm text-gray-500">Cổng thanh toán</p>
                  <p className="font-medium text-gray-900">{order.paymentGateway}</p>
                </div>
              )}
              {order.transactionId && (
                <div>
                  <p className="text-sm text-gray-500">Mã giao dịch</p>
                  <p className="font-medium text-gray-900">{order.transactionId}</p>
                </div>
              )}
              {order.paidAt && (
                <div>
                  <p className="text-sm text-gray-500">Thời gian thanh toán</p>
                  <p className="font-medium text-gray-900">{formatDate(order.paidAt)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Tổng kết đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng tiền</span>
                <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá</span>
                  <span>-{formatCurrency(order.discountAmount)}</span>
                </div>
              )}
              {order.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Thuế</span>
                  <span className="font-medium">{formatCurrency(order.taxAmount)}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold text-gray-900">Thành tiền</span>
                <span className="text-xl font-bold text-gray-900">{formatCurrency(order.finalAmount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <ClockIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Đơn hàng được tạo</p>
                  <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                </div>
              </div>
              {order.updatedAt && order.updatedAt !== order.createdAt && (
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Cập nhật lần cuối</p>
                    <p className="text-sm text-gray-500">{formatDate(order.updatedAt)}</p>
                  </div>
                </div>
              )}
              {order.paidAt && (
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Đã thanh toán</p>
                    <p className="text-sm text-gray-500">{formatDate(order.paidAt)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


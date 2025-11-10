'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { couponApi, UpdateCouponRequest, Coupon } from '@/services/couponApi';

export default function EditCouponPage() {
  const router = useRouter();
  const params = useParams();
  const couponId = parseInt(params.id as string);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState<UpdateCouponRequest>({
    name: '',
    description: '',
    discountType: undefined,
    discountValue: undefined,
    maxDiscountAmount: undefined,
    minOrderAmount: undefined,
    validFrom: undefined,
    validTo: undefined,
    usageLimit: undefined,
    applicableItemTypes: [],
    applicableItemIds: [],
    isActive: undefined
  });

  useEffect(() => {
    const fetchCoupon = async () => {
      try {
        setFetching(true);
        const data = await couponApi.getCouponById(couponId);
        setCoupon(data);
        setFormData({
          name: data.name,
          description: data.description || '',
          discountType: data.discountType,
          discountValue: data.discountValue,
          maxDiscountAmount: data.maxDiscountAmount,
          minOrderAmount: data.minOrderAmount,
          validFrom: data.validFrom.split('T')[0],
          validTo: data.validTo.split('T')[0],
          usageLimit: data.usageLimit,
          applicableItemTypes: data.applicableItemTypes,
          applicableItemIds: data.applicableItemIds,
          isActive: data.isActive
        });
      } catch (error) {
        console.error('Error fetching coupon:', error);
        alert(error instanceof Error ? error.message : 'Lỗi khi tải thông tin mã giảm giá');
        router.push('/dashboard/coupons');
      } finally {
        setFetching(false);
      }
    };

    if (couponId) {
      fetchCoupon();
    }
  }, [couponId, router]);

  const handleChange = (field: keyof UpdateCouponRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name && !formData.discountValue) {
      alert('Vui lòng điền ít nhất một trường để cập nhật');
      return;
    }

    if (formData.discountType === 0 && formData.discountValue && formData.discountValue > 100) {
      alert('Giảm giá phần trăm không thể vượt quá 100%');
      return;
    }

    if (formData.validFrom && formData.validTo && new Date(formData.validFrom) >= new Date(formData.validTo)) {
      alert('Ngày kết thúc phải sau ngày bắt đầu');
      return;
    }

    try {
      setLoading(true);
      
      // Clean up undefined values
      const requestData: UpdateCouponRequest = {
        name: formData.name || undefined,
        description: formData.description || undefined,
        discountType: formData.discountType,
        discountValue: formData.discountValue,
        maxDiscountAmount: formData.maxDiscountAmount || undefined,
        minOrderAmount: formData.minOrderAmount || undefined,
        validFrom: formData.validFrom || undefined,
        validTo: formData.validTo || undefined,
        usageLimit: formData.usageLimit || undefined,
        applicableItemTypes: formData.applicableItemTypes?.length ? formData.applicableItemTypes : undefined,
        applicableItemIds: formData.applicableItemIds?.length ? formData.applicableItemIds : undefined,
        isActive: formData.isActive
      };

      await couponApi.updateCoupon(couponId, requestData);
      router.push('/dashboard/coupons');
    } catch (error) {
      console.error('Error updating coupon:', error);
      alert(error instanceof Error ? error.message : 'Lỗi khi cập nhật mã giảm giá');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!coupon) {
    return (
      <div className="p-4 md:p-6">
        <div className="text-center text-gray-500 py-10">
          Không tìm thấy mã giảm giá
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Chỉnh sửa mã giảm giá</h1>
          <p className="text-gray-500 mt-1">Mã: <span className="font-mono font-semibold">{coupon.code}</span></p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
            <CardDescription>Cập nhật thông tin mã giảm giá</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="code">Mã giảm giá</Label>
              <Input
                id="code"
                value={coupon.code}
                disabled
                className="bg-gray-50"
              />
              <p className="text-sm text-gray-500 mt-1">Mã giảm giá không thể thay đổi</p>
            </div>

            <div>
              <Label htmlFor="name">Tên mã giảm giá</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ví dụ: Giảm 50% cho đơn hàng đầu tiên"
              />
            </div>

            <div>
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Mô tả về mã giảm giá..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin giảm giá</CardTitle>
            <CardDescription>Cấu hình loại và giá trị giảm giá</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discountType">Loại giảm giá</Label>
                <Select
                  value={formData.discountType !== undefined ? String(formData.discountType) : undefined}
                  onValueChange={(value) => handleChange('discountType', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại giảm giá" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Phần trăm (%)</SelectItem>
                    <SelectItem value="1">Số tiền cố định (VNĐ)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="discountValue">Giá trị giảm giá</Label>
                <Input
                  id="discountValue"
                  type="number"
                  min="0"
                  step={formData.discountType === 0 ? "1" : "1000"}
                  value={formData.discountValue || ''}
                  onChange={(e) => handleChange('discountValue', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder={formData.discountType === 0 ? "Ví dụ: 50" : "Ví dụ: 50000"}
                />
                {formData.discountType === 0 && (
                  <p className="text-sm text-gray-500 mt-1">Tối đa 100%</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxDiscountAmount">Giảm tối đa (VNĐ)</Label>
                <Input
                  id="maxDiscountAmount"
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.maxDiscountAmount || ''}
                  onChange={(e) => handleChange('maxDiscountAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="Để trống nếu không giới hạn"
                />
              </div>
              <div>
                <Label htmlFor="minOrderAmount">Đơn hàng tối thiểu (VNĐ)</Label>
                <Input
                  id="minOrderAmount"
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.minOrderAmount || ''}
                  onChange={(e) => handleChange('minOrderAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="Để trống nếu không yêu cầu"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thời gian hiệu lực</CardTitle>
            <CardDescription>Thời gian mã giảm giá có hiệu lực</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="validFrom">Ngày bắt đầu</Label>
                <Input
                  id="validFrom"
                  type="date"
                  value={formData.validFrom || ''}
                  onChange={(e) => handleChange('validFrom', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="validTo">Ngày kết thúc</Label>
                <Input
                  id="validTo"
                  type="date"
                  value={formData.validTo || ''}
                  onChange={(e) => handleChange('validTo', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Giới hạn sử dụng</CardTitle>
            <CardDescription>Cấu hình giới hạn sử dụng mã giảm giá</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="usageLimit">Số lần sử dụng tối đa</Label>
              <Input
                id="usageLimit"
                type="number"
                min="1"
                value={formData.usageLimit || ''}
                onChange={(e) => handleChange('usageLimit', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Để trống nếu không giới hạn"
              />
              {coupon.usedCount > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Đã sử dụng: {coupon.usedCount} / {coupon.usageLimit ?? '∞'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trạng thái</CardTitle>
            <CardDescription>Bật/tắt mã giảm giá</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive ?? coupon.isActive}
                onChange={(e) => handleChange('isActive', e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="isActive">Kích hoạt mã giảm giá</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Hủy
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang cập nhật...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Cập nhật
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}


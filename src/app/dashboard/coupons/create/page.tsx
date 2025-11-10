'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { couponApi, CreateCouponRequest } from '@/services/couponApi';

export default function CreateCouponPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateCouponRequest>({
    code: '',
    name: '',
    description: '',
    discountType: 0,
    discountValue: 0,
    maxDiscountAmount: undefined,
    minOrderAmount: undefined,
    validFrom: new Date().toISOString().split('T')[0],
    validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usageLimit: undefined,
    applicableItemTypes: [],
    applicableItemIds: []
  });

  const handleChange = (field: keyof CreateCouponRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.code || !formData.name || !formData.discountValue) {
      alert('Vui lòng điền đầy đủ các trường bắt buộc');
      return;
    }

    if (formData.discountType === 0 && formData.discountValue > 100) {
      alert('Giảm giá phần trăm không thể vượt quá 100%');
      return;
    }

    if (new Date(formData.validFrom) >= new Date(formData.validTo)) {
      alert('Ngày kết thúc phải sau ngày bắt đầu');
      return;
    }

    try {
      setLoading(true);
      
      // Clean up undefined values
      const requestData: CreateCouponRequest = {
        ...formData,
        maxDiscountAmount: formData.maxDiscountAmount || undefined,
        minOrderAmount: formData.minOrderAmount || undefined,
        usageLimit: formData.usageLimit || undefined,
        description: formData.description || undefined,
        applicableItemTypes: formData.applicableItemTypes?.length ? formData.applicableItemTypes : undefined,
        applicableItemIds: formData.applicableItemIds?.length ? formData.applicableItemIds : undefined
      };

      await couponApi.createCoupon(requestData);
      router.push('/dashboard/coupons');
    } catch (error) {
      console.error('Error creating coupon:', error);
      alert(error instanceof Error ? error.message : 'Lỗi khi tạo mã giảm giá');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Tạo mã giảm giá mới</h1>
          <p className="text-gray-500 mt-1">Tạo mã giảm giá cho khách hàng</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
            <CardDescription>Nhập thông tin mã giảm giá</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">Mã giảm giá *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                  placeholder="Ví dụ: SALE50"
                  required
                />
              </div>
              <div>
                <Label htmlFor="name">Tên mã giảm giá *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Ví dụ: Giảm 50% cho đơn hàng đầu tiên"
                  required
                />
              </div>
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
                <Label htmlFor="discountType">Loại giảm giá *</Label>
                <Select
                  value={String(formData.discountType)}
                  onValueChange={(value) => handleChange('discountType', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Phần trăm (%)</SelectItem>
                    <SelectItem value="1">Số tiền cố định (VNĐ)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="discountValue">Giá trị giảm giá *</Label>
                <Input
                  id="discountValue"
                  type="number"
                  min="0"
                  step={formData.discountType === 0 ? "1" : "1000"}
                  value={formData.discountValue}
                  onChange={(e) => handleChange('discountValue', parseFloat(e.target.value) || 0)}
                  placeholder={formData.discountType === 0 ? "Ví dụ: 50" : "Ví dụ: 50000"}
                  required
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
                <p className="text-sm text-gray-500 mt-1">Áp dụng cho giảm giá phần trăm</p>
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
                <Label htmlFor="validFrom">Ngày bắt đầu *</Label>
                <Input
                  id="validFrom"
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => handleChange('validFrom', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="validTo">Ngày kết thúc *</Label>
                <Input
                  id="validTo"
                  type="date"
                  value={formData.validTo}
                  onChange={(e) => handleChange('validTo', e.target.value)}
                  required
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
          <CardContent>
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
                Đang tạo...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Tạo mã giảm giá
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}


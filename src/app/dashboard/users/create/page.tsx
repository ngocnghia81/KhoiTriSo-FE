'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi, CreateUserRequest } from '@/services/adminApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, UserPlus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const roleOptions = [
  { value: 0, label: 'Học viên', description: 'Student - Người dùng học tập' },
  { value: 1, label: 'Giảng viên', description: 'Teacher - Người tạo khóa học và sách' },
  { value: 2, label: 'Quản trị viên', description: 'Admin - Quản lý toàn bộ hệ thống' },
];

export default function CreateUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateUserRequest>({
    email: '',
    username: '',
    fullName: '',
    phone: '',
    role: 0,
    password: '',
    sendEmail: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.email) {
        setError('Email là bắt buộc');
        setLoading(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Email không hợp lệ');
        setLoading(false);
        return;
      }

      // Prepare request (remove empty optional fields)
      const request: CreateUserRequest = {
        email: formData.email,
        role: formData.role,
        sendEmail: formData.sendEmail,
      };

      if (formData.username?.trim()) {
        request.username = formData.username.trim();
      }
      if (formData.fullName?.trim()) {
        request.fullName = formData.fullName.trim();
      }
      if (formData.phone?.trim()) {
        request.phone = formData.phone.trim();
      }
      if (formData.password?.trim()) {
        request.password = formData.password.trim();
      }

      const result = await adminApi.createUser(request);
      
      alert(`Tạo người dùng thành công!\nEmail: ${result.email}\nUsername: ${result.username}\n${formData.sendEmail ? 'Thông tin đăng nhập đã được gửi qua email.' : 'Vui lòng lưu thông tin đăng nhập.'}`);
      router.push('/dashboard/users');
    } catch (err: any) {
      setError(err?.message || 'Không thể tạo người dùng');
      console.error('Error creating user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CreateUserRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/users">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Tạo người dùng mới</h1>
          <p className="text-sm text-gray-600 mt-1">
            Tạo tài khoản cho học viên, giảng viên hoặc quản trị viên
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Thông tin người dùng
          </CardTitle>
          <CardDescription>
            Điền thông tin để tạo tài khoản mới. Các trường có dấu * là bắt buộc.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email - Required */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* Role - Required */}
            <div className="space-y-2">
              <Label htmlFor="role">
                Vai trò <span className="text-red-500">*</span>
              </Label>
              <Select
                value={String(formData.role)}
                onValueChange={(value) => handleChange('role', Number(value))}
                disabled={loading}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={String(option.value)}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-gray-500">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Username - Optional */}
            <div className="space-y-2">
              <Label htmlFor="username">Username (tùy chọn)</Label>
              <Input
                id="username"
                type="text"
                placeholder="Tự động tạo từ email nếu để trống"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                Nếu để trống, username sẽ được tạo tự động từ email
              </p>
            </div>

            {/* Full Name - Optional */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên (tùy chọn)</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Nguyễn Văn A"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Phone - Optional */}
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại (tùy chọn)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="0123456789"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Password - Optional */}
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu (tùy chọn)</Label>
              <Input
                id="password"
                type="password"
                placeholder="Tự động tạo mật khẩu ngẫu nhiên nếu để trống"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                Nếu để trống, mật khẩu sẽ được tạo tự động (12 ký tự). Mật khẩu sẽ được gửi qua email nếu bật "Gửi email".
              </p>
            </div>

            {/* Send Email - Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sendEmail"
                checked={formData.sendEmail}
                onCheckedChange={(checked) => handleChange('sendEmail', checked)}
                disabled={loading}
              />
              <Label htmlFor="sendEmail" className="cursor-pointer">
                Gửi thông tin đăng nhập qua email
              </Label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
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
                    <UserPlus className="w-4 h-4 mr-2" />
                    Tạo người dùng
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


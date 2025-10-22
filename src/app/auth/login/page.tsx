'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
  AcademicCapIcon,
  UserIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { API_CONFIG, API_URLS } from '@/lib/api-config';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, user } = useAuth();
  const [userType, setUserType] = useState<'student' | 'staff'>('student');
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Redirect if already authenticated (admin -> dashboard, others -> home)
  useEffect(() => {
    if (isAuthenticated) {
      router.push(user?.role === 'admin' ? '/dashboard' : '/');
    }
  }, [isAuthenticated, user?.role, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Don't render login form if already authenticated
  if (isAuthenticated) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    // Use frontend API route to start OAuth; it fetches AuthUrl then 302 redirects to Google
    const localRoute = `/api/auth/${provider}`;
    window.location.href = localRoute;
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (userType === 'student') {
      // For students, only email is required
      if (!formData.email) newErrors.email = 'Vui lòng nhập email';
    } else {
      // For admin/instructor, only username is required
      if (!formData.username) newErrors.username = 'Vui lòng nhập email';
    }
    
    if (!formData.password) newErrors.password = 'Vui lòng nhập mật khẩu';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setFormLoading(true);
    setErrors({});
    
    try {
      const response = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          EmailOrPassword: userType === 'student' ? formData.email : formData.username,
          Password: formData.password
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Always fetch user profile from backend using returned token to avoid using form inputs
        const res = data.Result;
        const token = res?.Token as string;
        const refreshToken = res?.RefreshToken as string | undefined;

        const meResp = await fetch('/api/auth/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        let userData;
        if (meResp.ok) {
          const meData = await meResp.json();
          const m = meData.Result || {};
          userData = {
            id: (m.Id?.toString?.() ?? '0'),
            name: m.FullName || m.Username || 'User',
            email: m.Email || '',
            avatar: m.Avatar || '/images/default-avatar.svg',
            role: m.Role === 2 ? 'admin' as const : m.Role === 1 ? 'instructor' as const : 'student' as const
          };
        } else {
          // Fallback to minimal safe data from token response only
          userData = {
            id: '0',
            name: 'User',
            email: '',
            avatar: '/images/default-avatar.svg',
            role: 'student' as const
          };
        }

        login(userData, token, refreshToken);
        router.push(userData.role === 'admin' ? '/dashboard' : '/');
      } else {
        setErrors({ general: data.Message || data.message || 'Đăng nhập thất bại' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'Có lỗi xảy ra khi đăng nhập' });
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <AcademicCapIcon className="h-6 w-6 text-white" />
              </div>
              <h2 className="ml-3 text-2xl font-bold text-gray-900">Khởi Trí Số</h2>
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              Đăng nhập tài khoản
            </h2>
          </div>

          <div className="mt-8">
            {/* User Type Selection */}
            <div className="mb-6">
              <div className="flex rounded-lg bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() => setUserType('student')}
                  className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    userType === 'student'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <UserIcon className="h-4 w-4 mr-2" />
                  Học viên
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('staff')}
                  className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    userType === 'staff'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <ShieldCheckIcon className="h-4 w-4 mr-2" />
                  Admin/Giảng viên
                </button>
              </div>
            </div>

            {/* Login Form - Only for Admin/Instructor */}
            {userType === 'staff' && (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      required
                      value={formData.username}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        errors.username ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Nhập email"
                    />
                  </div>
                  {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Mật khẩu
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockClosedIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Nhập mật khẩu"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                </div>

                {errors.general && (
                  <div className="rounded-md bg-red-50 p-4">
                    <p className="text-sm text-red-800">{errors.general}</p>
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {formLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                  </button>
                </div>

                <div className="text-center">
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
              </form>
            )}

            {/* OAuth Login - Only for Students */}
            {userType === 'student' && (
              <div>
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-600">
                    Học viên đăng nhập bằng tài khoản Google hoặc Facebook
                  </p>
                </div>

                {errors.general && (
                  <div className="mb-4 rounded-md bg-red-50 p-4">
                    <p className="text-sm text-red-800">{errors.general}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('google')}
                    className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="ml-3">Đăng nhập với Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSocialLogin('facebook')}
                    className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="ml-3">Đăng nhập với Facebook</span>
                  </button>

                  {/* Test Login Button */}
                  <button
                    type="button"
                    onClick={() => {
                      login({
                        id: '1',
                        name: 'Nghĩa Nguyễn',
                        email: 'ngocnghia1999nn@gmail.com',
                        avatar: 'https://lh3.googleusercontent.com/a/ACg8ocI6IbIfq7oy6H2jGF0APeYS8EA5kVVRe7vAknb2RpCVUooZD60v=s96-c',
                        role: 'student'
                      }, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjEiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9lbWFpbGFkZHJlc3MiOiJuZ29jbmdoaWExOTk5bm5AZ21haWwuY29tIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZSI6Im5nb2NuZ2hpYTE5OTlubiIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IlN0dWRlbnQiLCJleHAiOjE3NjAyMDM1MzksImlzcyI6Imh0dHBzOi8vbG9jYWxob3N0OjcwMTYiLCJhdWQiOiJodHRwOi8vbG9jYWxob3N0OjMwMDEifQ.XB4JRZXjNlaZhzpMej_bqSHG-yDX7CZhmAF99cyHg6g');
                      router.push('/');
                    }}
                    className="w-full inline-flex justify-center py-3 px-4 border border-green-300 rounded-xl shadow-sm bg-green-50 text-sm font-medium text-green-700 hover:bg-green-100 transition-colors"
                  >
                    <span className="ml-3">🧪 Test Login (Real Token)</span>
                  </button>
                </div>

                {/* Backend Connection Help */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Gặp lỗi kết nối?</h4>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Đảm bảo backend server đang chạy trên port 7016</li>
                    <li>• Kiểm tra URL: <code className="bg-blue-100 px-1 rounded">https://localhost:7016/api</code></li>
                    <li>• Cho phép popup trong trình duyệt</li>
                    <li>• Kiểm tra console để xem lỗi chi tiết</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="hidden lg:block relative w-0 flex-1">
        {/* Branding content... */}
      </div>
    </div>
  );
}
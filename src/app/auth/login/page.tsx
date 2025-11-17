'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, Shield, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, user } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const popupRef = useRef<Window | null>(null);
  const messageHandlerRef = useRef<((event: MessageEvent) => void) | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push(user?.role === 'admin' ? '/dashboard' : '/');
    }
  }, [isAuthenticated, user?.role, router]);

  // Cleanup OAuth popup and listeners on unmount
  useEffect(() => {
    return () => {
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close();
      }
      if (messageHandlerRef.current) {
        window.removeEventListener('message', messageHandlerRef.current);
      }
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, []);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center animate-pulse">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <div className="text-lg font-medium text-gray-600">Đang tải...</div>
        </div>
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
    const localRoute = `/api/auth/${provider}`;
    // Open OAuth in a popup window
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    // Close any existing popup
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
    }
    
    // Remove any existing message handler
    if (messageHandlerRef.current) {
      window.removeEventListener('message', messageHandlerRef.current);
    }
    
    // Clear any existing interval
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
    }
    
    const popup = window.open(
      localRoute,
      `${provider}Login`,
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
    
    popupRef.current = popup;

    // Listen for postMessage from OAuth callback
    const handleMessage = async (event: MessageEvent) => {
      // Verify origin for security
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data.error) {
        toast.error('Đăng nhập thất bại: ' + event.data.error);
        setErrors({ general: event.data.error });
        // Cleanup
        if (popupRef.current && !popupRef.current.closed) {
          popupRef.current.close();
        }
        if (messageHandlerRef.current) {
          window.removeEventListener('message', messageHandlerRef.current);
          messageHandlerRef.current = null;
        }
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }
        return;
      }

      if (event.data.token && event.data.user) {
        const { token, refreshToken, user } = event.data;
        
        // Ensure avatar is included from OAuth provider
        const userData = {
          id: user.id?.toString() || '0',
          name: user.name || user.FullName || 'User',
          email: user.email || user.Email || '',
          avatar: user.avatar || user.Avatar || '/images/default-avatar.svg', // Use avatar from OAuth
          role: user.role === 'admin' || user.role === 2 ? 'admin' as const : 
                user.role === 'instructor' || user.role === 1 ? 'instructor' as const : 
                'student' as const
        };

        console.log('OAuth login - User data with avatar:', userData);

        // Call login from AuthContext with avatar
        login(userData, token, refreshToken);
        toast.success('Đăng nhập thành công!');
        
        // Cleanup
        if (popupRef.current && !popupRef.current.closed) {
          popupRef.current.close();
        }
        if (messageHandlerRef.current) {
          window.removeEventListener('message', messageHandlerRef.current);
          messageHandlerRef.current = null;
        }
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }

        // Redirect based on role
        router.push(userData.role === 'admin' ? '/dashboard' : '/');
      }
    };

    messageHandlerRef.current = handleMessage;
    window.addEventListener('message', handleMessage);

    // Check if popup is closed and cleanup
    checkIntervalRef.current = setInterval(() => {
      if (popupRef.current?.closed) {
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }
        if (messageHandlerRef.current) {
          window.removeEventListener('message', messageHandlerRef.current);
          messageHandlerRef.current = null;
        }
      }
    }, 1000);
  };

  const validateForm = (userType: 'student' | 'staff') => {
    const newErrors: {[key: string]: string} = {};
    
    if (userType === 'staff') {
      if (!formData.username) newErrors.username = 'Vui lòng nhập email';
    }
    
    if (!formData.password) newErrors.password = 'Vui lòng nhập mật khẩu';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent, userType: 'student' | 'staff') => {
    e.preventDefault();
    if (userType === 'staff' && !validateForm(userType)) return;

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
            avatar: m.Avatar || m.avatar || '', // Get avatar from backend (may be from OAuth)
            role: m.Role === 2 ? 'admin' as const : m.Role === 1 ? 'instructor' as const : 'student' as const
          };
        } else {
          userData = {
            id: '0',
            name: 'User',
            email: '',
            avatar: '/images/default-avatar.svg',
            role: 'student' as const
          };
        }

        login(userData, token, refreshToken);
        toast.success('Đăng nhập thành công!');
        router.push(userData.role === 'admin' ? '/dashboard' : '/');
      } else {
        const errorMessage = data.Message || data.message || 'Đăng nhập thất bại';
        setErrors({ general: errorMessage });
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = 'Có lỗi xảy ra khi đăng nhập';
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        {/* Header */}

        {/* Login Card */}
        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900">Đăng nhập</CardTitle>
            <CardDescription>
              Chọn loại tài khoản để đăng nhập
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Tabs defaultValue="student" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="student" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Học viên</span>
                </TabsTrigger>
                <TabsTrigger value="staff" className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Admin/Giảng viên</span>
                </TabsTrigger>
              </TabsList>

              {/* Student Login */}
              <TabsContent value="student" className="space-y-4">
                <div className="text-center py-4">
                  <p className="text-sm text-gray-600 mb-6">
                    Học viên đăng nhập bằng tài khoản Google hoặc Facebook
                  </p>
                </div>

                {errors.general && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.general}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialLogin('google')}
                    className="w-full h-12 text-base font-medium hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Đăng nhập với Google
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialLogin('facebook')}
                    className="w-full h-12 text-base font-medium hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
                  >
                    <svg className="w-5 h-5 mr-3 fill-[#1877F2]" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Đăng nhập với Facebook
                  </Button>

                </div>
              </TabsContent>

              {/* Staff Login */}
              <TabsContent value="staff" className="space-y-4">
                <form onSubmit={(e) => handleSubmit(e, 'staff')} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="username"
                        name="username"
                        type="email"
                        placeholder="Nhập email"
                        value={formData.username}
                        onChange={handleInputChange}
                        className={`pl-10 ${errors.username ? 'border-red-500' : ''}`}
                        required
                      />
                    </div>
                    {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Mật khẩu</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Nhập mật khẩu"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                  </div>

                  {errors.general && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.general}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    disabled={formLoading}
                    className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold transition-all duration-300"
                  >
                    {formLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                  </Button>
                </form>

                <div className="text-center">
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
              </TabsContent>
            </Tabs>

            {/* Help Section */}
            
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Chưa có tài khoản?{' '}
            <Link href="/auth/register" className="text-blue-600 hover:text-blue-500 font-medium">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
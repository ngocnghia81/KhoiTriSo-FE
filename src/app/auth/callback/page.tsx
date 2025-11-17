'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refreshToken');
        const isNewUser = searchParams.get('isNewUser') === 'True' || searchParams.get('isNewUser') === 'true';

        console.log('OAuth Callback - Received params:', { 
          hasToken: !!token, 
          hasRefreshToken: !!refreshToken, 
          isNewUser 
        });

        if (!token) {
          setError('Token không hợp lệ');
          setTimeout(() => router.push('/auth/login?error=invalid_token'), 2000);
          return;
        }

        // Fetch user data from backend using the token
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Không thể lấy thông tin người dùng');
        }

        const data = await response.json();
        
        // Map backend user data to frontend User type
        const userData = {
          id: data.Result?.Id?.toString() || '0',
          name: data.Result?.FullName || data.Result?.Username || 'User',
          email: data.Result?.Email || '',
          avatar: data.Result?.Avatar || data.Result?.avatar || '', // Get avatar from OAuth provider
          role: data.Result?.Role === 0 ? 'student' as const : 
                data.Result?.Role === 1 ? 'instructor' as const : 
                'admin' as const
        };

        console.log('OAuth Callback - User data fetched:', userData);

        // Call login from AuthContext
        login(userData, token, refreshToken || undefined);

        console.log('OAuth Callback - Login successful, redirecting...');

        // Redirect based on user type and status
        if (isNewUser) {
          // New user - could redirect to onboarding or welcome page
          setTimeout(() => router.push('/profile?welcome=true'), 500);
        } else {
          // Existing user - redirect based on role
          if (userData.role === 'admin') {
            setTimeout(() => router.push('/dashboard'), 500);
          } else if (userData.role === 'instructor') {
            setTimeout(() => router.push('/instructor'), 500);
          } else {
            setTimeout(() => router.push('/profile/my-courses'), 500);
          }
        }
      } catch (err) {
        console.error('OAuth Callback Error:', err);
        setError(err instanceof Error ? err.message : 'Đăng nhập thất bại');
        setTimeout(() => router.push('/auth/login?error=auth_failed'), 2000);
      }
    };

    handleCallback();
  }, [searchParams, login, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        {error ? (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Đăng nhập thất bại</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">Đang chuyển hướng về trang đăng nhập...</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Đang đăng nhập...</h2>
            <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Đang xử lý...</h2>
          <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    }>
      <AuthCallbackClient />
    </Suspense>
  );
}

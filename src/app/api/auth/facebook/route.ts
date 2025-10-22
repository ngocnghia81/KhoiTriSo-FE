import { NextResponse } from 'next/server';
import { API_URLS } from '@/lib/api-config';

export async function GET() {
  try {
    console.log('Attempting to connect to:', API_URLS.FACEBOOK_AUTH);
    
    // Temporarily disable SSL verification for localhost
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    
    // Get the Facebook OAuth URL from your backend
    const response = await fetch(API_URLS.FACEBOOK_AUTH, {
      method: 'GET',
      headers: {
        'accept': '*/*',
      },
      // Add timeout and better error handling
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend OAuth error:', response.status, errorText);
      throw new Error(`Backend returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.Result?.AuthUrl) {
      console.error('Invalid OAuth response:', data);
      throw new Error('Invalid OAuth response from backend');
    }
    
    console.log('OAuth URL received:', data.Result.AuthUrl);
    // Redirect to Facebook OAuth URL
    return NextResponse.redirect(data.Result.AuthUrl);
  } catch (error) {
    console.error('Facebook OAuth error:', error);
    
    // Check if it's a connection error
    if (error instanceof Error && error.message.includes('fetch failed')) {
      return NextResponse.json(
        { 
          error: 'Không thể kết nối đến server. Vui lòng kiểm tra:', 
          details: [
            '1. Backend server có đang chạy không?',
            '2. Port 7016 có đúng không?',
            '3. Có sử dụng HTTPS hay HTTP?',
            '4. Có cấu hình CORS không?'
          ],
          suggestion: 'Hãy chạy backend server trước khi thử lại'
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to initiate Facebook OAuth', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

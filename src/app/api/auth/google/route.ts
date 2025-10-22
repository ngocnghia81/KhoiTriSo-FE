import { NextResponse } from 'next/server';
import { API_URLS } from '@/lib/api-config';

export async function GET() {
  try {
    console.log('Attempting to connect to:', API_URLS.GOOGLE_AUTH);
    
    // Temporarily disable SSL verification for localhost
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    
    // Get the Google OAuth URL from your backend
    const response = await fetch(API_URLS.GOOGLE_AUTH, {
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
    // Redirect to Google OAuth URL
    return NextResponse.redirect(data.Result.AuthUrl);
  } catch (error) {
    console.error('Google OAuth error:', error);
    
    // Check if it's a connection error
    if (error instanceof Error && (error.message.includes('fetch failed') || error.message.includes('certificate'))) {
      return NextResponse.json(
        { 
          error: 'Không thể kết nối đến server. Vui lòng kiểm tra:', 
          suggestion: 'Hãy chạy backend server và accept SSL certificate'
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to initiate Google OAuth', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

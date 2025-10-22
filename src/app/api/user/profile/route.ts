import { NextRequest, NextResponse } from 'next/server';
import { API_URLS } from '@/lib/api-config';

// Disable SSL verification for local development only
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const acceptLanguage = request.headers.get('accept-language') || 'vi';

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    const response = await fetch(API_URLS.USER_PROFILE, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept-Language': acceptLanguage,
        'Content-Type': 'application/json',
      },
      // Forward cookies if backend needs them
      // credentials: 'include',
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      return NextResponse.json(
        { error: `Backend returned ${response.status}: ${text.substring(0, 200)}` },
        { status: 502 }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('User profile proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



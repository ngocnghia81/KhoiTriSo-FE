import { NextRequest, NextResponse } from 'next/server';
import { API_URLS } from '@/lib/api-config';

// Disable SSL verification for local development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      );
    }

    console.log('Logout request:', { refreshToken: refreshToken.substring(0, 20) + '...' });

    const response = await fetch(`${API_URLS.LOGOUT}?refreshToken=${encodeURIComponent(refreshToken)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Backend logout response status:', response.status);

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Backend returned non-JSON response:', text);
      // Don't throw error for logout, just log it
      console.log('Logout completed (non-JSON response)');
      return NextResponse.json({ success: true });
    }

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Backend logout error:', data);
      // Don't fail logout even if backend returns error
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Logout error:', error);
    // Don't fail logout even if there's an error
    return NextResponse.json({ success: true });
  }
}
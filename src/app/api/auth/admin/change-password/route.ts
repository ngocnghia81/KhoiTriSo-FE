import { NextRequest, NextResponse } from 'next/server';
import { API_URLS } from '@/lib/api-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');
    
    console.log('API Route - Change password request');
    console.log('Request body:', body);
    console.log('Authorization header exists:', !!authHeader);
    console.log('Authorization header:', authHeader ? authHeader.substring(0, 30) + '...' : 'No header');
    console.log('Target URL:', API_URLS.CHANGE_PASSWORD);
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }
    
    console.log('Change password request with token:', authHeader.substring(0, 20) + '...');
    
    // Temporarily disable SSL verification for localhost
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    
    const response = await fetch(API_URLS.CHANGE_PASSWORD, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'accept': '*/*',
      },
      body: JSON.stringify(body),
    });

    console.log('Backend change password response status:', response.status);

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Backend returned non-JSON response:', text);
      throw new Error(`Backend returned ${response.status}: ${text.substring(0, 200)}`);
    }

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Change password failed' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

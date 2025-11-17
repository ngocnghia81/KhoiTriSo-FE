import { NextRequest, NextResponse } from 'next/server';
import { getAuthTokenFromRequest } from '@/lib/api/getAuthToken';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function GET(request: NextRequest) {
  try {
    const acceptLanguage = request.headers.get('accept-language') || 'vi';
    const token = getAuthTokenFromRequest(request);
    
    if (!token) {
      console.log('Cart API - No token found');
      return NextResponse.json(
        { Message: 'Unauthorized', MessageCode: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    console.log('Cart API - Forwarding request with token:', token.substring(0, 20) + '...');

    const response = await fetch(`${API_URL}/api/cart`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept-Language': acceptLanguage,
        'Content-Type': 'application/json',
      },
    });

    console.log('Cart API - Backend response status:', response.status);

    // Check if response is ok before parsing JSON
    if (!response.ok) {
      // Try to parse error response, but handle non-JSON responses (including empty responses)
      let errorData;
      try {
        const text = await response.text();
        if (text && text.trim().length > 0) {
          errorData = JSON.parse(text);
        } else {
          // Backend returned empty body (common for 401)
          errorData = { 
            Message: response.status === 401 ? 'Unauthorized' : `HTTP ${response.status}`,
            MessageCode: response.status === 401 ? 'UNAUTHORIZED' : 'ERROR'
          };
        }
      } catch (parseError) {
        // If parsing fails, create a default error response
        errorData = { 
          Message: response.status === 401 ? 'Unauthorized' : `HTTP ${response.status}: ${response.statusText}`,
          MessageCode: response.status === 401 ? 'UNAUTHORIZED' : 'ERROR'
        };
      }
      console.log('Cart API - Backend error response:', errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { Message: 'Lỗi khi tải giỏ hàng', Error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const acceptLanguage = request.headers.get('accept-language') || 'vi';
    const token = getAuthTokenFromRequest(request);
    
    if (!token) {
      return NextResponse.json(
        { Message: 'Unauthorized', MessageCode: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const response = await fetch(`${API_URL}/api/cart`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept-Language': acceptLanguage,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // Check if response is ok before parsing JSON
    if (!response.ok) {
      // Try to parse error response, but handle non-JSON responses (including empty responses)
      let errorData;
      try {
        const text = await response.text();
        if (text && text.trim().length > 0) {
          errorData = JSON.parse(text);
        } else {
          // Backend returned empty body (common for 401)
          errorData = { 
            Message: response.status === 401 ? 'Unauthorized' : `HTTP ${response.status}`,
            MessageCode: response.status === 401 ? 'UNAUTHORIZED' : 'ERROR'
          };
        }
      } catch (parseError) {
        // If parsing fails, create a default error response
        errorData = { 
          Message: response.status === 401 ? 'Unauthorized' : `HTTP ${response.status}: ${response.statusText}`,
          MessageCode: response.status === 401 ? 'UNAUTHORIZED' : 'ERROR'
        };
      }
      console.log('Cart API POST - Backend error response:', errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { Message: 'Lỗi khi thêm vào giỏ hàng', Error: error.message },
      { status: 500 }
    );
  }
}


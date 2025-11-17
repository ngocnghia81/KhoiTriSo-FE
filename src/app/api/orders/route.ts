import { NextRequest, NextResponse } from 'next/server';
import { getAuthTokenFromRequest } from '@/lib/api/getAuthToken';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

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

    console.log('Orders API - Forwarding POST request to backend:', {
      url: `${API_URL}/api/orders`,
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'none',
      bodyKeys: Object.keys(body)
    });

    const response = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept-Language': acceptLanguage,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('Orders API - Backend response status:', response.status);

    // Check if response is ok before parsing JSON
    if (!response.ok) {
      // Try to parse error response, but handle non-JSON responses (including empty responses)
      let errorData;
      try {
        const text = await response.text();
        console.log('Orders API - Backend error response text:', text);
        if (text && text.trim().length > 0) {
          errorData = JSON.parse(text);
        } else {
          // Backend returned empty body
          errorData = { 
            Message: `HTTP ${response.status}: ${response.statusText}`,
            MessageCode: 'ERROR'
          };
        }
      } catch (parseError) {
        // If parsing fails, create a default error response
        errorData = { 
          Message: `HTTP ${response.status}: ${response.statusText}`,
          MessageCode: 'ERROR'
        };
      }
      console.log('Orders API - Backend error response:', errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { Message: 'Lỗi khi tạo đơn hàng', Error: error.message },
      { status: 500 }
    );
  }
}


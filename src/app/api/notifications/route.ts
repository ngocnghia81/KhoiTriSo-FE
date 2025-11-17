import { NextRequest, NextResponse } from 'next/server';
import { getAuthTokenFromRequest } from '@/lib/api/getAuthToken';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function GET(request: NextRequest) {
  try {
    const token = getAuthTokenFromRequest(request);
    
    if (!token) {
      console.log('Notifications API - No token found');
      return NextResponse.json(
        { Message: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Notifications API - Forwarding request with token:', token.substring(0, 20) + '...');

    const searchParams = request.nextUrl.searchParams;
    const isRead = searchParams.get('isRead');
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('pageSize') || '20';

    const params = new URLSearchParams();
    if (isRead !== null) params.append('isRead', isRead);
    if (type) params.append('type', type);
    if (priority) params.append('priority', priority);
    params.append('page', page);
    params.append('pageSize', pageSize);

    const response = await fetch(`${API_URL}/api/notifications?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept-Language': request.headers.get('accept-language') || 'vi',
        'Content-Type': 'application/json',
      },
    });

    console.log('Notifications API - Backend response status:', response.status);

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
      console.log('Notifications API - Backend error response:', errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { Message: 'Lỗi khi tải thông báo', Error: error.message },
      { status: 500 }
    );
  }
}


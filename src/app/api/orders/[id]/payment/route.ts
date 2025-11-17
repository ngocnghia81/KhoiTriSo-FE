import { NextRequest, NextResponse } from 'next/server';
import { getAuthTokenFromRequest } from '@/lib/api/getAuthToken';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const acceptLanguage = request.headers.get('accept-language') || 'vi';
    const token = getAuthTokenFromRequest(request);
    
    if (!token) {
      return NextResponse.json(
        { Message: 'Unauthorized', MessageCode: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const response = await fetch(`${API_URL}/api/orders/${id}/payment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept-Language': acceptLanguage,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { Message: 'Lỗi khi xử lý thanh toán', Error: error.message },
      { status: 500 }
    );
  }
}


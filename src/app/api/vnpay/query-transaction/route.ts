import { NextRequest, NextResponse } from 'next/server';
import { getAuthTokenFromRequest } from '@/lib/api/getAuthToken';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function GET(request: NextRequest) {
  try {
    const acceptLanguage = request.headers.get('accept-language') || 'vi';
    const searchParams = request.nextUrl.searchParams;
    const orderCode = searchParams.get('orderCode');
    const token = getAuthTokenFromRequest(request);
    
    if (!token) {
      return NextResponse.json(
        { Message: 'Unauthorized', MessageCode: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    if (!orderCode) {
      return NextResponse.json(
        { Message: 'orderCode is required', MessageCode: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${API_URL}/api/vnpay/query-transaction?orderCode=${encodeURIComponent(orderCode)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept-Language': acceptLanguage,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Error querying VNPAY transaction:', error);
    return NextResponse.json(
      { Message: 'Lỗi khi truy vấn giao dịch', Error: error.message },
      { status: 500 }
    );
  }
}


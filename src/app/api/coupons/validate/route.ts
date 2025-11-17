import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function POST(request: NextRequest) {
  try {
    const acceptLanguage = request.headers.get('accept-language') || 'vi';
    const body = await request.json();

    const response = await fetch(`${API_URL}/api/coupons/validate`, {
      method: 'POST',
      headers: {
        'Accept-Language': acceptLanguage,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      { Message: 'Lỗi khi kiểm tra mã giảm giá', Error: error.message },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const acceptLanguage = request.headers.get('accept-language') || 'vi';
    
    if (!authHeader) {
      return NextResponse.json(
        { Message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('pageSize') || '20';

    const paramsUrl = new URLSearchParams();
    paramsUrl.append('page', page);
    paramsUrl.append('pageSize', pageSize);

    const response = await fetch(`${API_URL}/api/books/my-books?${paramsUrl.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Accept-Language': acceptLanguage,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Error fetching my books:', error);
    return NextResponse.json(
      { Message: 'Lỗi khi tải sách của tôi', Error: error.message },
      { status: 500 }
    );
  }
}


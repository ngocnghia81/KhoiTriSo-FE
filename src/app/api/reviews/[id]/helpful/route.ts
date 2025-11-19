import { NextRequest, NextResponse } from 'next/server';
import { getAuthTokenFromRequest } from '@/lib/api/getAuthToken';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getAuthTokenFromRequest(request);

    const response = await fetch(`${API_URL}/api/Reviews/${params.id}/helpful`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Error marking review as helpful:', error);
    return NextResponse.json(
      { Message: 'Lỗi khi đánh dấu hữu ích', Error: error.message },
      { status: 500 }
    );
  }
}


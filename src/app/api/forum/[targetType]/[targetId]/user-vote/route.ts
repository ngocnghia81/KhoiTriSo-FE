import { NextRequest, NextResponse } from 'next/server';
import { getAuthTokenFromRequest } from '@/lib/api/getAuthToken';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function GET(
  request: NextRequest,
  { params }: { params: { targetType: string; targetId: string } }
) {
  try {
    const token = getAuthTokenFromRequest(request);
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { Message: 'userId is required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${API_URL}/api/forum/${params.targetType}/${params.targetId}/user-vote?userId=${userId}`,
      {
        method: 'GET',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Error fetching user vote:', error);
    return NextResponse.json(
      { Message: 'Lỗi khi tải user vote', Error: error.message },
      { status: 500 }
    );
  }
}


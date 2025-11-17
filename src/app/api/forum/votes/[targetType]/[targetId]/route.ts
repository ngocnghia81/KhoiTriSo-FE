import { NextRequest, NextResponse } from 'next/server';
import { getAuthTokenFromRequest } from '@/lib/api/getAuthToken';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function GET(
  request: NextRequest,
  { params }: { params: { targetType: string; targetId: string } }
) {
  try {
    const token = getAuthTokenFromRequest(request);

    const response = await fetch(`${API_URL}/api/forum/${params.targetType}/${params.targetId}/votes`, {
      method: 'GET',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Error fetching votes:', error);
    return NextResponse.json(
      { Message: 'Lỗi khi tải votes', Error: error.message },
      { status: 500 }
    );
  }
}


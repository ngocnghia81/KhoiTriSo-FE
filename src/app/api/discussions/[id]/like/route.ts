import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization') || '';
    const acceptLanguage = request.headers.get('accept-language') || 'vi';
    
    if (!authHeader) {
      return NextResponse.json(
        { Message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_URL}/api/discussions/${id}/like`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Accept-Language': acceptLanguage,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Error toggling discussion like:', error);
    return NextResponse.json(
      { Message: 'Lỗi khi like/unlike bình luận', Error: error.message },
      { status: 500 }
    );
  }
}


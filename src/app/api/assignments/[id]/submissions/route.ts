import { NextRequest, NextResponse } from 'next/server';
import { getAuthTokenFromRequest } from '@/lib/api/getAuthToken';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function GET(
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

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('pageSize') || '20';

    const queryParams = new URLSearchParams({ page, pageSize });

    const response = await fetch(`${API_URL}/api/assignments/${id}/submissions?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept-Language': acceptLanguage,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorData;
      try {
        const text = await response.text();
        if (text && text.trim().length > 0) {
          errorData = JSON.parse(text);
        } else {
          errorData = { 
            Message: `HTTP ${response.status}: ${response.statusText}`,
            MessageCode: 'ERROR'
          };
        }
      } catch {
        errorData = { 
          Message: `HTTP ${response.status}: ${response.statusText}`,
          MessageCode: 'ERROR'
        };
      }
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Error fetching assignment submissions:', error);
    return NextResponse.json(
      { Message: 'Lỗi khi tải danh sách bài nộp', Error: error.message },
      { status: 500 }
    );
  }
}


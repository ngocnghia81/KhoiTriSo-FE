import { NextRequest, NextResponse } from 'next/server';
import { getAuthTokenFromRequest } from '@/lib/api/getAuthToken';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const acceptLanguage = request.headers.get('accept-language') || 'vi';
    const token = getAuthTokenFromRequest(request);
    const { id } = await params;

    const url = `${API_URL}/api/lessons/${id}`;

    const resp = await fetch(url, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        'Accept-Language': acceptLanguage,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!resp.ok) {
      let errorData;
      try {
        const text = await resp.text();
        if (text && text.trim().length > 0) {
          errorData = JSON.parse(text);
        } else {
          errorData = { 
            Message: `HTTP ${resp.status}: ${resp.statusText}`,
            MessageCode: 'ERROR'
          };
        }
      } catch {
        errorData = { 
          Message: `HTTP ${resp.status}: ${resp.statusText}`,
          MessageCode: 'ERROR'
        };
      }
      return NextResponse.json(errorData, { status: resp.status });
    }

    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });
  } catch (error) {
    console.error('Lesson API route - Error:', error);
    return NextResponse.json(
      { Message: 'Lỗi khi tải bài học', Error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

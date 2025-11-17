import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization') || '';
    const acceptLanguage = request.headers.get('accept-language') || 'vi';

    const response = await fetch(`${API_URL}/api/lessons/${id}/materials`, {
      method: 'GET',
      headers: {
        ...(authHeader ? { 'Authorization': authHeader } : {}),
        'Accept-Language': acceptLanguage,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Error fetching lesson materials:', error);
    return NextResponse.json(
      { Message: 'Lỗi khi tải tài liệu', Error: error.message },
      { status: 500 }
    );
  }
}


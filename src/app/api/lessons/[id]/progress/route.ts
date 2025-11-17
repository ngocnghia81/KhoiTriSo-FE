import { NextRequest, NextResponse } from 'next/server';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const acceptLanguage = request.headers.get('accept-language') || 'vi';
    const authHeader = request.headers.get('authorization') || '';
    const { id } = await params;
    const body = await request.json();

    const url = `${API_URL}/api/lessons/${id}/progress`;

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        ...(authHeader ? { 'Authorization': authHeader } : {}),
        'Accept-Language': acceptLanguage,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    const data = await resp.json().catch(() => ({}));
    return NextResponse.json(data, { status: resp.status });
  } catch (error) {
    console.error('Lesson Progress API route - Error:', error);
    return NextResponse.json(
      { error: 'Failed to update lesson progress', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


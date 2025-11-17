import { NextRequest, NextResponse } from 'next/server';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const acceptLanguage = request.headers.get('accept-language') || 'vi';
    const authHeader = request.headers.get('authorization') || '';
    const { id } = await params;

    console.log('Instructor API route - Fetching instructor:', id);

    const url = `${API_URL}/api/Instructor/${id}`;

    const resp = await fetch(url, {
      headers: {
        ...(authHeader ? { 'Authorization': authHeader } : {}),
        'Accept-Language': acceptLanguage,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    console.log('Instructor API route - Backend response status:', resp.status);

    let data;
    try {
      data = await resp.json();
    } catch (jsonError) {
      console.error('Instructor API route - JSON parse error:', jsonError);
      const text = await resp.text();
      console.error('Instructor API route - Response text:', text.substring(0, 200));
      return NextResponse.json(
        { error: 'Invalid JSON response from backend', details: text.substring(0, 200) },
        { status: 500 }
      );
    }

    console.log('Instructor API route - Response data keys:', Object.keys(data || {}));

    return NextResponse.json(data, { status: resp.status });
  } catch (error) {
    console.error('Instructor API route - Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch instructor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


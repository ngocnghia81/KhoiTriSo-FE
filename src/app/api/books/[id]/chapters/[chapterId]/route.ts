import { NextRequest, NextResponse } from 'next/server';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; chapterId: string } }
) {
  try {
    const { id, chapterId } = params;
    const acceptLanguage = request.headers.get('accept-language') || 'vi';
    const authHeader = request.headers.get('authorization') || '';

    const url = `${API_URL}/api/books/${id}/chapters/${chapterId}`;

    console.log('Book Chapter API - Fetching:', url);
    console.log('Book Chapter API - Headers:', {
      hasAuth: !!authHeader,
      acceptLanguage
    });

    const resp = await fetch(url, {
      headers: {
        ...(authHeader ? { 'Authorization': authHeader } : {}),
        'Accept-Language': acceptLanguage,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    console.log('Book Chapter API - Response status:', resp.status);

    let data;
    try {
      data = await resp.json();
    } catch (jsonError) {
      console.error('Book Chapter API - JSON parse error:', jsonError);
      const text = await resp.text();
      console.error('Book Chapter API - Response text:', text.substring(0, 200));
      return NextResponse.json(
        { error: 'Invalid JSON response from backend', details: text.substring(0, 200) },
        { status: 500 }
      );
    }

    console.log('Book Chapter API - Response data keys:', Object.keys(data || {}));

    return NextResponse.json(data, { status: resp.status });
  } catch (error) {
    console.error('Book Chapter API route - Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chapter details', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


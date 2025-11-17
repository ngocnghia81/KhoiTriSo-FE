import { NextRequest, NextResponse } from 'next/server';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const level = searchParams.get('level');
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('pageSize') || '20';
    const sortBy = searchParams.get('sortBy');
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    const acceptLanguage = request.headers.get('accept-language') || 'vi';
    const authHeader = request.headers.get('authorization') || '';

    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (level) params.append('level', level);
    params.append('page', page);
    params.append('pageSize', pageSize);
    if (sortBy) params.append('sortBy', sortBy);
    params.append('sortOrder', sortOrder);

    const url = `${API_URL}/api/learning-paths?${params.toString()}`;

    const resp = await fetch(url, {
      headers: {
        ...(authHeader ? { 'Authorization': authHeader } : {}),
        'Accept-Language': acceptLanguage,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });
  } catch (error) {
    console.error('Learning paths API route - Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch learning paths', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


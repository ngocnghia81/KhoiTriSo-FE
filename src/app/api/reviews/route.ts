import { NextRequest, NextResponse } from 'next/server';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemType = searchParams.get('itemType');
    const itemId = searchParams.get('itemId');
    const rating = searchParams.get('rating');
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('pageSize') || '20';
    const sortBy = searchParams.get('sortBy');
    const sortOrder = searchParams.get('sortOrder');

    // Validate required parameters
    if (!itemType || !itemId) {
      return NextResponse.json(
        { error: 'itemType and itemId are required' },
        { status: 400 }
      );
    }

    const acceptLanguage = request.headers.get('accept-language') || 'vi';
    const authHeader = request.headers.get('authorization') || '';

    const params = new URLSearchParams();
    params.append('itemType', itemType);
    params.append('itemId', itemId);
    if (rating) params.append('rating', rating);
    params.append('page', page);
    params.append('pageSize', pageSize);
    if (sortBy) params.append('sortBy', sortBy);
    if (sortOrder) params.append('sortOrder', sortOrder);

    const url = `${API_URL}/api/Reviews?${params.toString()}`;

    console.log('Reviews API - Fetching:', url);
    console.log('Reviews API - Headers:', { 
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

    console.log('Reviews API - Response status:', resp.status);

    let data;
    try {
      data = await resp.json();
    } catch (jsonError) {
      console.error('Reviews API - JSON parse error:', jsonError);
      const text = await resp.text();
      console.error('Reviews API - Response text:', text.substring(0, 200));
      return NextResponse.json(
        { error: 'Invalid JSON response from backend', details: text.substring(0, 200) },
        { status: 500 }
      );
    }

    console.log('Reviews API - Response data keys:', Object.keys(data || {}));

    return NextResponse.json(data, { status: resp.status });
  } catch (error) {
    console.error('Reviews API route - Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


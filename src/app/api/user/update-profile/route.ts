import { NextRequest, NextResponse } from 'next/server';
import { API_URLS } from '@/lib/api-config';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const acceptLanguage = request.headers.get('accept-language') || 'vi';

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const resp = await fetch(API_URLS.USER_UPDATE_PROFILE, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader,
        'Accept-Language': acceptLanguage,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await resp.json().catch(() => ({}));
    return NextResponse.json(data, { status: resp.status });
  } catch (error) {
    console.error('Update profile proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}



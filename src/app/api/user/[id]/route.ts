import { NextRequest, NextResponse } from 'next/server';
import { buildUserByIdUrl } from '@/lib/api-config';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const acceptLanguage = request.headers.get('accept-language') || 'vi';
    const url = buildUserByIdUrl(params.id);

    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept-Language': acceptLanguage,
        'Content-Type': 'application/json',
      },
    });

    const data = await resp.json().catch(() => ({}));
    return NextResponse.json(data, { status: resp.status });
  } catch (error) {
    console.error('Get user by id proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}



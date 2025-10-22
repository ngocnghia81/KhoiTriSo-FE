import { NextRequest, NextResponse } from 'next/server';
import { API_URLS } from '@/lib/api-config';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export async function POST(request: NextRequest) {
  const acceptLanguage = request.headers.get('accept-language') || 'vi';
  const body = await request.json();

  const resp = await fetch(API_URLS.RESET_PASSWORD, {
    method: 'POST',
    headers: {
      'Accept-Language': acceptLanguage,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  
  const data = await resp.json().catch(() => ({}));
  return NextResponse.json(data, { status: resp.status });
}

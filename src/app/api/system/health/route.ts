import { NextRequest, NextResponse } from 'next/server';
import { API_URLS } from '@/lib/api-config';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export async function GET(request: NextRequest) {
  const acceptLanguage = request.headers.get('accept-language') || 'vi';
  const resp = await fetch(API_URLS.SYSTEM_HEALTH, {
    headers: {
      'Accept-Language': acceptLanguage,
    },
  });
  const data = await resp.json().catch(() => ({}));
  return NextResponse.json(data, { status: resp.status });
}










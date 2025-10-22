import { NextRequest, NextResponse } from 'next/server';
import { API_URLS } from '@/lib/api-config';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const acceptLanguage = request.headers.get('accept-language') || 'vi';
  const authHeader = request.headers.get('authorization') || '';

  const qs = url.searchParams.toString();
  const target = `${API_URLS.COURSES_BASE}${qs ? `?${qs}` : ''}`;

  const resp = await fetch(target, {
    headers: {
      ...(authHeader ? { 'Authorization': authHeader } : {}),
      'Accept-Language': acceptLanguage,
    },
  });
  const data = await resp.json().catch(() => ({}));
  return NextResponse.json(data, { status: resp.status });
}

export async function POST(request: NextRequest) {
  const acceptLanguage = request.headers.get('accept-language') || 'vi';
  const authHeader = request.headers.get('authorization') || '';
  const body = await request.json();

  const resp = await fetch(API_URLS.COURSES_BASE, {
    method: 'POST',
    headers: {
      ...(authHeader ? { 'Authorization': authHeader } : {}),
      'Accept-Language': acceptLanguage,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await resp.json().catch(() => ({}));
  return NextResponse.json(data, { status: resp.status });
}



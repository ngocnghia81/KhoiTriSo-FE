import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/lib/api-config';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export async function PUT(request: NextRequest, { params }: { params: { userId: string } }) {
  const acceptLanguage = request.headers.get('accept-language') || 'vi';
  const authHeader = request.headers.get('authorization') || '';
  const body = await request.json();

  const resp = await fetch(`${API_CONFIG.BASE_URL}/admin/users/${params.userId}`, {
    method: 'PUT',
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










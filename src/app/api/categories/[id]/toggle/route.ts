import { NextRequest, NextResponse } from 'next/server';
import { buildCategoryByIdUrl } from '@/lib/api-config';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const acceptLanguage = request.headers.get('accept-language') || 'vi';
  const authHeader = request.headers.get('authorization') || '';
  const target = `${buildCategoryByIdUrl(params.id)}/toggle`;
  const resp = await fetch(target, {
    method: 'PUT',
    headers: { ...(authHeader ? { 'Authorization': authHeader } : {}), 'Accept-Language': acceptLanguage },
  });
  const data = await resp.json().catch(() => ({}));
  return NextResponse.json(data, { status: resp.status });
}



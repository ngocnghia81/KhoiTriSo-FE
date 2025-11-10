import { NextRequest, NextResponse } from 'next/server';
import { API_URLS } from '@/lib/api-config';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const acceptLanguage = request.headers.get('accept-language') || 'vi';
  const authHeader = request.headers.get('authorization') || '';
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || '30d';
  
  const url = `${API_URLS.ANALYTICS_COURSE(id)}?period=${period}`;
  
  const resp = await fetch(url, {
    method: 'GET',
    headers: {
      ...(authHeader ? { 'Authorization': authHeader } : {}),
      'Accept-Language': acceptLanguage,
    },
  });
  
  const data = await resp.json().catch(() => ({}));
  return NextResponse.json(data, { status: resp.status });
}








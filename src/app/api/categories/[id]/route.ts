import { NextRequest, NextResponse } from 'next/server';
import { buildCategoryByIdUrl } from '@/lib/api-config';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const acceptLanguage = request.headers.get('accept-language') || 'vi';
  const resp = await fetch(buildCategoryByIdUrl(id), {
    headers: { 'Accept-Language': acceptLanguage },
  });
  const data = await resp.json().catch(() => ({}));
  return NextResponse.json(data, { status: resp.status });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const acceptLanguage = request.headers.get('accept-language') || 'vi';
  const authHeader = request.headers.get('authorization') || '';
  const body = await request.json();
  const resp = await fetch(buildCategoryByIdUrl(id), {
    method: 'PUT',
    headers: { ...(authHeader ? { 'Authorization': authHeader } : {}), 'Accept-Language': acceptLanguage, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await resp.json().catch(() => ({}));
  return NextResponse.json(data, { status: resp.status });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const acceptLanguage = request.headers.get('accept-language') || 'vi';
  const authHeader = request.headers.get('authorization') || '';
  const resp = await fetch(buildCategoryByIdUrl(id), {
    method: 'DELETE',
    headers: { ...(authHeader ? { 'Authorization': authHeader } : {}), 'Accept-Language': acceptLanguage },
  });
  const data = await resp.json().catch(() => ({}));
  return NextResponse.json(data, { status: resp.status });
}



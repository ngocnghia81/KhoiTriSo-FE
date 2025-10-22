import { NextRequest, NextResponse } from 'next/server';
import { buildCourseByIdUrl, buildCourseSubmitUrl, buildCourseEnrollUrl, buildCourseUnenrollUrl } from '@/lib/api-config';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const acceptLanguage = request.headers.get('accept-language') || 'vi';
  const authHeader = request.headers.get('authorization') || '';
  const { id } = await params;
  const resp = await fetch(buildCourseByIdUrl(id), {
    headers: {
      ...(authHeader ? { 'Authorization': authHeader } : {}),
      'Accept-Language': acceptLanguage,
    },
  });
  const data = await resp.json().catch(() => ({}));
  return NextResponse.json(data, { status: resp.status });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const acceptLanguage = request.headers.get('accept-language') || 'vi';
  const authHeader = request.headers.get('authorization') || '';
  const body = await request.json();
  const { id } = await params;
  const resp = await fetch(buildCourseByIdUrl(id), {
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const acceptLanguage = request.headers.get('accept-language') || 'vi';
  const authHeader = request.headers.get('authorization') || '';
  const { id } = await params;
  const resp = await fetch(buildCourseByIdUrl(id), {
    method: 'DELETE',
    headers: {
      ...(authHeader ? { 'Authorization': authHeader } : {}),
      'Accept-Language': acceptLanguage,
    },
  });
  const data = await resp.json().catch(() => ({}));
  return NextResponse.json(data, { status: resp.status });
}

// helper subroutes
export async function POST(request: NextRequest, context: { params: { id: string }, nextUrl: URL }) {
  // This handler would conflict with main POST; we won't use here
  return NextResponse.json({ error: 'Use specific endpoints for submit/enroll/unenroll' }, { status: 400 });
}



import { NextRequest, NextResponse } from 'next/server';
import { buildCourseByIdUrl, buildCourseSubmitUrl, buildCourseEnrollUrl, buildCourseUnenrollUrl } from '@/lib/api-config';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const acceptLanguage = request.headers.get('accept-language') || 'vi';
    const authHeader = request.headers.get('authorization') || '';
    const { id } = await params;
    
    console.log('Course API route - Fetching course:', id);
    
    const resp = await fetch(buildCourseByIdUrl(id), {
      headers: {
        ...(authHeader ? { 'Authorization': authHeader } : {}),
        'Accept-Language': acceptLanguage,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    console.log('Course API route - Backend response status:', resp.status);
    
    let data;
    try {
      data = await resp.json();
    } catch (jsonError) {
      console.error('Course API route - JSON parse error:', jsonError);
      const text = await resp.text();
      console.error('Course API route - Response text:', text.substring(0, 200));
      return NextResponse.json(
        { error: 'Invalid JSON response from backend', details: text.substring(0, 200) },
        { status: 500 }
      );
    }
    
    console.log('Course API route - Response data keys:', Object.keys(data));
    
    return NextResponse.json(data, { status: resp.status });
  } catch (error) {
    console.error('Course API route - Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
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



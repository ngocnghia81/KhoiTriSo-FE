import { NextRequest, NextResponse } from 'next/server';
import { API_URLS } from '@/lib/api-config';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const acceptLanguage = request.headers.get('accept-language') || 'vi';

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();

    const resp = await fetch(API_URLS.USER_UPLOAD_AVATAR, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Accept-Language': acceptLanguage,
      },
      body: formData,
    });

    const data = await resp.json().catch(() => ({}));
    return NextResponse.json(data, { status: resp.status });
  } catch (error) {
    console.error('Upload avatar proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}



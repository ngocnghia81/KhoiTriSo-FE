import { NextRequest, NextResponse } from 'next/server';
import { getAuthTokenFromRequest } from '@/lib/api/getAuthToken';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = getAuthTokenFromRequest(request);
    const acceptLanguage = request.headers.get('accept-language') || 'vi';
    
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('pageSize') || '20';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const paramsUrl = new URLSearchParams();
    paramsUrl.append('page', page);
    paramsUrl.append('pageSize', pageSize);
    paramsUrl.append('sortBy', sortBy);
    paramsUrl.append('sortOrder', sortOrder);

    const response = await fetch(`${API_URL}/api/lessons/${id}/discussions?${paramsUrl.toString()}`, {
      method: 'GET',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        'Accept-Language': acceptLanguage,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorData;
      try {
        const text = await response.text();
        if (text && text.trim().length > 0) {
          errorData = JSON.parse(text);
        } else {
          errorData = { 
            Message: `HTTP ${response.status}: ${response.statusText}`,
            MessageCode: 'ERROR'
          };
        }
      } catch {
        errorData = { 
          Message: `HTTP ${response.status}: ${response.statusText}`,
          MessageCode: 'ERROR'
        };
      }
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Error fetching lesson discussions:', error);
    return NextResponse.json(
      { Message: 'Lỗi khi tải bình luận', Error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = getAuthTokenFromRequest(request);
    const acceptLanguage = request.headers.get('accept-language') || 'vi';
    
    if (!token) {
      return NextResponse.json(
        { Message: 'Unauthorized', MessageCode: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const response = await fetch(`${API_URL}/api/lessons/${id}/discussions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept-Language': acceptLanguage,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      let errorData;
      try {
        const text = await response.text();
        if (text && text.trim().length > 0) {
          errorData = JSON.parse(text);
        } else {
          errorData = { 
            Message: `HTTP ${response.status}: ${response.statusText}`,
            MessageCode: 'ERROR'
          };
        }
      } catch {
        errorData = { 
          Message: `HTTP ${response.status}: ${response.statusText}`,
          MessageCode: 'ERROR'
        };
      }
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Error creating lesson discussion:', error);
    return NextResponse.json(
      { Message: 'Lỗi khi tạo bình luận', Error: error.message },
      { status: 500 }
    );
  }
}


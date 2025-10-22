import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'No authorization header' },
        { status: 401 }
      );
    }

    // Decode JWT token to check payload
    const token = authHeader.replace('Bearer ', '');
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      return NextResponse.json(
        { error: 'Invalid token format' },
        { status: 401 }
      );
    }

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    
    return NextResponse.json({
      message: 'Token decoded successfully',
      payload: payload,
      role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
      userId: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
      email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']
    });
  } catch (error) {
    console.error('Token test error:', error);
    return NextResponse.json(
      { error: 'Failed to decode token' },
      { status: 500 }
    );
  }
}







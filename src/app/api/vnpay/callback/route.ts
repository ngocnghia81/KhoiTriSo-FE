import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const acceptLanguage = request.headers.get('accept-language') || 'vi';
    
    // Build query string from search params
    const queryString = searchParams.toString();
    const callbackUrl = `${API_URL}/api/vnpay/callback${queryString ? `?${queryString}` : ''}`;

    // Call backend callback endpoint - it returns a redirect URL
    const response = await fetch(callbackUrl, {
      method: 'GET',
      headers: {
        'Accept-Language': acceptLanguage,
      },
      redirect: 'manual', // Don't follow redirects automatically
    });

    // Backend should return a redirect URL in Location header or response
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (location) {
        return NextResponse.redirect(location);
      }
    }

    // Try to get redirect URL from response body
    const data = await response.text();
    try {
      const jsonData = JSON.parse(data);
      if (jsonData.RedirectUrl || jsonData.redirectUrl) {
        return NextResponse.redirect(jsonData.RedirectUrl || jsonData.redirectUrl);
      }
    } catch {
      // Not JSON, try to extract URL from text
      const urlMatch = data.match(/https?:\/\/[^\s"']+/);
      if (urlMatch) {
        return NextResponse.redirect(urlMatch[0]);
      }
    }

    // Default: check vnp_ResponseCode to determine success/failure
    const responseCode = searchParams.get('vnp_ResponseCode');
    if (responseCode === '00') {
      const orderCode = searchParams.get('vnp_TxnRef');
      return NextResponse.redirect(
        new URL(`/checkout/success${orderCode ? `?orderCode=${orderCode}` : ''}`, request.url)
      );
    } else {
      return NextResponse.redirect(new URL('/checkout/failure', request.url));
    }
  } catch (error: any) {
    console.error('Error processing VNPAY callback:', error);
    // Redirect to a failure page
    return NextResponse.redirect(new URL('/checkout/failure', request.url));
  }
}


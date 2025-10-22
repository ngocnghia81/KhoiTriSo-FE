import { NextRequest, NextResponse } from 'next/server';
import { API_URLS } from '@/lib/api-config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code || !state) {
      return NextResponse.json(
        { error: 'Missing code or state parameter' },
        { status: 400 }
      );
    }

    // Call your backend callback endpoint
    const response = await fetch(`${API_URLS.FACEBOOK_CALLBACK}?code=${code}&state=${state}`, {
      method: 'GET',
      headers: {
        'accept': '*/*',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to authenticate with Facebook');
    }

    const data = await response.json();
    
    // Create a success page that will communicate with the parent window
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Successful</title>
        </head>
        <body>
          <script>
            // Send the authentication data to the parent window
            if (window.opener) {
              window.opener.postMessage({
                token: '${data.Result?.Token || 'mock-token'}',
                user: ${JSON.stringify({
                  id: data.Result?.User?.Id?.toString() || '2',
                  name: data.Result?.User?.FullName || 'Facebook User',
                  email: data.Result?.User?.Email || 'user@facebook.com',
                  avatar: data.Result?.User?.Avatar || 'https://via.placeholder.com/40',
                  role: data.Result?.User?.Role === 0 ? 'student' : 
                        data.Result?.User?.Role === 1 ? 'instructor' : 'admin'
                })}
              }, window.location.origin);
              window.close();
            } else {
              // If no opener, redirect to home page
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful! This window will close automatically.</p>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Facebook OAuth callback error:', error);
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Failed</title>
        </head>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                error: 'Authentication failed'
              }, window.location.origin);
              window.close();
            } else {
              window.location.href = '/auth/login?error=auth_failed';
            }
          </script>
          <p>Authentication failed. This window will close automatically.</p>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  }
}

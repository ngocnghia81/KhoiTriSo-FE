import { NextRequest } from 'next/server';

/**
 * Extract bearer token from Authorization header or fallback cookies.
 * Many of our API routes run on the server and cannot read localStorage,
 * so we need to consistently look at both headers and cookies.
 */
export function getAuthTokenFromRequest(request: NextRequest): string | undefined {
  const authHeader =
    request.headers.get('authorization') || request.headers.get('Authorization');

  if (authHeader) {
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return (
    request.cookies.get('authToken')?.value ||
    request.cookies.get('token')?.value ||
    request.cookies.get('auth_token')?.value ||
    request.cookies.get('Authorization')?.value ||
    undefined
  );
}


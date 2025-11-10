/**
 * Refresh token utility
 */
let refreshPromise: Promise<boolean> | null = null;

async function refreshToken(): Promise<boolean> {
  const refreshTokenValue = localStorage.getItem('refreshToken');
  const currentToken = localStorage.getItem('accessToken');
  
  if (!refreshTokenValue || !currentToken) {
    console.log('No refresh token or access token available');
    return false;
  }

  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
    
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh?refreshToken=${encodeURIComponent(refreshTokenValue)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      const newToken = data.result?.token || data.token || data.Result?.Token || data.Result?.token;
      const newRefreshToken = data.result?.refreshToken || data.refreshToken || data.Result?.RefreshToken || data.Result?.refreshToken || refreshTokenValue;
      
      if (!newToken) {
        console.error('No token in refresh response');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('token');
        return false;
      }
      
      // Update tokens
      localStorage.setItem('accessToken', newToken);
      localStorage.setItem('token', newToken);
      if (newRefreshToken !== refreshTokenValue) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }
      
      // Update cookies
      document.cookie = `authToken=${newToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      if (newRefreshToken !== refreshTokenValue) {
        document.cookie = `refreshToken=${newRefreshToken}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
      }
      
      console.log('Token refreshed successfully');
      return true;
    } else {
      console.error('Token refresh failed:', response.status);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('token');
      return false;
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('token');
    return false;
  }
}

/**
 * Get refreshed token (with automatic refresh if needed)
 */
export async function getRefreshedToken(): Promise<string | null> {
  // If already refreshing, wait for that promise
  if (refreshPromise) {
    await refreshPromise;
  }
  
  return localStorage.getItem('accessToken') || localStorage.getItem('token');
}

/**
 * Fetch with automatic token refresh on 401
 */
export async function fetchWithTokenRefresh(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Get current token
  let token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  
  // Prepare headers
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // First attempt
  let response = await fetch(url, {
    ...options,
    headers,
  });
  
  // Check if we need to refresh token
  // Backend returns 400 with "Không thể xác định userId từ token" when token is invalid
  const needsRefresh = response.status === 401;
  let mightNeedRefresh = false;
  
  if (response.status === 400) {
    // Clone response to read body without consuming it
    const clonedResponse = response.clone();
    try {
      const responseText = await clonedResponse.text();
      if (responseText) {
        try {
          const responseData = JSON.parse(responseText);
          const message = responseData.message || responseData.Message || responseData.error || responseData.Error || '';
          mightNeedRefresh = message.includes('userId') || 
                           message.includes('token') || 
                           message.includes('Token') ||
                           message.includes('Unauthorized') ||
                           message.includes('xác định');
        } catch {
          // If not JSON, check text directly
          mightNeedRefresh = responseText.includes('userId') || 
                           responseText.includes('token') || 
                           responseText.includes('Token') ||
                           responseText.includes('Unauthorized');
        }
      }
    } catch {
      // Ignore errors when reading response
    }
  }
  
  // If token error, try to refresh token
  if (needsRefresh || mightNeedRefresh) {
    console.log('Token expired or invalid, attempting to refresh...', {
      status: response.status,
      needsRefresh,
      mightNeedRefresh
    });
    
    // If already refreshing, wait for that promise
    if (refreshPromise) {
      console.log('Waiting for ongoing refresh...');
      const refreshed = await refreshPromise;
      if (!refreshed) {
        console.log('Refresh failed, returning original response');
        return response; // Return original response if refresh failed
      }
    } else {
      // Start refresh
      console.log('Starting token refresh...');
      refreshPromise = refreshToken();
      const refreshed = await refreshPromise;
      refreshPromise = null;
      
      if (!refreshed) {
        console.log('Token refresh failed, returning original response');
        return response; // Return original response if refresh failed
      }
      console.log('Token refreshed successfully');
    }
    
    // Get new token
    token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    console.log('Retrying request with new token...', { 
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'none'
    });
    
    // Retry request with new token
    const retryHeaders = new Headers(options.headers);
    if (token) {
      retryHeaders.set('Authorization', `Bearer ${token}`);
    }
    
    response = await fetch(url, {
      ...options,
      headers: retryHeaders,
    });
    
    console.log('Retry response status:', response.status);
  }
  
  return response;
}


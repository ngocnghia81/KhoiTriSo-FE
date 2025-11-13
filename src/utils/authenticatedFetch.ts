/**
 * Global authenticated fetch wrapper that automatically handles token refresh
 * Use this instead of native fetch() for all API calls
 */
let refreshPromise: Promise<boolean> | null = null;

async function refreshToken(): Promise<boolean> {
  const refreshTokenValue = localStorage.getItem('refreshToken');
  const currentToken = localStorage.getItem('accessToken');
  
  if (!refreshTokenValue) {
    console.log('No refresh token available');
    return false;
  }

  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
    
    console.log('🔄 Attempting to refresh token...', {
      hasRefreshToken: !!refreshTokenValue,
      hasOldToken: !!currentToken
    });
    
    // Backend yêu cầu old token trong header để lấy username (dù đã hết hạn)
    // GetPrincipalFromExpiredToken có ValidateLifetime = false nên có thể parse expired token
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
      console.log('🔄 Sending old token in header (even if expired):', currentToken.substring(0, 20) + '...');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/Auth/refresh?refreshToken=${encodeURIComponent(refreshTokenValue)}`, {
      method: 'POST',
      headers,
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Refresh response:', { 
        hasResult: !!data.Result, 
        hasResultToken: !!data.Result?.Token,
        hasToken: !!data.token,
        keys: Object.keys(data)
      });
      
      const newToken = data.Result?.Token || data.Result?.token || data.result?.token || data.token;
      const newRefreshToken = data.Result?.RefreshToken || data.Result?.refreshToken || data.result?.refreshToken || data.refreshToken || refreshTokenValue;
      
      if (!newToken) {
        console.error('No token in refresh response', data);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return false;
      }
      
      console.log('Token refresh successful, updating tokens...');
      
      localStorage.setItem('accessToken', newToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      
      document.cookie = `authToken=${newToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      document.cookie = `refreshToken=${newRefreshToken}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
      
      console.log('Token refreshed successfully');
      return true;
    } else {
      const errorText = await response.text();
      console.error('Token refresh failed with status:', response.status, 'Response:', errorText);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return false;
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return false;
  }
}

/**
 * Authenticated fetch that automatically refreshes token on 401
 * This is a drop-in replacement for fetch() that handles token refresh automatically
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Get current token
  let token = localStorage.getItem('accessToken');
  
  // Prepare headers
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = new Headers(options.headers);
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Only set Content-Type if not FormData and not already set
  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  
  // First attempt
  let response = await fetch(url, {
    ...options,
    headers,
  });

  // Check if we need to refresh token
  if (response.status === 401) {
    console.log('🔴 401 Unauthorized detected, checking if token error...');
    
    // Clone response BEFORE reading to check if it's a token error
    let isTokenError = true;
    let errorMessage = '';
    try {
      // Clone the response so we can read it without consuming the original
      const clonedResponse = response.clone();
      const errorText = await clonedResponse.text();
      console.log('📄 Error response text:', errorText.substring(0, 300));
      
      if (errorText) {
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.Message || errorData.error || errorData.Error || errorData.ErrorMessage || '';
          const messageLower = errorMessage.toLowerCase();
          isTokenError = messageLower.includes('token') || 
                       messageLower.includes('unauthorized') ||
                       messageLower.includes('xác định') ||
                       messageLower.includes('expired') ||
                       messageLower.includes('invalid') ||
                       messageLower.includes('hết hạn') ||
                       messageLower.includes('không hợp lệ') ||
                       messageLower.includes('không thể xác định') ||
                       messageLower.includes('userid');
          console.log('🔍 Error message analysis:', { errorMessage, isTokenError });
        } catch (parseError) {
          // If can't parse as JSON, assume it's a token error for 401
          isTokenError = true;
          console.log('⚠️ Could not parse error response as JSON, assuming token error:', parseError);
        }
      } else {
        console.log('⚠️ Empty error response, assuming token error');
      }
    } catch (e) {
      // If we can't read the response, assume it's a token error for 401
      isTokenError = true;
      console.log('⚠️ Error reading response body, assuming token error:', e);
    }
    
    if (isTokenError) {
      console.log('✅ Confirmed token error, attempting refresh...');
      // If already refreshing, wait for that promise
      if (refreshPromise) {
        console.log('Waiting for ongoing refresh...');
        const refreshed = await refreshPromise;
        if (!refreshed) {
          console.log('Refresh failed, returning original response');
          return response;
        }
      } else {
        // Start refresh
        console.log('Starting token refresh...');
        refreshPromise = refreshToken();
        const refreshed = await refreshPromise;
        refreshPromise = null;
        
        if (!refreshed) {
          console.log('Token refresh failed, returning original response');
          return response;
        }
        console.log('Token refreshed successfully');
      }
      
      // Get new token
      token = localStorage.getItem('accessToken');
      console.log('Retrying request with new token...', { 
        hasToken: !!token,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'none'
      });
      
      if (!token) {
        console.error('No token after refresh');
        return response;
      }
      
      // Retry request with new token
      const retryHeaders = new Headers(options.headers);
      retryHeaders.set('Authorization', `Bearer ${token}`);
      
      // Preserve Accept-Language if present
      if (headers.has('Accept-Language')) {
        retryHeaders.set('Accept-Language', headers.get('Accept-Language')!);
      }
      
      if (!isFormData && !retryHeaders.has('Content-Type')) {
        retryHeaders.set('Content-Type', 'application/json');
      }
      
      console.log('🔄 Retrying request with new token...', {
        url,
        hasToken: !!token,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'none'
      });
      
      response = await fetch(url, {
        ...options,
        headers: retryHeaders,
      });
      
      console.log('✅ Retry response status:', response.status);
      
      // If still 401 after refresh, it might be a different auth issue
      if (response.status === 401) {
        console.error('❌ Still 401 after token refresh, may need to logout');
        const errorText = await response.clone().text();
        console.error('Error response:', errorText.substring(0, 200));
      }
    } else {
      console.log('⚠️ 401 but not a token error, returning original response');
    }
  }
  
  return response;
}


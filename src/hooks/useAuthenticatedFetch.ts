import { useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export const useAuthenticatedFetch = () => {
  const { refreshAuthToken, token, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  
  // Debug: Log auth status
  console.log('useAuthenticatedFetch - Auth status:', {
    isAuthenticated,
    hasToken: !!token,
    tokenPreview: token ? token.substring(0, 20) + '...' : 'null'
  });

  const authenticatedFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    // Add base URL if the URL starts with /api/
    const fullUrl = url.startsWith('/api/') ? `${API_BASE_URL}${url}` : url;
    
    // Debug: Log token status
    console.log('useAuthenticatedFetch - Token status:', {
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'null',
      url: url,
      fullUrl: fullUrl,
      localStorageToken: localStorage.getItem('accessToken')?.substring(0, 20) + '...' || 'null'
    });
    
    // Try to get token from localStorage if context token is null
    const actualToken = token || localStorage.getItem('accessToken');
    
    // First attempt - middleware will add token automatically
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    const defaultHeaders: Record<string, string> = {
      'Accept-Language': language,
      ...(actualToken ? { 'Authorization': `Bearer ${actualToken}` } : {}),
    };
    // Only set JSON content-type when not sending FormData and caller didn't specify
    if (!isFormData && !('Content-Type' in (options.headers || {}))) {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    let response = await fetch(fullUrl, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    // If token is expired (401), try to refresh
    if (response.status === 401) {
      console.log('Token expired, attempting to refresh...');
      const refreshSuccess = await refreshAuthToken();
      
      if (refreshSuccess) {
        console.log('Token refreshed successfully, retrying request...');
        // Retry the request with new token
        const newToken = localStorage.getItem('accessToken') || token;
        const retryHeaders: Record<string, string> = {
          'Accept-Language': language,
          ...(newToken ? { 'Authorization': `Bearer ${newToken}` } : {}),
        };
        if (!isFormData && !('Content-Type' in (options.headers || {}))) {
          retryHeaders['Content-Type'] = 'application/json';
        }
        response = await fetch(fullUrl, {
          ...options,
          headers: {
            ...retryHeaders,
            ...options.headers,
          },
        });
      } else {
        throw new Error('Token refresh failed');
      }
    }

    return response;
  }, [refreshAuthToken, token, language]);

  return { authenticatedFetch };
};

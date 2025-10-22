import { useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

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
    // Debug: Log token status
    console.log('useAuthenticatedFetch - Token status:', {
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'null',
      url: url,
      localStorageToken: localStorage.getItem('accessToken')?.substring(0, 20) + '...' || 'null'
    });
    
    // Try to get token from localStorage if context token is null
    const actualToken = token || localStorage.getItem('accessToken');
    
    // First attempt - middleware will add token automatically
    let response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': language,
        ...(actualToken ? { 'Authorization': `Bearer ${actualToken}` } : {}),
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
        response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'Accept-Language': language,
            ...(newToken ? { 'Authorization': `Bearer ${newToken}` } : {}),
            ...options.headers,
          },
        });
      } else {
        throw new Error('Token refresh failed');
      }
    }

    return response;
  }, [refreshAuthToken]);

  return { authenticatedFetch };
};

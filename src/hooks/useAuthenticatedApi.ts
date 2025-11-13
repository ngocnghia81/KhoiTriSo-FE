import { useAuth } from '@/contexts/AuthContext';
import { useCallback } from 'react';

export const useAuthenticatedApi = () => {
  const { token, refreshAuthToken } = useAuth();

  const authenticatedFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    // Always get token from localStorage first to ensure we have the latest value
    let authToken = localStorage.getItem('accessToken') || token;
    
    if (!authToken) {
      throw new Error('No authentication token available');
    }

    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    
    const makeRequest = async (authTokenValue: string) => {
      const headers: Record<string, string> = {
        ...(options.headers as Record<string, string> || {}),
        'Authorization': `Bearer ${authTokenValue}`,
      };
      
      // Only set Content-Type if not FormData and not already set
      if (!isFormData && !('Content-Type' in (options.headers || {}))) {
        headers['Content-Type'] = 'application/json';
      }
      
      return fetch(url, {
        ...options,
        headers,
      });
    };

    // First attempt with current token
    let response = await makeRequest(authToken);

    // If token is expired (401), try to refresh
    if (response.status === 401) {
      console.log('Token expired (401), attempting to refresh...');
      
      // Clone response to check error message
      let isTokenError = true;
      try {
        const clonedResponse = response.clone();
        const errorText = await clonedResponse.text();
        if (errorText) {
          try {
            const errorData = JSON.parse(errorText);
            const message = errorData.message || errorData.Message || errorData.error || errorData.Error || '';
            isTokenError = message.includes('token') || 
                         message.includes('Token') ||
                         message.includes('Unauthorized') ||
                         message.includes('xác định') ||
                         message.includes('expired') ||
                         message.includes('invalid');
          } catch {
            isTokenError = true; // Assume token error for 401
          }
        }
      } catch {
        isTokenError = true;
      }
      
      if (isTokenError) {
        const refreshSuccess = await refreshAuthToken();
        
        if (refreshSuccess) {
          // Get the new token from localStorage (it was updated by refreshAuthToken)
          const newToken = localStorage.getItem('accessToken');
          if (newToken) {
            console.log('Token refreshed successfully, retrying request...');
            response = await makeRequest(newToken);
            console.log('Retry response status:', response.status);
          } else {
            throw new Error('Failed to get new token after refresh');
          }
        } else {
          throw new Error('Token refresh failed');
        }
      }
    }

    return response;
  }, [token, refreshAuthToken]);

  return { authenticatedFetch };
};

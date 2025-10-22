import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCallback } from 'react';

export const useApiClient = () => {
  const { token, refreshAuthToken } = useAuth();
  const { language } = useLanguage();

  const apiCall = useCallback(async (url: string, options: RequestInit = {}) => {
    const makeRequest = async (authToken: string) => {
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'Accept-Language': language,
        },
      });
    };

    if (!token) {
      throw new Error('No authentication token available');
    }

    // First attempt with current token
    let response = await makeRequest(token);

    // If token is expired (401), try to refresh
    if (response.status === 401) {
      console.log('Token expired, attempting to refresh...');
      const refreshSuccess = await refreshAuthToken();
      
      if (refreshSuccess) {
        // Get the new token from localStorage (it was updated by refreshAuthToken)
        const newToken = localStorage.getItem('accessToken');
        if (newToken) {
          console.log('Token refreshed successfully, retrying request...');
          response = await makeRequest(newToken);
        } else {
          throw new Error('Failed to get new token after refresh');
        }
      } else {
        throw new Error('Token refresh failed');
      }
    }

    return response;
  }, [token, refreshAuthToken]);

  return { apiCall };
};

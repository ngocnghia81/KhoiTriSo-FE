import { useAuth } from '@/contexts/AuthContext';
import { useCallback } from 'react';

export const useAuthenticatedApi = () => {
  const { token, refreshAuthToken } = useAuth();

  const authenticatedFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    if (!token) {
      throw new Error('No authentication token available');
    }

    const makeRequest = async (authToken: string) => {
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
    };

    // First attempt with current token
    let response = await makeRequest(token);

    // If token is expired (401), try to refresh
    if (response.status === 401) {
      console.log('Token expired, attempting to refresh...');
      const refreshSuccess = await refreshAuthToken();
      
      if (refreshSuccess) {
        // Get the new token from localStorage (it was updated by refreshAuthToken)
        const newToken = localStorage.getItem('authToken');
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

  return { authenticatedFetch };
};

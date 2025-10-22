import { useCallback } from 'react';

export const useApi = () => {
  const apiCall = useCallback(async (url: string, options: RequestInit = {}) => {
    // Middleware will automatically add Authorization header if token exists
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    return response;
  }, []);

  return { apiCall };
};

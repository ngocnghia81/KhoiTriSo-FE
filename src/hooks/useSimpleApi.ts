import { useCallback } from 'react';

export const useSimpleApi = () => {
  const apiCall = useCallback(async (url: string, options: RequestInit = {}) => {
    // Simple fetch - middleware will handle token
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


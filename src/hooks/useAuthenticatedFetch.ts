import { useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { fetchWithAutoRefresh } from '@/utils/apiHelpers';

export const useAuthenticatedFetch = () => {
  const { token, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  
  console.log('useAuthenticatedFetch - Auth status:', {
    isAuthenticated,
    hasToken: !!token,
    tokenPreview: token ? token.substring(0, 20) + '...' : 'null'
  });

  const authenticatedFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const fullUrl = url.startsWith('http://') || url.startsWith('https://') ? url : url;

    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    const existingHeaders = new Headers(options.headers);
    const resolvedToken = token || localStorage.getItem('accessToken');

    if (!existingHeaders.has('Accept-Language')) {
      existingHeaders.set('Accept-Language', language);
    }

    if (resolvedToken && !existingHeaders.has('Authorization')) {
      existingHeaders.set('Authorization', `Bearer ${resolvedToken}`);
    }

    if (!isFormData && !existingHeaders.has('Content-Type')) {
      existingHeaders.set('Content-Type', 'application/json');
    }

    return fetchWithAutoRefresh(fullUrl, {
      ...options,
      headers: existingHeaders,
    });
  }, [token, language]);

  return { authenticatedFetch };
};

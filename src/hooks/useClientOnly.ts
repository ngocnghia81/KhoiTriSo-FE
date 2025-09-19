'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to check if component is running on client-side
 * Useful for preventing hydration mismatches
 */
export function useClientOnly() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

/**
 * Hook to safely access browser APIs
 * Returns undefined on server-side to prevent hydration mismatches
 */
export function useBrowserAPI<T>(fn: () => T): T | undefined {
  const isClient = useClientOnly();
  
  if (!isClient) {
    return undefined;
  }
  
  try {
    return fn();
  } catch {
    return undefined;
  }
}

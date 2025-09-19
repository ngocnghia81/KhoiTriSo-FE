'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

interface NoSSRProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component to disable SSR for specific parts of the app
 * Useful for components that cause hydration mismatches
 */
const NoSSR = ({ children, fallback = null }: NoSSRProps) => {
  return <>{children}</>;
};

// Export as dynamic component with SSR disabled
export default dynamic(() => Promise.resolve(NoSSR), {
  ssr: false,
  loading: () => null
});

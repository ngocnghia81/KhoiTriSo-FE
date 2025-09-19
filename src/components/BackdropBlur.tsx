'use client';

import { useClientOnly } from '@/hooks/useClientOnly';

interface BackdropBlurProps {
  onClick?: () => void;
  className?: string;
}

/**
 * Backdrop component with blur effect that prevents hydration mismatches
 */
export default function BackdropBlur({ onClick, className = '' }: BackdropBlurProps) {
  const isClient = useClientOnly();

  // Render consistent backdrop on both server and client
  const backdropStyle = isClient 
    ? {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)'
      }
    : {
        backgroundColor: 'rgba(255, 255, 255, 0.2)'
      };

  return (
    <div
      className={`fixed inset-0 ${className}`}
      style={backdropStyle}
      onClick={onClick}
    />
  );
}

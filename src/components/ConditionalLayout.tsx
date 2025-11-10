'use client';

import { usePathname } from 'next/navigation';
import HeaderModern from './HeaderModern';
import Footer from './Footer';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Don't show header/footer on dashboard pages
  const isDashboard = pathname?.startsWith('/dashboard') || pathname?.startsWith('/instructor');
  
  if (isDashboard) {
    return <>{children}</>;
  }
  
  return (
    <>
      <HeaderModern />
      <main className="pt-20">
        {children}
      </main>
      <Footer />
    </>
  );
}

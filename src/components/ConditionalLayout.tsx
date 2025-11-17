'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Don't show header/footer on dashboard pages and lesson player pages
  const isDashboard = pathname?.startsWith('/dashboard') || pathname?.startsWith('/instructor');
  const isLessonPlayer = pathname?.includes('/lessons/');
  
  if (isDashboard || isLessonPlayer) {
    return <>{children}</>;
  }
  
  return (
    <>
      <Header />
      <main>
        {children}
      </main>
      <Footer />
    </>
  );
}

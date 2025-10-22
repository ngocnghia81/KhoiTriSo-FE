'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type SupportedLanguage = 'vi' | 'en';

type LanguageContextType = {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function detectBrowserLanguage(): SupportedLanguage {
  if (typeof navigator === 'undefined') return 'vi';
  const langs = navigator.languages || [navigator.language];
  for (const l of langs) {
    const code = l?.split('-')[0]?.toLowerCase();
    if (code === 'vi' || code === 'en') return code as SupportedLanguage;
  }
  return 'vi';
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>('vi');

  useEffect(() => {
    try {
      const fromCookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith('lang='))?.split('=')[1];
      const fromStorage = localStorage.getItem('lang');
      const initial = (fromCookie || fromStorage || detectBrowserLanguage()) as SupportedLanguage;
      setLanguageState(initial === 'en' ? 'en' : 'vi');
    } catch {
      setLanguageState('vi');
    }
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    const normalized = lang === 'en' ? 'en' : 'vi';
    setLanguageState(normalized);
    try {
      localStorage.setItem('lang', normalized);
      document.cookie = `lang=${normalized}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
    } catch {}
  };

  const value = useMemo(() => ({ language, setLanguage }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};



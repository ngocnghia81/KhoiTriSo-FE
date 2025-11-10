import { useLanguage } from '@/contexts/LanguageContext';
import { vi } from '@/locales/vi';
import { en } from '@/locales/en';

export const useTranslation = () => {
  const { language } = useLanguage();
  
  const translations = language === 'en' ? en : vi;
  
  return { t: translations, language };
};

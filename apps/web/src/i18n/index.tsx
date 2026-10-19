import React, { createContext, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { id } from './id';
import { en } from './en';

export type Language = 'id' | 'en';
export type I18nDictionary = typeof id;

interface I18nContextType {
  lang: Language;
  t: I18nDictionary;
  toggleLang: () => void;
  setLang: (lang: Language) => void;
  localePath: (path: string) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine current language from URL path
  const isEnglish = location.pathname === '/en' || location.pathname.startsWith('/en/');
  const lang: Language = isEnglish ? 'en' : 'id';
  const t = isEnglish ? en : id;

  const localePath = (path: string): string => {
    // Normalizing incoming path
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    if (lang === 'en') {
      if (cleanPath === '/') return '/en';
      if (cleanPath.startsWith('/en/')) return cleanPath;
      return `/en${cleanPath}`;
    } else {
      if (cleanPath.startsWith('/en/')) {
        const stripped = cleanPath.replace(/^\/en/, '');
        return stripped || '/';
      }
      return cleanPath;
    }
  };

  const setLang = (targetLang: Language) => {
    if (targetLang === lang) return;
    const currentPath = location.pathname;
    const search = location.search;
    let newPath = '/';

    if (targetLang === 'en') {
      newPath = currentPath === '/' ? '/en' : `/en${currentPath}`;
    } else {
      newPath = currentPath.replace(/^\/en/, '') || '/';
    }

    navigate(`${newPath}${search}`, { replace: false });
  };

  const toggleLang = () => {
    setLang(lang === 'id' ? 'en' : 'id');
  };

  return (
    <I18nContext.Provider value={{ lang, t, toggleLang, setLang, localePath }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

import React from 'react';
import { useI18n, Language } from '../../i18n';

export const LanguageSwitcher: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { lang, setLang } = useI18n();

  return (
    <div
      role="group"
      aria-label="Pilih bahasa / Select language"
      className={`inline-flex items-center text-xs font-mono hairline-border p-0.5 bg-[#E9E4D8]/50 ${className}`}
    >
      <button
        type="button"
        onClick={() => setLang('id')}
        className={`px-2 py-1 transition-colors ${
          lang === 'id'
            ? 'bg-[#14201C] text-[#F4F1EA] font-medium'
            : 'text-[#14201C]/60 hover:text-[#14201C]'
        }`}
        aria-pressed={lang === 'id'}
      >
        ID
      </button>
      <span className="text-[#14201C]/20 px-0.5" aria-hidden="true">|</span>
      <button
        type="button"
        onClick={() => setLang('en')}
        className={`px-2 py-1 transition-colors ${
          lang === 'en'
            ? 'bg-[#14201C] text-[#F4F1EA] font-medium'
            : 'text-[#14201C]/60 hover:text-[#14201C]'
        }`}
        aria-pressed={lang === 'en'}
      >
        EN
      </button>
    </div>
  );
};

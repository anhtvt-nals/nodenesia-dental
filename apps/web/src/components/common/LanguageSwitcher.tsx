import React from 'react';
import { useI18n } from '../../i18n';

export const LanguageSwitcher: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { lang, setLang } = useI18n();

  return (
    <div
      role="group"
      aria-label="Pilih bahasa / Select language"
      className={`inline-flex items-center text-xs font-semibold border border-border rounded-lg p-0.5 bg-bg-alt ${className}`}
    >
      <button
        type="button"
        onClick={() => setLang('id')}
        className={`px-2.5 py-1.5 rounded-md transition-colors cursor-pointer ${
          lang === 'id'
            ? 'bg-primary text-white shadow-xs'
            : 'text-text-muted hover:text-text'
        }`}
        aria-pressed={lang === 'id'}
      >
        ID
      </button>
      <button
        type="button"
        onClick={() => setLang('en')}
        className={`px-2.5 py-1.5 rounded-md transition-colors cursor-pointer ${
          lang === 'en'
            ? 'bg-primary text-white shadow-xs'
            : 'text-text-muted hover:text-text'
        }`}
        aria-pressed={lang === 'en'}
      >
        EN
      </button>
    </div>
  );
};

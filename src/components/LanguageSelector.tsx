import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { LanguageCode } from '../types/freezer';

export const LanguageSelector: React.FC = () => {
  const { lang, setLang } = useLanguage();

  const handleSelect = (selected: LanguageCode) => {
    if (selected !== lang) {
      setLang(selected);
    }
  };

  return (
    <div
      role="group"
      aria-label="Sprachauswahl / Selector de idioma"
      className="inline-flex items-center rounded-xl bg-slate-100 p-0.5 border border-slate-200/80 shadow-2xs"
    >
      <button
        type="button"
        onClick={() => handleSelect('de')}
        className={`px-2 py-1 text-xs font-bold rounded-lg transition-all active:scale-95 flex items-center gap-1 ${
          lang === 'de'
            ? 'bg-white text-sky-700 shadow-xs border border-sky-100'
            : 'text-slate-500 hover:text-slate-800'
        }`}
        title="Deutsch (DE)"
      >
        <span className="text-[11px]">🇩🇪</span>
        <span>DE</span>
      </button>

      <span className="text-slate-300 text-xs select-none">|</span>

      <button
        type="button"
        onClick={() => handleSelect('es')}
        className={`px-2 py-1 text-xs font-bold rounded-lg transition-all active:scale-95 flex items-center gap-1 ${
          lang === 'es'
            ? 'bg-white text-sky-700 shadow-xs border border-sky-100'
            : 'text-slate-500 hover:text-slate-800'
        }`}
        title="Español (ES)"
      >
        <span className="text-[11px]">🇪🇸</span>
        <span>ES</span>
      </button>
    </div>
  );
};

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { LanguageCode, TipoMovimiento } from '../types/freezer';
import {
  translations,
  Translations,
  translateCategoryName,
  translateMovementType,
  translateUnitName,
  isSameCategory,
} from './translations';
import {
  formatCantidad,
  formatDate,
  formatUnidad,
} from '../utils/formatters';

interface LanguageContextType {
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  t: Translations;
  translateCategory: (catName: string | any) => string;
  isSameCategory: (catA: string | any, catB: string | any) => boolean;
  translateMovement: (tipo: TipoMovimiento | string) => string;
  translateUnit: (unidad: string, cantidad: number) => string;
  formatDateLocale: (dateStr: string | Date | undefined, includeTime?: boolean) => string;
  formatCantidadLocale: (val: number | string | undefined | null) => string;
  formatUnidadLocale: (cantidad: number, unidad: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// In-memory holder so language survives across component re-renders
let inMemoryLangPreference: LanguageCode = 'de';

export function getInMemoryLangPreference(): LanguageCode {
  return inMemoryLangPreference;
}

export function setInMemoryLangPreference(l: LanguageCode) {
  inMemoryLangPreference = l;
}

interface LanguageProviderProps {
  children: ReactNode;
  initialLang?: LanguageCode;
  onLanguageChange?: (lang: LanguageCode) => void;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  initialLang = inMemoryLangPreference,
  onLanguageChange,
}) => {
  const [lang, setLangState] = useState<LanguageCode>(initialLang);

  const setLang = (newLang: LanguageCode) => {
    inMemoryLangPreference = newLang;
    setLangState(newLang);
    if (onLanguageChange) {
      onLanguageChange(newLang);
    }
  };

  const t = translations[lang];

  const translateCategory = (catName: string | any) =>
    translateCategoryName(catName, lang);

  const translateMovement = (tipo: TipoMovimiento | string) =>
    translateMovementType(tipo, lang);

  const translateUnit = (unidad: string, cantidad: number) =>
    translateUnitName(unidad, cantidad, lang);

  const formatDateLocale = (dateStr: string | Date | undefined, includeTime = true) =>
    formatDate(dateStr, lang, includeTime);

  const formatCantidadLocale = (val: number | string | undefined | null) =>
    formatCantidad(val, lang);

  const formatUnidadLocale = (cantidad: number, unidad: string) =>
    formatUnidad(cantidad, unidad, lang);

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        t,
        translateCategory,
        isSameCategory,
        translateMovement,
        translateUnit,
        formatDateLocale,
        formatCantidadLocale,
        formatUnidadLocale,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

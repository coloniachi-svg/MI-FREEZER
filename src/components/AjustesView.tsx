import React, { useState } from 'react';
import {
  Smartphone,
  RefreshCw,
  Globe,
  Check,
  AlertCircle,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { useLanguage } from '../i18n/LanguageContext';
import { LanguageCode } from '../types/freezer';

interface AjustesViewProps {
  onRefreshAll: () => Promise<void>;
}

export const AjustesView: React.FC<AjustesViewProps> = ({
  onRefreshAll,
}) => {
  const { t, lang, setLang } = useLanguage();
  const [msg, setMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleManualSync = async () => {
    setRefreshing(true);
    try {
      await onRefreshAll();
      setMsg({ text: t.sincronizadoExito, isError: false });
      setTimeout(() => setMsg(null), 3000);
    } catch (err: any) {
      setMsg({ text: err?.message || 'Error', isError: true });
    } finally {
      setRefreshing(false);
    }
  };

  const handleSelectLang = (l: LanguageCode) => {
    setLang(l);
  };

  return (
    <div className="space-y-4 pb-24">
      <div>
        <h2 className="text-lg font-bold text-slate-900">{t.ajustesTitulo}</h2>
        <p className="text-xs text-slate-500">{t.ajustesSubtitulo}</p>
      </div>

      {msg && (
        <div
          className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
            msg.isError
              ? 'bg-rose-50 border border-rose-200 text-rose-700'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
          }`}
        >
          {msg.isError ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <Check className="w-4 h-4 shrink-0" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Idioma / Sprache */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">{t.idiomaSeccionTitulo}</h4>
            <p className="text-xs text-slate-500">{t.idiomaSeccionDesc}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => handleSelectLang('de')}
            className={`p-3 rounded-xl border flex items-center justify-between text-left transition ${
              lang === 'de'
                ? 'bg-sky-50/80 border-sky-500 text-sky-800 font-bold shadow-xs'
                : 'border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">🇩🇪</span>
              <span className="text-xs">Deutsch</span>
            </div>
            {lang === 'de' && <Check className="w-4 h-4 text-sky-600" />}
          </button>

          <button
            type="button"
            onClick={() => handleSelectLang('es')}
            className={`p-3 rounded-xl border flex items-center justify-between text-left transition ${
              lang === 'es'
                ? 'bg-sky-50/80 border-sky-500 text-sky-800 font-bold shadow-xs'
                : 'border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">🇪🇸</span>
              <span className="text-xs">Español</span>
            </div>
            {lang === 'es' && <Check className="w-4 h-4 text-sky-600" />}
          </button>
        </div>
      </div>

      {/* Instalación PWA */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">{t.pwaSeccionTitulo}</h4>
            <p className="text-xs text-slate-500">{t.pwaSeccionDesc}</p>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-600">{t.pwaDisponibilidadLabel}</span>
          <PWAInstallButton />
        </div>
      </div>

      {/* Sincronización */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                {t.sincronizacionSeccionTitulo}
              </h4>
              <p className="text-xs text-slate-500">
                {t.sincronizacionSeccionDesc}
              </p>
            </div>
          </div>

          <button
            onClick={handleManualSync}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 font-semibold text-xs flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{t.sincronizarBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

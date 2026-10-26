import React, { useState } from 'react';
import {
  ShieldCheck,
  Smartphone,
  RefreshCw,
  Globe,
  Lock,
  Check,
  AlertCircle,
} from 'lucide-react';
import { getStoredUserPin, setStoredUserPin } from '../services/backend';
import { PWAInstallButton } from './PWAInstallButton';
import { useLanguage } from '../i18n/LanguageContext';
import { LanguageCode } from '../types/freezer';

interface AjustesViewProps {
  onRefreshAll: () => Promise<void>;
  onLockApp: () => void;
}

export const AjustesView: React.FC<AjustesViewProps> = ({
  onRefreshAll,
  onLockApp,
}) => {
  const { t, lang, setLang } = useLanguage();
  const [newPin, setNewPin] = useState('');
  const [msg, setMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newPin.trim();
    if (!clean) {
      setMsg({ text: t.errorPinVacio, isError: true });
      return;
    }
    setStoredUserPin(clean, true);
    setNewPin('');
    setMsg({ text: t.pinActualizadoExito, isError: false });
    setTimeout(() => setMsg(null), 3000);
  };

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

      {/* Seguridad de Acceso */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">{t.pinSeccionTitulo}</h4>
              <p className="text-xs text-slate-500">{t.pinSeccionDesc}</p>
            </div>
          </div>

          <button
            onClick={onLockApp}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs flex items-center gap-1.5 transition active:scale-95"
            title={t.bloquearBtn}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{t.bloquearBtn}</span>
          </button>
        </div>

        <form onSubmit={handleUpdatePin} className="pt-2 border-t border-slate-100 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.cambiarPinLabel}
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder={t.nuevoPinPlaceholder}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none text-slate-800 transition font-mono tracking-widest text-center"
              />
              <button
                type="submit"
                disabled={!newPin.trim()}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition disabled:opacity-50"
              >
                {t.guardarPinBtn}
              </button>
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            {t.pinActualLabel}{' '}
            <strong className="font-mono text-slate-600">••••</strong>
          </p>
        </form>
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

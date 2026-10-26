import React, { useState } from 'react';
import { Lock, KeyRound, Check, AlertCircle } from 'lucide-react';
import { getStoredUserPin, setStoredUserPin } from '../services/backend';
import { useLanguage } from '../i18n/LanguageContext';

interface PinModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onClose?: () => void;
  title?: string;
  description?: string;
}

export const PinModal: React.FC<PinModalProps> = ({
  isOpen,
  onSuccess,
  onClose,
  title,
  description,
}) => {
  const { t } = useLanguage();
  const currentStored = getStoredUserPin();
  const [pin, setPin] = useState(currentStored);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const modalTitle = title || t.pinModalTitulo;
  const modalDesc = description || t.pinModalDesc;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      setError(t.errorPinVacio);
      return;
    }
    setError(null);
    setStoredUserPin(pin.trim(), remember);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-sky-100 text-slate-800">
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3 shadow-inner">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">{modalTitle}</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">{modalDesc}</p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.pinInputLabel}
            </label>
            <div className="relative">
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder={t.pinInputPlaceholder}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none text-center text-lg tracking-widest font-mono text-slate-800 transition"
                autoFocus
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="rounded text-sky-600 focus:ring-sky-400"
            />
            <span>{t.recordarDispositivo}</span>
          </label>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm transition shadow-sm active:scale-[0.98] flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{t.desbloquearBtn}</span>
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-full py-1 text-xs text-slate-400 hover:text-slate-600"
              >
                {t.cancelar}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

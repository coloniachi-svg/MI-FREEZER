import React, { useState } from 'react';
import { Lock, KeyRound, Check, AlertCircle } from 'lucide-react';
import { getStoredUserPin, setStoredUserPin } from '../services/backend';

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
  title = 'Seguridad de Mi Freezer',
  description = 'Ingresa tu PIN de acceso para sincronizar y modificar el inventario.',
}) => {
  const currentStored = getStoredUserPin();
  const [pin, setPin] = useState(currentStored === '1234' ? '' : currentStored);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      setError('Por favor ingresa tu código PIN.');
      return;
    }
    setError(null);
    setStoredUserPin(pin.trim(), remember);
    onSuccess();
  };

  const handleUseDefault = () => {
    setPin('1234');
    setStoredUserPin('1234', true);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-sky-100 text-slate-800">
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3 shadow-inner">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">{description}</p>
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
              PIN de Acceso
            </label>
            <div className="relative">
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Ej. 1234"
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
            <span>Recordar en este celular / dispositivo</span>
          </label>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm transition shadow-sm active:scale-[0.98] flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Desbloquear y Conectar</span>
            </button>

            <button
              type="button"
              onClick={handleUseDefault}
              className="w-full py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
            >
              Usar PIN inicial por defecto (1234)
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-full py-1 text-xs text-slate-400 hover:text-slate-600"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

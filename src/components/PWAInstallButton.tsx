import React, { useState } from 'react';
import { Download, Share2, X, Smartphone, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  // If already installed or running as standalone, don't show
  if (isInstalled) return null;

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-sky-700 bg-sky-100 hover:bg-sky-200 active:scale-95 rounded-full transition shadow-xs"
        title="Instalar Mi Freezer en este dispositivo"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Instalar App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-sky-700 bg-sky-100 hover:bg-sky-200 active:scale-95 rounded-full transition shadow-xs"
          title="Instalar en iPhone / iPad"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Instalar PWA</span>
        </button>

        {showIOSModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-sky-100 text-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xl">❄️</span>
                  <h3 className="font-semibold text-slate-900">Instalar en tu iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-sky-50/70 border border-sky-100">
                  <div className="p-1.5 rounded-lg bg-sky-500 text-white shrink-0 mt-0.5">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">1. Toca el botón Compartir</p>
                    <p className="text-xs text-slate-500">En la barra inferior de Safari.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-sky-50/70 border border-sky-100">
                  <div className="p-1.5 rounded-lg bg-sky-500 text-white shrink-0 mt-0.5">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">2. Elige "Agregar a Inicio"</p>
                    <p className="text-xs text-slate-500">Desplaza hacia abajo en las opciones.</p>
                  </div>
                </div>

                <p className="text-xs text-slate-500 text-center pt-1">
                  ¡Listo! Podrás abrir <strong>Mi Freezer</strong> a pantalla completa como una app nativa.
                </p>
              </div>

              <button
                onClick={() => setShowIOSModal(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-medium text-sm transition shadow-sm active:scale-[0.98]"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

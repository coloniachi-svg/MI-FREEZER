import React, { useState } from 'react';
import { Download, Share2, X, Smartphone, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useLanguage } from '../i18n/LanguageContext';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { t } = useLanguage();
  const [showIOSModal, setShowIOSModal] = useState(false);

  // If already installed or running as standalone, don't show
  if (isInstalled) return null;

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-sky-700 bg-sky-100 hover:bg-sky-200 active:scale-95 rounded-full transition shadow-xs"
        title={t.instalarApp}
      >
        <Download className="w-3.5 h-3.5" />
        <span>{t.instalarApp}</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-sky-700 bg-sky-100 hover:bg-sky-200 active:scale-95 rounded-full transition shadow-xs"
          title={t.instalarPWA}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>{t.instalarPWA}</span>
        </button>

        {showIOSModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-sky-100 text-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xl">❄️</span>
                  <h3 className="font-semibold text-slate-900">{t.instalarIosTitulo}</h3>
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
                    <p className="font-medium text-slate-900">{t.paso1IosTitulo}</p>
                    <p className="text-xs text-slate-500">{t.paso1IosDesc}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-sky-50/70 border border-sky-100">
                  <div className="p-1.5 rounded-lg bg-sky-500 text-white shrink-0 mt-0.5">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{t.paso2IosTitulo}</p>
                    <p className="text-xs text-slate-500">{t.paso2IosDesc}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-500 text-center pt-1">
                  {t.iosListoDesc}
                </p>
              </div>

              <button
                onClick={() => setShowIOSModal(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-medium text-sm transition shadow-sm active:scale-[0.98]"
              >
                {t.entendidoBtn}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

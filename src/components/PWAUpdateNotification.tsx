import React, { useState } from 'react';
import { RefreshCw, X, Loader2 } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useLanguage } from '../i18n/LanguageContext';

export const PWAUpdateNotification: React.FC = () => {
  const { t } = useLanguage();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('freezer_pwa_update_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;

      // Check for updates periodically (every 60 minutes)
      const interval = setInterval(() => {
        if (navigator.onLine) {
          registration.update().catch(() => {});
        }
      }, 60 * 60 * 1000);

      // Check when user brings the tab or installed PWA app back to foreground
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible' && navigator.onLine) {
          registration.update().catch(() => {});
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
    },
    onRegisterError(error) {
      console.warn('PWA service worker registration error:', error);
    },
  });

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      // Clear dismissed flag for subsequent updates
      try {
        sessionStorage.removeItem('freezer_pwa_update_dismissed');
      } catch {
        // ignore
      }

      // Activate waiting service worker and reload
      await updateServiceWorker(true);
    } catch (err) {
      console.error('Error activating updated service worker:', err);
      // Fallback reload
      window.location.reload();
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem('freezer_pwa_update_dismissed', 'true');
    } catch {
      // ignore
    }
    setNeedRefresh(false);
  };

  // Only show when a real update is ready and hasn't been dismissed in this session
  if (!needRefresh || isDismissed) {
    return null;
  }

  return (
    <div
      role="alert"
      className="bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-700 text-white shadow-md border-b border-sky-400/30 animate-in slide-in-from-top-2 duration-200 z-20"
    >
      <div className="max-w-xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-inner">
            <RefreshCw
              className={`w-4 h-4 text-white ${isUpdating ? 'animate-spin' : ''}`}
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold leading-tight truncate text-white">
              {t.pwaUpdateTitulo}
            </p>
            <p className="text-[11px] text-sky-100 leading-tight truncate mt-0.5">
              {t.pwaUpdateDesc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="px-3 py-1.5 rounded-xl bg-white text-sky-700 hover:bg-sky-50 active:scale-95 font-bold text-xs shadow-sm transition flex items-center gap-1.5 disabled:opacity-75 cursor-pointer"
          >
            {isUpdating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            <span>{isUpdating ? t.pwaUpdateActualizando : t.pwaUpdateBtn}</span>
          </button>

          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 active:scale-90 transition cursor-pointer"
            title={t.cancelar}
            aria-label={t.cancelar}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

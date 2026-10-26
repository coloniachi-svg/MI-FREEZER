import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useLanguage } from '../i18n/LanguageContext';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { t } = useLanguage();

  if (isOnline) return null;

  return (
    <div className="sticky top-0 z-50 bg-amber-500 text-white px-4 py-2.5 text-xs font-semibold shadow-md flex items-center justify-center gap-2 animate-in slide-in-from-top">
      <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
      <span>{t.offlineAviso}</span>
    </div>
  );
};

import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="sticky top-0 z-50 bg-amber-500 text-white px-4 py-2.5 text-xs font-semibold shadow-md flex items-center justify-center gap-2 animate-in slide-in-from-top">
      <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
      <span>Sin conexión a internet — No se pueden guardar cambios hasta reconectar.</span>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Trash2, AlertTriangle, Loader2, X } from 'lucide-react';
import { Producto } from '../types/freezer';
import { useLanguage } from '../i18n/LanguageContext';

interface QuitarProductoModalProps {
  isOpen: boolean;
  producto: Producto | null;
  onClose: () => void;
  onConfirm: (productoId: string | number) => Promise<void>;
}

export const QuitarProductoModal: React.FC<QuitarProductoModalProps> = ({
  isOpen,
  producto,
  onClose,
  onConfirm,
}) => {
  const { t, lang } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen || !producto) return null;

  const esSaldoMayorACero = producto.Saldo > 0;

  const handleConfirmar = async () => {
    if (esSaldoMayorACero) {
      setError(t.errorSaldoMayorACero);
      return;
    }

    setError(null);
    try {
      setLoading(true);
      await onConfirm(producto.ID);
      onClose();
    } catch (err: any) {
      setError(err?.message || (lang === 'de' ? 'Fehler beim Löschen.' : 'Error al eliminar el producto.'));
    } finally {
      setLoading(false);
    }
  };

  const titulo = t.eliminarProductoTitulo;
  const desc = t.eliminarProductoDesc.replace('{producto}', producto.Producto);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-rose-100 text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-rose-600">
            <Trash2 className="w-5 h-5" />
            <h3 className="font-bold text-slate-900 text-base leading-snug">
              {titulo}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 rounded-full text-slate-400 hover:bg-slate-100 transition disabled:opacity-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 flex items-start gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-4 space-y-4">
          <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200/80 text-xs space-y-2">
            <p className="font-bold text-slate-900 text-sm">
              {producto.Producto}
            </p>
            <p className="text-slate-600 leading-relaxed">
              {desc}
            </p>
          </div>

          {esSaldoMayorACero && (
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{t.errorSaldoMayorACero}</span>
            </div>
          )}

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-1/2 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer"
            >
              {t.cancelar}
            </button>
            <button
              type="button"
              onClick={handleConfirmar}
              disabled={loading || esSaldoMayorACero}
              className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition shadow-sm active:scale-[0.98] flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{t.eliminando}</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.eliminarProductoBtn}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const EliminarProductoModal = QuitarProductoModal;

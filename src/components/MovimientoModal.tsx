import React, { useState } from 'react';
import { Minus, Plus, Loader2, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { Producto, TipoMovimiento } from '../types/freezer';
import { parseDecimalInput } from '../utils/formatters';
import { useLanguage } from '../i18n/LanguageContext';

interface MovimientoModalProps {
  isOpen: boolean;
  producto: Producto | null;
  tipo: TipoMovimiento; // 'SALIDA' | 'ENTRADA'
  onClose: () => void;
  onConfirm: (cantidad: number, observacion: string) => Promise<void>;
}

export const MovimientoModal: React.FC<MovimientoModalProps> = ({
  isOpen,
  producto,
  tipo,
  onClose,
  onConfirm,
}) => {
  const { t, formatCantidadLocale, formatUnidadLocale } = useLanguage();
  const [cantidadStr, setCantidadStr] = useState<string>('1');
  const [observacion, setObservacion] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !producto) return null;

  const isSalida = tipo === 'SALIDA';
  const available = producto.Saldo;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cantidad = parseDecimalInput(cantidadStr);

    if (isNaN(cantidad) || cantidad <= 0) {
      setError(t.errorCantidadInvalida);
      return;
    }

    if (isSalida && cantidad > available) {
      setError(
        `${t.errorRetirarMasDeDisponible} (${formatUnidadLocale(available, producto.Unidad)}).`
      );
      return;
    }

    try {
      setLoading(true);
      await onConfirm(cantidad, observacion);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Error al registrar el movimiento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-sky-100 text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl text-white ${
                isSalida ? 'bg-amber-500 shadow-amber-200' : 'bg-emerald-500 shadow-emerald-200'
              } shadow-sm`}
            >
              {isSalida ? (
                <Minus className="w-5 h-5 stroke-[2.5]" />
              ) : (
                <Plus className="w-5 h-5 stroke-[2.5]" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">
                {isSalida ? t.retirarTitulo : t.agregarTitulo}
              </h3>
              <p className="text-xs text-slate-500 font-medium truncate max-w-[200px]">
                {producto.Producto}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 rounded-full text-slate-400 hover:bg-slate-100 transition disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current status pill */}
        <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">{t.disponibleActual}</span>
          <span className="font-bold text-slate-800 text-sm">
            {formatUnidadLocale(available, producto.Unidad)}
          </span>
        </div>

        {error && (
          <div className="mt-3 flex items-start gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isSalida ? t.cantidadRetirar : t.cantidadAgregar} ({producto.Unidad})
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={cantidadStr}
                onChange={(e) => setCantidadStr(e.target.value)}
                placeholder="0,0"
                disabled={loading}
                autoFocus
                className="w-full text-center text-2xl font-bold py-2.5 px-3 rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none text-slate-800 transition"
              />
            </div>
            <div className="mt-2 flex items-center justify-center gap-2">
              {[0.5, 1, 2, 5].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  disabled={loading}
                  onClick={() => setCantidadStr(preset.toString().replace('.', ','))}
                  className="px-2.5 py-1 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 active:scale-95 rounded-lg border border-sky-200 transition"
                >
                  +{formatCantidadLocale(preset)}
                </button>
              ))}
              {isSalida && available > 0 && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setCantidadStr(available.toString().replace('.', ','))}
                  className="px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 active:scale-95 rounded-lg border border-amber-200 transition"
                >
                  {t.todo} ({formatCantidadLocale(available)})
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.observacionLabel} <span className="font-normal text-slate-400">({t.opcional})</span>
            </label>
            <input
              type="text"
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder={isSalida ? t.obsPlaceholderRetirar : t.obsPlaceholderAgregar}
              disabled={loading}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none text-slate-800 transition"
            />
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-1/2 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition"
            >
              {t.cancelar}
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`w-1/2 py-2.5 rounded-xl text-white font-semibold text-sm transition shadow-sm active:scale-[0.98] flex items-center justify-center gap-1.5 ${
                isSalida
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              } disabled:opacity-50`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t.guardando}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSalida ? t.retirarProducto : t.agregarProducto}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

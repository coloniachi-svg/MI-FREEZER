import React, { useState, useEffect } from 'react';
import {
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Archive,
  Sliders,
  Edit3,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import { Categoria, EditarProductoDTO, Producto } from '../types/freezer';
import { parseDecimalInput, getCategoryEmoji } from '../utils/formatters';
import { useLanguage } from '../i18n/LanguageContext';
import { EmojiSelector } from './EmojiSelector';

interface EditarProductoModalProps {
  isOpen: boolean;
  producto: Producto | null;
  categorias: Categoria[];
  onClose: () => void;
  onEditar: (dto: EditarProductoDTO) => Promise<void>;
  onAjustarSaldo: (productoId: string | number, nuevoSaldo: number, observacion: string) => Promise<void>;
  onEliminar: (productoId: string | number) => Promise<void>;
}

export const EditarProductoModal: React.FC<EditarProductoModalProps> = ({
  isOpen,
  producto,
  categorias,
  onClose,
  onEditar,
  onAjustarSaldo,
  onEliminar,
}) => {
  const { t, formatUnidadLocale, translateCategory, lang } = useLanguage();

  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [emoji, setEmoji] = useState('');
  const [minimoStr, setMinimoStr] = useState('1');
  const [nuevoSaldoStr, setNuevoSaldoStr] = useState('0');
  const [ajusteObs, setAjusteObs] = useState('');

  const [activeTab, setActiveTab] = useState<'info' | 'ajuste' | 'archivar'>('info');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && producto) {
      setNombre(producto.Producto || '');
      setCategoria(producto.Categoria || '');
      setEmoji(producto.Emoji || producto.emoji || '');
      setMinimoStr(producto.Minimo !== undefined ? producto.Minimo.toString().replace('.', ',') : '1');
      setNuevoSaldoStr(producto.Saldo !== undefined ? producto.Saldo.toString().replace('.', ',') : '0');
      setAjusteObs('');
      setActiveTab('info');
      setError(null);
      setLoading(false);
    }
  }, [isOpen, producto]);

  if (!isOpen || !producto) return null;

  const esSaldoMayorACero = producto.Saldo > 0;

  // Handle edit basic info
  const handleGuardarDatos = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const nombreLimpio = nombre.trim();
    if (!nombreLimpio) {
      setError(t.errorNombreVacio);
      return;
    }
    const minimo = parseDecimalInput(minimoStr);
    if (isNaN(minimo) || minimo < 0) {
      setError(t.errorMinimoInvalido);
      return;
    }

    try {
      setLoading(true);
      await onEditar({
        id: producto.ID,
        producto: nombreLimpio,
        categoria: categoria.trim(),
        minimo,
        emoji: emoji.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar el producto.');
    } finally {
      setLoading(false);
    }
  };

  // Handle stock balance adjustment (AJUSTE)
  const handleAjusteSaldo = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const nuevoSaldo = parseDecimalInput(nuevoSaldoStr);
    if (isNaN(nuevoSaldo) || nuevoSaldo < 0) {
      setError(t.errorSaldoInvalido);
      return;
    }

    try {
      setLoading(true);
      await onAjustarSaldo(
        producto.ID,
        nuevoSaldo,
        ajusteObs.trim() || 'Ajuste manual de saldo en inventario'
      );
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Error al registrar el ajuste de saldo.');
    } finally {
      setLoading(false);
    }
  };

  // Handle definitive deletion
  const handleConfirmarEliminar = async () => {
    if (esSaldoMayorACero) {
      setError(t.errorSaldoMayorACero);
      return;
    }

    setError(null);
    try {
      setLoading(true);
      await onEliminar(producto.ID);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar el producto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl border border-sky-100 text-slate-800 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100 flex items-center gap-1 w-fit">
              <span>{getCategoryEmoji(producto.Categoria, categorias)}</span>
              <span>{translateCategory(producto.Categoria)}</span>
            </span>
            <h3 className="font-bold text-slate-900 text-base leading-tight mt-1">
              {producto.Producto}
            </h3>
            <p className="text-xs text-slate-500">
              {t.saldoActualLabel}{' '}
              <span className="font-bold text-slate-700">
                {formatUnidadLocale(producto.Saldo, producto.Unidad)}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 rounded-full text-slate-400 hover:bg-slate-100 transition disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-100 mt-3">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-2 text-xs font-semibold border-b-2 transition flex items-center justify-center gap-1.5 ${
              activeTab === 'info'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{t.tabDatos}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ajuste')}
            className={`flex-1 py-2 text-xs font-semibold border-b-2 transition flex items-center justify-center gap-1.5 ${
              activeTab === 'ajuste'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{t.tabAjuste}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('archivar')}
            className={`flex-1 py-2 text-xs font-semibold border-b-2 transition flex items-center justify-center gap-1.5 ${
              activeTab === 'archivar'
                ? 'border-rose-600 text-rose-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{lang === 'de' ? 'Produkt entfernen' : 'Eliminar producto'}</span>
          </button>
        </div>

        {error && (
          <div className="mt-3 flex items-start gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab 1: Edit info */}
        {activeTab === 'info' && (
          <form onSubmit={handleGuardarDatos} className="mt-4 space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.nombreProductoLabel}
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none text-slate-800 transition"
              />
            </div>

            <EmojiSelector
              value={emoji}
              onChange={setEmoji}
              defaultEmojiSuggestion="Auto 🥩/🥖/🥦"
              label="Emoji personalizado"
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.categoriaLabel}
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none text-slate-800 transition cursor-pointer"
              >
                {categorias.map((c) => (
                  <option key={c.id || c.nombre} value={c.nombre}>
                    {getCategoryEmoji(c, categorias)} {translateCategory(c.nombre)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.alertaMinimoLabel} ({producto.Unidad})
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={minimoStr}
                onChange={(e) => setMinimoStr(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none text-slate-800 transition font-semibold"
              />
            </div>

            <p className="text-[11px] text-slate-400 italic">
              {t.notaModificarSaldo}
            </p>

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
                className="w-1/2 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm transition shadow-sm active:scale-[0.98] flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t.guardando}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t.guardarCambios}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Ajuste de saldo */}
        {activeTab === 'ajuste' && (
          <form onSubmit={handleAjusteSaldo} className="mt-4 space-y-3.5">
            <div className="p-3 rounded-xl bg-sky-50/80 border border-sky-100 text-xs text-sky-800">
              <p className="font-semibold mb-0.5">{t.infoAjusteTitulo}</p>
              <p className="text-[11px] text-sky-700">
                {t.infoAjusteDesc}
              </p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500">{t.saldoRegistradoActualmente}</span>
              <span className="text-sm font-bold text-slate-800">
                {formatUnidadLocale(producto.Saldo, producto.Unidad)}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.nuevoSaldoExactoLabel} ({producto.Unidad})
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={nuevoSaldoStr}
                onChange={(e) => setNuevoSaldoStr(e.target.value)}
                placeholder="0"
                disabled={loading}
                autoFocus
                className="w-full text-center text-2xl font-bold py-2.5 px-3 rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none text-slate-800 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.motivoAjusteLabel} <span className="font-normal text-slate-400">({t.opcional})</span>
              </label>
              <input
                type="text"
                value={ajusteObs}
                onChange={(e) => setAjusteObs(e.target.value)}
                placeholder={t.motivoAjustePlaceholder}
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
                className="w-1/2 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm transition shadow-sm active:scale-[0.98] flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t.guardando}</span>
                  </>
                ) : (
                  <>
                    <Sliders className="w-4 h-4" />
                    <span>{t.registrarAjusteBtn}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Eliminar definitivamente */}
        {activeTab === 'archivar' && (
          <div className="mt-4 space-y-4">
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold">
                  {t.eliminarProductoTitulo}
                </p>
                <p className="text-rose-700 leading-relaxed">
                  {t.eliminarProductoDesc.replace('{producto}', producto.Producto)}
                </p>
              </div>
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
                className="w-1/2 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition cursor-pointer"
              >
                {t.cancelar}
              </button>
              <button
                type="button"
                onClick={handleConfirmarEliminar}
                disabled={loading || esSaldoMayorACero}
                className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm transition shadow-sm active:scale-[0.98] flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t.eliminando}</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>{t.eliminarProductoBtn}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

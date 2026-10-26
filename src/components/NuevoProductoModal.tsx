import React, { useState } from 'react';
import { Plus, Loader2, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { Categoria, CrearProductoDTO, Producto, UnidadMedida } from '../types/freezer';
import { parseDecimalInput } from '../utils/formatters';
import { useLanguage } from '../i18n/LanguageContext';

interface NuevoProductoModalProps {
  isOpen: boolean;
  categorias: Categoria[];
  productosExistentes: Producto[];
  onClose: () => void;
  onCrear: (dto: CrearProductoDTO) => Promise<void>;
  onCrearCategoria: (categoria: string) => Promise<void>;
}

export const NuevoProductoModal: React.FC<NuevoProductoModalProps> = ({
  isOpen,
  categorias,
  productosExistentes,
  onClose,
  onCrear,
  onCrearCategoria,
}) => {
  const { t, lang, translateCategory } = useLanguage();
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [nuevaCat, setNuevaCat] = useState('');
  const [mostrandoNuevaCat, setMostrandoNuevaCat] = useState(false);
  const [unidad, setUnidad] = useState<UnidadMedida>('kg');
  const [saldoStr, setSaldoStr] = useState('1');
  const [minimoStr, setMinimoStr] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const defaultCat =
    categoria || (categorias.length > 0 ? categorias[0].nombre : 'Carnes');

  const unidadesList: { value: UnidadMedida; label: string }[] =
    lang === 'de'
      ? [
          { value: 'kg', label: 'Kilogramm (kg)' },
          { value: 'g', label: 'Gramm (g)' },
          { value: 'unidad', label: 'Stück (Stk)' },
          { value: 'litro', label: 'Liter (l)' },
        ]
      : [
          { value: 'kg', label: 'Kilogramos (kg)' },
          { value: 'g', label: 'Gramos (g)' },
          { value: 'unidad', label: 'Unidades (u)' },
          { value: 'litro', label: 'Litros (l)' },
        ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const nombreLimpio = nombre.trim();
    if (!nombreLimpio) {
      setError(t.errorNombreVacio);
      return;
    }

    // Check duplicate active name
    const duplicado = productosExistentes.some(
      (p) => p.Producto.trim().toLowerCase() === nombreLimpio.toLowerCase()
    );
    if (duplicado) {
      setError(`${t.errorNombreDuplicado} "${nombreLimpio}".`);
      return;
    }

    let finalCategoria = mostrandoNuevaCat ? nuevaCat.trim() : defaultCat;
    if (!finalCategoria) {
      finalCategoria = 'Otros';
    }

    const saldo = parseDecimalInput(saldoStr);
    const minimo = parseDecimalInput(minimoStr);

    if (isNaN(saldo) || saldo < 0) {
      setError(t.errorSaldoInvalido);
      return;
    }

    if (isNaN(minimo) || minimo < 0) {
      setError(t.errorMinimoInvalido);
      return;
    }

    try {
      setLoading(true);

      // If user created a new category inline, save it too
      if (mostrandoNuevaCat && nuevaCat.trim()) {
        const catExiste = categorias.some(
          (c) => c.nombre.toLowerCase() === nuevaCat.trim().toLowerCase()
        );
        if (!catExiste) {
          try {
            await onCrearCategoria(nuevaCat.trim());
          } catch {
            // continue even if category creation has minor issue
          }
        }
      }

      await onCrear({
        producto: nombreLimpio,
        categoria: finalCategoria,
        unidad,
        saldo,
        minimo,
      });

      onClose();
    } catch (err: any) {
      setError(err?.message || 'Error al guardar el producto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl border border-sky-100 text-slate-800 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-500 text-white shadow-sm shadow-sky-200">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">
                {t.nuevoProductoTitulo}
              </h3>
              <p className="text-xs text-slate-500">
                {t.nuevoProductoSubtitulo}
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

        {error && (
          <div className="mt-3 flex items-start gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Nombre */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.nombreProductoLabel}
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder={t.nombreProductoPlaceholder}
              disabled={loading}
              autoFocus
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none text-slate-800 transition"
            />
          </div>

          {/* Categoría */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                {t.categoriaLabel}
              </label>
              <button
                type="button"
                onClick={() => setMostrandoNuevaCat(!mostrandoNuevaCat)}
                className="text-[11px] font-medium text-sky-600 hover:text-sky-800 transition"
              >
                {mostrandoNuevaCat ? t.elegirExistente : t.crearNueva}
              </button>
            </div>

            {mostrandoNuevaCat ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nuevaCat}
                  onChange={(e) => setNuevaCat(e.target.value)}
                  placeholder={t.nuevaCatPlaceholder}
                  disabled={loading}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-sky-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none text-slate-800 transition"
                />
              </div>
            ) : (
              <select
                value={categoria || defaultCat}
                onChange={(e) => setCategoria(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none text-slate-800 transition cursor-pointer"
              >
                {categorias.map((c) => (
                  <option key={c.id || c.nombre} value={c.nombre}>
                    {translateCategory(c.nombre)}
                  </option>
                ))}
                {categorias.length === 0 && (
                  <>
                    <option value="Carnes">{translateCategory('Carnes')}</option>
                    <option value="Panificados">{translateCategory('Panificados')}</option>
                    <option value="Verduras">{translateCategory('Verduras')}</option>
                    <option value="Frutas">{translateCategory('Frutas')}</option>
                    <option value="Comidas preparadas">{translateCategory('Comidas preparadas')}</option>
                    <option value="Otros">{translateCategory('Otros')}</option>
                  </>
                )}
              </select>
            )}
          </div>

          {/* Unidad */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.unidadMedidaLabel}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {unidadesList.map((u) => (
                <button
                  key={u.value}
                  type="button"
                  disabled={loading}
                  onClick={() => setUnidad(u.value)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-medium border text-left transition ${
                    unidad === u.value
                      ? 'bg-sky-50 border-sky-500 text-sky-800 font-semibold shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cantidad Inicial y Mínimo */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.cantidadInicialLabel} ({unidad})
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={saldoStr}
                onChange={(e) => setSaldoStr(e.target.value)}
                placeholder="0"
                disabled={loading}
                className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none text-slate-800 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.alertaMinimoLabel} ({unidad})
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={minimoStr}
                onChange={(e) => setMinimoStr(e.target.value)}
                placeholder="1"
                disabled={loading}
                className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none text-slate-800 transition"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center gap-2">
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
                  <span>{t.guardarProductoBtn}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

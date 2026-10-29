import React, { useState } from 'react';
import { Trash2, AlertTriangle, Loader2, ArrowRightLeft, X } from 'lucide-react';
import { Categoria, Producto } from '../types/freezer';
import { useLanguage } from '../i18n/LanguageContext';

interface EliminarCategoriaModalProps {
  isOpen: boolean;
  categoria: Categoria | null;
  categoriasExistentes: Categoria[];
  productos: Producto[];
  onClose: () => void;
  onConfirmarEliminar: (catId: string | number, catNombre: string, targetCatNombre?: string) => Promise<void>;
}

export const EliminarCategoriaModal: React.FC<EliminarCategoriaModalProps> = ({
  isOpen,
  categoria,
  categoriasExistentes,
  productos,
  onClose,
  onConfirmarEliminar,
}) => {
  const { t, translateCategory, isSameCategory } = useLanguage();

  if (!isOpen || !categoria) return null;

  const catNombre = categoria.nombre || '';
  const catVisual = translateCategory(catNombre);

  // Active non-archived products in this category (both stock > 0 and stock === 0)
  const productosAsociados = productos.filter((p) =>
    isSameCategory(p.Categoria, catNombre) && p.Estado !== 'ARCHIVADO'
  );
  const totalProductos = productosAsociados.length;

  // Other categories available to reassign products
  const otrasCategorias = categoriasExistentes.filter(
    (c) => c.id !== categoria.id && !isSameCategory(c.nombre, catNombre)
  );

  const [targetCategoria, setTargetCategoria] = useState<string>(
    otrasCategorias.length > 0 ? otrasCategorias[0].nombre : ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEliminar = async () => {
    setError(null);
    try {
      setLoading(true);
      if (totalProductos > 0 && !targetCategoria) {
        setError('Selecciona la categoría a la cual deseas trasladar los productos.');
        return;
      }

      await onConfirmarEliminar(
        categoria.id,
        catNombre,
        totalProductos > 0 ? targetCategoria : undefined
      );
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar la categoría.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-rose-100 text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-rose-600">
            <Trash2 className="w-5 h-5" />
            <h3 className="font-bold text-slate-900 text-base">
              Eliminar Categoría
            </h3>
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
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-4 space-y-4">
          {totalProductos === 0 ? (
            /* Safe to delete immediately */
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
              <p className="font-bold text-slate-800">
                ¿Deseas eliminar la categoría <span className="text-rose-600">"{catVisual}"</span>?
              </p>
              <p>
                Esta categoría no contiene productos asociados. Se eliminará de forma segura.
              </p>
            </div>
          ) : (
            /* Requires reassigning products first */
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Categoría con {totalProductos} producto(s)</span>
                </p>
                <p className="leading-relaxed">
                  Para no perder la organización de tus alimentos ni su historial, selecciona la categoría de destino a la cual trasladar los {totalProductos} producto(s) registrados:
                </p>
              </div>

              {otrasCategorias.length === 0 ? (
                <p className="text-xs text-rose-600 font-semibold">
                  Debes crear al menos otra categoría antes de poder trasladar los productos y eliminar esta.
                </p>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Trasladar productos a:
                  </label>
                  <select
                    value={targetCategoria}
                    onChange={(e) => setTargetCategoria(e.target.value)}
                    disabled={loading}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none text-slate-800 transition cursor-pointer font-semibold"
                  >
                    {otrasCategorias.map((c) => (
                      <option key={c.id || c.nombre} value={c.nombre}>
                        {translateCategory(c.nombre)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-1/2 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
            >
              {t.cancelar}
            </button>
            <button
              type="button"
              onClick={handleEliminar}
              disabled={loading || (totalProductos > 0 && otrasCategorias.length === 0)}
              className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition shadow-sm active:scale-[0.98] flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Eliminando...</span>
                </>
              ) : totalProductos > 0 ? (
                <>
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Trasladar y eliminar</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar categoría</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

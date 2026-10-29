import React, { useState } from 'react';
import { Plus, Loader2, AlertCircle, CheckCircle2, Edit3, Trash2 } from 'lucide-react';
import { Categoria, Producto } from '../types/freezer';
import { getCategoryEmoji } from '../utils/formatters';
import { useLanguage } from '../i18n/LanguageContext';
import { EditarCategoriaModal } from './EditarCategoriaModal';
import { EliminarCategoriaModal } from './EliminarCategoriaModal';
import { EmojiSelector } from './EmojiSelector';

interface CategoriasViewProps {
  categorias: Categoria[];
  productos: Producto[];
  onCrearCategoria: (nombre: string, emoji?: string) => Promise<void>;
  onEditarCategoria: (id: string | number, nuevoNombre: string, nuevoEmoji: string) => Promise<void>;
  onEliminarCategoria: (catId: string | number, catNombre: string, targetCatNombre?: string) => Promise<void>;
  onSelectCategoria: (nombre: string) => void;
}

export const CategoriasView: React.FC<CategoriasViewProps> = ({
  categorias,
  productos,
  onCrearCategoria,
  onEditarCategoria,
  onEliminarCategoria,
  onSelectCategoria,
}) => {
  const { t, translateCategory, isSameCategory } = useLanguage();
  const [nuevaCat, setNuevaCat] = useState('');
  const [nuevoEmoji, setNuevoEmoji] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modals state
  const [catAEditar, setCatAEditar] = useState<Categoria | null>(null);
  const [catAEliminar, setCatAEliminar] = useState<Categoria | null>(null);

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const limpio = nuevaCat.trim();
    if (!limpio) {
      setError(t.errorNombreCategoriaVacio);
      return;
    }

    const existe = categorias.some((c) => isSameCategory(c.nombre, limpio));

    if (existe) {
      setError(t.errorCategoriaExiste);
      return;
    }

    try {
      setLoading(true);
      await onCrearCategoria(limpio, nuevoEmoji.trim());
      setNuevaCat('');
      setNuevoEmoji('');
      setSuccessMsg(t.categoriaCreadaExito);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setError(err?.message || 'Error al guardar la categoría.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-24">
      <div>
        <h2 className="text-lg font-bold text-slate-900">{t.categoriasTitulo}</h2>
        <p className="text-xs text-slate-500">
          {t.categoriasSubtitulo}
        </p>
      </div>

      {/* Formulario crear categoría */}
      <form
        onSubmit={handleCrear}
        className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3"
      >
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5 text-sky-600" />
          <span>{t.nuevaCategoriaTitulo}</span>
        </h4>

        {error && (
          <div className="flex items-start gap-2 p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-start gap-2 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={nuevaCat}
              onChange={(e) => setNuevaCat(e.target.value)}
              placeholder={t.nuevaCategoriaPlaceholder}
              disabled={loading}
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none text-slate-800 transition"
            />
            <button
              type="submit"
              disabled={loading || !nuevaCat.trim()}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              <span>{t.crearCategoriaBtn}</span>
            </button>
          </div>

          <EmojiSelector
            value={nuevoEmoji}
            onChange={setNuevoEmoji}
            defaultEmojiSuggestion="❄️"
            label="Emoji opcional de la nueva categoría"
          />
        </div>
      </form>

      {/* Grid de categorías */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {categorias.map((cat) => {
          const rawNombre = cat.nombre || '';
          const nombreVisual = translateCategory(rawNombre);

          // Active products count with Saldo > 0
          const countInStock = productos.filter(
            (p) => isSameCategory(p.Categoria, rawNombre) && p.Saldo > 0 && p.Estado !== 'ARCHIVADO'
          ).length;

          // Total non-archived products count (both > 0 and === 0)
          const countTotal = productos.filter(
            (p) => isSameCategory(p.Categoria, rawNombre) && p.Estado !== 'ARCHIVADO'
          ).length;

          return (
            <div
              key={cat.id || rawNombre}
              onClick={() => onSelectCategoria(rawNombre)}
              className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-sky-300 transition flex items-center justify-between cursor-pointer group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="text-2xl p-2 rounded-xl bg-sky-50/70 border border-sky-100 group-hover:scale-105 transition shrink-0">
                  {getCategoryEmoji(cat, categorias)}
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-slate-800 text-sm group-hover:text-sky-700 transition truncate">
                    {nombreVisual}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {countInStock} {countInStock === 1 ? t.productoActivo : t.productosActivos}
                    {countTotal > countInStock && (
                      <span className="ml-1 font-semibold text-slate-500">
                        ({countTotal} total)
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Action buttons: Edit, Delete, View */}
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCatAEditar(cat);
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition cursor-pointer"
                  title="Editar categoría"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCatAEliminar(cat);
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  title="Eliminar categoría"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <span className="text-xs font-semibold text-sky-600 bg-sky-50 px-2 py-1 rounded-lg group-hover:bg-sky-100 transition hidden xs:inline-block">
                  {t.verCategoriaBtn}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Category Modal */}
      <EditarCategoriaModal
        isOpen={!!catAEditar}
        categoria={catAEditar}
        categoriasExistentes={categorias}
        onClose={() => setCatAEditar(null)}
        onGuardar={async (id, nuevoNombre, nuevoEmoji) => {
          await onEditarCategoria(id, nuevoNombre, nuevoEmoji);
        }}
      />

      {/* Delete Category Modal */}
      <EliminarCategoriaModal
        isOpen={!!catAEliminar}
        categoria={catAEliminar}
        categoriasExistentes={categorias}
        productos={productos}
        onClose={() => setCatAEliminar(null)}
        onConfirmarEliminar={async (catId, catNombre, targetCatNombre) => {
          await onEliminarCategoria(catId, catNombre, targetCatNombre);
        }}
      />
    </div>
  );
};

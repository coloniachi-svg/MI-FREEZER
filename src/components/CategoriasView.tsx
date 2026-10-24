import React, { useState } from 'react';
import { Tag, Plus, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Categoria, Producto } from '../types/freezer';
import { getCategoryEmoji } from '../utils/formatters';

interface CategoriasViewProps {
  categorias: Categoria[];
  productos: Producto[];
  onCrearCategoria: (nombre: string) => Promise<void>;
  onSelectCategoria: (nombre: string) => void;
}

export const CategoriasView: React.FC<CategoriasViewProps> = ({
  categorias,
  productos,
  onCrearCategoria,
  onSelectCategoria,
}) => {
  const [nuevaCat, setNuevaCat] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const limpio = nuevaCat.trim();
    if (!limpio) {
      setError('Escribe el nombre de la categoría.');
      return;
    }

    const existe = categorias.some(
      (c) => c.Categoria.toLowerCase() === limpio.toLowerCase()
    );
    if (existe) {
      setError(`La categoría "${limpio}" ya existe.`);
      return;
    }

    try {
      setLoading(true);
      await onCrearCategoria(limpio);
      setNuevaCat('');
      setSuccessMsg(`Categoría "${limpio}" creada correctamente.`);
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
        <h2 className="text-lg font-bold text-slate-900">Categorías de Alimentos</h2>
        <p className="text-xs text-slate-500">
          Organiza tus alimentos congelados por sectores
        </p>
      </div>

      {/* Formulario crear categoría */}
      <form
        onSubmit={handleCrear}
        className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3"
      >
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5 text-sky-600" />
          <span>Nueva Categoría</span>
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

        <div className="flex gap-2">
          <input
            type="text"
            value={nuevaCat}
            onChange={(e) => setNuevaCat(e.target.value)}
            placeholder="Ej. Mariscos, Lácteos, Helados..."
            disabled={loading}
            className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none text-slate-800 transition"
          />
          <button
            type="submit"
            disabled={loading || !nuevaCat.trim()}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            <span>Crear</span>
          </button>
        </div>
      </form>

      {/* Grid de categorías */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {categorias.map((cat) => {
          const count = productos.filter(
            (p) => p.Categoria.toLowerCase() === cat.Categoria.toLowerCase()
          ).length;

          return (
            <div
              key={cat.ID || cat.Categoria}
              onClick={() => onSelectCategoria(cat.Categoria)}
              className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-sky-300 transition flex items-center justify-between cursor-pointer group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl p-2 rounded-xl bg-sky-50/70 border border-sky-100 group-hover:scale-105 transition">
                  {getCategoryEmoji(cat.Categoria)}
                </span>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm group-hover:text-sky-700 transition">
                    {cat.Categoria}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {count} {count === 1 ? 'producto activo' : 'productos activos'}
                  </p>
                </div>
              </div>

              <span className="text-xs font-semibold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-lg group-hover:bg-sky-100 transition">
                Ver →
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

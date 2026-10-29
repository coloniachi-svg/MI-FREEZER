import React, { useState } from 'react';
import { X, Loader2, AlertCircle, CheckCircle2, Edit3 } from 'lucide-react';
import { Categoria } from '../types/freezer';
import { EmojiSelector } from './EmojiSelector';
import { useLanguage } from '../i18n/LanguageContext';

interface EditarCategoriaModalProps {
  isOpen: boolean;
  categoria: Categoria | null;
  categoriasExistentes: Categoria[];
  onClose: () => void;
  onGuardar: (id: string | number, nuevoNombre: string, nuevoEmoji: string) => Promise<void>;
}

export const EditarCategoriaModal: React.FC<EditarCategoriaModalProps> = ({
  isOpen,
  categoria,
  categoriasExistentes,
  onClose,
  onGuardar,
}) => {
  const { t, translateCategory, isSameCategory } = useLanguage();

  if (!isOpen || !categoria) return null;

  const [nombre, setNombre] = useState(categoria.nombre || '');
  const [emoji, setEmoji] = useState(categoria.emoji || categoria.Emoji || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const limpio = nombre.trim();
    if (!limpio) {
      setError(t.errorNombreCategoriaVacio);
      return;
    }

    // Check duplicate against other existing categories (except current one)
    const esDuplicado = categoriasExistentes.some(
      (c) => c.id !== categoria.id && isSameCategory(c.nombre, limpio)
    );

    if (esDuplicado) {
      setError(t.errorCategoriaExiste);
      return;
    }

    try {
      setLoading(true);
      await onGuardar(categoria.id, limpio, emoji.trim());
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar la categoría.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-sky-100 text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-sky-600" />
            <h3 className="font-bold text-slate-900 text-base">
              Editar Categoría
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
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nombre de la categoría *
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Panificados, Carnes..."
              disabled={loading}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none text-slate-800 transition font-semibold"
            />
          </div>

          <EmojiSelector
            value={emoji}
            onChange={setEmoji}
            defaultEmojiSuggestion="❄️"
            label="Emoji de categoría"
          />

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
              type="submit"
              disabled={loading}
              className="w-1/2 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition shadow-sm active:scale-[0.98] flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{t.guardando}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t.guardarCambios}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

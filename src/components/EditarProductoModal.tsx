import React, { useState } from 'react';
import {
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Archive,
  Sliders,
  Edit3,
  AlertTriangle,
} from 'lucide-react';
import { Categoria, EditarProductoDTO, Producto } from '../types/freezer';
import { formatCantidad, formatUnidad, parseDecimalInput } from '../utils/formatters';

interface EditarProductoModalProps {
  isOpen: boolean;
  producto: Producto | null;
  categorias: Categoria[];
  onClose: () => void;
  onEditar: (dto: EditarProductoDTO) => Promise<void>;
  onAjustarSaldo: (productoId: string | number, nuevoSaldo: number, observacion: string) => Promise<void>;
  onArchivar: (productoId: string | number) => Promise<void>;
}

export const EditarProductoModal: React.FC<EditarProductoModalProps> = ({
  isOpen,
  producto,
  categorias,
  onClose,
  onEditar,
  onAjustarSaldo,
  onArchivar,
}) => {
  if (!isOpen || !producto) return null;

  const [nombre, setNombre] = useState(producto.Producto);
  const [categoria, setCategoria] = useState(producto.Categoria);
  const [minimoStr, setMinimoStr] = useState(producto.Minimo.toString().replace('.', ','));
  const [nuevoSaldoStr, setNuevoSaldoStr] = useState(
    producto.Saldo.toString().replace('.', ',')
  );
  const [ajusteObs, setAjusteObs] = useState('');

  const [activeTab, setActiveTab] = useState<'info' | 'ajuste' | 'archivar'>('info');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle edit basic info
  const handleGuardarDatos = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const nombreLimpio = nombre.trim();
    if (!nombreLimpio) {
      setError('El nombre no puede estar vacío.');
      return;
    }
    const minimo = parseDecimalInput(minimoStr);
    if (isNaN(minimo) || minimo < 0) {
      setError('La cantidad mínima no puede ser negativa.');
      return;
    }

    try {
      setLoading(true);
      await onEditar({
        id: producto.ID,
        producto: nombreLimpio,
        categoria: categoria.trim(),
        minimo,
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
      setError('El saldo exacto no puede ser negativo ni inválido.');
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

  // Handle archive
  const handleConfirmarArchivar = async () => {
    setError(null);
    try {
      setLoading(true);
      await onArchivar(producto.ID);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Error al archivar el producto.');
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
            <span className="text-[11px] font-semibold tracking-wider uppercase text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
              {producto.Categoria}
            </span>
            <h3 className="font-bold text-slate-900 text-base leading-tight mt-1">
              {producto.Producto}
            </h3>
            <p className="text-xs text-slate-500">
              Saldo actual: <span className="font-bold text-slate-700">{formatUnidad(producto.Saldo, producto.Unidad)}</span>
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
            <span>Datos</span>
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
            <span>Ajustar Saldo</span>
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
            <Archive className="w-3.5 h-3.5" />
            <span>Archivar</span>
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
                Nombre del producto
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none text-slate-800 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Categoría
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none text-slate-800 transition"
              >
                {categorias.map((c) => (
                  <option key={c.ID || c.Categoria} value={c.Categoria}>
                    {c.Categoria}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cantidad mínima para alerta ({producto.Unidad})
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
              * Para modificar la cantidad en stock, utiliza la pestaña "Ajustar Saldo" o los botones [+] y [-] del inventario.
            </p>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="w-1/2 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-1/2 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm transition shadow-sm active:scale-[0.98] flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Guardar cambios</span>
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
              <p className="font-semibold mb-0.5">Ajuste de inventario real</p>
              <p className="text-[11px] text-sky-700">
                Esta acción registrará un movimiento de tipo <strong>AJUSTE</strong> en Google Sheets con el nuevo saldo total.
              </p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500">Saldo registrado actualmente:</span>
              <span className="text-sm font-bold text-slate-800">
                {formatUnidad(producto.Saldo, producto.Unidad)}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nuevo saldo exacto ({producto.Unidad}) *
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
                Motivo del ajuste <span className="font-normal text-slate-400">(opcional)</span>
              </label>
              <input
                type="text"
                value={ajusteObs}
                onChange={(e) => setAjusteObs(e.target.value)}
                placeholder="Ej. Recuento físico del freezer, pesaje con balanza"
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
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-1/2 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm transition shadow-sm active:scale-[0.98] flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Sliders className="w-4 h-4" />
                    <span>Registrar Ajuste</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Archivar */}
        {activeTab === 'archivar' && (
          <div className="mt-4 space-y-4">
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold">¿Deseas archivar "{producto.Producto}"?</p>
                <p className="text-rose-700 leading-relaxed">
                  El producto ya no se mostrará en tu lista activa del freezer.
                  No se eliminará físicamente de tu hoja de Google Sheets ni se borrará su historial de movimientos.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="w-1/2 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarArchivar}
                disabled={loading}
                className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm transition shadow-sm active:scale-[0.98] flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Archivando...</span>
                  </>
                ) : (
                  <>
                    <Archive className="w-4 h-4" />
                    <span>Sí, Archivar</span>
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

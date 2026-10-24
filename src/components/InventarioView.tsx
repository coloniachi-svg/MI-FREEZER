import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Minus,
  AlertTriangle,
  PackageX,
  Filter,
  PlusCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Categoria, Producto } from '../types/freezer';
import { formatCantidad, formatUnidad, getCategoryEmoji } from '../utils/formatters';

interface InventarioViewProps {
  productos: Producto[];
  categorias: Categoria[];
  categoriaSeleccionada: string | null;
  onSelectCategoria: (cat: string | null) => void;
  onOpenNuevoModal: () => void;
  onOpenRetirarModal: (prod: Producto) => void;
  onOpenAgregarModal: (prod: Producto) => void;
  onOpenEditarModal: (prod: Producto) => void;
  onRefresh: () => Promise<void>;
  loading: boolean;
}

export const InventarioView: React.FC<InventarioViewProps> = ({
  productos,
  categorias,
  categoriaSeleccionada,
  onSelectCategoria,
  onOpenNuevoModal,
  onOpenRetirarModal,
  onOpenAgregarModal,
  onOpenEditarModal,
  onRefresh,
  loading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [soloStockBajo, setSoloStockBajo] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  // Filter products
  const filteredProductos = useMemo(() => {
    return productos.filter((p) => {
      const matchSearch = (p.Producto || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase().trim());

      const matchCat =
        !categoriaSeleccionada ||
        p.Categoria.toLowerCase() === categoriaSeleccionada.toLowerCase();

      const isBajo = p.Saldo <= p.Minimo;
      const matchStockBajo = !soloStockBajo || isBajo;

      return matchSearch && matchCat && matchStockBajo;
    });
  }, [productos, searchTerm, categoriaSeleccionada, soloStockBajo]);

  const totalProductos = productos.length;
  const stockBajoCount = productos.filter((p) => p.Saldo <= p.Minimo).length;

  return (
    <div className="space-y-4 pb-24">
      {/* Top summary stats */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3 rounded-2xl bg-white border border-sky-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Alimentos
            </p>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">
              {totalProductos}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-lg">
            ❄️
          </div>
        </div>

        <div
          onClick={() => setSoloStockBajo(!soloStockBajo)}
          className={`p-3 rounded-2xl border transition shadow-xs cursor-pointer flex items-center justify-between ${
            soloStockBajo
              ? 'bg-amber-500 text-white border-amber-600 shadow-amber-200'
              : stockBajoCount > 0
              ? 'bg-amber-50/80 border-amber-200 text-amber-900'
              : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          <div>
            <p
              className={`text-[11px] font-semibold uppercase tracking-wider ${
                soloStockBajo ? 'text-amber-100' : 'text-amber-700'
              }`}
            >
              Stock Bajo
            </p>
            <p
              className={`text-xl font-extrabold mt-0.5 ${
                soloStockBajo ? 'text-white' : 'text-amber-800'
              }`}
            >
              {stockBajoCount}
            </p>
          </div>
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              soloStockBajo
                ? 'bg-white/20 text-white'
                : 'bg-amber-100 text-amber-600'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar pechuga, pan, carne..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none text-slate-800 transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="p-2.5 rounded-xl text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-100 transition active:scale-95 disabled:opacity-50 shrink-0"
            title="Sincronizar con Google Sheets"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
            />
          </button>

          <button
            onClick={onOpenNuevoModal}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition shadow-sm active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Nuevo producto</span>
            <span className="sm:hidden">Nuevo</span>
          </button>
        </div>

        {/* Category horizontal scroll pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar items-center">
          <button
            onClick={() => onSelectCategoria(null)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
              !categoriaSeleccionada
                ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            Todos ({productos.length})
          </button>

          {categorias.map((cat) => {
            const isSelected =
              categoriaSeleccionada?.toLowerCase() ===
              cat.Categoria.toLowerCase();
            const count = productos.filter(
              (p) => p.Categoria.toLowerCase() === cat.Categoria.toLowerCase()
            ).length;

            return (
              <button
                key={cat.ID || cat.Categoria}
                onClick={() =>
                  onSelectCategoria(isSelected ? null : cat.Categoria)
                }
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span>{getCategoryEmoji(cat.Categoria)}</span>
                <span>{cat.Categoria}</span>
                <span className="opacity-75 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main product list */}
      {filteredProductos.length === 0 ? (
        <div className="text-center py-14 px-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          {productos.length === 0 ? (
            <div className="space-y-3 max-w-xs mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto text-3xl shadow-inner">
                ❄️
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                Tu freezer está vacío. Agrega tu primer producto.
              </h3>
              <p className="text-xs text-slate-500">
                Lleva el control exacto de tus alimentos congelados, carnes, panes y porciones.
              </p>
              <button
                onClick={onOpenNuevoModal}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition shadow-sm active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>+ Nuevo producto</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <PackageX className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-semibold text-slate-700 text-sm">
                No se encontraron alimentos
              </h4>
              <p className="text-xs text-slate-400">
                Ningún alimento coincide con los filtros aplicados.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  onSelectCategoria(null);
                  setSoloStockBajo(false);
                }}
                className="text-xs font-semibold text-sky-600 hover:underline pt-1"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredProductos.map((prod) => {
            const isAgotado = prod.Saldo <= 0;
            const isBajo = prod.Saldo <= prod.Minimo && !isAgotado;

            return (
              <div
                key={prod.ID || prod.Producto}
                className={`p-3.5 rounded-2xl bg-white border transition shadow-xs flex items-center justify-between gap-3 ${
                  isAgotado
                    ? 'border-rose-200 bg-rose-50/20'
                    : isBajo
                    ? 'border-amber-200 bg-amber-50/20'
                    : 'border-slate-200/90 hover:border-sky-300'
                }`}
              >
                {/* Left: icon & details (clickable to edit) */}
                <div
                  onClick={() => onOpenEditarModal(prod)}
                  className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer group"
                >
                  <div className="text-2xl p-2.5 rounded-xl bg-sky-50/60 border border-sky-100 group-hover:scale-105 transition shrink-0">
                    {getCategoryEmoji(prod.Categoria)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-bold text-slate-900 text-sm leading-tight truncate group-hover:text-sky-700 transition">
                        {prod.Producto}
                      </h4>

                      {isAgotado && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 border border-rose-200">
                          Agotado
                        </span>
                      )}

                      {isBajo && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                          Bajo stock
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-base font-extrabold text-slate-800 font-mono">
                        {formatUnidad(prod.Saldo, prod.Unidad)}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        • {prod.Categoria}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Quick action buttons [-] and [+] (optimized for mobile touch) */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenRetirarModal(prod);
                    }}
                    disabled={prod.Saldo <= 0}
                    className="w-11 h-11 rounded-xl bg-amber-50 hover:bg-amber-100 active:bg-amber-200 active:scale-95 text-amber-700 border border-amber-200 flex items-center justify-center font-bold transition disabled:opacity-30 disabled:pointer-events-none shadow-xs"
                    aria-label={`Retirar ${prod.Producto}`}
                    title="Retirar cantidad"
                  >
                    <Minus className="w-5 h-5 stroke-[2.8]" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenAgregarModal(prod);
                    }}
                    className="w-11 h-11 rounded-xl bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 active:scale-95 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold transition shadow-xs"
                    aria-label={`Agregar ${prod.Producto}`}
                    title="Agregar cantidad"
                  >
                    <Plus className="w-5 h-5 stroke-[2.8]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Minus,
  AlertTriangle,
  PackageX,
  RefreshCw,
} from 'lucide-react';
import { Categoria, Producto } from '../types/freezer';
import { getCategoryEmoji, getProductEmoji } from '../utils/formatters';
import { useLanguage } from '../i18n/LanguageContext';

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
  const { t, formatUnidadLocale, translateCategory, isSameCategory } = useLanguage();
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

  // Compute total counts based ONLY on items with Saldo > 0
  const totalEnStock = useMemo(() => {
    return productos.filter((p) => p.Saldo > 0).length;
  }, [productos]);

  // Filter products by search term, category, and low-stock filter
  const filteredProductos = useMemo(() => {
    return productos.filter((p) => {
      const pNombre = (p.Producto || '').toLowerCase();
      const pCat = (p.Categoria || '').toLowerCase();
      const s = searchTerm.toLowerCase().trim();

      const matchSearch = pNombre.includes(s) || pCat.includes(s);

      let matchCat = true;
      if (categoriaSeleccionada) {
        matchCat = isSameCategory(p.Categoria, categoriaSeleccionada);
      }

      const isBajo = p.Saldo <= p.Minimo;
      const matchStockBajo = !soloStockBajo || isBajo;

      return matchSearch && matchCat && matchStockBajo;
    }).sort((a, b) => {
      // 1. Saldo > 0 first, Saldo === 0 last
      const aInStock = a.Saldo > 0 ? 1 : 0;
      const bInStock = b.Saldo > 0 ? 1 : 0;
      if (aInStock !== bInStock) {
        return bInStock - aInStock;
      }
      // 2. Alphabetical secondary sort
      return (a.Producto || '').localeCompare(b.Producto || '');
    });
  }, [productos, searchTerm, categoriaSeleccionada, soloStockBajo, isSameCategory]);

  return (
    <div className="space-y-4 pb-24">

      {/* Search & Action Bar + Categories Grid */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.buscarPlaceholder}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none text-slate-800 transition"
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
            className="p-2.5 rounded-xl text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-100 transition active:scale-95 disabled:opacity-50 shrink-0 cursor-pointer"
            title={t.sincronizar}
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
            />
          </button>

          <button
            onClick={onOpenNuevoModal}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition shadow-sm active:scale-95 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">{t.nuevoProducto}</span>
            <span className="sm:hidden">{t.nuevoProductoShort}</span>
          </button>
        </div>

        {/* Category Adaptive Grid (2 cols mobile, 3-4 cols desktop, multi-row, NO horizontal scroll) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {/* "Alle / Todos" Button */}
          <button
            type="button"
            onClick={() => onSelectCategoria(null)}
            className={`p-2.5 rounded-2xl text-xs font-semibold transition border flex items-center justify-between gap-1.5 text-left active:scale-[0.98] cursor-pointer ${
              !categoriaSeleccionada
                ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-base shrink-0">❄️</span>
              <span className="truncate font-bold">{t.todos}</span>
            </div>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono shrink-0 font-bold ${
                !categoriaSeleccionada
                  ? 'bg-sky-700/80 text-white'
                  : 'bg-sky-50 text-sky-700'
              }`}
            >
              {totalEnStock}
            </span>
          </button>

          {/* Individual Category Cards */}
          {categorias.map((cat) => {
            const rawCatNombre = cat.nombre || '';
            const visualNombre = translateCategory(rawCatNombre);
            const isSelected = categoriaSeleccionada
              ? isSameCategory(categoriaSeleccionada, rawCatNombre)
              : false;

            // Count ONLY products with Saldo > 0
            const countInStock = productos.filter((p) => {
              return isSameCategory(p.Categoria, rawCatNombre) && p.Saldo > 0;
            }).length;

            return (
              <button
                key={cat.id || rawCatNombre}
                type="button"
                onClick={() =>
                  onSelectCategoria(isSelected ? null : rawCatNombre)
                }
                className={`p-2.5 rounded-2xl text-xs font-semibold transition border flex items-center justify-between gap-1.5 text-left active:scale-[0.98] cursor-pointer ${
                  isSelected
                    ? 'bg-sky-600 text-white border-sky-600 shadow-xs ring-2 ring-sky-300/60'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <span className="text-base shrink-0">
                    {getCategoryEmoji(cat, categorias)}
                  </span>
                  <span className="break-words leading-tight text-xs font-semibold min-w-0">
                    {visualNombre}
                  </span>
                </div>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono shrink-0 font-bold ${
                    isSelected
                      ? 'bg-sky-700/80 text-white'
                      : countInStock > 0
                      ? 'bg-sky-50 text-sky-700'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {countInStock}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Product List */}
      {filteredProductos.length === 0 ? (
        <div className="text-center py-14 px-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          {productos.length === 0 ? (
            <div className="space-y-3 max-w-xs mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto text-3xl shadow-inner">
                ❄️
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                {t.emptyFreezerTitle}
              </h3>
              <p className="text-xs text-slate-500">
                {t.emptyFreezerDesc}
              </p>
              <button
                onClick={onOpenNuevoModal}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition shadow-sm active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>{t.nuevoProducto}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <PackageX className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-semibold text-slate-700 text-sm">
                {t.emptySearchTitle}
              </h4>
              <p className="text-xs text-slate-400">
                {t.emptySearchDesc}
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  onSelectCategoria(null);
                  setSoloStockBajo(false);
                }}
                className="text-xs font-semibold text-sky-600 hover:underline pt-1 cursor-pointer"
              >
                {t.limpiarFiltros}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredProductos.map((prod) => {
            const isAgotado = prod.Saldo <= 0;
            const isBajo = prod.Saldo <= prod.Minimo && !isAgotado;
            const catVisual = translateCategory(prod.Categoria);
            const catObj = categorias.find((c) => isSameCategory(c.nombre, prod.Categoria));

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
                    {getProductEmoji(prod.Producto, catObj || prod.Categoria, prod.Emoji, categorias)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-bold text-slate-900 text-sm leading-tight truncate group-hover:text-sky-700 transition">
                        {prod.Producto}
                      </h4>

                      {isAgotado && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 border border-rose-200">
                          {t.agotado}
                        </span>
                      )}

                      {isBajo && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                          {t.bajoStockBadge}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-base font-extrabold text-slate-800 font-mono">
                        {formatUnidadLocale(prod.Saldo, prod.Unidad)}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        • {catVisual}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Quick action buttons [-] and [+] */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenRetirarModal(prod);
                    }}
                    disabled={prod.Saldo <= 0}
                    className="w-11 h-11 rounded-xl bg-amber-50 hover:bg-amber-100 active:bg-amber-200 active:scale-95 text-amber-700 border border-amber-200 flex items-center justify-center font-bold transition disabled:opacity-30 disabled:pointer-events-none shadow-xs cursor-pointer"
                    aria-label={`${t.retirarProducto} ${prod.Producto}`}
                    title={t.retirarProducto}
                  >
                    <Minus className="w-5 h-5 stroke-[2.8]" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenAgregarModal(prod);
                    }}
                    className="w-11 h-11 rounded-xl bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 active:scale-95 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold transition shadow-xs cursor-pointer"
                    aria-label={`${t.agregarProducto} ${prod.Producto}`}
                    title={t.agregarProducto}
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

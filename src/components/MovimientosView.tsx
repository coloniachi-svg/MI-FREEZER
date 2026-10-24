import React, { useState, useMemo } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Sliders,
  Search,
  Filter,
  Calendar,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { Movimiento, TipoMovimiento } from '../types/freezer';
import { formatCantidad, formatDateSpanish } from '../utils/formatters';

interface MovimientosViewProps {
  movimientos: Movimiento[];
  loading: boolean;
  onRefresh: () => Promise<void>;
}

export const MovimientosView: React.FC<MovimientosViewProps> = ({
  movimientos,
  loading,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<TipoMovimiento | 'TODOS'>('TODOS');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  const filtered = useMemo(() => {
    return movimientos.filter((m) => {
      const matchSearch = (m.Producto || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase().trim());
      const matchTipo =
        tipoFiltro === 'TODOS' || (m.Tipo || '').toUpperCase() === tipoFiltro;
      return matchSearch && matchTipo;
    });
  }, [movimientos, searchTerm, tipoFiltro]);

  return (
    <div className="space-y-4 pb-24">
      {/* Search & Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>Historial de Movimientos</span>
          </h2>
          <p className="text-xs text-slate-500">
            {filtered.length} {filtered.length === 1 ? 'registro' : 'registros'} encontrados
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading || refreshing}
          className="p-2 rounded-xl text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-100 transition active:scale-95 disabled:opacity-50"
          title="Actualizar historial"
        >
          <RefreshCw
            className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
          />
        </button>
      </div>

      {/* Filter controls */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar por nombre de alimento..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none text-slate-800 transition"
          />
        </div>

        {/* Tipo tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {(['TODOS', 'ENTRADA', 'SALIDA', 'AJUSTE'] as const).map((tipo) => {
            const isSelected = tipoFiltro === tipo;
            return (
              <button
                key={tipo}
                onClick={() => setTipoFiltro(tipo)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                  isSelected
                    ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {tipo === 'TODOS'
                  ? 'Todos'
                  : tipo === 'ENTRADA'
                  ? '⬇️ Entradas'
                  : tipo === 'SALIDA'
                  ? '⬆️ Salidas'
                  : '⚖️ Ajustes'}
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="font-semibold text-slate-700 text-sm">No hay movimientos registrados</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            {searchTerm || tipoFiltro !== 'TODOS'
              ? 'Prueba a cambiar o limpiar los filtros de búsqueda.'
              : 'Los registros de entradas, salidas y ajustes aparecerán aquí.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((mov) => {
            const tipo = (mov.Tipo || '').toUpperCase();
            const isEntrada = tipo === 'ENTRADA';
            const isSalida = tipo === 'SALIDA';
            const isAjuste = tipo === 'AJUSTE';

            return (
              <div
                key={mov.ID || `${mov.Fecha}-${mov.ProductoID}-${Math.random()}`}
                className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-sky-200 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                        isEntrada
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : isSalida
                          ? 'bg-amber-50 text-amber-600 border border-amber-200'
                          : 'bg-sky-50 text-sky-600 border border-sky-200'
                      }`}
                    >
                      {isEntrada ? (
                        <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
                      ) : isSalida ? (
                        <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <Sliders className="w-4 h-4 stroke-[2.5]" />
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-snug">
                        {mov.Producto}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDateSpanish(mov.Fecha)}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity badge */}
                  <div className="text-right shrink-0">
                    <div
                      className={`font-mono font-bold text-sm ${
                        isEntrada
                          ? 'text-emerald-700'
                          : isSalida
                          ? 'text-amber-700'
                          : 'text-sky-700'
                      }`}
                    >
                      {isEntrada ? '+' : isSalida ? '-' : 'Saldo: '}
                      {formatCantidad(mov.Cantidad)}
                    </div>
                    <span
                      className={`inline-block text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-md mt-0.5 ${
                        isEntrada
                          ? 'bg-emerald-100/70 text-emerald-800'
                          : isSalida
                          ? 'bg-amber-100/70 text-amber-800'
                          : 'bg-sky-100/70 text-sky-800'
                      }`}
                    >
                      {mov.Tipo}
                    </span>
                  </div>
                </div>

                {/* Subdetails: Saldo Anterior -> Saldo Posterior */}
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span>Saldo:</span>
                    <span className="font-mono text-slate-600">
                      {formatCantidad(mov.SaldoAnterior)}
                    </span>
                    <span>→</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {formatCantidad(mov.SaldoPosterior)}
                    </span>
                  </div>

                  {mov.Observacion && (
                    <span className="italic text-slate-500 truncate max-w-[160px]" title={mov.Observacion}>
                      "{mov.Observacion}"
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  Package,
  History,
  Tags,
  Settings,
  Lock,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  WifiOff,
} from 'lucide-react';
import { Categoria, CrearProductoDTO, EditarProductoDTO, Movimiento, Producto } from './types/freezer';
import {
  archivarProducto,
  crearCategoria,
  crearProducto,
  editarProducto,
  getDatosIniciales,
  getStoredUserPin,
  registrarMovimiento,
} from './services/backend';
import { InventarioView } from './components/InventarioView';
import { MovimientosView } from './components/MovimientosView';
import { CategoriasView } from './components/CategoriasView';
import { AjustesView } from './components/AjustesView';
import { MovimientoModal } from './components/MovimientoModal';
import { NuevoProductoModal } from './components/NuevoProductoModal';
import { EditarProductoModal } from './components/EditarProductoModal';
import { PinModal } from './components/PinModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';
import { formatCantidad } from './utils/formatters';

type TabView = 'inventario' | 'movimientos' | 'categorias' | 'ajustes';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<TabView>('inventario');

  // In-memory application state
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);

  // Loading & error states
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Security Lock
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Toast feedback
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Modals state
  const [isNuevoModalOpen, setIsNuevoModalOpen] = useState(false);
  const [movimientoModalState, setMovimientoModalState] = useState<{
    isOpen: boolean;
    producto: Producto | null;
    tipo: 'ENTRADA' | 'SALIDA';
  }>({
    isOpen: false,
    producto: null,
    tipo: 'SALIDA',
  });
  const [editarModalProducto, setEditarModalProducto] = useState<Producto | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // Fetch initial data from Google Sheets via /api/backend
  const cargarDatos = useCallback(async (isSilent = false) => {
    if (!isSilent) {
      setLoadingInitial(true);
    }
    setGlobalError(null);

    try {
      const data = await getDatosIniciales();
      setProductos(data.productos);
      setCategorias(data.categorias);
      setMovimientos(data.movimientos);
      setIsLocked(false);
    } catch (err: any) {
      if (err?.code === 'UNAUTHORIZED') {
        setIsLocked(true);
      } else {
        setGlobalError(err?.message || 'Error al conectar con Google Sheets.');
      }
    } finally {
      if (!isSilent) {
        setLoadingInitial(false);
      }
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Handle Movimiento (ENTRADA o SALIDA)
  const handleRegistrarMovimiento = async (cantidad: number, observacion: string) => {
    if (!movimientoModalState.producto) return;
    const { producto, tipo } = movimientoModalState;

    setActionLoading(true);
    try {
      await registrarMovimiento({
        productoId: producto.ID,
        tipo,
        cantidad,
        observacion,
      });

      // Update locally affected product state immediately
      const anterior = producto.Saldo;
      const posterior = tipo === 'ENTRADA' ? anterior + cantidad : Math.max(0, anterior - cantidad);

      setProductos((prev) =>
        prev.map((p) => (p.ID === producto.ID ? { ...p, Saldo: posterior } : p))
      );

      // Add to movement timeline
      const nuevoMovimiento: Movimiento = {
        ID: Date.now(),
        Fecha: new Date().toISOString(),
        ProductoID: producto.ID,
        Producto: producto.Producto,
        Tipo: tipo,
        Cantidad: cantidad,
        SaldoAnterior: anterior,
        SaldoPosterior: posterior,
        Observacion: observacion,
      };
      setMovimientos((prev) => [nuevoMovimiento, ...prev]);

      showToast(
        `${tipo === 'ENTRADA' ? 'Agregado' : 'Retirado'} con éxito: ${formatCantidad(cantidad)} ${producto.Unidad} de ${producto.Producto}.`,
        'success'
      );
    } catch (err: any) {
      if (err?.code === 'UNAUTHORIZED') {
        setIsLocked(true);
      }
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Ajuste de Saldo (AJUSTE)
  const handleAjusteSaldo = async (
    productoId: string | number,
    nuevoSaldo: number,
    observacion: string
  ) => {
    const target = productos.find((p) => p.ID === productoId);
    if (!target) return;

    setActionLoading(true);
    try {
      await registrarMovimiento({
        productoId,
        tipo: 'AJUSTE',
        cantidad: nuevoSaldo,
        observacion,
      });

      const anterior = target.Saldo;
      setProductos((prev) =>
        prev.map((p) => (p.ID === productoId ? { ...p, Saldo: nuevoSaldo } : p))
      );

      const nuevoMov: Movimiento = {
        ID: Date.now(),
        Fecha: new Date().toISOString(),
        ProductoID: productoId,
        Producto: target.Producto,
        Tipo: 'AJUSTE',
        Cantidad: nuevoSaldo,
        SaldoAnterior: anterior,
        SaldoPosterior: nuevoSaldo,
        Observacion: observacion,
      };
      setMovimientos((prev) => [nuevoMov, ...prev]);

      showToast(`Saldo ajustado a ${formatCantidad(nuevoSaldo)} ${target.Unidad}.`, 'success');
    } catch (err: any) {
      if (err?.code === 'UNAUTHORIZED') {
        setIsLocked(true);
      }
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Crear Producto
  const handleCrearProducto = async (dto: CrearProductoDTO) => {
    setActionLoading(true);
    try {
      const res = await crearProducto(dto);

      const nuevoProd: Producto = {
        ID: (res as any)?.id || (res as any)?.ID || Date.now(),
        Producto: dto.producto,
        Categoria: dto.categoria,
        Unidad: dto.unidad,
        Saldo: dto.saldo,
        Minimo: dto.minimo,
        Estado: 'ACTIVO',
      };

      setProductos((prev) => [...prev, nuevoProd]);

      if (dto.saldo > 0) {
        setMovimientos((prev) => [
          {
            ID: Date.now(),
            Fecha: new Date().toISOString(),
            ProductoID: nuevoProd.ID,
            Producto: dto.producto,
            Tipo: 'ENTRADA',
            Cantidad: dto.saldo,
            SaldoAnterior: 0,
            SaldoPosterior: dto.saldo,
            Observacion: 'Saldo inicial de creación',
          },
          ...prev,
        ]);
      }

      showToast(`"${dto.producto}" guardado en Google Sheets.`, 'success');
    } catch (err: any) {
      if (err?.code === 'UNAUTHORIZED') {
        setIsLocked(true);
      }
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Editar Producto
  const handleEditarProducto = async (dto: EditarProductoDTO) => {
    setActionLoading(true);
    try {
      await editarProducto(dto);
      setProductos((prev) =>
        prev.map((p) =>
          p.ID === dto.id
            ? { ...p, Producto: dto.producto, Categoria: dto.categoria, Minimo: dto.minimo }
            : p
        )
      );
      showToast('Cambios del producto guardados.', 'success');
    } catch (err: any) {
      if (err?.code === 'UNAUTHORIZED') {
        setIsLocked(true);
      }
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Archivar Producto
  const handleArchivarProducto = async (productoId: string | number) => {
    setActionLoading(true);
    try {
      await archivarProducto(productoId);
      setProductos((prev) => prev.filter((p) => p.ID !== productoId));
      showToast('Producto archivado correctamente.', 'info');
    } catch (err: any) {
      if (err?.code === 'UNAUTHORIZED') {
        setIsLocked(true);
      }
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Crear Categoría
  const handleCrearCategoria = async (nombreCat: string) => {
    setActionLoading(true);
    try {
      const res = await crearCategoria(nombreCat);
      const nueva: Categoria = {
        ID: (res as any)?.id || nombreCat,
        Categoria: nombreCat,
      };
      setCategorias((prev) => [...prev, nueva]);
      showToast(`Categoría "${nombreCat}" agregada.`, 'success');
    } catch (err: any) {
      if (err?.code === 'UNAUTHORIZED') {
        setIsLocked(true);
      }
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-sky-200">
      {/* Offline Connectivity Warning */}
      <OfflineIndicator />

      {/* Main App Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-sky-100/80 shadow-xs">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-sky-200">
              ❄️
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-slate-900 leading-none">
                Mi Freezer
              </h1>
              <p className="text-[10px] font-semibold text-sky-600 tracking-wider uppercase mt-0.5">
                Control de Inventario
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <PWAInstallButton />
            <button
              onClick={() => setIsLocked(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              title="Bloquear acceso con PIN"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 pt-4 pb-20">
        {/* Loading Initial Screen */}
        {loadingInitial ? (
          <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-3xl bg-sky-50 text-sky-600 flex items-center justify-center text-2xl shadow-inner animate-pulse">
                ❄️
              </div>
              <Loader2 className="w-6 h-6 text-sky-500 animate-spin absolute -bottom-1 -right-1" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Cargando Mi Freezer...</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Sincronizando productos y movimientos
              </p>
            </div>
          </div>
        ) : globalError ? (
          <div className="py-12 px-4 rounded-3xl bg-white border border-rose-200 shadow-xs text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">No pudimos conectar con el servidor</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                {globalError}
              </p>
            </div>
            <button
              onClick={() => cargarDatos()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-sm transition active:scale-95"
            >
              Reintentar conexión
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'inventario' && (
              <InventarioView
                productos={productos}
                categorias={categorias}
                categoriaSeleccionada={selectedCategoria}
                onSelectCategoria={setSelectedCategoria}
                onOpenNuevoModal={() => setIsNuevoModalOpen(true)}
                onOpenRetirarModal={(prod) =>
                  setMovimientoModalState({ isOpen: true, producto: prod, tipo: 'SALIDA' })
                }
                onOpenAgregarModal={(prod) =>
                  setMovimientoModalState({ isOpen: true, producto: prod, tipo: 'ENTRADA' })
                }
                onOpenEditarModal={(prod) => setEditarModalProducto(prod)}
                onRefresh={() => cargarDatos(true)}
                loading={actionLoading}
              />
            )}

            {activeTab === 'movimientos' && (
              <MovimientosView
                movimientos={movimientos}
                loading={actionLoading}
                onRefresh={() => cargarDatos(true)}
              />
            )}

            {activeTab === 'categorias' && (
              <CategoriasView
                categorias={categorias}
                productos={productos}
                onCrearCategoria={handleCrearCategoria}
                onSelectCategoria={(catName) => {
                  setSelectedCategoria(catName);
                  setActiveTab('inventario');
                }}
              />
            )}

            {activeTab === 'ajustes' && (
              <AjustesView
                onRefreshAll={() => cargarDatos(false)}
                onLockApp={() => setIsLocked(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Fixed Bottom Menu Optimized for One-Hand Mobile Use */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg">
        <div className="max-w-xl mx-auto px-3 py-1 flex items-center justify-around">
          <button
            onClick={() => setActiveTab('inventario')}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition active:scale-95 ${
              activeTab === 'inventario'
                ? 'text-sky-600 font-bold'
                : 'text-slate-400 hover:text-slate-600 font-medium'
            }`}
          >
            <span className="text-lg">❄️</span>
            <span className="text-[10px] mt-0.5">Inventario</span>
          </button>

          <button
            onClick={() => setActiveTab('movimientos')}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition active:scale-95 ${
              activeTab === 'movimientos'
                ? 'text-sky-600 font-bold'
                : 'text-slate-400 hover:text-slate-600 font-medium'
            }`}
          >
            <History className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Movimientos</span>
          </button>

          <button
            onClick={() => setActiveTab('categorias')}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition active:scale-95 ${
              activeTab === 'categorias'
                ? 'text-sky-600 font-bold'
                : 'text-slate-400 hover:text-slate-600 font-medium'
            }`}
          >
            <Tags className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Categorías</span>
          </button>

          <button
            onClick={() => setActiveTab('ajustes')}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition active:scale-95 ${
              activeTab === 'ajustes'
                ? 'text-sky-600 font-bold'
                : 'text-slate-400 hover:text-slate-600 font-medium'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Ajustes</span>
          </button>
        </div>
      </nav>

      {/* Modals */}
      <MovimientoModal
        isOpen={movimientoModalState.isOpen}
        producto={movimientoModalState.producto}
        tipo={movimientoModalState.tipo}
        onClose={() =>
          setMovimientoModalState({ isOpen: false, producto: null, tipo: 'SALIDA' })
        }
        onConfirm={handleRegistrarMovimiento}
      />

      <NuevoProductoModal
        isOpen={isNuevoModalOpen}
        categorias={categorias}
        productosExistentes={productos}
        onClose={() => setIsNuevoModalOpen(false)}
        onCrear={handleCrearProducto}
        onCrearCategoria={handleCrearCategoria}
      />

      <EditarProductoModal
        isOpen={!!editarModalProducto}
        producto={editarModalProducto}
        categorias={categorias}
        onClose={() => setEditarModalProducto(null)}
        onEditar={handleEditarProducto}
        onAjustarSaldo={handleAjusteSaldo}
        onArchivar={handleArchivarProducto}
      />

      {/* Security PIN Lock Modal */}
      <PinModal
        isOpen={isLocked}
        onSuccess={() => {
          setIsLocked(false);
          cargarDatos();
        }}
      />

      {/* Floating Toast Notifications */}
      <div className="fixed bottom-20 left-4 right-4 z-50 pointer-events-none flex flex-col items-center gap-2 max-w-sm mx-auto">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-3.5 py-2.5 rounded-2xl shadow-lg border text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-200 ${
              toast.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-700'
                : toast.type === 'error'
                ? 'bg-rose-600 text-white border-rose-700'
                : 'bg-slate-800 text-white border-slate-900'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{toast.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="ml-1 opacity-70 hover:opacity-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

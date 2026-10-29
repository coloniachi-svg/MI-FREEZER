/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  History,
  Tags,
  Settings,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';
import {
  Categoria,
  CrearProductoDTO,
  EditarProductoDTO,
  LanguageCode,
  Movimiento,
  Producto,
} from './types/freezer';
import {
  archivarProducto,
  crearCategoria,
  crearProducto,
  editarCategoria,
  editarProducto,
  eliminarCategoria,
  getDatosIniciales,
  guardarConfiguracion,
  registrarMovimiento,
} from './services/backend';
import { InventarioView } from './components/InventarioView';
import { MovimientosView } from './components/MovimientosView';
import { CategoriasView } from './components/CategoriasView';
import { AjustesView } from './components/AjustesView';
import { MovimientoModal } from './components/MovimientoModal';
import { NuevoProductoModal } from './components/NuevoProductoModal';
import { EditarProductoModal } from './components/EditarProductoModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';
import { PWAUpdateNotification } from './components/PWAUpdateNotification';
import { LanguageSelector } from './components/LanguageSelector';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { isSameCategory } from './i18n/translations';

type TabView = 'inventario' | 'movimientos' | 'categorias' | 'ajustes';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

function MainFreezerApp() {
  const { t, lang, setLang, formatCantidadLocale, formatUnidadLocale } = useLanguage();

  // Navigation state (preserved in memory)
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

      // Check if language was stored in Google Sheets Configuracion sheet
      const langConfig =
        data.configuracion?.['idioma'] ||
        data.configuracion?.['lang'] ||
        data.configuracion?.['language'];

      if (langConfig && (langConfig === 'de' || langConfig === 'es')) {
        setLang(langConfig as LanguageCode);
      }
    } catch (err: any) {
      const errorMsg =
        err?.message === 'OFFLINE_ERROR'
          ? t.offlineAviso
          : err?.message || t.errorConexionTitulo;
      setGlobalError(errorMsg);
    } finally {
      if (!isSilent) {
        setLoadingInitial(false);
      }
    }
  }, [setLang, t.errorConexionTitulo, t.offlineAviso]);

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

      const template =
        tipo === 'ENTRADA' ? t.toastAgregadoExito : t.toastRetiradoExito;
      const msg = template
        .replace('{cantidad}', formatCantidadLocale(cantidad))
        .replace('{unidad}', producto.Unidad)
        .replace('{producto}', producto.Producto);

      showToast(msg, 'success');
    } catch (err: any) {
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

      const msg = t.toastAjusteExito
        .replace('{producto}', target.Producto)
        .replace('{cantidad}', formatCantidadLocale(nuevoSaldo))
        .replace('{unidad}', target.Unidad);

      showToast(msg, 'success');
    } catch (err: any) {
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

      const realId =
        (res as any)?.resultado?.id ||
        (res as any)?.resultado?.ID ||
        (res as any)?.id ||
        (res as any)?.ID ||
        Date.now();

      const nuevoProd: Producto = {
        ID: realId,
        Producto: dto.producto,
        Categoria: dto.categoria,
        Unidad: dto.unidad,
        Saldo: dto.saldo,
        Minimo: dto.minimo,
        Emoji: dto.emoji,
        emoji: dto.emoji,
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

      showToast(
        t.toastProductoCreadoExito.replace('{producto}', dto.producto),
        'success'
      );
    } catch (err: any) {
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
            ? {
                ...p,
                Producto: dto.producto,
                Categoria: dto.categoria,
                Minimo: dto.minimo,
                Emoji: dto.emoji,
                emoji: dto.emoji,
              }
            : p
        )
      );
      showToast(
        t.toastProductoEditadoExito.replace('{producto}', dto.producto),
        'success'
      );
    } catch (err: any) {
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Archivar / Eliminar Producto
  const handleArchivarProducto = async (productoId: string | number) => {
    setActionLoading(true);
    try {
      await archivarProducto(productoId);
      setProductos((prev) => prev.filter((p) => p.ID !== productoId));
      showToast(t.toastProductoArchivadoExito, 'info');
    } catch (err: any) {
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Crear Categoría
  const handleCrearCategoria = async (nombreCat: string, emoji?: string) => {
    setActionLoading(true);
    try {
      const res = await crearCategoria(nombreCat, emoji);
      const cleanNombre = nombreCat.trim();
      const realId =
        (res as any)?.resultado?.id ||
        (res as any)?.resultado?.ID ||
        (res as any)?.id ||
        (res as any)?.ID ||
        cleanNombre;

      const nueva: Categoria = {
        id: realId,
        nombre: cleanNombre,
        Emoji: emoji || '',
        emoji: emoji || '',
        ID: realId,
        Categoria: cleanNombre,
      };
      setCategorias((prev) => [...prev, nueva]);
      showToast(
        t.toastCategoriaCreadaExito.replace('{categoria}', cleanNombre),
        'success'
      );
    } catch (err: any) {
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Editar Categoría
  const handleEditarCategoria = async (
    catId: string | number,
    nuevoNombre: string,
    nuevoEmoji: string
  ) => {
    setActionLoading(true);
    try {
      const oldCat = categorias.find((c) => c.id === catId || isSameCategory(c.nombre, catId));
      const oldNombre = oldCat ? oldCat.nombre : String(catId);
      const targetId = oldCat ? oldCat.id : catId;

      await editarCategoria({
        id: targetId,
        nombre: nuevoNombre,
        nombreAnterior: oldNombre,
        emoji: nuevoEmoji,
      });

      setCategorias((prev) =>
        prev.map((c) =>
          c.id === targetId || isSameCategory(c.nombre, oldNombre)
            ? { ...c, id: targetId, ID: targetId, nombre: nuevoNombre, Categoria: nuevoNombre, Emoji: nuevoEmoji, emoji: nuevoEmoji }
            : c
        )
      );

      // If category name was renamed, update active products matching old category
      if (oldNombre && oldNombre.trim().toLowerCase() !== nuevoNombre.trim().toLowerCase()) {
        const affected = productos.filter((p) => isSameCategory(p.Categoria, oldNombre));
        setProductos((prev) =>
          prev.map((p) =>
            isSameCategory(p.Categoria, oldNombre)
              ? { ...p, Categoria: nuevoNombre }
              : p
          )
        );
        for (const prod of affected) {
          editarProducto({
            id: prod.ID,
            producto: prod.Producto,
            categoria: nuevoNombre,
            minimo: prod.Minimo,
            emoji: prod.Emoji,
          }).catch((err) => console.error('Error auto-updating product category:', err));
        }
      }

      showToast('Categoría actualizada con éxito.', 'success');
    } catch (err: any) {
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Eliminar Categoría
  const handleEliminarCategoria = async (
    catId: string | number,
    catNombre: string,
    targetCatNombre?: string
  ) => {
    setActionLoading(true);
    try {
      if (targetCatNombre) {
        const affected = productos.filter((p) => p.Categoria.trim().toLowerCase() === catNombre.trim().toLowerCase());
        setProductos((prev) =>
          prev.map((p) =>
            p.Categoria.trim().toLowerCase() === catNombre.trim().toLowerCase()
              ? { ...p, Categoria: targetCatNombre }
              : p
          )
        );
        for (const prod of affected) {
          await editarProducto({
            id: prod.ID,
            producto: prod.Producto,
            categoria: targetCatNombre,
            minimo: prod.Minimo,
            emoji: prod.Emoji,
          });
        }
      }

      await eliminarCategoria(catId);
      setCategorias((prev) => prev.filter((c) => c.id !== catId));

      if (selectedCategoria && selectedCategoria.trim().toLowerCase() === catNombre.trim().toLowerCase()) {
        setSelectedCategoria(null);
      }

      showToast('Categoría eliminada con éxito.', 'info');
    } catch (err: any) {
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
                {t.appName}
              </h1>
              <p className="text-[10px] font-semibold text-sky-600 tracking-wider uppercase mt-0.5">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Compact DE | ES Language Selector (always accessible) */}
            <LanguageSelector />

            <PWAInstallButton />
          </div>
        </div>
      </header>

      {/* PWA Update Notification Banner */}
      <PWAUpdateNotification />

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
              <h3 className="font-bold text-slate-800 text-sm">{t.cargandoTitulo}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {t.cargandoSubtitulo}
              </p>
            </div>
          </div>
        ) : globalError ? (
          <div className="py-12 px-4 rounded-3xl bg-white border border-rose-200 shadow-xs text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {t.errorConexionTitulo}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                {globalError}
              </p>
            </div>
            <button
              onClick={() => cargarDatos()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-sm transition active:scale-95"
            >
              {t.reintentarConexion}
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
                onEditarCategoria={handleEditarCategoria}
                onEliminarCategoria={handleEliminarCategoria}
                onSelectCategoria={(catName) => {
                  setSelectedCategoria(catName);
                  setActiveTab('inventario');
                }}
              />
            )}

            {activeTab === 'ajustes' && (
              <AjustesView
                onRefreshAll={() => cargarDatos(false)}
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
            <span className="text-[10px] mt-0.5">{t.navInventario}</span>
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
            <span className="text-[10px] mt-0.5">{t.navMovimientos}</span>
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
            <span className="text-[10px] mt-0.5">{t.navCategorias}</span>
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
            <span className="text-[10px] mt-0.5">{t.navAjustes}</span>
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

export default function App() {
  const handleLanguageChange = (newLang: LanguageCode) => {
    // Attempt saving to Google Sheets Configuracion sheet (silently in memory if not implemented yet)
    guardarConfiguracion('idioma', newLang);
  };

  return (
    <LanguageProvider initialLang="de" onLanguageChange={handleLanguageChange}>
      <MainFreezerApp />
    </LanguageProvider>
  );
}

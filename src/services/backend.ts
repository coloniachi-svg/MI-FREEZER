/**
 * Centralized backend service for communicating exclusively with /api/backend.
 * Handles single-user security authorization PIN, request formatting,
 * and error parsing.
 */

import {
  BackendResponse,
  Categoria,
  CrearProductoDTO,
  EditarProductoDTO,
  Movimiento,
  Producto,
  RegistrarMovimientoDTO,
} from '../types/freezer';
import { parseDecimalInput } from '../utils/formatters';

const BASE_API_URL = '/api/backend';

// Storage key for user PIN on this client
const USER_PIN_STORAGE_KEY = 'mi_freezer_user_pin';

/**
 * Get current configured or stored user PIN
 */
export function getStoredUserPin(): string {
  try {
    return (
      sessionStorage.getItem(USER_PIN_STORAGE_KEY) ||
      localStorage.getItem(USER_PIN_STORAGE_KEY) ||
      '1234'
    );
  } catch {
    return '1234';
  }
}

/**
 * Set user PIN in local storage / session storage
 */
export function setStoredUserPin(pin: string, remember = true): void {
  try {
    sessionStorage.setItem(USER_PIN_STORAGE_KEY, pin);
    if (remember) {
      localStorage.setItem(USER_PIN_STORAGE_KEY, pin);
    } else {
      localStorage.removeItem(USER_PIN_STORAGE_KEY);
    }
  } catch {
    // ignore storage restrictions
  }
}

/**
 * Clear stored user PIN
 */
export function clearStoredUserPin(): void {
  try {
    sessionStorage.removeItem(USER_PIN_STORAGE_KEY);
    localStorage.removeItem(USER_PIN_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Normalizes product numbers from Google Sheets (which might be strings)
 */
function normalizeProducto(item: any): Producto {
  return {
    ID: item.ID || item.id || '',
    Producto: item.Producto || item.producto || item.nombre || '',
    Categoria: item.Categoria || item.categoria || 'Otros',
    Unidad: item.Unidad || item.unidad || 'unidad',
    Saldo: parseDecimalInput(item.Saldo ?? item.saldo ?? 0),
    Minimo: parseDecimalInput(item.Minimo ?? item.minimo ?? 0),
    Estado: item.Estado || item.estado || 'ACTIVO',
    FechaCreacion: item.FechaCreacion || item.fechaCreacion || '',
    FechaActualizacion: item.FechaActualizacion || item.fechaActualizacion || '',
  };
}

/**
 * Normalizes movement records
 */
function normalizeMovimiento(item: any): Movimiento {
  return {
    ID: item.ID || item.id || '',
    Fecha: item.Fecha || item.fecha || '',
    ProductoID: item.ProductoID || item.productoId || item.producto_id || '',
    Producto: item.Producto || item.producto || '',
    Tipo: (item.Tipo || item.tipo || 'ENTRADA').toUpperCase(),
    Cantidad: parseDecimalInput(item.Cantidad ?? item.cantidad ?? 0),
    SaldoAnterior: parseDecimalInput(item.SaldoAnterior ?? item.saldoAnterior ?? 0),
    SaldoPosterior: parseDecimalInput(item.SaldoPosterior ?? item.saldoPosterior ?? 0),
    Observacion: item.Observacion || item.observacion || '',
  };
}

/**
 * Normalizes category records
 */
function normalizeCategoria(item: any): Categoria {
  if (typeof item === 'string') {
    return { ID: item, Categoria: item };
  }
  return {
    ID: item.ID || item.id || item.Categoria || item.categoria || '',
    Categoria: item.Categoria || item.categoria || String(item),
  };
}

/**
 * Helper to make requests to /api/backend with PIN header and error handling
 */
async function requestApi<T>(
  method: 'GET' | 'POST',
  params?: Record<string, string>,
  body?: Record<string, unknown>
): Promise<BackendResponse<T>> {
  if (!navigator.onLine) {
    throw new Error('Sin conexión a internet. Conéctate para operar con el inventario.');
  }

  const pin = getStoredUserPin();
  let url = BASE_API_URL;

  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'x-user-pin': pin,
  };

  const options: RequestInit = {
    method,
    headers,
  };

  if (method === 'POST') {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body || {});
  }

  let response: Response;
  try {
    response = await fetch(url, options);
  } catch (netErr: any) {
    throw new Error(
      `No se pudo conectar con el servidor: ${netErr?.message || 'Error de red'}`
    );
  }

  if (response.status === 401) {
    const errorData = await response.json().catch(() => ({}));
    const err = new Error(
      errorData.error || 'PIN de acceso incorrecto o no autorizado.'
    );
    (err as any).code = 'UNAUTHORIZED';
    throw err;
  }

  let data: BackendResponse<T>;
  try {
    data = await response.json();
  } catch {
    throw new Error('Respuesta inválida recibida del servidor (no es JSON válido).');
  }

  // Handle Apps Script error reporting
  if (data.ok === false || (data as any).success === false) {
    const msg = data.error || data.mensaje || 'Error desconocido reportado por el servidor.';
    throw new Error(msg);
  }

  return data;
}

// ==========================================
// EXPORTED API METHODS
// ==========================================

export interface DatosIniciales {
  productos: Producto[];
  categorias: Categoria[];
  movimientos: Movimiento[];
}

/**
 * Obtener productos, categorías y movimientos en una sola solicitud inicial
 */
export async function getDatosIniciales(): Promise<DatosIniciales> {
  const res = await requestApi<any>('GET', { action: 'inicial' });

  const rawProductos = res.productos || (res.resultado as any)?.productos || [];
  const rawCategorias = res.categorias || (res.resultado as any)?.categorias || [];
  const rawMovimientos = res.movimientos || (res.resultado as any)?.movimientos || [];

  return {
    productos: rawProductos.map(normalizeProducto).filter((p: Producto) => p.Estado !== 'ARCHIVADO'),
    categorias: rawCategorias.map(normalizeCategoria),
    movimientos: rawMovimientos.map(normalizeMovimiento),
  };
}

/**
 * Obtener inventario de productos activos
 */
export async function getInventario(): Promise<Producto[]> {
  const res = await requestApi<any>('GET', { action: 'inventario' });
  const list = res.productos || (Array.isArray(res.resultado) ? res.resultado : []);
  return list.map(normalizeProducto).filter((p: Producto) => p.Estado !== 'ARCHIVADO');
}

/**
 * Obtener lista de categorías
 */
export async function getCategorias(): Promise<Categoria[]> {
  const res = await requestApi<any>('GET', { action: 'categorias' });
  const list = res.categorias || (Array.isArray(res.resultado) ? res.resultado : []);
  return list.map(normalizeCategoria);
}

/**
 * Obtener historial de movimientos
 */
export async function getMovimientos(): Promise<Movimiento[]> {
  const res = await requestApi<any>('GET', { action: 'movimientos' });
  const list = res.movimientos || (Array.isArray(res.resultado) ? res.resultado : []);
  return list.map(normalizeMovimiento);
}

/**
 * Crear un nuevo producto en Google Sheets
 */
export async function crearProducto(dto: CrearProductoDTO): Promise<BackendResponse> {
  const res = await requestApi<any>('POST', undefined, {
    action: 'crearProducto',
    producto: dto.producto.trim(),
    categoria: dto.categoria.trim(),
    unidad: dto.unidad,
    saldo: dto.saldo,
    minimo: dto.minimo,
  });
  return res;
}

/**
 * Editar un producto existente (nombre, categoría, cantidad mínima)
 * No modifica directamente el saldo.
 */
export async function editarProducto(dto: EditarProductoDTO): Promise<BackendResponse> {
  const res = await requestApi<any>('POST', undefined, {
    action: 'editarProducto',
    id: dto.id,
    producto: dto.producto.trim(),
    categoria: dto.categoria.trim(),
    minimo: dto.minimo,
  });
  return res;
}

/**
 * Registrar un movimiento (ENTRADA, SALIDA o AJUSTE)
 * En AJUSTE, cantidad representa el nuevo saldo total.
 */
export async function registrarMovimiento(dto: RegistrarMovimientoDTO): Promise<BackendResponse> {
  const res = await requestApi<any>('POST', undefined, {
    action: 'movimiento',
    productoId: dto.productoId,
    tipo: dto.tipo,
    cantidad: dto.cantidad,
    observacion: dto.observacion?.trim() || '',
  });
  return res;
}

/**
 * Archivar un producto en Google Sheets (cambio de estado sin eliminar físicamente)
 */
export async function archivarProducto(id: string | number): Promise<BackendResponse> {
  const res = await requestApi<any>('POST', undefined, {
    action: 'archivarProducto',
    id: id,
  });
  return res;
}

/**
 * Crear una nueva categoría en Google Sheets
 */
export async function crearCategoria(nombreCategoria: string): Promise<BackendResponse> {
  const res = await requestApi<any>('POST', undefined, {
    action: 'crearCategoria',
    categoria: nombreCategoria.trim(),
  });
  return res;
}

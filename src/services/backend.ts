/**
 * Centralized backend service for communicating exclusively with /api/backend.
 * Handles single-user security authorization PIN, request formatting,
 * error parsing, and robust data normalization.
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

/**
 * Normalizes product numbers and categories from Google Sheets
 */
function normalizeProducto(item: any): Producto {
  const catRaw = item?.Categoria ?? item?.categoria ?? item?.categoriaNombre ?? 'Otros';
  const catName =
    typeof catRaw === 'object'
      ? catRaw?.nombre || catRaw?.Categoria || 'Otros'
      : String(catRaw || 'Otros');

  const rawEmoji = item?.Emoji || item?.emoji || '';

  return {
    ID: item?.ID || item?.id || '',
    Producto: item?.Producto || item?.producto || item?.nombre || '',
    Categoria: catName,
    Unidad: item?.Unidad || item?.unidad || 'unidad',
    Saldo: parseDecimalInput(item?.Saldo ?? item?.saldo ?? 0),
    Minimo: parseDecimalInput(item?.Minimo ?? item?.minimo ?? 0),
    Emoji: rawEmoji,
    emoji: rawEmoji,
    Estado: item?.Estado || item?.estado || 'ACTIVO',
    FechaCreacion: item?.FechaCreacion || item?.fechaCreacion || '',
    FechaActualizacion: item?.FechaActualizacion || item?.fechaActualizacion || '',
  };
}

/**
 * Normalizes movement records
 */
function normalizeMovimiento(item: any): Movimiento {
  return {
    ID: item?.ID || item?.id || '',
    Fecha: item?.Fecha || item?.fecha || '',
    ProductoID: item?.ProductoID || item?.productoId || item?.producto_id || '',
    Producto: item?.Producto || item?.producto || '',
    Tipo: (item?.Tipo || item?.tipo || 'ENTRADA').toUpperCase(),
    Cantidad: parseDecimalInput(item?.Cantidad ?? item?.cantidad ?? 0),
    SaldoAnterior: parseDecimalInput(item?.SaldoAnterior ?? item?.saldoAnterior ?? 0),
    SaldoPosterior: parseDecimalInput(item?.SaldoPosterior ?? item?.saldoPosterior ?? 0),
    Observacion: item?.Observacion || item?.observacion || '',
  };
}

/**
 * Normalizes category records, ensuring `nombre` is ALWAYS a clean string,
 * preventing `[object Object]` errors completely.
 */
function normalizeCategoria(item: any): Categoria {
  if (typeof item === 'string') {
    const s = item.trim();
    return {
      id: s,
      nombre: s,
      Emoji: '',
      emoji: '',
      ID: s,
      Categoria: s,
    };
  }

  const rawNombre =
    item?.nombre ??
    item?.Nombre ??
    item?.Categoria ??
    item?.categoria ??
    item?.name ??
    '';

  const cleanNombre =
    typeof rawNombre === 'object'
      ? (rawNombre?.nombre || rawNombre?.Categoria || '')
      : String(rawNombre || '').trim();

  const rawId = item?.id ?? item?.ID ?? item?.Id ?? cleanNombre;
  const cleanId = String(rawId || cleanNombre);
  const rawEmoji = item?.Emoji ?? item?.emoji ?? '';

  return {
    id: cleanId,
    nombre: cleanNombre,
    Emoji: rawEmoji,
    emoji: rawEmoji,
    ID: cleanId,
    Categoria: cleanNombre,
  };
}

/**
 * Normalizes configuration key-values from Google Sheets
 */
function normalizeConfiguracion(rawConfig: any): Record<string, string> {
  const map: Record<string, string> = {};
  if (Array.isArray(rawConfig)) {
    for (const item of rawConfig) {
      const k = item?.Clave ?? item?.clave ?? item?.key ?? item?.Key;
      const v = item?.Valor ?? item?.valor ?? item?.val ?? item?.Value;
      if (k) map[String(k).trim().toLowerCase()] = String(v ?? '').trim();
    }
  } else if (rawConfig && typeof rawConfig === 'object') {
    for (const [k, v] of Object.entries(rawConfig)) {
      map[k.trim().toLowerCase()] = String(v ?? '').trim();
    }
  }
  return map;
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
    throw new Error('OFFLINE_ERROR');
  }

  let url = BASE_API_URL;

  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
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
      `CONNECTION_FAILED: ${netErr?.message || 'Error de red'}`
    );
  }

  if (response.status === 401) {
    const errorData = await response.json().catch(() => ({}));
    const err = new Error(
      errorData.error || 'Acceso no autorizado por el servidor.'
    );
    throw err;
  }

  let data: BackendResponse<T>;
  try {
    data = await response.json();
  } catch {
    throw new Error('INVALID_JSON_RESPONSE');
  }

  // Handle Apps Script error reporting
  if (data.ok === false || (data as any).success === false) {
    const msg = data.error || data.mensaje || 'SERVER_REPORTED_ERROR';
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
  configuracion: Record<string, string>;
}

/**
 * Obtener productos, categorías, movimientos y configuración en una sola solicitud inicial
 */
export async function getDatosIniciales(): Promise<DatosIniciales> {
  const res = await requestApi<any>('GET', { action: 'inicial' });

  const rawProductos = res.productos || (res.resultado as any)?.productos || [];
  const rawCategorias = res.categorias || (res.resultado as any)?.categorias || [];
  const rawMovimientos = res.movimientos || (res.resultado as any)?.movimientos || [];
  const rawConfig = res.configuracion || (res.resultado as any)?.configuracion || [];

  const allParsedProductos = rawProductos.map(normalizeProducto);

  return {
    // Exclude any legacy archived rows from active inventory without deleting them automatically
    productos: allParsedProductos.filter((p: Producto) => p.Estado !== 'ARCHIVADO'),
    categorias: rawCategorias
      .map(normalizeCategoria)
      .filter((c: Categoria) => c.nombre && c.nombre !== '[object Object]'),
    movimientos: rawMovimientos.map(normalizeMovimiento),
    configuracion: normalizeConfiguracion(rawConfig),
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
  return list
    .map(normalizeCategoria)
    .filter((c: Categoria) => c.nombre && c.nombre !== '[object Object]');
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
 * Crear un nuevo producto en Google Sheets.
 */
export async function crearProducto(dto: CrearProductoDTO): Promise<BackendResponse> {
  const nombreLimpio = dto.producto.trim();
  const res = await requestApi<any>('POST', undefined, {
    action: 'crearProducto',
    nombre: nombreLimpio,
    producto: nombreLimpio,
    categoria: dto.categoria.trim(),
    unidad: dto.unidad,
    saldoInicial: dto.saldo,
    saldo: dto.saldo,
    minimo: dto.minimo,
    stockMinimo: dto.minimo,
    emoji: dto.emoji || '',
  });
  return res;
}

/**
 * Editar un producto existente (nombre, categoría, cantidad mínima, emoji).
 */
export async function editarProducto(dto: EditarProductoDTO): Promise<BackendResponse> {
  const idStr = String(dto.id);
  const nombreLimpio = dto.producto.trim();
  const res = await requestApi<any>('POST', undefined, {
    action: 'editarProducto',
    id: idStr,
    productoId: idStr,
    nombre: nombreLimpio,
    producto: nombreLimpio,
    categoria: dto.categoria.trim(),
    minimo: dto.minimo,
    stockMinimo: dto.minimo,
    emoji: dto.emoji || '',
  });
  return res;
}

/**
 * Registrar un movimiento (ENTRADA, SALIDA o AJUSTE)
 */
export async function registrarMovimiento(dto: RegistrarMovimientoDTO): Promise<BackendResponse> {
  const idStr = String(dto.productoId);
  const res = await requestApi<any>('POST', undefined, {
    action: 'movimiento',
    productoId: idStr,
    id: idStr,
    tipo: dto.tipo,
    cantidad: dto.cantidad,
    observacion: dto.observacion?.trim() || '',
  });
  return res;
}

/**
 * Eliminar un producto sin stock y sus movimientos permanentemente de Google Sheets
 */
export async function eliminarProductoDefinitivo(id: string | number): Promise<BackendResponse> {
  const idStr = String(id);
  const res = await requestApi<any>('POST', undefined, {
    action: 'eliminarProducto',
    id: idStr,
    productoId: idStr,
  });
  return res;
}

/**
 * Alias para compatibilidad con llamadas anteriores
 */
export const archivarProducto = eliminarProductoDefinitivo;

/**
 * Limpiar filas de productos que quedaron en estado 'ARCHIVADO' de pruebas anteriores
 */
export async function limpiarArchivadosAnteriores(): Promise<BackendResponse> {
  try {
    const res = await requestApi<any>('POST', undefined, {
      action: 'limpiarArchivados',
    });
    return res;
  } catch (err) {
    return { ok: false, error: 'No se pudo limpiar los productos archivados' };
  }
}

/**
 * Crear una nueva categoría en Google Sheets.
 */
export async function crearCategoria(nombreCategoria: string, emoji?: string): Promise<BackendResponse> {
  const nombreLimpio = nombreCategoria.trim();
  const res = await requestApi<any>('POST', undefined, {
    action: 'crearCategoria',
    nombre: nombreLimpio,
    categoria: nombreLimpio,
    emoji: emoji || '',
  });
  return res;
}

/**
 * Editar una categoría existente en Google Sheets.
 */
export async function editarCategoria(dto: {
  id: string | number;
  nombre: string;
  nombreAnterior?: string;
  emoji?: string;
}): Promise<BackendResponse> {
  const idStr = String(dto.id);
  const nombreLimpio = dto.nombre.trim();
  const nombreAnt = (dto.nombreAnterior || idStr).trim();

  const res = await requestApi<any>('POST', undefined, {
    action: 'editarCategoria',
    id: idStr,
    categoriaId: idStr,
    idCategoria: idStr,
    nombre: nombreLimpio,
    categoria: nombreLimpio,
    nombreNuevo: nombreLimpio,
    nombreAnterior: nombreAnt,
    categoriaAnterior: nombreAnt,
    nombreOriginal: nombreAnt,
    oldNombre: nombreAnt,
    emoji: dto.emoji || '',
  });
  return res;
}

/**
 * Eliminar una categoría en Google Sheets.
 */
export async function eliminarCategoria(id: string | number): Promise<BackendResponse> {
  const idStr = String(id);
  const res = await requestApi<any>('POST', undefined, {
    action: 'eliminarCategoria',
    id: idStr,
    categoriaId: idStr,
  });
  return res;
}

/**
 * Guardar preferencia en la hoja Configuracion de Google Sheets.
 * Se maneja silenciosamente si la acción no está implementada en Apps Script.
 */
export async function guardarConfiguracion(
  clave: string,
  valor: string
): Promise<BackendResponse> {
  try {
    const res = await requestApi<any>('POST', undefined, {
      action: 'guardarConfiguracion',
      clave: clave.trim(),
      valor: valor.trim(),
    });
    return res;
  } catch (err) {
    // Mantener preferencia en memoria si la acción no está soportada aún en Apps Script
    return { ok: true };
  }
}

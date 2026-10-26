/**
 * Types matching the Google Sheets schema and Google Apps Script API
 */

export type UnidadMedida = 'kg' | 'g' | 'litro' | 'unidad';

export type TipoMovimiento = 'ENTRADA' | 'SALIDA' | 'AJUSTE';

export type LanguageCode = 'de' | 'es';

export interface Producto {
  ID: string | number;
  Producto: string;
  Categoria: string;
  Unidad: UnidadMedida | string;
  Saldo: number;
  Minimo: number;
  Estado?: string; // 'ACTIVO' | 'ARCHIVADO'
  FechaCreacion?: string;
  FechaActualizacion?: string;
}

export interface Movimiento {
  ID: string | number;
  Fecha: string;
  ProductoID: string | number;
  Producto: string;
  Tipo: TipoMovimiento;
  Cantidad: number;
  SaldoAnterior: number;
  SaldoPosterior: number;
  Observacion?: string;
}

export interface Categoria {
  id: string | number;
  nombre: string;
  // Aliases for compatibility
  ID?: string | number;
  Categoria?: string;
}

export interface Configuracion {
  Clave: string;
  Valor: string;
}

export interface BackendResponse<T = unknown> {
  ok: boolean;
  error?: string;
  mensaje?: string;
  resultado?: unknown;
  productos?: Producto[];
  categorias?: Categoria[];
  movimientos?: Movimiento[];
  configuracion?: Configuracion[] | Record<string, string>;
  producto?: Producto;
  data?: T;
  code?: string;
}

export interface CrearProductoDTO {
  producto: string;
  categoria: string;
  unidad: UnidadMedida;
  saldo: number;
  minimo: number;
}

export interface EditarProductoDTO {
  id: string | number;
  producto: string;
  categoria: string;
  minimo: number;
}

export interface RegistrarMovimientoDTO {
  productoId: string | number;
  tipo: TipoMovimiento;
  cantidad: number;
  observacion?: string;
}

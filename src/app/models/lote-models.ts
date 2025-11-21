// Modelos relacionados con lotes
// Todos los comentarios están en español según las reglas del proyecto.

/**
 * Modelo de entrada para lote.
 */
export interface LoteEntrada {
  nombreLote?: string | null;
  firmadoresIds: number[];
  usuarioCreacionId: number;
  estatus: boolean;
  orientacion?: string | null;
  instructor?: string | null;
  activo: boolean;
  fecha?: string | null;
  extFondo?: string | null;
  fondo?: string | null;
  lstConstanciasLote: import('./constancia-models').ConstanciaEntrada[];
}

/**
 * Parámetros para la consulta paginada de lotes por firmante/creador.
 */
export interface LotePagedQueryParams {
  id: number;
  estatus: string;
  noPagina: number;
  registrosxPagina: number;
  busqueda: string;
  colOrden: string;
  tipoOrden: number;
}

/**
 * Modelo de salida para lote.
 */
export interface LoteSalida {
  idLote?: number | null;
  nombreLote?: string | null;
  idFirmante?: number | null;
  nombreFirmante?: string | null;
  estatus?: string | null;
  orientacion?: string | null;
  instructor?: string | null;
  cantidad?: number | null;
  fecha?: string | null;
  activo: boolean;
  fechaFirmado?: string | null;
}

/**
 * Modelo de respuesta con lista de lotes.
 */
export interface LoteSalidaListResponseModel {
  data: LoteSalida[] | null;
  success: boolean;
  message: string;
}

/**
 * Modelo de respuesta paginada con lista de lotes.
 */
export interface LoteSalidaPagedResponseModel {
  data: {
    paginacion: {
      paginaActual: number;
      conteoTotal: number;
      paginasTotales: number;
      anterior: boolean;
      siguiente: boolean;
    };
    registros: LoteSalida[];
  } | null;
  success: boolean;
  message: string;
}

/**
 * Modelo de respuesta con un lote.
 */
export interface LoteSalidaResponseModel {
  data: LoteSalida;
  success: boolean;
  message: string;
}

/**
 * Modelo de lote FMC.
 */
export interface FmcLote {
  id?: number | null;
  nombre: string;
  userId: number;
  firmanteId: number;
  instructor?: string | null;
  estatus: boolean;
  orientacion?: string | null;
  activo: boolean;
  fecha?: string | null;
  fechaFirmado?: string | null;
}

/**
 * Modelo de respuesta con lote FMC.
 */
export interface FmcLoteResponseModel {
  data: FmcLote;
  success: boolean;
  message: string;
}

/**
 * Modelo de lote nuevo.
 */
export interface LoteNuevo {
  // Esquema vacío en Swagger
}

/**
 * Modelo de respuesta con lote nuevo.
 */
export interface LoteNuevoResponseModel {
  data: LoteNuevo;
  success: boolean;
  message: string;
}

// Modelos relacionados con constancias
// Todos los comentarios están en español según las reglas del proyecto.

/**
 * Modelo de entrada para constancia.
 */
export interface ConstanciaEntrada {
  idConstancia?: string | null;
  nombrePersona?: string | null;
  rfc?: string | null;
  curp?: string | null;
  email?: string | null;
  fondoImagen?: string | null;
  textoHtml?: string | null;
  sello?: string | null;
  identificador: string;
}

/**
 * Modelo de salida para constancia.
 */
export interface ConstanciaSalida {
  id?: number | null;
  nombre?: string | null;
  rfc?: string | null;
  curp?: string | null;
  email?: string | null;
  texto?: string | null;
  loteId: number;
  cadena?: string | null;
  codigoQr?: string | null;
  estatus: boolean;
  identificador: string;
}

/**
 * Modelo de respuesta con lista de constancias.
 */
export interface ConstanciaSalidaListResponseModel {
  data: ConstanciaSalida[] | null;
  success: boolean;
  message: string;
}

/**
 * Modelo de respuesta con una constancia.
 */
export interface ConstanciaSalidaResponseModel {
  data: ConstanciaSalida;
  success: boolean;
  message: string;
}

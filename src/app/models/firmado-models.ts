// Modelos relacionados con firmado digital
// Todos los comentarios están en español según las reglas del proyecto.

/**
 * Modelo de datos firmados para constancia.
 */
export interface DatosFirmadoConstancia {
  idConstancia: number;
  nombreCompleto?: string | null;
  fechaTimbrado: string; // Date-time
  numCertificado?: string | null;
  rfcCertificado?: string | null;
  selloDigital?: string | null;
  selloEstampadoTiempo?: string | null;
  urlValida?: string | null;
  identificador: string;
}

/**
 * Modelo de respuesta para datos firmados.
 */
export interface DatosFirmadoResponse {
  sucess: boolean;
  mensajeRespuesta?: string | null;
  idLote: number;
  datosFirmadoConstancias: DatosFirmadoConstancia[];
}

// Modelos relacionados con base de constancia
// Todos los comentarios están en español según las reglas del proyecto.

/**
 * Modelo de base de constancia.
 */
export interface FmcBaseConstancia {
  id?: number | null;
  idUsuario?: number | null;
  cuerpoConstancia: string;
}

/**
 * Modelo de respuesta con lista enumerable de bases de constancia.
 */
export interface FmcBaseConstanciaIEnumerableResponseModel {
  data: FmcBaseConstancia[] | null;
  success: boolean;
  message: string;
}

/**
 * Modelo de respuesta con una base de constancia.
 */
export interface FmcBaseConstanciaResponseModel {
  data: FmcBaseConstancia;
  success: boolean;
  message: string;
}

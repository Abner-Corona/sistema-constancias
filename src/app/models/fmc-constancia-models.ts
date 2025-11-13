// Modelos FMC adicionales
// Todos los comentarios están en español según las reglas del proyecto.

/**
 * Modelo de constancia FMC.
 */
export interface FmcConstancia {
  // Esquema vacío en Swagger, agregar propiedades según necesidad
  nombre: string;
}

/**
 * Modelo de respuesta con lista enumerable de constancias FMC.
 */
export interface FmcConstanciaIEnumerableResponseModel {
  data: FmcConstancia[] | null;
  success: boolean;
  message: string;
}

/**
 * Modelo de respuesta con lista de constancias FMC.
 */
export interface FmcConstanciaListResponseModel {
  data: FmcConstancia[] | null;
  success: boolean;
  message: string;
}

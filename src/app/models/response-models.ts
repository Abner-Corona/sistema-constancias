// Modelos de respuesta genéricos
// Todos los comentarios están en español según las reglas del proyecto.

/**
 * Modelo de respuesta booleana.
 */
export interface BooleanResponseModel {
  data: boolean;
  success: boolean;
  message: string;
}

/**
 * Modelo de respuesta con array de bytes.
 */
export interface ByteArrayResponseModel {
  data: string | null; // Base64 encoded
  success: boolean;
  message: string;
}

/**
 * Modelo de respuesta con entero de 32 bits.
 */
export interface Int32ResponseModel {
  data: number;
  success: boolean;
  message: string;
}

/**
 * Modelo de respuesta genérica con objeto.
 */
export interface ObjectResponseModel {
  data: any;
  success: boolean;
  message: string;
}

/**
 * Modelo de respuesta con cadena de texto.
 */
export interface StringResponseModel {
  data: string | null;
  success: boolean;
  message: string;
}

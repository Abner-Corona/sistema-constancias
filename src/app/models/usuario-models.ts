// Modelos relacionados con usuarios
// Todos los comentarios están en español según las reglas del proyecto.

/**
 * Modelo de credenciales para login.
 */
export interface LoginCredentials {
  usuario: string;
  password: string;
}

/**
 * Modelo de salida para usuario.
 */
export interface UsuarioSalida {
  id?: number | null;
  nombre?: string | null;
  usuario?: string | null;
  token?: string | null;
  perfiles: string[];
}

/**
 * Modelo de respuesta con lista enumerable de usuarios.
 */
export interface UsuarioSalidaIEnumerableResponseModel {
  data: UsuarioSalida[] | null;
  success: boolean;
  message: string;
}

/**
 * Modelo de respuesta con lista de usuarios.
 */
export interface UsuarioSalidaListResponseModel {
  data: UsuarioSalida[] | null;
  success: boolean;
  message: string;
}

/**
 * Modelo de respuesta con un usuario.
 */
export interface UsuarioSalidaResponseModel {
  data: UsuarioSalida;
  success: boolean;
  message: string;
}

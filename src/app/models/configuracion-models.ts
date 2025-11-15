// Modelos relacionados con configuración
// Todos los comentarios están en español según las reglas del proyecto.

/**
 * Modelo de configuración.
 */
export interface FmcConfiguracion {
  id?: number | null;
  emailEnvio: string;
  passwordEnvio: string;
  puerto?: string | null;
  smtp?: string | null;
  defaultCredentials: boolean;
  enableSsl: boolean;
  nombre?: string | null;
  idFirmante?: number | null;
}

/**
 * Modelo para crear una nueva configuración (POST).
 */
export interface FmcConfiguracionCreate {
  correo: string;
  password?: string;
  userID?: number;
  puerto?: number;
  smtp?: string;
  credentials?: boolean;
  ssl?: boolean;
  titulo?: string;
}

/**
 * Modelo de respuesta con configuración.
 */
export interface FmcConfiguracionResponseModel {
  data: FmcConfiguracion;
  success: boolean;
  message: string;
}

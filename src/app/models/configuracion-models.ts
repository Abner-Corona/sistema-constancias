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
 * Modelo de respuesta con configuración.
 */
export interface FmcConfiguracionResponseModel {
  data: FmcConfiguracion;
  success: boolean;
  message: string;
}

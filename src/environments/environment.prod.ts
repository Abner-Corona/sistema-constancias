/**
 * Configuración del entorno de producción
 * Este archivo contiene todas las variables de entorno específicas para producción
 */
export const environment = {
  production: true,
  name: 'production',

  // Configuración de la API
  api: {
    baseUrl: 'https://sifec.morelos.gob.mx/firmadoWSTEST/',
    timeout: 30000,
    retries: 3,
  },

  // Configuración de la aplicación
  app: {
    name: 'Sistema de Certificados',
    version: '1.0.0',
    defaultLanguage: 'es',
  },

  // Flags de funcionalidades
  features: {
    enableDebugMode: false,
    enableAnalytics: true,
    enableErrorReporting: true,
  },

  // Servicios externos
  external: {
    analytics: {
      enabled: true,
      trackingId: 'GA_MEASUREMENT_ID',
    },
  },
};

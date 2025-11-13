/**
 * Configuración del entorno de producción
 * Este archivo contiene todas las variables de entorno específicas para producción
 */
export const environment = {
  production: true,
  name: 'production',

  // API Configuration
  api: {
    baseUrl: 'https://sifec.morelos.gob.mx/firmadoWSTEST/',
    timeout: 30000,
    retries: 3,
  },

  // Application Configuration
  app: {
    name: 'Sistema de Constancias',
    version: '1.0.0',
    defaultLanguage: 'es',
  },

  // Feature Flags
  features: {
    enableDebugMode: false,
    enableAnalytics: true,
    enableErrorReporting: true,
  },

  // External Services
  external: {
    analytics: {
      enabled: true,
      trackingId: 'GA_MEASUREMENT_ID',
    },
  },
};

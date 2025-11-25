/**
 * Configuración del entorno de staging
 * Este archivo contiene todas las variables de entorno específicas para staging/testing
 */
export const environment = {
  production: false,
  name: 'staging',

  // Configuración de la API
  api: {
    baseUrl: 'https://api-staging.sistema-certificados.com/api/',
    timeout: 30000,
    retries: 3,
  },

  // Configuración de la aplicación
  app: {
    name: 'Sistema de Certificados (Staging)',
    version: '1.0.0-beta',
    defaultLanguage: 'es',
  },

  // Flags de funcionalidades
  features: {
    enableDebugMode: true,
    enableAnalytics: false,
    enableErrorReporting: true,
  },

  // Servicios externos
  external: {
    analytics: {
      enabled: false,
      trackingId: '',
    },
  },
};

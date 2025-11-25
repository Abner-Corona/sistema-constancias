/**
 * Configuración del entorno de desarrollo
 * Este archivo contiene todas las variables de entorno específicas para desarrollo local
 */
export const environment = {
  production: false,
  name: 'development',

  // Configuración de la API
  api: {
    baseUrl: 'https://localhost:7199/api/',
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

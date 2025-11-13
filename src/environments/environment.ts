/**
 * Configuración del entorno de desarrollo
 * Este archivo contiene todas las variables de entorno específicas para desarrollo local
 */
export const environment = {
  production: false,
  name: 'development',

  // API Configuration
  api: {
    baseUrl: 'https://localhost:7199/api/',
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
    enableDebugMode: true,
    enableAnalytics: false,
    enableErrorReporting: true,
  },

  // External Services
  external: {
    analytics: {
      enabled: false,
      trackingId: '',
    },
  },
};

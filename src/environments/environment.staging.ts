/**
 * Configuración del entorno de staging
 * Este archivo contiene todas las variables de entorno específicas para staging/testing
 */
export const environment = {
  production: false,
  name: 'staging',

  // API Configuration
  api: {
    baseUrl: 'https://api-staging.sistema-certificados.com/api/',
    timeout: 30000,
    retries: 3,
  },

  // Application Configuration
  app: {
    name: 'Sistema de Certificados (Staging)',
    version: '1.0.0-beta',
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

import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';

/**
 * Servicio de configuración centralizada
 * Proporciona acceso tipado y seguro a las variables de entorno
 * Facilita el testing y la inyección de dependencias
 */
@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private readonly config = environment;

  /**
   * Obtiene la configuración completa del entorno
   */
  getEnvironment(): typeof environment {
    return this.config;
  }

  /**
   * Verifica si estamos en modo producción
   */
  isProduction(): boolean {
    return this.config.production;
  }

  /**
   * Obtiene el nombre del entorno actual
   */
  getEnvironmentName(): string {
    return this.config.name;
  }

  /**
   * Obtiene la configuración de la API
   */
  getApiConfig() {
    return this.config.api;
  }

  /**
   * Obtiene la URL base de la API
   */
  getApiBaseUrl(): string {
    return this.config.api.baseUrl;
  }

  /**
   * Obtiene el timeout de la API
   */
  getApiTimeout(): number {
    return this.config.api.timeout;
  }

  /**
   * Obtiene el número máximo de reintentos de API
   */
  getApiRetries(): number {
    return this.config.api.retries;
  }

  /**
   * Obtiene la configuración de la aplicación
   */
  getAppConfig() {
    return this.config.app;
  }

  /**
   * Obtiene el nombre de la aplicación
   */
  getAppName(): string {
    return this.config.app.name;
  }

  /**
   * Obtiene la versión de la aplicación
   */
  getAppVersion(): string {
    return this.config.app.version;
  }

  /**
   * Obtiene el idioma por defecto
   */
  getDefaultLanguage(): string {
    return this.config.app.defaultLanguage;
  }

  /**
   * Obtiene las banderas de características
   */
  getFeatures() {
    return this.config.features;
  }

  /**
   * Verifica si una característica está habilitada
   */
  isFeatureEnabled(feature: keyof typeof environment.features): boolean {
    return this.config.features[feature];
  }

  /**
   * Obtiene la configuración de servicios externos
   */
  getExternalConfig() {
    return this.config.external;
  }

  /**
   * Verifica si los analytics están habilitados
   */
  isAnalyticsEnabled(): boolean {
    return this.config.external.analytics.enabled;
  }

  /**
   * Obtiene el ID de seguimiento de analytics
   */
  getAnalyticsTrackingId(): string {
    return this.config.external.analytics.trackingId;
  }
}

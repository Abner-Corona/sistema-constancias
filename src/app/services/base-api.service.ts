import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';

/**
 * Clase base para servicios API con patrón híbrido
 * Proporciona métodos tanto observables como async/await
 */
@Injectable({
  providedIn: 'root',
})
export abstract class BaseApiService {
  protected http = inject(HttpClient);

  /**
   * Convierte un observable a Promise con manejo de errores centralizado
   */
  protected async executeAsync<T>(observable: Observable<T>): Promise<T> {
    try {
      return await firstValueFrom(observable);
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Manejo centralizado de errores de API
   */
  protected handleApiError(error: any): ApiError {
    console.error('API Error:', error);

    let message = 'Error desconocido en la servidor';
    let statusCode = 500;

    if (error?.status) {
      statusCode = error.status;

      switch (error.status) {
        case 400:
          message = 'Datos inválidos enviados al servidor';
          break;
        case 401:
          message = 'Sesión expirada. Por favor, inicie sesión nuevamente';
          // Aquí podrías hacer logout automático
          // this.authService.logout();
          break;
        case 403:
          message = 'No tiene permisos para realizar esta acción';
          break;
        case 404:
          message = 'El recurso solicitado no fue encontrado';
          break;
        case 409:
          message = 'Conflicto con los datos existentes';
          break;
        case 422:
          message = 'Los datos enviados no cumplen con las validaciones';
          break;
        case 500:
          message = 'Error interno del servidor. Intente nuevamente';
          break;
        default:
          message = `Error del servidor (${error.status})`;
      }
    }

    return new ApiError(message, statusCode, error);
  }
}

/**
 * Clase de error personalizada para APIs
 */
export class ApiError extends Error {
  constructor(message: string, public statusCode: number = 500, public originalError?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

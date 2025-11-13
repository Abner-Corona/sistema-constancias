import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from '../base-api.service';
import { FmcConfiguracionResponseModel } from '@models/configuracion-models';

/**
 * Servicio para manejar operaciones de configuración.
 * Implementa patrón híbrido: observables + async/await
 */
@Injectable({
  providedIn: 'root',
})
export class ConfiguracionService extends BaseApiService {
  /**
   * Obtiene la configuración actual.
   * @returns Observable con la configuración.
   */
  get(): Observable<FmcConfiguracionResponseModel> {
    return this.http.get<FmcConfiguracionResponseModel>('Configuracion');
  }

  /**
   * Obtiene la configuración actual (versión async/await).
   * @returns Promise con la configuración.
   */
  async getAsync(): Promise<FmcConfiguracionResponseModel> {
    return this.executeAsync(this.get());
  }

  /**
   * Agrega una nueva configuración.
   * @param configuracion Datos de la configuración a agregar.
   * @returns Observable con la respuesta de la operación.
   */
  add(configuracion: any): Observable<FmcConfiguracionResponseModel> {
    return this.http.post<FmcConfiguracionResponseModel>('Configuracion', configuracion);
  }

  /**
   * Agrega una nueva configuración (versión async/await).
   * @param configuracion Datos de la configuración a agregar.
   * @returns Promise con la respuesta de la operación.
   */
  async addAsync(configuracion: any): Promise<FmcConfiguracionResponseModel> {
    return this.executeAsync(this.add(configuracion));
  }

  /**
   * Actualiza la configuración existente.
   * @param configuracion Datos actualizados de la configuración.
   * @returns Observable con la respuesta de la operación.
   */
  update(configuracion: any): Observable<FmcConfiguracionResponseModel> {
    return this.http.put<FmcConfiguracionResponseModel>(
      'Configuracion/ActualizarPut',
      configuracion
    );
  }

  /**
   * Actualiza la configuración existente (versión async/await).
   * @param configuracion Datos actualizados de la configuración.
   * @returns Promise con la respuesta de la operación.
   */
  async updateAsync(configuracion: any): Promise<FmcConfiguracionResponseModel> {
    return this.executeAsync(this.update(configuracion));
  }

  /**
   * Obtiene el firmante por configuración.
   * @returns Observable con la información del firmante.
   */
  getFirmante(): Observable<any> {
    return this.http.get('Configuracion/GetFirmante');
  }

  /**
   * Obtiene el firmante por configuración (versión async/await).
   * @returns Promise con la información del firmante.
   */
  async getFirmanteAsync(): Promise<any> {
    return this.executeAsync(this.getFirmante());
  }
}

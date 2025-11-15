import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from '../base-api.service';
import {
  FmcConfiguracionResponseModel,
  FmcConfiguracionCreate,
} from '@models/configuracion-models';
import { objectToFormData } from '@utils/helpers';

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
  add(configuracion: FmcConfiguracionCreate): Observable<FmcConfiguracionResponseModel> {
    const formData = objectToFormData(configuracion);
    return this.http.post<FmcConfiguracionResponseModel>('Configuracion', formData);
  }

  /**
   * Agrega una nueva configuración (versión async/await).
   * @param configuracion Datos de la configuración a agregar.
   * @returns Promise con la respuesta de la operación.
   */
  async addAsync(configuracion: FmcConfiguracionCreate): Promise<FmcConfiguracionResponseModel> {
    return this.executeAsync(this.add(configuracion));
  }

  /**
   * Actualiza la configuración existente.
   * @param configuracion Datos actualizados de la configuración.
   * @returns Observable con la respuesta de la operación.
   */
  update(configuracion: FmcConfiguracionCreate): Observable<FmcConfiguracionResponseModel> {
    const formData = objectToFormData(configuracion);
    return this.http.put<FmcConfiguracionResponseModel>('Configuracion/ActualizarPut', formData);
  }

  /**
   * Actualiza la configuración existente (versión async/await).
   * @param configuracion Datos actualizados de la configuración.
   * @returns Promise con la respuesta de la operación.
   */
  async updateAsync(configuracion: FmcConfiguracionCreate): Promise<FmcConfiguracionResponseModel> {
    return this.executeAsync(this.update(configuracion));
  }

  /**
   * Obtiene el firmante por configuración.
   * @param idFirmante ID del firmante a obtener.
   * @returns Observable con la información del firmante.
   */
  getFirmante(idFirmante: number): Observable<FmcConfiguracionResponseModel> {
    const params = new HttpParams().set('idFirmante', idFirmante.toString());
    return this.http.get<FmcConfiguracionResponseModel>('Configuracion/GetFirmante', { params });
  }

  /**
   * Obtiene el firmante por configuración (versión async/await).
   * @param idFirmante ID del firmante a obtener.
   * @returns Promise con la información del firmante.
   */
  async getFirmanteAsync(idFirmante: number): Promise<FmcConfiguracionResponseModel> {
    return this.executeAsync(this.getFirmante(idFirmante));
  }
}

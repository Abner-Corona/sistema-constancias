import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from '../base-api.service';
import {
  FmcBaseConstanciaIEnumerableResponseModel,
  FmcBaseConstanciaResponseModel,
} from '@models/base-constancia-models';

/**
 * Servicio para manejar operaciones de base de constancia.
 * Implementa patrón híbrido: observables + async/await
 */
@Injectable({
  providedIn: 'root',
})
export class BaseConstanciaService extends BaseApiService {
  /**
   * Obtiene todas las bases de constancia.
   * @returns Observable con la lista de bases de constancia.
   */
  getAll(): Observable<FmcBaseConstanciaIEnumerableResponseModel> {
    return this.http.get<FmcBaseConstanciaIEnumerableResponseModel>('BaseConstancia');
  }

  /**
   * Obtiene todas las bases de constancia (versión async/await).
   * @returns Promise con la lista de bases de constancia.
   */
  async getAllAsync(): Promise<FmcBaseConstanciaIEnumerableResponseModel> {
    return this.executeAsync(this.getAll());
  }

  /**
   * Agrega una nueva base de constancia.
   * @param baseConstancia Datos de la base de constancia a agregar.
   * @returns Observable con la respuesta de la operación.
   */
  add(baseConstancia: any): Observable<FmcBaseConstanciaResponseModel> {
    return this.http.post<FmcBaseConstanciaResponseModel>('BaseConstancia', baseConstancia);
  }

  /**
   * Agrega una nueva base de constancia (versión async/await).
   * @param baseConstancia Datos de la base de constancia a agregar.
   * @returns Promise con la respuesta de la operación.
   */
  async addAsync(baseConstancia: any): Promise<FmcBaseConstanciaResponseModel> {
    return this.executeAsync(this.add(baseConstancia));
  }

  /**
   * Actualiza una base de constancia existente.
   * @param baseConstancia Datos actualizados de la base de constancia.
   * @returns Observable con la respuesta de la operación.
   */
  update(baseConstancia: any): Observable<FmcBaseConstanciaResponseModel> {
    return this.http.patch<FmcBaseConstanciaResponseModel>('BaseConstancia', baseConstancia);
  }

  /**
   * Actualiza una base de constancia existente (versión async/await).
   * @param baseConstancia Datos actualizados de la base de constancia.
   * @returns Promise con la respuesta de la operación.
   */
  async updateAsync(baseConstancia: any): Promise<FmcBaseConstanciaResponseModel> {
    return this.executeAsync(this.update(baseConstancia));
  }

  /**
   * Obtiene bases de constancia por ID de usuario.
   * @param idUsuario ID del usuario.
   * @returns Observable con la lista de bases de constancia.
   */
  getByUserId(idUsuario: number): Observable<FmcBaseConstanciaIEnumerableResponseModel> {
    return this.http.get<FmcBaseConstanciaIEnumerableResponseModel>(
      `BaseConstancia/GetBaseConstIdUsuario/${idUsuario}`
    );
  }

  /**
   * Obtiene bases de constancia por ID de usuario (versión async/await).
   * @param idUsuario ID del usuario.
   * @returns Promise con la lista de bases de constancia.
   */
  async getByUserIdAsync(idUsuario: number): Promise<FmcBaseConstanciaIEnumerableResponseModel> {
    return this.executeAsync(this.getByUserId(idUsuario));
  }
}

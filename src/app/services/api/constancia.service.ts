import { Injectable } from '@angular/core';
import { BaseApiService } from '@services/base-api.service';
import { Observable } from 'rxjs';
import {
  ConstanciaSalidaListResponseModel,
  ConstanciaSalidaResponseModel,
  ConstanciaEntrada,
} from '@models/constancia-models';

/**
 * Servicio para manejar operaciones de constancias con patrón híbrido
 * Proporciona métodos tanto observables como async/await
 */
@Injectable({
  providedIn: 'root',
})
export class ConstanciaService extends BaseApiService {
  /**
   * Obtiene todas las constancias (Observable)
   * Ideal para templates con async pipe o subscribe manual
   */
  getAll(): Observable<ConstanciaSalidaListResponseModel> {
    return this.http.get<ConstanciaSalidaListResponseModel>('Constancia');
  }

  /**
   * Obtiene todas las constancias (Promise)
   * Ideal para lógica secuencial con async/await
   */
  async getAllAsync(): Promise<ConstanciaSalidaListResponseModel> {
    return this.executeAsync(this.getAll());
  }

  /**
   * Agrega una nueva constancia (Observable)
   */
  add(constancia: ConstanciaEntrada): Observable<ConstanciaSalidaResponseModel> {
    return this.http.post<ConstanciaSalidaResponseModel>('Constancia', constancia);
  }

  /**
   * Agrega una nueva constancia (Promise)
   */
  async addAsync(constancia: ConstanciaEntrada): Promise<ConstanciaSalidaResponseModel> {
    return this.executeAsync(this.add(constancia));
  }

  /**
   * Actualiza una constancia existente (Observable)
   */
  update(constancia: ConstanciaEntrada): Observable<ConstanciaSalidaResponseModel> {
    return this.http.put<ConstanciaSalidaResponseModel>('Constancia', constancia);
  }

  /**
   * Actualiza una constancia existente (Promise)
   */
  async updateAsync(constancia: ConstanciaEntrada): Promise<ConstanciaSalidaResponseModel> {
    return this.executeAsync(this.update(constancia));
  }

  /**
   * Obtiene una constancia por ID (Observable)
   */
  getById(id: number): Observable<ConstanciaSalidaResponseModel> {
    return this.http.get<ConstanciaSalidaResponseModel>(`Constancia/GetConstanciaId/${id}`);
  }

  /**
   * Obtiene una constancia por ID (Promise)
   */
  async getByIdAsync(id: number): Promise<ConstanciaSalidaResponseModel> {
    return this.executeAsync(this.getById(id));
  }

  /**
   * Obtiene constancias por ID de lote (Observable)
   */
  getByLoteId(idLote: number): Observable<ConstanciaSalidaListResponseModel> {
    return this.http.get<ConstanciaSalidaListResponseModel>(
      `Constancia/GetConstanciaIdLote/${idLote}`
    );
  }

  /**
   * Obtiene constancias por ID de lote (Promise)
   */
  async getByLoteIdAsync(idLote: number): Promise<ConstanciaSalidaListResponseModel> {
    return this.executeAsync(this.getByLoteId(idLote));
  }

  /**
   * Obtiene constancias por nombre (Observable)
   */
  getByNombre(nombre: string): Observable<ConstanciaSalidaListResponseModel> {
    return this.http.get<ConstanciaSalidaListResponseModel>(
      `Constancia/GetConstanciaNombre/${nombre}`
    );
  }

  /**
   * Obtiene constancias por nombre (Promise)
   */
  async getByNombreAsync(nombre: string): Promise<ConstanciaSalidaListResponseModel> {
    return this.executeAsync(this.getByNombre(nombre));
  }

  /**
   * Obtiene constancias por email (Observable)
   */
  getByEmail(email: string): Observable<ConstanciaSalidaListResponseModel> {
    return this.http.get<ConstanciaSalidaListResponseModel>(
      `Constancia/GetConstanciaEmail/${email}`
    );
  }

  /**
   * Obtiene constancias por email (Promise)
   */
  async getByEmailAsync(email: string): Promise<ConstanciaSalidaListResponseModel> {
    return this.executeAsync(this.getByEmail(email));
  }
}

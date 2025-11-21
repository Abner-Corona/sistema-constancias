import { Injectable } from '@angular/core';
import { BaseApiService } from '@services/base-api.service';
import { Observable } from 'rxjs';
import {
  LoteSalidaListResponseModel,
  LoteSalidaPagedResponseModel,
  LoteSalidaResponseModel,
  LoteEntrada,
  LotePagedQueryParams,
} from '@models/lote-models';

/**
 * Servicio para manejar operaciones de lotes con patrón híbrido
 * Proporciona métodos tanto observables como async/await
 */
@Injectable({
  providedIn: 'root',
})
export class LotesService extends BaseApiService {
  /**
   * Obtiene todos los lotes (Observable)
   */
  getAll(): Observable<LoteSalidaListResponseModel> {
    return this.http.get<LoteSalidaListResponseModel>('Lotes');
  }

  /**
   * Obtiene todos los lotes (Promise)
   */
  async getAllAsync(): Promise<LoteSalidaListResponseModel> {
    return this.executeAsync(this.getAll());
  }

  /**
   * Agrega un nuevo lote (Observable)
   */
  add(lote: LoteEntrada): Observable<LoteSalidaResponseModel> {
    return this.http.post<LoteSalidaResponseModel>('Lotes', lote);
  }

  /**
   * Agrega un nuevo lote (Promise)
   */
  async addAsync(lote: LoteEntrada): Promise<LoteSalidaResponseModel> {
    return this.executeAsync(this.add(lote));
  }

  /**
   * Elimina un lote (Observable)
   */
  delete(id: number): Observable<any> {
    return this.http.patch(`Lotes?id=${id}`, {});
  }

  /**
   * Elimina un lote (Promise)
   */
  async deleteAsync(id: number): Promise<any> {
    return this.executeAsync(this.delete(id));
  }

  /**
   * Actualiza el curso de un lote (Observable)
   */
  updateCurso(id: number, curso: string): Observable<any> {
    return this.http.put(`Lotes?id=${id}&curso=${encodeURIComponent(curso)}`, {});
  }

  /**
   * Actualiza el curso de un lote (Promise)
   */
  async updateCursoAsync(id: number, curso: string): Promise<any> {
    return this.executeAsync(this.updateCurso(id, curso));
  }

  /**
   * Obtiene un lote por ID (Observable)
   */
  getById(id: number): Observable<LoteSalidaResponseModel> {
    return this.http.get<LoteSalidaResponseModel>(`Lotes/GetLoteId/${id}`);
  }

  /**
   * Obtiene un lote por ID (Promise)
   */
  async getByIdAsync(id: number): Promise<LoteSalidaResponseModel> {
    return this.executeAsync(this.getById(id));
  }

  /**
   * Obtiene lotes por estatus (Observable)
   */
  getByEstatus(estatus: string): Observable<LoteSalidaListResponseModel> {
    return this.http.get<LoteSalidaListResponseModel>(`Lotes/GetLoteEstatus/${estatus}`);
  }

  /**
   * Obtiene lotes por estatus (Promise)
   */
  async getByEstatusAsync(estatus: string): Promise<LoteSalidaListResponseModel> {
    return this.executeAsync(this.getByEstatus(estatus));
  }

  /**
   * Obtiene lotes por firmante y estatus (Observable)
   */
  getByFirmante(idFirmante: number, estatus: string): Observable<LoteSalidaListResponseModel> {
    return this.http.get<LoteSalidaListResponseModel>(
      `Lotes/GetLoteFirmanteCreador/${idFirmante}/${estatus}`
    );
  }

  /**
   * Obtiene lotes por firmante y estatus (Promise)
   */
  async getByFirmanteAsync(
    idFirmante: number,
    estatus: string
  ): Promise<LoteSalidaListResponseModel> {
    return this.executeAsync(this.getByFirmante(idFirmante, estatus));
  }

  /**
   * Obtiene lotes por firmante/creador con paginación y filtros (Observable)
   */
  getLoteFirmanteCreadorPaged(
    params: LotePagedQueryParams
  ): Observable<LoteSalidaPagedResponseModel> {
    const queryParams = new URLSearchParams({
      noPagina: params.noPagina.toString(),
      RegistrosxPagina: params.registrosxPagina.toString(),
      busqueda: params.busqueda,
      colOrden: params.colOrden,
      tipoOrden: params.tipoOrden.toString(),
    });
    return this.http.get<LoteSalidaPagedResponseModel>(
      `Lotes/GetLoteFirmanteCreador/${params.id}/${params.estatus}?${queryParams.toString()}`
    );
  }

  /**
   * Obtiene lotes por firmante/creador con paginación y filtros (Promise)
   */
  async getLoteFirmanteCreadorPagedAsync(
    params: LotePagedQueryParams
  ): Promise<LoteSalidaPagedResponseModel> {
    return this.executeAsync(this.getLoteFirmanteCreadorPaged(params));
  }
}

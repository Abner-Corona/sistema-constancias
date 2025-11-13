import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from '../base-api.service';
import { DatosFirmadoResponse } from '@models/firmado-models';

/**
 * Servicio para manejar operaciones de firmado digital.
 * Implementa patrón híbrido: observables + async/await
 */
@Injectable({
  providedIn: 'root',
})
export class FirmadoService extends BaseApiService {
  /**
   * Firma las constancias de un lote.
   * @param firmadoData Datos para el firmado.
   * @returns Observable con la respuesta del firmado.
   */
  firmar(firmadoData: any): Observable<DatosFirmadoResponse> {
    return this.http.post<DatosFirmadoResponse>('Firmado', firmadoData);
  }

  /**
   * Firma las constancias de un lote (versión async/await).
   * @param firmadoData Datos para el firmado.
   * @returns Promise con la respuesta del firmado.
   */
  async firmarAsync(firmadoData: any): Promise<DatosFirmadoResponse> {
    return this.executeAsync(this.firmar(firmadoData));
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from '../base-api.service';

/**
 * Servicio para manejar operaciones de correo.
 * Implementa patrón híbrido: observables + async/await
 */
@Injectable({
  providedIn: 'root',
})
export class CorreoService extends BaseApiService {
  /**
   * Envía un correo electrónico.
   * @param emailData Datos del correo a enviar.
   * @returns Observable con la respuesta de la operación.
   */
  sendEmail(emailData: any): Observable<any> {
    return this.http.post('Correo', emailData);
  }

  /**
   * Envía un correo electrónico (versión async/await).
   * @param emailData Datos del correo a enviar.
   * @returns Promise con la respuesta de la operación.
   */
  async sendEmailAsync(emailData: any): Promise<any> {
    return this.executeAsync(this.sendEmail(emailData));
  }
}

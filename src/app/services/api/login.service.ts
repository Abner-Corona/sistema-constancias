import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from '../base-api.service';
import { UsuarioSalidaResponseModel, LoginCredentials } from '@models/usuario-models';
import { objectToFormData } from '@utils/helpers';

/**
 * Servicio para manejar operaciones de login.
 * Implementa patrón híbrido: observables + async/await
 */
@Injectable({
  providedIn: 'root',
})
export class LoginService extends BaseApiService {
  /**
   * Realiza el login del usuario.
   * @param credentials Credenciales del usuario (usuario y contraseña).
   * @returns Observable con la respuesta del login.
   */
  login(credentials: LoginCredentials): Observable<UsuarioSalidaResponseModel> {
    const formData = objectToFormData(credentials);
    return this.http.post<UsuarioSalidaResponseModel>('Login', formData);
  }

  /**
   * Realiza el login del usuario (versión async/await).
   * @param credentials Credenciales del usuario (usuario y contraseña).
   * @returns Promise con la respuesta del login.
   */
  async loginAsync(credentials: LoginCredentials): Promise<UsuarioSalidaResponseModel> {
    return this.executeAsync(this.login(credentials));
  }
}

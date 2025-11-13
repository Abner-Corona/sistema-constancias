import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from '../base-api.service';
import { UsuarioSalidaListResponseModel, UsuarioSalidaResponseModel } from '@models/usuario-models';

/**
 * Servicio para manejar operaciones de usuarios.
 * Implementa patrón híbrido: observables + async/await
 */
@Injectable({
  providedIn: 'root',
})
export class UsuariosService extends BaseApiService {
  /**
   * Obtiene todos los usuarios.
   * @returns Observable con la lista de usuarios.
   */
  getAll(): Observable<UsuarioSalidaListResponseModel> {
    return this.http.get<UsuarioSalidaListResponseModel>('Usuarios');
  }

  /**
   * Obtiene todos los usuarios (versión async/await).
   * @returns Promise con la lista de usuarios.
   */
  async getAllAsync(): Promise<UsuarioSalidaListResponseModel> {
    return this.executeAsync(this.getAll());
  }

  /**
   * Obtiene un usuario por ID.
   * @param id ID del usuario.
   * @returns Observable con el usuario.
   */
  getById(id: number): Observable<UsuarioSalidaResponseModel> {
    return this.http.get<UsuarioSalidaResponseModel>(`Usuarios/GetUsuarioId/${id}`);
  }

  /**
   * Obtiene un usuario por ID (versión async/await).
   * @param id ID del usuario.
   * @returns Promise con el usuario.
   */
  async getByIdAsync(id: number): Promise<UsuarioSalidaResponseModel> {
    return this.executeAsync(this.getById(id));
  }

  /**
   * Obtiene usuarios por perfil.
   * @param nombrePerfil Nombre del perfil.
   * @returns Observable con la lista de usuarios.
   */
  getByPerfil(nombrePerfil: string): Observable<UsuarioSalidaListResponseModel> {
    return this.http.get<UsuarioSalidaListResponseModel>(
      `Usuarios/GetUsuarioPerfil/${nombrePerfil}`
    );
  }

  /**
   * Obtiene usuarios por perfil (versión async/await).
   * @param nombrePerfil Nombre del perfil.
   * @returns Promise con la lista de usuarios.
   */
  async getByPerfilAsync(nombrePerfil: string): Promise<UsuarioSalidaListResponseModel> {
    return this.executeAsync(this.getByPerfil(nombrePerfil));
  }
}

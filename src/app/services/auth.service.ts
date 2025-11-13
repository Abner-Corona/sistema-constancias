import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '@services/api/login.service';
import { UsuarioSalidaResponseModel, UsuarioSalida } from '@models/usuario-models';

/**
 * Servicio de autenticación que maneja el estado del usuario y la sesión.
 * Proporciona métodos para login, logout y verificación de autenticación.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private router = inject(Router);
  private loginService = inject(LoginService);

  // Estado de autenticación usando señales
  private _currentUser = signal<UsuarioSalida | null>(null);
  private _isAuthenticated = signal<boolean>(false);

  // Señales computadas para estado derivado
  public currentUser = this._currentUser.asReadonly();
  public isAuthenticated = this._isAuthenticated.asReadonly();
  public userProfile = computed(() => this._currentUser()?.perfiles?.[0] || null);
  public userId = computed(() => this._currentUser()?.id || null);
  public userName = computed(() => this._currentUser()?.usuario || null);
  public userFullName = computed(() => this._currentUser()?.nombre || null);

  constructor() {
    this.checkStoredSession();
  }

  /**
   * Realiza el login del usuario (versión async/await)
   */
  async loginAsync(credentials: {
    usuario: string;
    password: string;
  }): Promise<UsuarioSalidaResponseModel> {
    try {
      const response = await this.loginService.loginAsync(credentials);
      if (response.success && response.data) {
        this.setAuthenticatedUser(response.data);
        this.saveSessionToStorage(response.data);
        return response;
      } else {
        throw new Error(response.message || 'Error en la autenticación');
      }
    } catch (error) {
      this.logout();
      throw error;
    }
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    this._currentUser.set(null);
    this._isAuthenticated.set(false);
    this.clearSessionFromStorage();
    this.router.navigate(['/login']);
  }

  /**
   * Verifica la sesión almacenada al iniciar la aplicación
   */
  private checkStoredSession(): void {
    try {
      const storedUser = localStorage.getItem('currentUser');
      const storedAuth = localStorage.getItem('isAuthenticated');

      if (storedUser && storedAuth === 'true') {
        const user: UsuarioSalida = JSON.parse(storedUser);
        this.setAuthenticatedUser(user);
      }
    } catch (error) {
      // Si hay error al parsear, limpiar la sesión
      this.clearSessionFromStorage();
    }
  }

  /**
   * Establece el usuario autenticado
   */
  private setAuthenticatedUser(user: UsuarioSalida): void {
    this._currentUser.set(user);
    this._isAuthenticated.set(true);
  }

  /**
   * Guarda la sesión en localStorage
   */
  private saveSessionToStorage(user: UsuarioSalida): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('isAuthenticated', 'true');
    if (user.token) {
      localStorage.setItem('authToken', user.token);
    }
  }

  /**
   * Limpia la sesión de localStorage
   */
  private clearSessionFromStorage(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('authToken');
  }
}

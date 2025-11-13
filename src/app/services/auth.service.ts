import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
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

  // BehaviorSubject para compatibilidad con observables (útil para guards)
  private authStatusSubject = new BehaviorSubject<boolean>(false);
  public authStatus$ = this.authStatusSubject.asObservable();

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
    this.authStatusSubject.next(false);
    this.clearSessionFromStorage();
    this.router.navigate(['/login']);
  }

  /**
   * Verifica si el usuario tiene un perfil específico
   */
  hasRole(role: string): boolean {
    const user = this._currentUser();
    return user?.perfiles?.includes(role) || false;
  }

  /**
   * Verifica si el usuario tiene alguno de los roles especificados
   */
  hasAnyRole(roles: string[]): boolean {
    return roles.some((role) => this.hasRole(role));
  }

  /**
   * Verifica si el usuario tiene todos los roles especificados
   */
  hasAllRoles(roles: string[]): boolean {
    return roles.every((role) => this.hasRole(role));
  }

  /**
   * Obtiene el token de autenticación (si existe)
   * Nota: Adaptar según la implementación real de tokens
   */
  getToken(): string | null {
    return sessionStorage.getItem('authToken');
  }

  /**
   * Verifica la sesión almacenada al iniciar la aplicación
   */
  private checkStoredSession(): void {
    try {
      const storedUser = sessionStorage.getItem('currentUser');
      const storedAuth = sessionStorage.getItem('isAuthenticated');

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
    this.authStatusSubject.next(true);
  }

  /**
   * Guarda la sesión en sessionStorage
   */
  private saveSessionToStorage(user: UsuarioSalida): void {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    sessionStorage.setItem('isAuthenticated', 'true');
    // Guardar campos individuales para compatibilidad
    sessionStorage.setItem('userID', user.id?.toString() || '');
    sessionStorage.setItem('userName', user.usuario || '');
    sessionStorage.setItem('userProfile', user.perfiles?.[0] || '');
    sessionStorage.setItem('userFullName', user.nombre || '');
  }

  /**
   * Limpia la sesión de sessionStorage
   */
  private clearSessionFromStorage(): void {
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('userID');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('userProfile');
    sessionStorage.removeItem('userFullName');
    sessionStorage.removeItem('authToken');
  }
}

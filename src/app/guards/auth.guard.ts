import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { AuthService } from '@services/auth.service';

/**
 * Guard que protege rutas que requieren autenticación.
 * Redirige a login si el usuario no está autenticado.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(): Observable<boolean> | boolean {
    // Si ya está autenticado, permitir acceso
    if (this.authService.isAuthenticated()) {
      return true;
    }

    // Si no está autenticado, redirigir a login
    this.router.navigate(['/login']);
    return false;
  }
}

/**
 * Guard que protege rutas que requieren NO estar autenticado.
 * Útil para páginas como login, registro, etc.
 * Redirige al dashboard si el usuario ya está autenticado.
 */
@Injectable({
  providedIn: 'root',
})
export class GuestGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(): Observable<boolean> | boolean {
    // Si está autenticado, redirigir al dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    // Si no está autenticado, permitir acceso a la ruta
    return true;
  }
}

/**
 * Guard que verifica roles específicos.
 * Se puede usar para proteger rutas que requieren permisos específicos.
 */
@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {}

  canActivate(): Observable<boolean> | boolean {
    // Verificar si el usuario tiene el rol requerido
    // Nota: Este guard se puede extender para recibir roles como parámetro
    // Por ahora, verifica que tenga al menos un rol
    if (this.authService.userProfile()) {
      return true;
    }

    // Si no tiene rol, redirigir a página de acceso denegado o login
    this.router.navigate(['/login']);
    return false;
  }
}

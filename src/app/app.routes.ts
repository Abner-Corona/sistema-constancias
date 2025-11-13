import { Routes } from '@angular/router';
import { AuthGuard, GuestGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('@pages/login/login').then((m) => m.LoginComponent),
    canActivate: [GuestGuard], // Solo accesible si NO está autenticado
  },
  {
    path: 'main',
    canActivate: [AuthGuard], // Requiere autenticación
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadComponent: () => import('@pages/home/home').then((m) => m.HomeComponent),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '/login', // Redirigir rutas no encontradas al login
  },
];

import { Routes } from '@angular/router';
import { AuthGuard, GuestGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('@pages/login/login').then((m) => m.LoginComponent),
    canActivate: [GuestGuard], // Solo accesible si NO está autenticado
  },
  {
    path: 'dashboard',
    loadComponent: () => import('@pages/dashboard/dashboard').then((m) => m.DashboardComponent),
    canActivate: [AuthGuard], // Requiere autenticación
    children: [
      {
        path: '',
        loadComponent: () => import('@pages/dashboard/home/home').then((m) => m.HomeComponent),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '/login', // Redirigir rutas no encontradas al login
  },
];

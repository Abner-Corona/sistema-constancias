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
      {
        path: 'usuarios',
        loadComponent: () =>
          import('@pages/dashboard/usuarios/usuarios').then((m) => m.UsuariosComponent),
      },
      {
        path: 'configuracion',
        loadComponent: () =>
          import('@pages/dashboard/configuracion/configuracion').then(
            (m) => m.ConfiguracionComponent
          ),
      },
      {
        path: 'constancias',
        loadComponent: () =>
          import('@pages/dashboard/constancias/constancias').then((m) => m.ConstanciasComponent),
        children: [
          {
            path: '',
            redirectTo: 'nuevas',
            pathMatch: 'full',
          },
          {
            path: 'nuevas',
            loadComponent: () =>
              import('@pages/dashboard/constancias/nuevas/nuevas').then((m) => m.NuevasComponent),
          },
          {
            path: 'pendientes',
            loadComponent: () =>
              import('@pages/dashboard/constancias/pendientes/pendientes').then(
                (m) => m.PendientesComponent
              ),
          },
          {
            path: 'firmadas',
            loadComponent: () =>
              import('@pages/dashboard/constancias/firmadas/firmadas').then(
                (m) => m.FirmadasComponent
              ),
          },
        ],
      },
    ],
  },
  {
    path: '**',
    redirectTo: '/login', // Redirigir rutas no encontradas al login
  },
];

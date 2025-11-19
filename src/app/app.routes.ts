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
        path: 'certificados',
        loadComponent: () =>
          import('@pages/dashboard/certificados/certificados').then((m) => m.CertificadosComponent),
        children: [
          {
            path: '',
            redirectTo: 'pendientes',
            pathMatch: 'full',
          },
          {
            path: 'nuevos',
            loadComponent: () =>
              import('@pages/dashboard/certificados/nuevos/nuevos').then((m) => m.NuevosComponent),
          },
          {
            path: 'pendientes',
            loadComponent: () =>
              import('@pages/dashboard/certificados/pendientes/pendientes').then(
                (m) => m.PendientesComponent
              ),
          },
          {
            path: 'firmados',
            loadComponent: () =>
              import('@pages/dashboard/certificados/firmados/firmados').then(
                (m) => m.FirmadosComponent
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

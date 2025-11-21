import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MenubarModule } from 'primeng/menubar';
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet,
    ButtonModule,
    CardModule,
    MenubarModule,
    MenuModule,
    BadgeModule,
    TooltipModule,
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  protected readonly open = signal(true);

  // Información del usuario actual
  userName = this.authService.userFullName;
  userProfile = this.authService.userProfile;

  // Computed para responsive
  isMobile = computed(() => typeof window !== 'undefined' && window.innerWidth < 768);

  // Menú items para el sidebar
  menuItems = [
    {
      label: 'Inicio',
      icon: 'pi pi-home',
      routerLink: '/dashboard',
      command: () => this.closeSidebarOnMobile(),
    },
    {
      label: 'Certificados',
      icon: 'pi pi-file',
      routerLink: '/dashboard/certificados',
      command: () => this.closeSidebarOnMobile(),
    },
    {
      label: 'Usuarios',
      icon: 'pi pi-users',
      routerLink: '/dashboard/usuarios',
      command: () => this.closeSidebarOnMobile(),
    },
    {
      label: 'Configuración',
      icon: 'pi pi-cog',
      routerLink: '/dashboard/configuracion',
      command: () => this.closeSidebarOnMobile(),
    },
  ];

  toggle(): void {
    this.open.update((v) => !v);
  }

  closeSidebarOnMobile(): void {
    // En móvil, cerrar el sidebar después de navegar
    if (this.isMobile()) {
      this.open.set(false);
    }
  }

  logout(): void {
    this.authService.logout();
  }
}

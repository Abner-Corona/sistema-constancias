import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, ButtonModule, CardModule],
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

  toggle(): void {
    this.open.update((v) => !v);
  }

  logout(): void {
    this.authService.logout();
  }
}

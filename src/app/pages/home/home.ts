import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Información del usuario actual
  userName = this.authService.userFullName;
  userProfile = this.authService.userProfile;

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    this.authService.logout();
  }

  /**
   * Navega a la demostración del preset Morelos
   */
  navigateToMorelosDemo(): void {
    this.router.navigate(['/main/morelos-demo']);
  }
}

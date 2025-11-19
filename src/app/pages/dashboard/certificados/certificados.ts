import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-certificados',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ButtonModule, CardModule],
  templateUrl: './certificados.html',
  styleUrls: ['./certificados.css'],
})
export class CertificadosComponent implements OnInit {
  private router = inject(Router);

  // Estado activo del tab
  activeTab = signal(0);

  ngOnInit() {
    // Navegar a la primera pestaña por defecto
    this.navigateToTab(0);
  }

  // Navegar a una pestaña específica
  navigateToTab(index: number) {
    this.activeTab.set(index);
    const routes = ['pendientes', 'nuevos', 'firmados'];
    if (routes[index]) {
      this.router.navigate([`/dashboard/certificados/${routes[index]}`]);
    }
  }
}

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-constancias',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ButtonModule, CardModule],
  templateUrl: './constancias.html',
  styleUrls: ['./constancias.css'],
})
export class ConstanciasComponent implements OnInit {
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
    const routes = ['pendientes', 'nuevas', 'firmadas'];
    if (routes[index]) {
      this.router.navigate([`/dashboard/constancias/${routes[index]}`]);
    }
  }
}

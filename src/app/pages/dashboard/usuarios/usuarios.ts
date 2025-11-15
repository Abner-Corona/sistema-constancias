import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { UsuariosService } from '@services/api/usuarios.service';
import { UsuarioSalida } from '@models/usuario-models';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, TableModule],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.css'],
})
export class UsuariosComponent implements OnInit {
  private usuariosService = inject(UsuariosService);

  // Señales para el estado
  usuarios = signal<UsuarioSalida[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  async ngOnInit() {
    await this.loadUsuarios();
  }

  private async loadUsuarios() {
    try {
      this.loading.set(true);
      this.error.set(null);
      const response = await this.usuariosService.getAllAsync();
      this.usuarios.set(response.data || []);
    } catch (error) {
      console.error('Error loading usuarios:', error);
      this.error.set('Error al cargar los usuarios. Por favor, intenta de nuevo.');
    } finally {
      this.loading.set(false);
    }
  }
}

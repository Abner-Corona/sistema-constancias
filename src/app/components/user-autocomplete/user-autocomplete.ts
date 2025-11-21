import { Component, input, output, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutoComplete, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { UsuarioSalida } from '@models/usuario-models';
import { UsuariosService } from '@services/api/usuarios.service';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

interface CompleteEvent {
  query: string;
}

@Component({
  selector: 'app-user-autocomplete',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AutoComplete,
    ProgressSpinnerModule,
    IconFieldModule,
    InputIconModule,
  ],
  templateUrl: './user-autocomplete.html',
  styleUrls: ['./user-autocomplete.css'],
})
export class UserAutocompleteComponent implements OnInit {
  // Inputs
  label = input<string>('');
  placeholder = input<string>('Buscar usuario');
  perfil = input<string>('Firmante');
  selectedValue = input<UsuarioSalida[] | string>('');
  multiple = input<boolean>(false);
  styleClass = input<string>('');

  // Outputs
  onSelect = output<UsuarioSalida | UsuarioSalida[]>();

  // Servicios
  private usuariosService = inject(UsuariosService);

  // Señales internas
  allUsers = signal<UsuarioSalida[]>([]);
  filteredUsers = signal<UsuarioSalida[]>([]);
  loading = signal(false);

  // Propiedad local para ngModel
  selectedValueModel: UsuarioSalida[] | string = '';

  async ngOnInit() {
    if (this.multiple()) {
      this.selectedValueModel = Array.isArray(this.selectedValue()) ? this.selectedValue() : [];
    } else {
      this.selectedValueModel =
        typeof this.selectedValue() === 'string' ? this.selectedValue() : '';
    }
    await this.loadUsers();
  }

  private async loadUsers() {
    this.loading.set(true);
    try {
      const response = await this.usuariosService.getByPerfilAsync(this.perfil());
      if (response.success && response.data) {
        this.allUsers.set(response.data);
        this.filteredUsers.set(response.data);
      }
    } catch (error) {
    } finally {
      this.loading.set(false);
    }
  }

  onUserSelect(event: AutoCompleteSelectEvent) {
    if (this.multiple()) {
      this.onSelect.emit(this.selectedValueModel as UsuarioSalida[]);
    } else {
      const user = event.value as UsuarioSalida;
      this.selectedValueModel = user.nombre || '';
      this.onSelect.emit(user);
    }
  }

  filterUsers(event: CompleteEvent) {
    const query = event.query.toLowerCase();
    this.filteredUsers.set(
      this.allUsers().filter((user) => user.nombre?.toLowerCase().includes(query))
    );
  }
}

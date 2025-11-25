import {
  Component,
  input,
  effect,
  output,
  signal,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  Renderer2,
  inject,
} from '@angular/core';
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
export class UserAutocompleteComponent implements OnInit, AfterViewInit, OnDestroy {
  // Entradas
  label = input<string>('');
  placeholder = input<string>('Buscar usuario');
  perfil = input<string>('Firmante');
  // selectedValue puede ser un array (modo multiple), una cadena (modo single/typed), o null cuando se limpia
  selectedValue = input<UsuarioSalida[] | string | null>('');
  multiple = input<boolean>(false);
  styleClass = input<string>('');

  // Salidas
  // permitir null cuando el usuario limpia la selección en modo single
  onSelect = output<UsuarioSalida | UsuarioSalida[] | null>();

  // Servicios
  private usuariosService = inject(UsuariosService);
  // Referencias DOM para gestionar comportamiento de foco/scroll
  private hostRef = inject(ElementRef) as ElementRef<HTMLElement>;
  private renderer = inject(Renderer2);

  // Señales internas
  allUsers = signal<UsuarioSalida[]>([]);
  filteredUsers = signal<UsuarioSalida[]>([]);
  loading = signal(false);

  // Propiedad local para ngModel (getter/setter protege contra `null`)
  private _selectedValueModel: UsuarioSalida[] | string = '';

  // manejador en fase de captura para limpiar el input
  private _clearHandler: ((e: Event) => void) | null = null;

  get selectedValueModel(): UsuarioSalida[] | string {
    return this._selectedValueModel;
  }

  set selectedValueModel(value: unknown) {
    // Normalizar el modelo para evitar errores internos de PrimeNG cuando el valor sea null.
    if (this.multiple()) {
      if (value == null || value === '') {
        this._selectedValueModel = [];
        return;
      }

      if (Array.isArray(value)) {
        // filtrar entradas null/undefined por seguridad
        this._selectedValueModel = (value as UsuarioSalida[]).filter((v) => v != null);
        return;
      }

      // Tipo inesperado -> conservar el valor previo o usar array vacío
      this._selectedValueModel = Array.isArray(this._selectedValueModel)
        ? this._selectedValueModel
        : [];
      return;
    }

    // En modo single el modelo debe ser una etiqueta (string), nunca null
    if (value == null) {
      this._selectedValueModel = '';
      return;
    }

    if (typeof value === 'string') {
      this._selectedValueModel = value;
      return;
    }

    // Si se recibe un objeto, intentar usar su propiedad `nombre`
    if (typeof value === 'object') {
      const user = value as UsuarioSalida;
      this._selectedValueModel = user.nombre || '';
      return;
    }

    // Alternativa / caso por defecto
    this._selectedValueModel = '';
  }

  // Mantener el modelo interno sincronizado cuando el padre actualice `selectedValue` (p.ej. cancelar/reset)
  // IMPORTANTE: effect() debe crearse en un contexto de inyección (por ejemplo, inicializador de campo)
  private syncSelectedEffect = effect(() => {
    const sv = this.selectedValue();
    if (this.multiple()) {
      this.selectedValueModel = Array.isArray(sv) ? sv : [];
    } else {
      this.selectedValueModel = typeof sv === 'string' ? sv : '';
    }
  });

  async ngOnInit() {
    if (this.multiple()) {
      const sv = this.selectedValue();
      this.selectedValueModel = Array.isArray(sv) ? sv : [];
    } else {
      const sv = this.selectedValue();
      this.selectedValueModel = typeof sv === 'string' ? sv : '';
    }
    await this.loadUsers();
  }

  ngAfterViewInit(): void {
    // Si el autocomplete se renderiza en modo múltiple, asegurarse de que el input
    // inline se desplace a la vista al recibir focus para que el cursor/placeholder sean visibles.
    try {
      const container = this.hostRef.nativeElement.querySelector('.p-autocomplete-input-multiple');
      if (container) {
        const inputEl = container.querySelector(
          'input.p-autocomplete-input'
        ) as HTMLInputElement | null;
        if (inputEl) {
          this.renderer.listen(inputEl, 'focus', () => {
            // Desplazar el contenedor horizontalmente para que el input quede visible
            // Se desplaza hasta el final donde normalmente vive el input.
            container.scrollLeft = container.scrollWidth;
          });
        }
      }
      // instalar un listener en fase de captura en el host para interceptar clicks
      // sobre el icono de limpiar antes de que corran los handlers internos de PrimeNG.
      // Esto nos permite normalizar el modelo y evitar que updateModel de PrimeNG
      // intente leer `.map` sobre null.
      this._clearHandler = (e: Event) => {
        const target = e.target as Element | null;
        if (!target) return;
        const clearEl = target.closest('.p-autocomplete-clear-icon, .p-autocomplete-clear');
        if (clearEl) {
          e.stopImmediatePropagation();
          e.preventDefault();
          if (this.multiple()) {
            this.selectedValueModel = [];
            this.onSelect.emit([]);
          } else {
            this.selectedValueModel = '';
            this.onSelect.emit(null);
          }
        }
      };
      this.hostRef.nativeElement.addEventListener('click', this._clearHandler, true);
    } catch (e) {
      // Si la estructura del DOM es diferente o estamos en SSR, ignorar de forma segura
    }
  }

  ngOnDestroy(): void {
    if (this._clearHandler) {
      try {
        this.hostRef.nativeElement.removeEventListener('click', this._clearHandler, true);
      } catch (e) {
        /* ignore */
      }
      this._clearHandler = null;
    }
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
      // asegurarnos de no emitir arrays que contengan null o undefined
      const arr = Array.isArray(this.selectedValueModel)
        ? (this.selectedValueModel as UsuarioSalida[]).filter((v) => v != null)
        : [];
      this.onSelect.emit(arr);
    } else {
      const user = event.value as UsuarioSalida;
      this.selectedValueModel = user.nombre || '';
      this.onSelect.emit(user);
    }
  }

  /**
   * Llamado cuando cambia el ngModel (escritura, chips agregados/removidos, o botón de limpiar).
   * Emitimos onSelect para que los componentes padres reciban la selección actualizada y
   * normalizamos las acciones de limpieza: array vacío para modo múltiple, null para modo single.
   */
  onModelChange(value: unknown) {
    // Modo múltiple -> esperar arrays
    if (this.multiple()) {
      if (Array.isArray(value)) {
        // filtrar nulls que pueden aparecer en algunos casos extremos
        const safe = (value as Array<unknown>).filter((v) => v != null) as UsuarioSalida[];
        this.selectedValueModel = safe;
        this.onSelect.emit(safe);
      } else if (value == null || value === '') {
        this.selectedValueModel = [];
        this.onSelect.emit([]);
      } else {
        // Algunos casos extremos donde puede recibirse un único objeto
        this.selectedValueModel = Array.isArray(this.selectedValueModel)
          ? this.selectedValueModel
          : [];
        this.onSelect.emit(this.selectedValueModel as UsuarioSalida[]);
      }
      return;
    }

    // Modo single
    if (value == null || value === '') {
      // limpiado
      this.selectedValueModel = '';
      this.onSelect.emit(null);
    } else if (typeof value === 'object') {
      // PrimeNG puede proporcionar el objeto; mostrar el label mientras emitimos el objeto
      const user = value as UsuarioSalida;
      this.selectedValueModel = user.nombre || '';
      this.onSelect.emit(user);
    } else if (typeof value === 'string') {
      // cadena escrita - mantener el modelo pero no emitir un objeto Usuario todavía
      this.selectedValueModel = value;
    }
  }

  filterUsers(event: CompleteEvent) {
    const query = event.query.toLowerCase();
    this.filteredUsers.set(
      this.allUsers().filter((user) => user.nombre?.toLowerCase().includes(query))
    );
  }
}

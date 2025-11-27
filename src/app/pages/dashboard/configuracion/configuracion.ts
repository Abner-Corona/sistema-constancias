import {
  Component,
  inject,
  signal,
  OnInit,
  computed,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  Renderer2,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ConfiguracionService } from '@services/api/configuracion.service';
import { FmcConfiguracionCreate } from '@models/configuracion-models';
import { UsuarioSalida } from '@models/usuario-models';
import { UsuariosService } from '@services/api/usuarios.service';
import { AutoComplete } from 'primeng/autocomplete';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [
    CommonModule,
    // reactive form removed: using template-driven forms (ngModel)
    FormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    AutoComplete,
    ProgressSpinnerModule,
    IconFieldModule,
    InputIconModule,
    PasswordModule,
    ConfirmDialogModule,
  ],
  templateUrl: './configuracion.html',
  styleUrls: ['./configuracion.css'],
  providers: [ConfirmationService],
})
export class ConfiguracionComponent implements OnInit, AfterViewInit, OnDestroy {
  // Modelo usado por template-driven forms
  config = signal({
    id: null as number | null,
    emailEnvio: '' as string,
    passwordEnvio: '' as string,
    puerto: '' as string,
    smtp: '' as string,
    defaultCredentials: false,
    enableSsl: true,
    nombre: '' as string,
    idFirmante: null as number | null,
    editorData: `<p style="text-align:center;"><img class="image_resized" style="width:242px;" src="assets/images/logotipos.png" alt="Proyecto Colibri"></p><h2 style="text-align:center;">GOBIERNO DEL ESTADO DE MORELOS</h2><h4 style="text-align:center;">Otorga el presente certificado a:</h4><p style="text-align:center;"><br>--NOMBRE--</p><p style="text-align:center;">&nbsp;</p><p style="text-align:center;">Por haber concluido satisfactoriamente</p><p>&nbsp;</p>`,
  });
  private configuracionService = inject(ConfiguracionService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private hostRef = inject(ElementRef) as ElementRef<HTMLElement>;
  private renderer = inject(Renderer2);

  private _clearHandler: ((e: Event) => void) | null = null;
  private usuariosService = inject(UsuariosService);

  // Señales para el estado
  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);
  selectedUser = signal<UsuarioSalida | null>(null);
  selectedUserName = signal<string>('');
  // usuarios/autocomplete state
  allUsers = signal<UsuarioSalida[]>([]);
  filteredUsers = signal<UsuarioSalida[]>([]);
  usersLoading = signal<boolean>(false);

  // modelo para el ngModel del autocompletado (string, input text)
  selectedUserModel = '';

  // El formulario ahora es template-driven: usar 'config' signal y ngModel en la plantilla

  async ngOnInit() {
    // Cargar la lista de firmantes para el autocomplete y, si procede, la configuración
    await this.loadUsers();
    // Inicialmente mantenerse con el estado por defecto; si se desea, cargar configuración
    await this.loadConfiguracion();
  }

  ngAfterViewInit(): void {
    // Intercept clicks on clear icon to avoid PrimeNG updateModel calling .map on null
    try {
      this._clearHandler = (e: Event) => {
        const target = e.target as Element | null;
        if (!target) return;
        const clearEl = target.closest('.p-autocomplete-clear-icon, .p-autocomplete-clear');
        if (clearEl) {
          e.stopImmediatePropagation();
          e.preventDefault();
          // clear selection for single-mode autocomplete on this page
          this.selectedUser.set(null);
          this.selectedUserName.set('');
          this.selectedUserModel = '';
          this.config.update((c) => ({ ...c, idFirmante: null }));
        }
      };

      this.hostRef.nativeElement.addEventListener('click', this._clearHandler, true);
    } catch (e) {
      // ignore in SSR or unusual DOM
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
    try {
      this.usersLoading.set(true);
      const response = await this.usuariosService.getByPerfilAsync('Firmante');
      if (response.success && response.data) {
        this.allUsers.set(response.data);
        this.filteredUsers.set(response.data);
      }
    } catch (error) {
      /* ignorar errores aquí, se muestran en loadConfiguracion si aplica */
    } finally {
      this.usersLoading.set(false);
    }
  }

  filterUsers(event: { query: string }) {
    const q = (event.query || '').toLowerCase();
    this.filteredUsers.set(this.allUsers().filter((u) => u.nombre?.toLowerCase().includes(q)));
  }

  onModelChange(value: unknown) {
    // Cuando escriben en el input lo mantenemos como string; si viene un objeto (PrimeNG
    // puede pasar el objeto con ngModel), delegamos a onUserSelect
    if (value == null || value === '') {
      this.selectedUserModel = '';
      // limpiar selección cuando la caja queda vacía
      this.selectedUser.set(null);
      this.selectedUserName.set('');
      this.config.update((c) => ({ ...c, idFirmante: null }));
      return;
    }

    if (typeof value === 'object') {
      this.onUserSelect((value as any).value ?? value);
      return;
    }

    // valor string
    this.selectedUserModel = String(value);
  }

  // Actualiza una propiedad del modelo de configuración (usado por template-driven forms)
  setConfigProp(key: string, value: unknown) {
    this.config.update((c) => ({ ...(c as any), [key]: value }));
  }

  private async loadConfiguracion(idFirmante?: number) {
    const firmanteId = idFirmante || this.selectedUser()?.id || 1;
    try {
      this.loading.set(true);
      this.error.set(null);
      const response = await this.configuracionService.getFirmanteAsync(firmanteId);

      if (response.success && response.data) {
        const d = response.data;
        // Mapear respuesta al modelo usado por la plantilla
        this.config.set({
          id: (d as any).id ?? null,
          emailEnvio: (d as any).emailEnvio ?? '',
          passwordEnvio: (d as any).passwordEnvio ?? '',
          puerto: (d as any).puerto ?? '',
          smtp: (d as any).smtp ?? '',
          defaultCredentials: (d as any).defaultCredentials ?? false,
          enableSsl: (d as any).enableSsl ?? true,
          nombre: (d as any).nombre ?? '',
          idFirmante: (d as any).idFirmante ?? null,
          editorData: this.config().editorData,
        });
      }
    } catch (error) {
      this.error.set('Error al cargar la configuración. Por favor, intenta de nuevo.');
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo cargar la configuración',
      });
    } finally {
      this.loading.set(false);
    }
  }

  async onSubmit(form: any) {
    if (form.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Por favor, completa todos los campos requeridos correctamente.',
      });
      return;
    }

    this.confirmationService.confirm({
      message: '¿Quieres guardar la configuración?',
      acceptButtonProps: { label: 'Sí' },
      rejectButtonProps: { label: 'No' },
      accept: () => {
        this.saveConfig();
      },
    });
  }

  private async saveConfig() {
    try {
      this.saving.set(true);
      const formValue = this.config();

      let response;

      // Create: sin id
      const createData: FmcConfiguracionCreate = {
        correo: formValue.emailEnvio,
        password: formValue.passwordEnvio || undefined,
        userID: typeof formValue.idFirmante === 'number' ? formValue.idFirmante : undefined,
        puerto: formValue.puerto ? Number(formValue.puerto) : undefined,
        smtp: formValue.smtp || undefined,
        credentials: formValue.defaultCredentials,
        ssl: formValue.enableSsl,
        titulo: formValue.nombre || undefined,
      };
      response = await this.configuracionService.addAsync(createData);

      if (response.success) {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Configuración guardada correctamente',
        });
        // Recargar la configuración para obtener el ID si era nueva
        await this.loadConfiguracion();
      } else {
        throw new Error(response.message || 'Error desconocido');
      }
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo guardar la configuración',
      });
    } finally {
      this.saving.set(false);
    }
  }

  onUserSelect(event: any) {
    // PrimeNG AutoComplete passes { originalEvent, value } when an item is selected.
    const user = event?.value ?? event;
    if (user) {
      this.selectedUser.set(user);
      this.selectedUserName.set(user.nombre || '');
      this.selectedUserModel = user.nombre || '';
      // Establecer el idFirmante en el formulario
      this.config.update((c) => ({ ...c, idFirmante: user.id }));
      if (user.id) {
        this.loadConfiguracion(user.id);
      }
    } else {
      // Clear selection
      this.selectedUser.set(null);
      this.selectedUserName.set('');
      this.config.update((c) => ({ ...c, idFirmante: null }));
    }
  }
}

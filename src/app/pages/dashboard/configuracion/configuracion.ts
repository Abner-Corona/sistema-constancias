import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { AutoComplete } from 'primeng/autocomplete';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ConfiguracionService } from '@services/api/configuracion.service';
import { FmcConfiguracionCreate } from '@models/configuracion-models';
import { UsuariosService } from '@services/api/usuarios.service';
import { UsuarioSalida } from '@models/usuario-models';
@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    AutoComplete,
    ToastModule,
    ConfirmDialogModule,
  ],
  templateUrl: './configuracion.html',
  styleUrls: ['./configuracion.css'],
  providers: [MessageService, ConfirmationService],
})
export class ConfiguracionComponent implements OnInit {
  private fb = inject(FormBuilder);
  private configuracionService = inject(ConfiguracionService);
  private usuariosService = inject(UsuariosService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  // Señales para el estado
  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);
  users = signal<UsuarioSalida[]>([]);
  filteredUsers = signal<UsuarioSalida[]>([]);
  selectedUser = signal<UsuarioSalida | null>(null);
  selectedUserName = signal<string>('');

  // Formulario reactivo
  configForm: FormGroup = this.fb.group({
    id: [null],
    emailEnvio: ['', [Validators.required, Validators.email]],
    passwordEnvio: ['', [Validators.required, Validators.minLength(6)]],
    puerto: [''],
    smtp: [''],
    defaultCredentials: [false],
    enableSsl: [true],
    nombre: [''],
    idFirmante: [null],
    editorData: [
      `<p style="text-align:center;"><img class="image_resized" style="width:242px;" src="assets/images/logotipos.png" alt="Proyecto Colibri"></p><h2 style="text-align:center;">GOBIERNO DEL ESTADO DE MORELOS</h2><h4 style="text-align:center;">Otorga la presente constancia a:</h4><p style="text-align:center;"><br>--NOMBRE--</p><p style="text-align:center;">&nbsp;</p><p style="text-align:center;">Por haber concluido satisfactoriamente</p><p>&nbsp;</p>`,
    ],
  });

  async ngOnInit() {
    await this.loadSigners();
  }

  private async loadSigners() {
    try {
      const response = await this.usuariosService.getByPerfilAsync('Firmante');
      if (response.success && response.data) {
        this.users.set(response.data);
        this.filteredUsers.set(response.data);
      }
    } catch (error) {}
  }

  private async loadConfiguracion(idFirmante?: number) {
    const firmanteId = idFirmante || this.selectedUser()?.id || 1;
    try {
      this.loading.set(true);
      this.error.set(null);
      const response = await this.configuracionService.getFirmanteAsync(firmanteId);

      if (response.success && response.data) {
        this.configForm.patchValue(response.data);
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

  async onSubmit() {
    if (this.configForm.invalid) {
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
      const formValue = this.configForm.value;

      let response;

      // Create: sin id
      const createData: FmcConfiguracionCreate = {
        correo: formValue.emailEnvio,
        password: formValue.passwordEnvio,
        userID: formValue.idFirmante,
        puerto: formValue.puerto,
        smtp: formValue.smtp,
        credentials: formValue.defaultCredentials,
        ssl: formValue.enableSsl,
        titulo: formValue.nombre,
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
    const user = event;
    if (user) {
      this.selectedUser.set(user);
      this.selectedUserName.set(user.nombre || '');
      // Establecer el idFirmante en el formulario
      this.configForm.patchValue({ idFirmante: user.id });
      if (user.id) {
        this.loadConfiguracion(user.id);
      }
    }
  }

  // Filtrar usuarios para el autocomplete
  filterUsers(event: any) {
    const query = event.query.toLowerCase();
    this.filteredUsers.set(
      this.users().filter((user) => user.nombre?.toLowerCase().includes(query))
    );
  }
}

import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PostServiceService } from '@services/post-service.service';
import { LoginResponse } from '@models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CardModule,
    MessageModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private router = inject(Router);
  private postServices = inject(PostServiceService);

  loading = signal(false);
  usuario = signal('');
  password = signal('');
  showPassword = signal(false);
  errorMessage = signal<string | null>(null);

  logIn() {
    this.loading.set(true);
    this.errorMessage.set(null);

    if (this.usuario() && this.password()) {
      const formData = new FormData();
      formData.append('usuario', this.usuario());
      formData.append('password', this.password());

      this.postServices.logInSuscribe(formData).subscribe({
        next: (response: LoginResponse) => {
          if (response.success && response.data) {
            const user = response.data;
            const userProfile = user.perfiles[0];
            const idUsuario = user.id;
            const usuario = user.usuario;
            const nombre = user.nombre;

            this.saveData(idUsuario, userProfile, usuario, nombre);
            this.loading.set(false);
            this.router.navigate(['/main/home']);
          } else {
            this.errorMessage.set(response.message || 'Error en la autenticación');
            this.loading.set(false);
          }
        },
        error: (error: unknown) => {
          this.errorMessage.set('Error en el servidor');
          this.loading.set(false);
        },
      });
    } else {
      this.errorMessage.set('Se requieren los datos de usuario y contraseña');
      this.loading.set(false);
    }
  }

  toggleShowPassword() {
    this.showPassword.update((show) => !show);
  }

  private saveData(idUsuario: number, perfil: string, usuario: string, userFullName: string) {
    sessionStorage.setItem('userID', idUsuario.toString());
    sessionStorage.setItem('userName', usuario);
    sessionStorage.setItem('userProfile', perfil);
    sessionStorage.setItem('userFullName', userFullName);
  }
}

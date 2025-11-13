import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { AuthService } from '@services/auth.service';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CardModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);

  // Formulario reactivo
  loginForm: FormGroup = this.fb.group({
    usuario: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  // Estado del componente
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  /**
   * Maneja el envío del formulario de login
   */
  onSubmit(): void {
    if (this.loginForm.valid) {
      this.performLogin();
    } else {
      this.markFormGroupTouched();
      this.showValidationErrorsToast();
    }
  }

  /**
   * Realiza la autenticación del usuario
   */
  private async performLogin(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set(null);

    try {
      const credentials = this.loginForm.value;
      await this.authService.loginAsync(credentials);
      this.router.navigate(['/main/home']);
    } catch (error) {
      this.handleLoginError(error);
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Maneja errores del login
   */
  private handleLoginError(error: any): void {
    const msg =
      error?.message ||
      error?.error?.message ||
      'Error al iniciar sesión. Verifique sus credenciales.';
    console.log('Mostrando toast de error:', msg);
    this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
  }

  /**
   * Marca todos los campos del formulario como tocados para mostrar errores de validación
   */
  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach((key) => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Verifica si un campo tiene errores y ha sido tocado
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Obtiene el mensaje de error para un campo específico
   */
  getFieldErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} es requerido`;
      }
      if (field.errors['minlength']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} debe tener al menos ${
          field.errors['minlength'].requiredLength
        } caracteres`;
      }
    }
    return '';
  }

  /**
   * Muestra errores de validación del formulario en un toast
   */
  private showValidationErrorsToast(): void {
    const messages: { severity: string; summary: string; detail: string }[] = [];
    Object.keys(this.loginForm.controls).forEach((key) => {
      const field = this.loginForm.get(key);
      if (field && field.invalid) {
        // Forzar touched para que getFieldErrorMessage funcione correctamente
        field.markAsTouched();
        const detail = this.getFieldErrorMessage(key) || `${key} inválido`;
        messages.push({ severity: 'warn', summary: 'Validación', detail });
      }
    });

    // Mostrar todos los mensajes en el toast
    if (messages.length) {
      console.log('Mostrando toasts de validación:', messages);
      messages.forEach((m) => this.messageService.add(m));
    }
  }
}

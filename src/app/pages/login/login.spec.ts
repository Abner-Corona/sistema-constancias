import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { LoginComponent } from './login';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: Router;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        FormsModule,
        ButtonModule,
        InputTextModule,
        PasswordModule,
        CardModule,
        MessageModule,
        ProgressSpinnerModule,
      ],
      providers: [{ provide: Router, useValue: routerSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty values', () => {
    expect(component.usuario()).toBe('');
    expect(component.password()).toBe('');
    expect(component.loading()).toBe(false);
    expect(component.errorMessage()).toBe(null);
  });

  it('should toggle password visibility', () => {
    expect(component.showPassword()).toBe(false);
    component.toggleShowPassword();
    expect(component.showPassword()).toBe(true);
    component.toggleShowPassword();
    expect(component.showPassword()).toBe(false);
  });

  it('should set error message when fields are empty', () => {
    component.logIn();
    expect(component.errorMessage()).toBe('Se requieren los datos de usuario y contraseña');
  });
});

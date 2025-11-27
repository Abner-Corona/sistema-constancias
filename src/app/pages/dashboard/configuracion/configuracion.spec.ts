import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { UsuariosService } from '@services/api/usuarios.service';
import { ToastModule } from 'primeng/toast';

import { ConfiguracionComponent } from './configuracion';

describe('ConfiguracionComponent', () => {
  let component: ConfiguracionComponent;
  let fixture: ComponentFixture<ConfiguracionComponent>;

  beforeEach(async () => {
    const usuariosSpy = jasmine.createSpyObj('UsuariosService', ['getByPerfilAsync']);
    usuariosSpy.getByPerfilAsync.and.returnValue(Promise.resolve({ success: true, data: [] }));

    await TestBed.configureTestingModule({
      imports: [ConfiguracionComponent, ReactiveFormsModule, ToastModule],
      providers: [MessageService, { provide: UsuariosService, useValue: usuariosSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfiguracionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

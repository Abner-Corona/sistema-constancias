import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';

import { NuevosComponent } from './nuevos';

describe('NuevosComponent', () => {
  let component: NuevosComponent;
  let fixture: ComponentFixture<NuevosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NuevosComponent, ReactiveFormsModule],
      providers: [MessageService],
    }).compileComponents();

    fixture = TestBed.createComponent(NuevosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form', () => {
    expect(component.loteForm).toBeDefined();
    expect(component.loteForm.get('nombreLote')).toBeDefined();
    expect(component.loteForm.get('firmadorId')).toBeDefined();
  });
});

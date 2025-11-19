import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';

import { NuevasComponent } from './nuevas';

describe('NuevasComponent', () => {
  let component: NuevasComponent;
  let fixture: ComponentFixture<NuevasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NuevasComponent, ReactiveFormsModule],
      providers: [MessageService],
    }).compileComponents();

    fixture = TestBed.createComponent(NuevasComponent);
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

  it('should add constancia to form array', () => {
    const initialLength = component.constancias.length;
    component.addConstancia();
    expect(component.constancias.length).toBe(initialLength + 1);
  });

  it('should remove constancia from form array', () => {
    component.addConstancia();
    const initialLength = component.constancias.length;
    component.removeConstancia(0);
    expect(component.constancias.length).toBe(initialLength - 1);
  });
});

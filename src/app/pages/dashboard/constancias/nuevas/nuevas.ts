import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { LotesService } from '@services/api/lotes.service';
import { BaseConstanciaService } from '@services/api/base-constancia.service';
import { UsuarioSalida } from '@models/usuario-models';
import { FmcBaseConstancia } from '@models/base-constancia-models';
import { LoteEntrada } from '@models/lote-models';
import { UserAutocompleteComponent } from '@components/user-autocomplete/user-autocomplete';

@Component({
  selector: 'app-nuevas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    UserAutocompleteComponent,
  ],
  templateUrl: './nuevas.html',
  styleUrls: ['./nuevas.css'],
  providers: [MessageService],
})
export class NuevasComponent implements OnInit {
  private fb = inject(FormBuilder);
  private lotesService = inject(LotesService);
  private baseConstanciaService = inject(BaseConstanciaService);
  private messageService = inject(MessageService);

  // Señales para estado
  loading = signal(false);
  baseConstancias = signal<FmcBaseConstancia[]>([]);
  selectedSigner = signal<UsuarioSalida | null>(null);
  selectedSignerName = signal<string>('');

  // Formulario
  loteForm: FormGroup;

  constructor() {
    this.loteForm = this.fb.group({
      nombreLote: ['', Validators.required],
      firmadorId: [null, Validators.required],
      orientacion: ['horizontal'],
      instructor: [''],
      activo: [true],
      extFondo: [''],
      fondo: [''],
      constancias: this.fb.array([]),
    });
  }

  async ngOnInit() {
    await this.loadData();
  }

  private async loadData() {
    this.loading.set(true);
    try {
      const baseRes = await this.baseConstanciaService.getAllAsync();

      if (baseRes.success && baseRes.data) {
        this.baseConstancias.set(baseRes.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar los datos necesarios',
      });
    } finally {
      this.loading.set(false);
    }
  }

  // Getter para el FormArray de constancias
  get constancias(): FormArray {
    return this.loteForm.get('constancias') as FormArray;
  }

  // Agregar una nueva constancia al lote
  addConstancia() {
    const constanciaForm = this.fb.group({
      nombrePersona: ['', Validators.required],
      rfc: [''],
      curp: [''],
      email: ['', [Validators.required, Validators.email]],
      textoHtml: [''],
      identificador: ['', Validators.required],
    });
    this.constancias.push(constanciaForm);
  }

  // Remover una constancia
  removeConstancia(index: number) {
    this.constancias.removeAt(index);
  }

  // Seleccionar firmante
  onSignerSelect(event: any) {
    const signer = event;
    if (signer) {
      this.selectedSigner.set(signer);
      this.selectedSignerName.set(signer.nombre || '');
      this.loteForm.patchValue({ firmadorId: signer.id });
    }
  }

  // Crear el lote
  async onSubmit() {
    if (this.loteForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor, complete todos los campos requeridos',
      });
      return;
    }

    this.loading.set(true);
    try {
      const formValue = this.loteForm.value;

      // Obtener usuario actual (asumiendo que está en localStorage o servicio)
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const usuarioCreacionId = currentUser.id || 1; // Valor por defecto

      const loteData: LoteEntrada = {
        nombreLote: formValue.nombreLote,
        firmadorId: formValue.firmadorId,
        usuarioCreacionId: usuarioCreacionId,
        estatus: true,
        orientacion: formValue.orientacion,
        instructor: formValue.instructor,
        activo: formValue.activo,
        extFondo: formValue.extFondo,
        fondo: formValue.fondo,
        lstConstanciasLote: formValue.constancias.map((c: any) => ({
          nombrePersona: c.nombrePersona,
          rfc: c.rfc,
          curp: c.curp,
          email: c.email,
          textoHtml: c.textoHtml,
          identificador: c.identificador,
        })),
      };

      const response = await this.lotesService.addAsync(loteData);

      if (response.success) {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Lote creado exitosamente',
        });
        this.loteForm.reset();
        this.constancias.clear();
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: response.message || 'Error al crear el lote',
        });
      }
    } catch (error) {
      console.error('Error creating lote:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al crear el lote',
      });
    } finally {
      this.loading.set(false);
    }
  }
}

import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DatePicker } from 'primeng/datepicker';
import { FileUploadModule } from 'primeng/fileupload';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { LotesService } from '@services/api/lotes.service';
import { BaseConstanciaService } from '@services/api/base-constancia.service';
import { UsuarioSalida } from '@models/usuario-models';
import { FmcBaseConstancia } from '@models/base-constancia-models';
import { LoteEntrada } from '@models/lote-models';
import { UserAutocompleteComponent } from '@components/user-autocomplete/user-autocomplete';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-nuevos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    DatePicker,
    FileUploadModule,
    TableModule,
    TooltipModule,
    ToastModule,
    UserAutocompleteComponent,
  ],
  templateUrl: './nuevos.html',
  styleUrls: ['./nuevos.css'],
})
export class NuevosComponent implements OnInit {
  private fb = inject(FormBuilder);
  private lotesService = inject(LotesService);
  private baseCertificadoService = inject(BaseConstanciaService);
  private messageService = inject(MessageService);

  // Señales para estado
  loading = signal(false);
  baseCertificados = signal<FmcBaseConstancia[]>([]);
  selectedSigner = signal<UsuarioSalida | null>(null);
  selectedSignerName = signal<string>('');

  xlsName = 'ejemplo.xlsx';

  // Formulario
  loteForm: FormGroup;

  constructor() {
    this.loteForm = this.fb.group({
      nombreLote: ['', Validators.required],
      firmadorId: [null, Validators.required],
      orientacion: ['horizontal'],
      instructor: [''],
      activo: [true],
      fecha: [''],
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
      const baseRes = await this.baseCertificadoService.getAllAsync();

      if (baseRes.success && baseRes.data) {
        this.baseCertificados.set(baseRes.data);
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

  // Getter para el FormArray de certificados
  get constancias(): FormArray {
    return this.loteForm.get('constancias') as FormArray;
  }

  // Agregar un nuevo certificado al lote
  addCertificado() {
    const certificadoForm = this.fb.group({
      nombrePersona: ['', Validators.required],
      rfc: [''],
      curp: [''],
      email: ['', [Validators.required, Validators.email]],
      textoHtml: [''],
      identificador: ['', Validators.required],
    });
    this.constancias.push(certificadoForm);
  }

  // Remover un certificado
  removeCertificado(index: number) {
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

  // Seleccionar imagen de fondo
  onFileSelect(event: any) {
    const file = event.files[0];
    if (file) {
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Solo se permiten archivos PNG, JPG y JPEG',
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const ext = file.name.split('.').pop()?.toLowerCase();
        this.loteForm.patchValue({
          fondo: base64,
          extFondo: ext,
        });
      };
      reader.readAsDataURL(file);
    }
  }

  // Exportar a Excel
  exportToExcel(): void {
    let element = document.createElement('div');
    let tableHtml = `<table id="season-tble">
    <tr>
      <th>NOMBRE</th>
      <th>CURP</th>
      <th>RFC</th>
      <th>CORREO</th>
      <th>IDENTIFICADOR</th>
    </tr>`;

    this.constancias.value.forEach((c: any) => {
      tableHtml += `
    <tr>
      <td>${c.nombrePersona || ''}</td>
      <td>${c.curp || ''}</td>
      <td>${c.rfc || ''}</td>
      <td>${c.email || ''}</td>
      <td>${c.identificador || ''}</td>
    </tr>`;
    });

    tableHtml += '</table>';
    element.innerHTML = tableHtml;

    const worksheet: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    const book: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, worksheet, 'Sheet1');

    XLSX.writeFile(book, this.xlsName);
  }

  // Importar desde Excel
  onExcelSelect(event: any) {
    const file = event.files[0];
    if (file) {
      const reader: FileReader = new FileReader();
      reader.readAsBinaryString(file);
      reader.onload = (e: any) => {
        /* create workbook */
        const binarystr: string = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(binarystr, { type: 'binary' });

        /* selected the first sheet */
        const wsname: string = wb.SheetNames[0];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];

        /* save data */
        const data = XLSX.utils.sheet_to_json(ws); // to get 2d array pass 2nd parameter as object {header: 1}
        console.log(data); // Data will be logged in array format containing objects
        this.constancias.clear();
        (data as any[]).forEach((obj: any) => {
          const constanciaForm = this.fb.group({
            nombrePersona: [obj.NOMBRE || '', Validators.required],
            rfc: [obj.RFC || ''],
            curp: [obj.CURP || ''],
            email: [obj.CORREO || '', [Validators.required, Validators.email]],
            textoHtml: [''],
            identificador: [obj.IDENTIFICADOR || '', Validators.required],
          });
          this.constancias.push(constanciaForm);
        });
      };
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
        fecha: formValue.fecha,
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

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
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { Select } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { EditorModule } from 'primeng/editor';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LotesService } from '@services/api/lotes.service';
import { BaseConstanciaService } from '@services/api/base-constancia.service';
import { UsuarioSalida } from '@models/usuario-models';
import { FmcBaseConstancia } from '@models/base-constancia-models';
import { LoteEntrada } from '@models/lote-models';
import { UserAutocompleteComponent } from '@components/user-autocomplete/user-autocomplete';
import { EditorConstanciasComponent } from '@components/editor-constancias/editor-constancias';
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
    DialogModule,
    SelectModule,
    Select,
    ConfirmDialogModule,
    EditorModule,
    UserAutocompleteComponent,
    EditorConstanciasComponent,
  ],
  providers: [ConfirmationService],
  templateUrl: './nuevos.html',
  styleUrls: ['./nuevos.css'],
})
export class NuevosComponent implements OnInit {
  private fb = inject(FormBuilder);
  private lotesService = inject(LotesService);
  private baseCertificadoService = inject(BaseConstanciaService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  // Señales para estado
  loading = signal(false);
  baseCertificados = signal<FmcBaseConstancia[]>([]);
  selectedSigner = signal<UsuarioSalida[]>([]);
  selectedSignerName = computed(() =>
    this.selectedSigner()
      .map((s) => s.nombre || '')
      .join(', ')
  );
  selectedFile = signal<File | null>(null);
  previewDialogVisible = signal(false);
  formReviewDialogVisible = signal(false);
  editorDialogVisible = signal(false);

  editorContent = '';

  // Opciones para orientación
  orientationOptions = [
    { label: 'Horizontal', value: 'horizontal' },
    { label: 'Vertical', value: 'vertical' },
  ];

  xlsName = 'ejemplo.xlsx';

  // Formulario
  loteForm: FormGroup;

  constructor() {
    this.loteForm = this.fb.group({
      nombreLote: ['', Validators.required],
      firmadoresIds: this.fb.array([], [Validators.required, Validators.minLength(1)]),
      orientacion: ['horizontal'],
      instructor: [''],
      activo: [true],
      fecha: [new Date()],
      extFondo: [''],
      fondo: ['', Validators.required],
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
    if (this.constancias.length > 0) {
      const last = this.constancias.at(this.constancias.length - 1);
      if (!last.valid) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Advertencia',
          detail:
            'Complete todos los campos requeridos de la última constancia antes de agregar otra.',
        });
        return;
      }
    }
    const certificadoForm = this.fb.group({
      id: [this.constancias.length + 1],
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
  onSignerSelect(event: UsuarioSalida | UsuarioSalida[]) {
    const signers = Array.isArray(event) ? event : [event];
    this.selectedSigner.set(signers);
    const idsArray = this.fb.array(
      signers.map((s) => this.fb.control(s.id)),
      [Validators.required, Validators.minLength(1)]
    );
    this.loteForm.setControl('firmadoresIds', idsArray);
  }

  // Abrir previsualización
  openPreview() {
    this.previewDialogVisible.set(true);
  }

  // Cerrar previsualización
  closePreview() {
    this.previewDialogVisible.set(false);
  }

  // Abrir revisión del formulario
  openFormReview() {
    this.formReviewDialogVisible.set(true);
  }

  // Cerrar revisión del formulario
  closeFormReview() {
    this.formReviewDialogVisible.set(false);
  }

  // Abrir diálogo del editor
  openEditorDialog() {
    this.editorDialogVisible.set(true);
  }

  // Cerrar diálogo del editor
  closeEditorDialog() {
    this.editorDialogVisible.set(false);
  }

  // Autollenar formulario con datos de ejemplo
  autollenarEjemplo() {
    // Limpiar constancias existentes
    this.constancias.clear();

    // Llenar formulario principal
    this.loteForm.patchValue({
      nombreLote: 'Lote de Ejemplo - Certificaciones 2025',
      orientacion: 'horizontal',
      instructor: 'Prof. María González',
      fecha: new Date(),
      activo: true,
    });

    // Simular selección de firmante con ID 42 (asumiendo que existe)
    const firmanteEjemplo: UsuarioSalida = {
      id: 42,
      nombre: 'Dr. Carlos Ramírez',
      perfiles: ['ADMIN'],
    };
    this.selectedSigner.set([firmanteEjemplo]);
    this.loteForm.setControl(
      'firmadoresIds',
      this.fb.array([42], [Validators.required, Validators.minLength(1)])
    );

    // Agregar una constancia de ejemplo
    const certificadoForm = this.fb.group({
      id: [1],
      nombrePersona: ['Juan Pérez García', Validators.required],
      rfc: ['PEGJ900101ABC'],
      curp: ['PEGJ900101HDFRPN00'],
      email: ['juan.perez@email.com', [Validators.required, Validators.email]],
      textoHtml: [''],
      identificador: ['42', Validators.required],
    });
    this.constancias.push(certificadoForm);

    // Nota: La imagen de fondo debe ser seleccionada por el usuario
    this.messageService.add({
      severity: 'info',
      summary: 'Formulario autollenado',
      detail: 'Los datos de ejemplo han sido cargados. Recuerda seleccionar la imagen de fondo.',
    });
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

      this.selectedFile.set(file);

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
      this.confirmationService.confirm({
        message: '¿Desea reemplazar todos los certificados existentes o agregar los nuevos?',
        header: 'Confirmar Importación',
        acceptLabel: 'Reemplazar',
        rejectLabel: 'Agregar',
        accept: () => {
          this.processExcelFile(file, true);
        },
        reject: () => {
          this.processExcelFile(file, false);
        },
      });
    }
  }

  private processExcelFile(file: File, replace: boolean) {
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
      if (replace) {
        this.constancias.clear();
      }
      (data as any[]).forEach((obj: any) => {
        const constanciaForm = this.fb.group({
          id: [this.constancias.length + 1],
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
        firmadoresIds: formValue.firmadoresIds,
        usuarioCreacionId: usuarioCreacionId,
        estatus: true,
        orientacion: formValue.orientacion,
        instructor: formValue.instructor,
        activo: formValue.activo,
        fecha: formValue.fecha,
        extFondo: formValue.extFondo,
        fondo: formValue.fondo,
        lstConstanciasLote: formValue.constancias.map((c: any) => ({
          idConstancia: c.identificador,
          nombrePersona: c.nombrePersona,
          rfc: c.rfc,
          curp: c.curp,
          email: c.email,
          fondoImagen: formValue.fondo,
          textoHtml: c.textoHtml,
          sello: '',
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

  // Manejar completado de edición de celda
  onCellEditComplete(event: any) {
    console.log('Cell edit complete:', event);
  }
}

import {
  Component,
  inject,
  signal,
  OnInit,
  computed,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DatePicker } from 'primeng/datepicker';
import { FileUploadModule, FileUpload } from 'primeng/fileupload';
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
import { ConstanciaEntrada } from '@models/constancia-models';
import { UserAutocompleteComponent } from '@components/user-autocomplete/user-autocomplete';
import { EditorCertificadosComponent } from '@components/editor-certificados/editor-certificados';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-nuevos',
  standalone: true,
  imports: [
    CommonModule,
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
    EditorCertificadosComponent,
  ],
  providers: [ConfirmationService],
  templateUrl: './nuevos.html',
  styleUrls: ['./nuevos.css'],
})
export class NuevosComponent implements OnInit {
  private lotesService = inject(LotesService);
  private baseCertificadoService = inject(BaseConstanciaService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('fileUpload') fileUpload!: FileUpload;

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

  // Modelo del lote para Template Driven Forms
  lote: LoteEntrada = {
    nombreLote: '',
    firmadoresIds: [],
    usuarioCreacionId: 0,
    estatus: true,
    orientacion: 'horizontal',
    instructor: '',
    activo: true,
    fecha: new Date().toISOString().split('T')[0],
    extFondo: '',
    fondo: '',
    lstConstanciasLote: [],
  };

  // Opciones para orientación
  orientationOptions = [
    { label: 'Horizontal', value: 'horizontal' },
    { label: 'Vertical', value: 'vertical' },
  ];

  xlsName = 'ejemplo.xlsx';

  // Getter para orientation
  get orientationValue(): 'horizontal' | 'vertical' {
    return this.lote.orientacion === 'vertical' ? 'vertical' : 'horizontal';
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
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar los datos necesarios',
      });
    } finally {
      this.loading.set(false);
    }
  }

  // Getter para el array de certificados — alias funcional para plantilla
  // mantiene el nombre 'constancias' para compatibilidad de templates
  get constancias(): ConstanciaEntrada[] {
    return this.lote.lstConstanciasLote;
  }

  // Agregar un nuevo certificado al lote
  addCertificado() {
    if (this.constancias.length > 0) {
      const last = this.constancias[this.constancias.length - 1];
      if (!last.nombrePersona || !last.email || !last.identificador) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Advertencia',
          detail:
            'Complete todos los campos requeridos de la última constancia antes de agregar otra.',
        });
        return;
      }
    }
    // Objeto que coincide con ConstanciaEntrada
    const certificado: ConstanciaEntrada = {
      idConstancia: String(this.constancias.length + 1),
      nombrePersona: '',
      rfc: '',
      curp: '',
      email: '',
      fondoImagen: '',
      textoHtml: '',
      sello: '',
      identificador: '',
    };
    this.lote.lstConstanciasLote.push(certificado);
  }

  // Remover un certificado
  removeCertificado(index: number) {
    this.lote.lstConstanciasLote.splice(index, 1);
  }

  // Seleccionar firmante
  onSignerSelect(event: UsuarioSalida | UsuarioSalida[]) {
    const signers = Array.isArray(event) ? event : [event];
    this.selectedSigner.set(signers);
    this.lote.firmadoresIds = signers.map((s) => s.id).filter((id): id is number => id != null);
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
    this.lote.lstConstanciasLote = [];

    // Llenar formulario principal
    this.lote.nombreLote = 'Lote de Ejemplo - Certificaciones 2025';
    this.lote.orientacion = 'horizontal';
    this.lote.instructor = 'Prof. María González';
    this.lote.fecha = new Date().toISOString().split('T')[0];
    this.lote.activo = true;

    // Simular selección de firmante con ID 42 (asumiendo que existe)
    const firmanteEjemplo: UsuarioSalida = {
      id: 42,
      nombre: 'Dr. Carlos Ramírez',
      perfiles: ['ADMIN'],
    };
    this.selectedSigner.set([firmanteEjemplo]);
    this.lote.firmadoresIds = [42];

    // Agregar una constancia de ejemplo
    const certificado: ConstanciaEntrada = {
      idConstancia: '1',
      nombrePersona: 'Juan Pérez García',
      rfc: 'PEGJ900101ABC',
      curp: 'PEGJ900101HDFRPN00',
      email: 'juan.perez@email.com',
      fondoImagen: '',
      textoHtml: '',
      sello: '',
      identificador: '42',
    };
    this.lote.lstConstanciasLote.push(certificado);
  }

  // Seleccionar imagen de fondo
  async onFileSelect(event: any) {
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

      try {
        const base64 = await this.readFileAsDataURL(file);
        const ext = file.name.split('.').pop()?.toLowerCase();
        this.lote.fondo = base64;

        this.lote.extFondo = ext || '';
        this.cdr.detectChanges();
      } catch (error) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al leer el archivo',
        });
      }
    }
  }

  private readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
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

    this.lote.lstConstanciasLote.forEach((c: ConstanciaEntrada) => {
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
      // Data will be logged in array format containing objects
      if (replace) {
        this.lote.lstConstanciasLote = [];
      }
      (data as Record<string, unknown>[]).forEach((obj: Record<string, unknown>) => {
        const constancia: ConstanciaEntrada = {
          idConstancia: String(this.lote.lstConstanciasLote.length + 1),
          nombrePersona: (obj['NOMBRE'] as string) || '',
          rfc: (obj['RFC'] as string) || '',
          curp: (obj['CURP'] as string) || '',
          email: (obj['CORREO'] as string) || '',
          fondoImagen: '',
          textoHtml: '',
          sello: '',
          identificador: (obj['IDENTIFICADOR'] as string) || '',
        };
        this.lote.lstConstanciasLote.push(constancia);
      });
    };
  }

  // Crear el lote
  async onSubmit() {
    if (
      !this.lote.nombreLote ||
      this.lote.firmadoresIds.length === 0 ||
      !this.lote.fondo ||
      this.lote.lstConstanciasLote.length === 0
    ) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor, complete todos los campos requeridos',
      });
      return;
    }

    this.loading.set(true);
    try {
      const formValue = this.lote;

      // Obtener usuario actual (asumiendo que está en localStorage o servicio)
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const usuarioCreacionId = currentUser.id || 1; // Valor por defecto

      const loteData: LoteEntrada = {
        nombreLote: formValue.nombreLote,
        firmadoresIds: formValue.firmadoresIds,
        usuarioCreacionId: usuarioCreacionId,
        estatus: formValue.estatus ?? true,
        orientacion: formValue.orientacion,
        instructor: formValue.instructor,
        activo: formValue.activo,
        fecha: formValue.fecha,
        extFondo: formValue.extFondo,
        fondo: formValue.fondo,
        lstConstanciasLote: (formValue.lstConstanciasLote || []).map((c: ConstanciaEntrada) => ({
          idConstancia: c.idConstancia ?? c.identificador ?? null,
          nombrePersona: c.nombrePersona,
          rfc: c.rfc,
          curp: c.curp,
          email: c.email,
          fondoImagen: c.fondoImagen ?? formValue.fondo,
          textoHtml: c.textoHtml,
          sello: c.sello ?? '',
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
        this.resetLote();
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: response.message || 'Error al crear el lote',
        });
      }
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al crear el lote',
      });
    } finally {
      this.loading.set(false);
    }
  }

  // Resetear el lote
  resetLote() {
    this.lote = {
      nombreLote: '',
      firmadoresIds: [],
      usuarioCreacionId: 0,
      estatus: true,
      orientacion: 'horizontal',
      instructor: '',
      activo: true,
      fecha: new Date().toISOString().split('T')[0],
      extFondo: '',
      fondo: '',
      lstConstanciasLote: [],
    };
    this.selectedSigner.set([]);
    this.selectedFile.set(null);
    this.fileUpload.clear();
  }
}

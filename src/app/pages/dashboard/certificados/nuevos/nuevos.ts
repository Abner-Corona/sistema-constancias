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
import { AuthService } from '@services/auth.service';
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
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('fileUpload') fileUpload!: FileUpload;
  // Referencia al componente editor para invocar acciones (refresh) antes de abrirlo
  @ViewChild(EditorCertificadosComponent) editorComponent?: EditorCertificadosComponent;

  // Señales para estado
  loading = signal(false);
  baseCertificados = signal<FmcBaseConstancia[]>([]);
  selectedSigner = signal<UsuarioSalida[]>([]);
  selectedSignerName = computed(() =>
    (this.selectedSigner() || []).map((s) => s?.nombre || '').join(', ')
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

  // Objeto Date usado por el datepicker de PrimeNG (p-datepicker espera un objeto Date)
  loteDate: Date | null = this.lote.fecha ? new Date(this.lote.fecha) : null;

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

  // Paginador para la tabla de constancias (cliente)
  // rows: cantidad de filas por página, first: índice del primer registro mostrado
  rowsOptions = [5, 10, 20];
  rows = signal<number>(10);
  first = signal<number>(0);

  // Manejador del evento onPage de p-table
  handlePage(event: { first: number; rows: number; page?: number; pageCount?: number }) {
    // event.first: índice del primer registro mostrado
    // event.rows: número de filas por página
    this.first.set(event.first ?? 0);
    this.rows.set(event.rows ?? this.rows());
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

  // Seleccionar firmante (acepta null cuando el Autocomplete se limpia)
  onSignerSelect(event: UsuarioSalida | UsuarioSalida[] | null): void {
    if (event == null) {
      // Clear selection
      this.selectedSigner.set([]);
      this.lote.firmadoresIds = [];
      return;
    }

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
    // Asegurarnos de que el editor tenga calculadas las personas (largo/corto)
    try {
      this.editorComponent?.refreshPersonas();
    } catch (e) {
      // no bloquear si la referencia no existe aún
    }

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
    this.loteDate = this.lote.fecha ? new Date(this.lote.fecha) : null;
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

        // Defer assignment to the next microtask so we don't change bound
        // values in the same change detection cycle (avoids ExpressionChangedAfterItHasBeenCheckedError).
        Promise.resolve().then(() => {
          this.lote.fondo = base64;
          this.lote.extFondo = ext || '';
          // notify change detector after the deferred assignment
          this.cdr.detectChanges();
        });
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
      if (!this.lote.lstConstanciasLote || this.lote.lstConstanciasLote.length === 0) {
        this.processExcelFile(file, true);
        return;
      }
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
  async onSubmit(): Promise<boolean> {
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
      return false;
    }

    this.loading.set(true);
    let success = false;
    try {
      // before building the payload, generate per-constancia HTML from the
      // editor (if available) so `textoHtml` contains the designed layout
      // + background for each certificate in the lote.
      try {
        if (this.editorComponent) {
          for (const c of this.lote.lstConstanciasLote) {
            // build personalized HTML from the editor state
            c.textoHtml = this.editorComponent.buildHtmlForConstancia(c);
          }
        }
      } catch (err) {
        // non-fatal: if editor fails for some reason we still proceed
        console.warn('Failed to build per-constancia HTML from editor', err);
      }

      const formValue = this.lote;

      // Obtener usuario actual usando AuthService. Fall back a 1 si no hay
      // sesion actual (mantenemos compatibilidad con implementaciones
      // anteriores que usaban un id por defecto).
      const usuarioIdFromAuth =
        typeof this.authService?.userId === 'function'
          ? this.authService.userId()
          : this.authService?.userId ?? null;
      const usuarioCreacionId = usuarioIdFromAuth ?? 1;

      // helper to remove data URL header if present so backend receives
      // pure base64 content (many APIs expect just the data, not the data: header)
      const stripDataUrlHeader = (v?: string | null) => {
        if (!v) return '';
        return String(v).replace(/^data:[^;]+;base64,/, '');
      };

      // map orientation into the backend shorthand expected by API
      // legacy API wants 'p' for portrait (vertical) and 'l' for landscape (horizontal)
      const mapOrientationToShort = (o?: string | null) => (o === 'vertical' ? 'p' : 'l');

      const loteData: LoteEntrada = {
        nombreLote: formValue.nombreLote,
        firmadoresIds: formValue.firmadoresIds,
        usuarioCreacionId: usuarioCreacionId,
        estatus: formValue.estatus ?? true,
        orientacion: mapOrientationToShort(formValue.orientacion),
        instructor: formValue.instructor,
        activo: formValue.activo,
        fecha: formValue.fecha,
        extFondo: formValue.extFondo,
        // Send the background image without the data URL prefix
        fondo: stripDataUrlHeader(formValue.fondo),
        lstConstanciasLote: (formValue.lstConstanciasLote || []).map((c: ConstanciaEntrada) => ({
          idConstancia: c.idConstancia ?? c.identificador ?? null,
          nombrePersona: c.nombrePersona,
          rfc: c.rfc,
          curp: c.curp,
          email: c.email,
          // Prefer per-constancia fondoImagen when provided, but ensure
          // any `data:image/...;base64,` header is stripped before send.
          fondoImagen: stripDataUrlHeader(c.fondoImagen ?? formValue.fondo),
          textoHtml: c.textoHtml,
          sello: c.sello ?? '',
          identificador: c.identificador,
        })),
      };

      // ensure we include a background; if the user set the background inside
      // the editor but didn't persist it into `this.lote`, try to grab it
      // from the editor component (best-effort fallback before sending to API)
      if ((!formValue.fondo || formValue.fondo.length === 0) && this.editorComponent) {
        try {
          // editorComponent.fondoValue is an input signal; call it if available
          const edComp: any = this.editorComponent as any;
          const edFondo =
            edComp && typeof edComp.fondoValue === 'function'
              ? edComp.fondoValue()
              : edComp?.fondoValue ?? null;
          if (edFondo) {
            formValue.fondo = edFondo;
            formValue.extFondo = formValue.extFondo || '';
          }
        } catch (err) {
          // ignore failures here; server validation will handle missing fields
          console.debug('Could not read editor fondoValue as fallback', err);
        }
      }

      let response = await this.lotesService.addAsync(loteData);

      if (response.success) {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Lote creado exitosamente',
        });
        this.resetLote();
        success = true;
      } else {
        // If the server returned validation indicating missing top-level
        // 'lote' or $.fondo issues (some backends expect a wrapper like { lote: {...} }),
        // attempt a defensive retry by sending the payload wrapped inside a
        // `lote` key. This preserves backward compatibility with divergent APIs.
        const errors = response?.message ?? '';
        const shouldRetryWrapped = /lote|\$\.fondo|fondo/i.test(String(errors));
        if (shouldRetryWrapped) {
          try {
            response = await this.lotesService.addAsync({ lote: loteData } as any);
            // if retry succeeds, handle success
            if (response.success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Lote creado exitosamente (wrapped payload)',
              });
              this.resetLote();
              success = true;
              // done — will return after finally
            }
          } catch (err) {
            // ignored - fall through to show original failure
            console.warn('Retry with wrapped payload failed', err);
          }
        }

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
      return success;
    }
  }

  /**
   * Called when the editor's save button is used. Keeps the editor modal open
   * while creating the lote (loading state), and only closes the modal when
   * the create operation returns success. If onSubmit returns false the modal
   * remains open so the user can correct problems.
   */
  async saveFromEditor(): Promise<void> {
    const ok = await this.onSubmit();
    if (ok) {
      this.closeEditorDialog();
    }
  }

  // Sincronizar el objeto Date del datepicker con la cadena usada por la API
  onDateChange(date: Date | null) {
    if (date) {
      // format as YYYY-MM-DD for backend and UI summary
      this.lote.fecha = date.toISOString().split('T')[0];
    } else {
      this.lote.fecha = '';
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
    // asegurarse de que el objeto Date usado por el datepicker también se reinicie
    this.loteDate = this.lote.fecha ? new Date(this.lote.fecha) : null;
    this.selectedSigner.set([]);
    this.selectedFile.set(null);
    this.fileUpload.clear();
  }
}

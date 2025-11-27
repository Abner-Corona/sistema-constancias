import {
  Component,
  inject,
  signal,
  OnInit,
  AfterViewInit,
  OnDestroy,
  computed,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  Renderer2,
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
import { UsuariosService } from '@services/api/usuarios.service';
import { AutoComplete, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
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
    AutoComplete,
    ProgressSpinnerModule,
    IconFieldModule,
    InputIconModule,
    EditorCertificadosComponent,
  ],
  providers: [ConfirmationService],
  templateUrl: './nuevos.html',
  styleUrls: ['./nuevos.css'],
})
export class NuevosComponent implements OnInit, AfterViewInit, OnDestroy {
  private lotesService = inject(LotesService);
  private baseCertificadoService = inject(BaseConstanciaService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private cdr = inject(ChangeDetectorRef);
  private hostRef = inject(ElementRef) as ElementRef<HTMLElement>;
  private renderer = inject(Renderer2);

  private _clearHandler: ((e: Event) => void) | null = null;
  private usuariosService = inject(UsuariosService);

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

  // Autocomplete state
  allUsers = signal<UsuarioSalida[]>([]);
  filteredUsers = signal<UsuarioSalida[]>([]);
  usersLoading = signal<boolean>(false);
  // ngModel for the autocomplete in multiple mode is an array of selected objects
  selectedSignerModel: UsuarioSalida[] = [];
  previewDialogVisible = signal(false);
  formReviewDialogVisible = signal(false);
  editorDialogVisible = signal(false);
  showExcelConfirmDialog = signal(false);

  editorContent = '';

  excelFileToProcess: File | null = null;

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
    await Promise.all([this.loadData(), this.loadUsers()]);
    // Inicializar el modelo del ngModel con la selección actual si existe
    this.selectedSignerModel = Array.isArray(this.selectedSigner()) ? this.selectedSigner() : [];
  }

  ngAfterViewInit(): void {
    try {
      this._clearHandler = (e: Event) => {
        const target = e.target as Element | null;
        if (!target) return;
        const clearEl = target.closest('.p-autocomplete-clear-icon, .p-autocomplete-clear');
        if (clearEl) {
          e.stopImmediatePropagation();
          e.preventDefault();
          // Clear multi-selection safely
          this.selectedSignerModel = [];
          this.selectedSigner.set([]);
          this.lote.firmadoresIds = [];
        }
      };

      this.hostRef.nativeElement.addEventListener('click', this._clearHandler, true);
    } catch (e) {
      // ignore: DOM might not be available in some environments
    }
  }

  ngOnDestroy(): void {
    if (this._clearHandler) {
      try {
        this.hostRef.nativeElement.removeEventListener('click', this._clearHandler, true);
      } catch (e) {
        /* ignore */
      }
      this._clearHandler = null;
    }
  }

  private async loadUsers() {
    try {
      this.usersLoading.set(true);
      const response = await this.usuariosService.getByPerfilAsync('Firmante');
      if (response.success && response.data) {
        this.allUsers.set(response.data);
        this.filteredUsers.set(response.data);
      }
    } catch (error) {
      // no bloquear carga principal
    } finally {
      this.usersLoading.set(false);
    }
  }

  filterUsers(event: { query: string }) {
    const q = (event.query || '').toLowerCase();
    this.filteredUsers.set(this.allUsers().filter((u) => u.nombre?.toLowerCase().includes(q)));
  }

  onSignerModelChange(value: unknown) {
    // ngModel for multiple mode is an array of UsuarioSalida objects
    if (Array.isArray(value)) {
      this.selectedSignerModel = value as UsuarioSalida[];
      this.selectedSigner.set(this.selectedSignerModel);
      this.lote.firmadoresIds = this.selectedSignerModel
        .map((s) => s.id)
        .filter((id): id is number => id != null);
      return;
    }

    // Si value viene null/empty, limpiar selección
    if (value == null || value === '') {
      this.selectedSignerModel = [];
      this.selectedSigner.set([]);
      this.lote.firmadoresIds = [];
    }
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
  onSignerSelect(event: AutoCompleteSelectEvent | UsuarioSalida | UsuarioSalida[] | null): void {
    // PrimeNG AutoComplete may emit an object (keyboard Enter) or an array (click) in multiple mode.
    const value = (event as any)?.value ?? event;

    if (value == null) {
      this.selectedSigner.set([]);
      this.selectedSignerModel = [];
      this.lote.firmadoresIds = [];
      return;
    }

    let current: UsuarioSalida[] = Array.isArray(this.selectedSigner())
      ? this.selectedSigner()
      : [];

    if (Array.isArray(value)) {
      // PrimeNG provided the full selected array (click selection)
      current = (value as UsuarioSalida[]).filter((v) => v != null);
    } else if (typeof value === 'object') {
      // Single user (keyboard/Enter) — merge into current selection if not present
      const user = value as UsuarioSalida;
      const exists = current.some((u) => u?.id != null && user?.id === u.id);
      if (!exists) current = [...current, user];
    }

    this.selectedSigner.set(current);
    this.selectedSignerModel = current;
    this.lote.firmadoresIds = current.map((s) => s.id).filter((id): id is number => id != null);
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
  async onFileSelect(event: { files: File[] }) {
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
  onExcelSelect(event: { files: File[] }) {
    const file = event.files[0];
    if (file) {
      if (!this.lote.lstConstanciasLote || this.lote.lstConstanciasLote.length === 0) {
        this.processExcelFile(file, true);
        return;
      }
      this.excelFileToProcess = file;
      this.showExcelConfirmDialog.set(true);
    }
  }

  private processExcelFile(file: File, replace: boolean) {
    const reader: FileReader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const target = e.target as FileReader;
      const binarystr: string = target.result as string;
      const wb: XLSX.WorkBook = XLSX.read(binarystr, { type: 'binary' });

      /* selected the first sheet */
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      /* save data */
      const data = XLSX.utils.sheet_to_json(ws); // to get 2d array pass 2nd parameter as object {header: 1}
      // Data will be logged in array format containing objects
      const newConstancias: ConstanciaEntrada[] = (data as Record<string, unknown>[]).map(
        (obj: Record<string, unknown>) => ({
          idConstancia: String(this.lote.lstConstanciasLote.length + 1),
          nombrePersona: (obj['NOMBRE'] as string) || '',
          rfc: (obj['RFC'] as string) || '',
          curp: (obj['CURP'] as string) || '',
          email: (obj['CORREO'] as string) || '',
          fondoImagen: '',
          textoHtml: '',
          sello: '',
          identificador: (obj['IDENTIFICADOR'] as string) || '',
        })
      );

      // Diferir la modificación del array para evitar ExpressionChangedAfterItHasBeenCheckedError
      Promise.resolve().then(() => {
        if (replace) {
          this.lote.lstConstanciasLote = [];
        }
        this.lote.lstConstanciasLote.push(...newConstancias);
        this.cdr.detectChanges();
      });
    };
  }

  // Cancelar importación de Excel
  cancelExcelImport() {
    this.showExcelConfirmDialog.set(false);
    this.excelFileToProcess = null;
  }

  // Reemplazar certificados con Excel
  replaceExcel() {
    if (this.excelFileToProcess) {
      this.processExcelFile(this.excelFileToProcess, true);
    }
    this.showExcelConfirmDialog.set(false);
    this.excelFileToProcess = null;
  }

  // Agregar certificados desde Excel
  addExcel() {
    if (this.excelFileToProcess) {
      this.processExcelFile(this.excelFileToProcess, false);
    }
    this.showExcelConfirmDialog.set(false);
    this.excelFileToProcess = null;
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
      // Antes de construir el payload, generar HTML por-constancia desde el
      // editor (si está disponible) para que `textoHtml` contenga el diseño layout
      // + fondo para cada certificado en el lote.
      try {
        if (this.editorComponent) {
          for (const c of this.lote.lstConstanciasLote) {
            // Construir HTML personalizado desde el estado del editor
            c.textoHtml = this.editorComponent.buildHtmlForConstancia(c);
          }
        }
      } catch (err) {
        // No fatal: si el editor falla por alguna razón, aún procedemos
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

      // Función auxiliar para remover el header de data URL si está presente para que el backend reciba
      // contenido base64 puro (muchas APIs esperan solo los datos, no el header data:)
      const stripDataUrlHeader = (v?: string | null) => {
        if (!v) return '';
        return String(v).replace(/^data:[^;]+;base64,/, '');
      };

      // Mapear orientación al shorthand esperado por la API del backend
      // API legacy quiere 'p' para portrait (vertical) y 'l' para landscape (horizontal)
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
        // Enviar la imagen de fondo sin el prefijo de data URL
        fondo: stripDataUrlHeader(formValue.fondo),
        lstConstanciasLote: (formValue.lstConstanciasLote || []).map((c: ConstanciaEntrada) => ({
          idConstancia: c.idConstancia ?? c.identificador ?? null,
          nombrePersona: c.nombrePersona,
          rfc: c.rfc,
          curp: c.curp,
          email: c.email,
          // Preferir fondoImagen por-constancia cuando se proporcione, pero asegurar
          // que cualquier header `data:image/...;base64,` sea removido antes de enviar.
          fondoImagen: stripDataUrlHeader(c.fondoImagen ?? formValue.fondo),
          textoHtml: c.textoHtml,
          sello: c.sello ?? '',
          identificador: c.identificador,
        })),
      };

      if ((!formValue.fondo || formValue.fondo.length === 0) && this.editorComponent) {
        try {
          // editorComponent.fondoValue es una señal de entrada; llamarla si está disponible
          const edComp = this.editorComponent as unknown as { fondoValue?: () => string | null };
          const edFondo =
            edComp && typeof edComp.fondoValue === 'function' ? edComp.fondoValue() : null;
          if (edFondo) {
            formValue.fondo = edFondo;
            formValue.extFondo = formValue.extFondo || '';
          }
        } catch (err) {
          // Ignorar fallos aquí; la validación del servidor manejará campos faltantes
          console.debug('No se pudo leer editor fondoValue como fallback', err);
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
        // Si el servidor retornó validación indicando faltante de nivel superior
        // 'lote' o problemas de $.fondo (algunos backends esperan un wrapper como { lote: {...} }),
        // intentar un reintento defensivo enviando el payload envuelto dentro de una
        // clave `lote`. Esto preserva compatibilidad hacia atrás con APIs divergentes.
        const errors = response?.message ?? '';
        const shouldRetryWrapped = /lote|\$\.fondo|fondo/i.test(String(errors));
        if (shouldRetryWrapped) {
          try {
            response = await this.lotesService.addAsync({
              lote: loteData,
            } as unknown as LoteEntrada);
            // Si el reintento tiene éxito, manejar éxito
            if (response.success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Lote creado exitosamente (wrapped payload)',
              });
              this.resetLote();
              success = true;
              // Hecho — retornará después de finally
            }
          } catch (err) {
            // Ignorado - continuar para mostrar fallo original
            console.warn('Reintento con payload envuelto falló', err);
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
   * Llamado cuando se usa el botón guardar del editor. Mantiene el modal del editor abierto
   * mientras se crea el lote (estado de carga), y solo cierra el modal cuando
   * la operación de creación retorna éxito. Si onSubmit retorna false el modal
   * permanece abierto para que el usuario pueda corregir problemas.
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
      // Formatear como YYYY-MM-DD para backend y resumen de UI
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

import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { LotesService } from '@services/api/lotes.service';
import {
  LoteSalida,
  LoteSalidaPagedResponseModel,
  LotePagedQueryParams,
} from '@models/lote-models';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { AuthService } from '@services/auth.service';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-pendientes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    DialogModule,
    ConfirmDialogModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
  ],
  templateUrl: './pendientes.html',
  styleUrls: ['./pendientes.css'],
  providers: [ConfirmationService],
})
export class PendientesComponent implements OnInit {
  private lotesService = inject(LotesService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  // Señales para el estado
  certificados = signal<LoteSalida[]>([]);
  loading = signal(false);
  totalRecords = signal(0);
  searchTerm = signal('');

  // Paginación y ordenamiento
  first = signal(0);
  rows = signal(10);
  sortField = signal('ID');
  sortOrder = signal(2); // 1 asc, 2 desc

  // Diálogo para ver detalles
  dialogVisible = signal(false);
  selectedCertificado = signal<LoteSalida | null>(null);

  // Diálogo para editar curso
  editDialogVisible = signal(false);
  editingLoteId = signal<number | null>(null);
  cursoName = signal('');

  // Propiedad para debounce en sort
  private lastSortCall = 0;

  async ngOnInit() {
    await this.loadCertificados();
  }

  async loadCertificados() {
    const userId = this.authService.userId();
    if (!userId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Usuario no autenticado',
      });
      return;
    }

    this.loading.set(true);
    try {
      const params: LotePagedQueryParams = {
        id: userId,
        estatus: 'PENDIENTE',
        noPagina: Math.floor(this.first() / this.rows()) + 1,
        registrosxPagina: this.rows(),
        busqueda: this.searchTerm(),
        colOrden: this.sortField(),
        tipoOrden: this.sortOrder(),
      };
      const response: LoteSalidaPagedResponseModel =
        await this.lotesService.getLoteFirmanteCreadorPagedAsync(params);
      if (response.success) {
        this.certificados.set(response.data?.registros || []);
        this.totalRecords.set(response.data?.paginacion.conteoTotal || 0);
      } else {
        this.certificados.set([]);
        this.totalRecords.set(0);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los certificados pendientes',
        });
      }
    } catch (error) {
      console.error('Error loading pendientes certificados:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar los certificados pendientes',
      });
    } finally {
      this.loading.set(false);
    }
  }

  // Ver detalles de certificado pendiente
  viewDetails(certificado: LoteSalida) {
    this.selectedCertificado.set(certificado);
    this.dialogVisible.set(true);
  }

  // Cerrar diálogo
  closeDialog() {
    this.dialogVisible.set(false);
    this.selectedCertificado.set(null);
  }

  // Firmar certificado pendiente
  firmarCertificado(certificado: LoteSalida) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que quieres firmar el certificado ${certificado.nombreLote}?`,
      header: 'Confirmar Firma',
      icon: 'pi pi-pencil',
      accept: async () => {
        try {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `Certificado ${certificado.nombreLote} firmado correctamente`,
          });
          await this.loadCertificados();
        } catch (error) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al firmar el certificado',
          });
        }
      },
    });
  }

  // Editar certificado pendiente
  editLotePendiente(idLote: number) {
    const lote = this.certificados().find((c) => c.idLote === idLote);
    if (lote) {
      this.editingLoteId.set(idLote);
      this.cursoName.set(lote.nombreLote || '');
      this.editDialogVisible.set(true);
    }
  }

  // Guardar edición del curso
  async saveCursoEdit() {
    const id = this.editingLoteId();
    const curso = this.cursoName().trim();

    if (!id || !curso) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El nombre del curso es requerido',
      });
      return;
    }

    try {
      await this.lotesService.updateCursoAsync(id, curso);
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Nombre del curso actualizado correctamente',
      });
      this.closeEditDialog();
      await this.loadCertificados();
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al actualizar el nombre del curso',
      });
    }
  }

  // Cancelar edición del curso
  cancelCursoEdit() {
    this.closeEditDialog();
  }

  // Cerrar diálogo de edición
  closeEditDialog() {
    this.editDialogVisible.set(false);
    this.editingLoteId.set(null);
    this.cursoName.set('');
  }

  // Ver listado de certificados
  setLotePendiente(idLote: number, nombreLote: string) {
    // Implementar vista del listado de certificados
    this.messageService.add({
      severity: 'info',
      summary: 'Ver certificados',
      detail: `Ver certificados del certificado ${nombreLote}`,
    });
  }

  // Borrar curso
  deleteBatch(idLote: number) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que quieres borrar el certificado ${idLote}?`,
      header: 'Confirmar Borrado',
      icon: 'pi pi-trash',
      accept: async () => {
        try {
          await this.lotesService.deleteAsync(idLote);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `Certificado ${idLote} borrado correctamente`,
          });
          await this.loadCertificados();
        } catch (error) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al borrar el certificado',
          });
        }
      },
    });
  }

  // Buscar certificados
  onSearch(event: any) {
    this.searchTerm.set(event.target.value);
    this.first.set(0);
    this.loadCertificados();
  }

  // Manejar cambio de página
  onPage(event: any) {
    this.first.set(event.first);
    this.rows.set(event.rows);
    this.loadCertificados();
  }

  // Manejar ordenamiento
  onSort(event: any) {
    const now = Date.now();
    if (now - this.lastSortCall < 300) return; // Debounce 300ms
    this.lastSortCall = now;

    console.log('aa');
    this.sortField.set(event.field);
    this.sortOrder.set(event.order === 1 ? 1 : 2); // PrimeNG uses 1 for asc, -1 for desc, but API uses 1 asc, 2 desc
    this.loadCertificados();
  }
}

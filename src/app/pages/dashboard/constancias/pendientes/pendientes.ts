import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
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
    TableModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
  ],
  templateUrl: './pendientes.html',
  styleUrls: ['./pendientes.css'],
  providers: [MessageService, ConfirmationService],
})
export class PendientesComponent implements OnInit {
  private lotesService = inject(LotesService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  // Señales para el estado
  constancias = signal<LoteSalida[]>([]);
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
  selectedConstancia = signal<LoteSalida | null>(null);

  async ngOnInit() {
    await this.loadConstancias();
  }

  private async loadConstancias() {
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
        this.constancias.set(response.data?.registros || []);
        this.totalRecords.set(response.data?.paginacion.conteoTotal || 0);
      } else {
        this.constancias.set([]);
        this.totalRecords.set(0);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las constancias pendientes',
        });
      }
    } catch (error) {
      console.error('Error loading pendientes lotes:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar los lotes pendientes',
      });
    } finally {
      this.loading.set(false);
    }
  }

  // Ver detalles de constancia pendiente
  viewDetails(constancia: LoteSalida) {
    this.selectedConstancia.set(constancia);
    this.dialogVisible.set(true);
  }

  // Cerrar diálogo
  closeDialog() {
    this.dialogVisible.set(false);
    this.selectedConstancia.set(null);
  }

  // Firmar constancia pendiente
  firmarConstancia(constancia: LoteSalida) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que quieres firmar la constancia ${constancia.nombreLote}?`,
      header: 'Confirmar Firma',
      icon: 'pi pi-pencil',
      accept: async () => {
        try {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `Constancia ${constancia.nombreLote} firmada correctamente`,
          });
          await this.loadConstancias();
        } catch (error) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al firmar la constancia',
          });
        }
      },
    });
  }

  // Editar lote pendiente
  editLotePendiente(idLote: number) {
    // Implementar edición del nombre del curso
    this.messageService.add({
      severity: 'info',
      summary: 'Editar',
      detail: `Editar lote ${idLote}`,
    });
  }

  // Ver listado de constancias
  setLotePendiente(idLote: number, nombreLote: string) {
    // Implementar vista del listado de constancias
    this.messageService.add({
      severity: 'info',
      summary: 'Ver constancias',
      detail: `Ver constancias del lote ${nombreLote}`,
    });
  }

  // Borrar curso
  deleteBatch(idLote: number) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que quieres borrar el lote ${idLote}?`,
      header: 'Confirmar Borrado',
      icon: 'pi pi-trash',
      accept: async () => {
        try {
          // Implementar borrado
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `Lote ${idLote} borrado correctamente`,
          });
          await this.loadConstancias();
        } catch (error) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al borrar el lote',
          });
        }
      },
    });
  }

  // Buscar constancias
  onSearch(event: any) {
    this.searchTerm.set(event.target.value);
    this.first.set(0);
    this.loadConstancias();
  }

  // Manejar cambio de página
  onPage(event: any) {
    this.first.set(event.first);
    this.rows.set(event.rows);
    this.loadConstancias();
  }

  // Manejar ordenamiento
  onSort(event: any) {
    this.sortField.set(event.field);
    this.sortOrder.set(event.order === 1 ? 1 : 2); // PrimeNG uses 1 for asc, -1 for desc, but API uses 1 asc, 2 desc
    this.loadConstancias();
  }
}

import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConstanciaService } from '@services/api/constancia.service';
import { ConstanciaSalida } from '@models/constancia-models';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-nuevas',
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
  ],
  templateUrl: './nuevas.html',
  styleUrls: ['./nuevas.css'],
  providers: [MessageService, ConfirmationService],
})
export class NuevasComponent implements OnInit {
  private constanciaService = inject(ConstanciaService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  // Señales para el estado
  constancias = signal<ConstanciaSalida[]>([]);
  loading = signal(false);
  searchTerm = signal('');

  // Diálogo para crear/editar
  dialogVisible = signal(false);
  editingConstancia = signal<ConstanciaSalida | null>(null);

  async ngOnInit() {
    await this.loadConstancias();
  }

  private async loadConstancias() {
    this.loading.set(true);
    try {
      const response = await this.constanciaService.getAllAsync();
      if (response.success && response.data) {
        // Filtrar solo constancias nuevas (asumiendo que nuevas son las que no tienen firma)
        // Por ahora mostramos todas, pero en el futuro se puede filtrar por estatus
        this.constancias.set(response.data);
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las constancias nuevas',
        });
      }
    } catch (error) {
      console.error('Error loading nuevas constancias:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar las constancias nuevas',
      });
    } finally {
      this.loading.set(false);
    }
  }

  // Filtrar constancias basado en el término de búsqueda
  filteredConstancias = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.constancias().filter(
      (c) =>
        c.nombre?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.identificador.toLowerCase().includes(term)
    );
  });

  // Abrir diálogo para crear nueva constancia
  openCreateDialog() {
    this.editingConstancia.set(null);
    this.dialogVisible.set(true);
  }

  // Abrir diálogo para editar constancia
  openEditDialog(constancia: ConstanciaSalida) {
    this.editingConstancia.set(constancia);
    this.dialogVisible.set(true);
  }

  // Cerrar diálogo
  closeDialog() {
    this.dialogVisible.set(false);
    this.editingConstancia.set(null);
  }

  // Guardar constancia (crear o actualizar)
  async saveConstancia() {
    this.messageService.add({
      severity: 'info',
      summary: 'Información',
      detail: 'Funcionalidad de guardar constancia en desarrollo',
    });
    this.closeDialog();
  }

  // Eliminar constancia
  deleteConstancia(constancia: ConstanciaSalida) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que quieres eliminar la constancia de ${constancia.nombre}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Constancia eliminada correctamente',
          });
          await this.loadConstancias();
        } catch (error) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al eliminar la constancia',
          });
        }
      },
    });
  }

  // Buscar constancias
  onSearch(event: any) {
    this.searchTerm.set(event.target.value);
  }

  // Marcar como pendiente de firma
  marcarComoPendiente(constancia: ConstanciaSalida) {
    this.messageService.add({
      severity: 'info',
      summary: 'Información',
      detail: `Constancia ${constancia.identificador} marcada como pendiente de firma`,
    });
  }
}

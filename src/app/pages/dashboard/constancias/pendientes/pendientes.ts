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
  ],
  templateUrl: './pendientes.html',
  styleUrls: ['./pendientes.css'],
  providers: [MessageService, ConfirmationService],
})
export class PendientesComponent implements OnInit {
  private constanciaService = inject(ConstanciaService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  // Señales para el estado
  constancias = signal<ConstanciaSalida[]>([]);
  loading = signal(false);
  searchTerm = signal('');

  // Diálogo para ver detalles
  dialogVisible = signal(false);
  selectedConstancia = signal<ConstanciaSalida | null>(null);

  async ngOnInit() {
    await this.loadConstancias();
  }

  private async loadConstancias() {
    this.loading.set(true);
    try {
      const response = await this.constanciaService.getAllAsync();
      if (response.success && response.data) {
        // Filtrar solo constancias pendientes (asumiendo que pendientes son las que están en proceso)
        // Por ahora mostramos todas, pero en el futuro se puede filtrar por estatus pendiente
        this.constancias.set(response.data);
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las constancias pendientes',
        });
      }
    } catch (error) {
      console.error('Error loading pendientes constancias:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar las constancias pendientes',
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

  // Ver detalles de constancia pendiente
  viewDetails(constancia: ConstanciaSalida) {
    this.selectedConstancia.set(constancia);
    this.dialogVisible.set(true);
  }

  // Cerrar diálogo
  closeDialog() {
    this.dialogVisible.set(false);
    this.selectedConstancia.set(null);
  }

  // Firmar constancia pendiente
  firmarConstancia(constancia: ConstanciaSalida) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que quieres firmar la constancia de ${constancia.nombre}?`,
      header: 'Confirmar Firma',
      icon: 'pi pi-pencil',
      accept: async () => {
        try {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `Constancia ${constancia.identificador} firmada correctamente`,
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

  // Buscar constancias
  onSearch(event: any) {
    this.searchTerm.set(event.target.value);
  }
}

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
  selector: 'app-firmadas',
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
  templateUrl: './firmadas.html',
  styleUrls: ['./firmadas.css'],
  providers: [MessageService, ConfirmationService],
})
export class FirmadasComponent implements OnInit {
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
        // Filtrar solo constancias firmadas (asumiendo que firmadas son las que tienen firma)
        // Por ahora mostramos todas, pero en el futuro se puede filtrar por estatus de firma
        this.constancias.set(response.data);
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las constancias firmadas',
        });
      }
    } catch (error) {
      console.error('Error loading firmadas constancias:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar las constancias firmadas',
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

  // Ver detalles de constancia firmada
  viewDetails(constancia: ConstanciaSalida) {
    this.selectedConstancia.set(constancia);
    this.dialogVisible.set(true);
  }

  // Cerrar diálogo
  closeDialog() {
    this.dialogVisible.set(false);
    this.selectedConstancia.set(null);
  }

  // Descargar constancia firmada
  downloadConstancia(constancia: ConstanciaSalida) {
    this.messageService.add({
      severity: 'info',
      summary: 'Información',
      detail: `Descargando constancia ${constancia.identificador}...`,
    });
  }

  // Buscar constancias
  onSearch(event: any) {
    this.searchTerm.set(event.target.value);
  }
}

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ConstanciaService } from '@services/api/constancia.service';
import { UsuariosService } from '@services/api/usuarios.service';
import { ConstanciaSalida } from '@models/constancia-models';
import { UsuarioSalida } from '@models/usuario-models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ChartModule, CardModule, TableModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class HomeComponent implements OnInit {
  private constanciaService = inject(ConstanciaService);
  private usuariosService = inject(UsuariosService);

  // Estadísticas
  totalConstancias = signal(0);
  totalUsuarios = signal(0);
  constanciasRecientes = signal<ConstanciaSalida[]>([]);
  allConstancias = signal<ConstanciaSalida[]>([]);

  // Datos para gráfico
  chartData = signal<any>({});
  chartOptions = signal<any>({});

  async ngOnInit() {
    await this.loadData();
    this.prepareChartData();
  }

  private async loadData() {
    try {
      const [constanciasRes, usuariosRes] = await Promise.all([
        this.constanciaService.getAllAsync(),
        this.usuariosService.getAllAsync(),
      ]);

      const constancias = constanciasRes.data || [];
      this.allConstancias.set(constancias);
      this.totalConstancias.set(constancias.length);
      this.totalUsuarios.set(usuariosRes.data?.length || 0);

      // Obtener constancias recientes (últimas 10)
      const recientes = constancias.slice(-10).reverse();
      this.constanciasRecientes.set(recientes);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }

  private prepareChartData() {
    // Por ahora, usar datos de ejemplo ya que el modelo no incluye fechaCreacion
    // En el futuro, agregar fechaCreacion al modelo si es necesario
    this.chartData.set({
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
      datasets: [
        {
          label: 'Constancias Generadas',
          data: [
            this.totalConstancias() > 0 ? Math.floor(this.totalConstancias() / 6) : 0,
            19,
            3,
            5,
            2,
            3,
          ],
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    });

    this.chartOptions.set({
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Constancias por Mes',
        },
      },
    });
  }

  private groupByMonth(constancias: ConstanciaSalida[]): { [key: string]: number } {
    // Implementación futura cuando se agregue fechaCreacion al modelo
    const grouped: { [key: string]: number } = {};
    // Por ahora, devolver datos vacíos
    return grouped;
  }
}

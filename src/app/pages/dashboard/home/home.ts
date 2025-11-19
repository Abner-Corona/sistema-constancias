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
  private certificadoService = inject(ConstanciaService);
  private usuariosService = inject(UsuariosService);

  // Estadísticas
  totalCertificados = signal(0);
  totalUsuarios = signal(0);
  certificadosRecientes = signal<ConstanciaSalida[]>([]);
  allCertificados = signal<ConstanciaSalida[]>([]);

  // Datos para gráfico
  chartData = signal<any>({});
  chartOptions = signal<any>({});

  async ngOnInit() {
    await this.loadData();
    this.prepareChartData();
  }

  private async loadData() {
    try {
      const [certificadosRes, usuariosRes] = await Promise.all([
        this.certificadoService.getAllAsync(),
        this.usuariosService.getAllAsync(),
      ]);

      const certificados = certificadosRes.data || [];
      this.allCertificados.set(certificados);
      this.totalCertificados.set(certificados.length);
      this.totalUsuarios.set(usuariosRes.data?.length || 0);

      // Obtener certificados recientes (últimas 10)
      const recientes = certificados.slice(-10).reverse();
      this.certificadosRecientes.set(recientes);
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
          label: 'Certificados Generados',
          data: [
            this.totalCertificados() > 0 ? Math.floor(this.totalCertificados() / 6) : 0,
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
          text: 'Certificados por Mes',
        },
      },
    });
  }

  private groupByMonth(certificados: ConstanciaSalida[]): { [key: string]: number } {
    // Implementación futura cuando se agregue fechaCreacion al modelo
    const grouped: { [key: string]: number } = {};
    // Por ahora, devolver datos vacíos
    return grouped;
  }
}

import { Component } from '@angular/core';
import { EChartsOption } from 'echarts/types/dist/echarts';
import { LogsService } from '../../../services/logs/logs.service';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';

@Component({
  selector: 'app-website-visits',
  standalone: true,
  imports: [CommonModule, NgxEchartsModule],
  templateUrl: './website-visits.component.html',
  styleUrl: './website-visits.component.css',
})
export class WebsiteVisitsComponent {
  loading = false;
  error: string | null = null;

  visits: any[] = [];
  totalVisits = 0;

  barChartOption: EChartsOption = {};
  lineChartOption: EChartsOption = {};

  constructor(private visitsService: LogsService) {}

  ngOnInit(): void {
    this.refresh();
  }

  async refresh() {
    this.loading = true;
    this.error = null;
    try {
      // Obtener datos de Firebase
      this.visits = await this.visitsService.getVisitsGroupedByDate();

      this.totalVisits = this.visits.reduce((sum, v) => sum + v.cantidad, 0);

      this.visits = this.visits.map((v) => ({
        ...v,
        porcentaje: ((v.cantidad / this.totalVisits) * 100).toFixed(1), // 1 decimal
      }));

      this.setupCharts();
    } catch (err) {
      console.error(err);
      this.error = 'Error cargando las estadísticas de visitas';
    } finally {
      this.loading = false;
    }
  }

  setupCharts() {
    const fechas = this.visits.map((v) => v.fecha);
    const cantidades = this.visits.map((v) => v.cantidad);

    // Gráfico de Barras
    this.barChartOption = {
      title: { text: 'Visitas por Día', left: 'center' },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: fechas },
      yAxis: { type: 'value' },
      series: [
        {
          name: 'Visitas',
          type: 'bar',
          data: cantidades,
          itemStyle: { color: '#4CAF50' },
        },
      ],
    };

    // Gráfico de Línea
    this.lineChartOption = {
      title: { text: 'Tendencia de Visitas', left: 'center' },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: fechas },
      yAxis: { type: 'value' },
      series: [
        {
          name: 'Visitas',
          type: 'line',
          smooth: true,
          data: cantidades,
          lineStyle: { color: '#2196F3' },
        },
      ],
    };
  }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import {
  LogsService,
  SpecialityCount,
  SpecialityChartData,
  DailyAppointmentCount,
} from '../../../services/logs/logs.service';
import { EChartsOption } from 'echarts';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import { PdfLogsService } from '../../../services/pdfLogs/pdf-logs.service';

@Component({
  selector: 'app-appointments-per-day',
  standalone: true,
  imports: [CommonModule, NgxEchartsModule],
  templateUrl: './appointments-per-day.component.html',
  styleUrl: './appointments-per-day.component.css',
})
export class AppointmentsPerDayComponent {
  private destroy$ = new Subject<void>();

  // Datos del componente
  dailyCounts: DailyAppointmentCount[] = [];
  loading = true;
  error: string | null = null;

  // Configuraciones de gráficos
  lineChartOption: EChartsOption = {};
  barChartOption: EChartsOption = {};
  calendarChartOption: EChartsOption = {};

  // Estadísticas
  totalDays = 0;
  totalAppointments = 0;
  averagePerDay = 0;
  maxDayCount = 0;
  peakDay: DailyAppointmentCount | null = null;
  weekdayAverage = 0;
  weekendAverage = 0;

  Math = Math;

  constructor(
    private appointmentsService: LogsService,
    private pdfExportService: PdfLogsService
  ) {
    console.log('🏗️ Constructor AppointmentsPerSpecialtyComponent');
  }

  ngOnInit(): void {
    console.log('📅 Componente Appointments Per Day inicializado');
    this.loadDailyData();
  }

  ngOnDestroy(): void {
    console.log('🗑️ Componente Appointments Per Day destruido');
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga todos los datos de turnos por día
   */
  loadDailyData(): void {
    this.loading = true;
    this.error = null;

    console.log('📊 Cargando datos diarios...');

    // Cargar conteos diarios
    this.appointmentsService
      .getAppointmentsByDay()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (dailyCounts) => {
          console.log('✅ Datos diarios cargados:', dailyCounts);
          this.dailyCounts = dailyCounts;
          this.loadStats();
          this.setupCharts();
        },
        error: (error) => {
          console.error('❌ Error cargando datos diarios:', error);
          this.error = 'Error al cargar los datos diarios. Inténtalo de nuevo.';
          this.loading = false;
        },
      });
  }

  /**
   * Carga las estadísticas diarias
   */
  private loadStats(): void {
    this.appointmentsService
      .getDailyAppointmentStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          console.log('📊 Estadísticas diarias cargadas:', stats);
          this.totalDays = stats.totalDays;
          this.totalAppointments = stats.totalAppointments;
          this.averagePerDay = stats.averagePerDay;
          this.maxDayCount = stats.maxDayCount;
          this.peakDay = stats.peakDay;
          this.weekdayAverage = stats.weekdayAverage;
          this.weekendAverage = stats.weekendAverage;
          this.loading = false;
        },
        error: (error) => {
          console.error('❌ Error cargando estadísticas diarias:', error);
          this.loading = false;
        },
      });
  }

  /**
   * Configura todos los gráficos
   */
  private setupCharts(): void {
    console.log('📊 Configurando gráficos diarios...');

    if (this.dailyCounts.length === 0) {
      console.warn('⚠️ No hay datos diarios para mostrar');
      return;
    }

    this.setupLineChart();
    this.setupBarChart();

    console.log('✅ Gráficos diarios configurados');
  }

  /**
   * Configura el gráfico de líneas
   */
  private setupLineChart(): void {
    console.log('📈 Configurando gráfico de líneas...');

    const dates = this.dailyCounts.map((item) => item.fecha);
    const counts = this.dailyCounts.map((item) => item.cantidad);
    const dayLabels = this.dailyCounts.map(
      (item) => `${item.diaSemana}\n${this.formatDate(item.fecha)}`
    );

    this.lineChartOption = {
      title: {
        text: '📈 Tendencia de Turnos por Día',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
        },
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const param = params[0];
          const index = param.dataIndex;
          const dayInfo = this.dailyCounts[index];

          return `<strong>${dayInfo.diaSemana}</strong><br/>
                  Fecha: ${this.formatDate(dayInfo.fecha)}<br/>
                  Turnos: ${param.value}<br/>
                  ${
                    dayInfo.esFinDeSemana
                      ? '🏖️ Fin de semana'
                      : '💼 Día laborable'
                  }`;
        },
      },
      grid: {
        left: '8%',
        right: '8%',
        bottom: '15%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: {
          formatter: (value: string) => {
            return this.formatDateShort(value);
          },
          rotate: 45,
          fontSize: 10,
        },
      },
      yAxis: {
        type: 'value',
        name: 'Cantidad de Turnos',
        nameTextStyle: {
          fontSize: 12,
        },
      },
      series: [
        {
          type: 'line',
          data: counts,
          smooth: true,
          lineStyle: {
            color: '#3b82f6',
            width: 3,
          },
          itemStyle: {
            color: '#3b82f6',
            borderColor: '#ffffff',
            borderWidth: 2,
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
                { offset: 1, color: 'rgba(59, 130, 246, 0.1)' },
              ],
            },
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
          markLine: {
            data: [
              {
                type: 'average',
                name: 'Promedio',
                label: {
                  formatter: 'Promedio: {c}',
                },
              },
            ],
            lineStyle: {
              color: '#f59e0b',
              type: 'dashed',
            },
          },
        },
      ],
    };

    console.log('✅ Gráfico de líneas configurado');
  }

  /**
   * Configura el gráfico de barras con diferenciación de fines de semana
   */
  private setupBarChart(): void {
    console.log('📊 Configurando gráfico de barras...');

    const dates = this.dailyCounts.map((item) => item.fecha);
    const counts = this.dailyCounts.map((item) => item.cantidad);

    // Datos con colores diferentes para fines de semana
    const barData = this.dailyCounts.map((item) => ({
      value: item.cantidad,
      itemStyle: {
        color: item.esFinDeSemana ? '#f59e0b' : '#10b981',
      },
    }));

    this.barChartOption = {
      title: {
        text: '📊 Turnos por Día (Detalle)',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          const param = params[0];
          const index = param.dataIndex;
          const dayInfo = this.dailyCounts[index];

          return `<strong>${dayInfo.diaSemana}</strong><br/>
                  Fecha: ${this.formatDate(dayInfo.fecha)}<br/>
                  Turnos: ${param.value}<br/>
                  ${
                    dayInfo.esFinDeSemana
                      ? '🏖️ Fin de semana'
                      : '💼 Día laborable'
                  }`;
        },
      },
      legend: {
        data: ['Días laborables', 'Fines de semana'],
        top: '8%',
        itemStyle: {
          color: '#10b981',
        },
      },
      grid: {
        left: '5%',
        right: '5%',
        bottom: '15%',
        top: '20%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: {
          formatter: (value: string) => {
            return this.formatDateShort(value);
          },
          rotate: 45,
          fontSize: 10,
        },
      },
      yAxis: {
        type: 'value',
        name: 'Cantidad de Turnos',
        nameTextStyle: {
          fontSize: 12,
        },
      },
      series: [
        {
          type: 'bar',
          data: barData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
          label: {
            show: false,
          },
        },
      ],
    };

    console.log('✅ Gráfico de barras configurado');
  }

  /**
   * Formatea fecha de YYYY-MM-DD a DD/MM/YYYY
   */
  formatDate(dateString: string): string {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  }

  /**
   * Formatea fecha de forma corta DD/MM
   */
  private formatDateShort(dateString: string): string {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}`;
  }

  /**
   * Obtiene la clase CSS para el día según si es fin de semana
   */
  getDayClass(day: DailyAppointmentCount): string {
    if (day.esFinDeSemana) return 'weekend';
    return 'weekday';
  }

  /**
   * Obtiene la clase de cantidad según el promedio
   */
  getCountClass(cantidad: number): string {
    if (cantidad >= this.averagePerDay * 1.5) return 'high';
    if (cantidad >= this.averagePerDay * 0.75) return 'medium';
    return 'low';
  }

  /**
   * Refresca los datos
   */
  refresh(): void {
    console.log('🔄 Refrescando datos diarios...');
    this.loadDailyData();
  }

  /**
   * Exporta los datos a CSV
   */
  exportToCSV(): void {
    console.log('📊 Exportando datos diarios a CSV...');

    if (this.dailyCounts.length === 0) {
      console.warn('⚠️ No hay datos diarios para exportar');
      return;
    }

    const csvHeader = 'Fecha,Día de la Semana,Cantidad de Turnos,Tipo de Día\n';
    const csvContent = this.dailyCounts
      .map(
        (item) =>
          `"${this.formatDate(item.fecha)}","${item.diaSemana}","${
            item.cantidad
          }","${item.esFinDeSemana ? 'Fin de semana' : 'Día laborable'}"`
      )
      .join('\n');

    const csv = csvHeader + csvContent;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `turnos-por-dia-${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('✅ CSV diario exportado');
  }

  /**
   * Prueba el servicio diario
   */
  testService(): void {
    console.log('🧪 Probando servicio diario...');
    this.appointmentsService.testDailyService();
  }

  /**
   * TrackBy function para optimizar *ngFor
   */
  trackByDate(index: number, day: DailyAppointmentCount): string {
    return day.fecha;
  }

  /**
   * Exporta todo el componente a PDF
   */
  async exportToPDF(): Promise<void> {
    try {
      console.log('📄 Iniciando exportación completa a PDF...');

      const title = 'Turnos por Día';
      const subtitle = `Reporte completo - ${this.totalAppointments} turnos en ${this.totalDays} días • Promedio: ${this.averagePerDay} turnos/día`;

      await this.pdfExportService.exportElementToPdf(
        'appointments-day-container',
        'turnos-por-dia',
        title,
        subtitle
      );

      console.log('✅ PDF completo exportado');
    } catch (error) {
      console.error('❌ Error exportando PDF completo:', error);
      alert('Error al generar el PDF. Inténtalo de nuevo.');
    }
  }

  /**
   * Exporta solo los gráficos a PDF
   */
  async exportChartsToPDF(): Promise<void> {
    try {
      console.log('📊 Exportando solo gráficos a PDF...');

      const chartIds = ['chart-line', 'chart-bar'];

      const title = 'Gráficos - Turnos por Día';
      const subtitle = `Análisis de ${this.totalAppointments} turnos distribuidos en ${this.totalDays} días`;

      await this.pdfExportService.exportChartsOnlyToPdf(
        chartIds,
        'graficos-diarios',
        title,
        subtitle
      );

      console.log('✅ PDF de gráficos exportado');
    } catch (error) {
      console.error('❌ Error exportando gráficos PDF:', error);
      alert('Error al generar el PDF de gráficos. Inténtalo de nuevo.');
    }
  }

  /**
   * Exporta tabla de datos a PDF
   */
  exportTableToPDF(): void {
    try {
      console.log('Exportando tabla a PDF...');

      const tableData = this.dailyCounts.map((day) => ({
        fecha: this.formatDate(day.fecha),
        diaSemana: day.diaSemana,
        cantidad: day.cantidad,
        tipoDia: day.esFinDeSemana ? 'Fin de semana' : 'Laborable',
      }));

      const columns = [
        {
          key: 'fecha' as keyof (typeof tableData)[0],
          title: 'Fecha',
          width: 30,
        },
        {
          key: 'diaSemana' as keyof (typeof tableData)[0],
          title: 'Día',
          width: 30,
        },
        {
          key: 'cantidad' as keyof (typeof tableData)[0],
          title: 'Turnos',
          width: 25,
        },
        {
          key: 'tipoDia' as keyof (typeof tableData)[0],
          title: 'Tipo',
          width: 35,
        },
        {
          key: 'comparacion' as keyof (typeof tableData)[0],
          title: 'vs Promedio',
          width: 30,
        },
      ];

      const title = '📋 Tabla de Turnos Diarios';
      const subtitle = `Detalle día a día (${this.dailyCounts.length} días registrados)`;

      this.pdfExportService.generateTablePdf(
        tableData,
        columns,
        'tabla-diaria',
        title,
        subtitle
      );

      console.log('✅ PDF de tabla exportado');
    } catch (error) {
      console.error('❌ Error exportando tabla PDF:', error);
      alert('Error al generar el PDF de tabla. Inténtalo de nuevo.');
    }
  }
}

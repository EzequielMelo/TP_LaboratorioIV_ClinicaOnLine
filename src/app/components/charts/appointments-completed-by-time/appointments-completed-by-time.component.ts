import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import {
  LogsService,
  SpecialityCount,
  SpecialityChartData,
  DailyAppointmentCount,
  DoctorAppointmentCount,
  TimePeriod,
  DoctorCompletedAppointmentCount,
} from '../../../services/logs/logs.service';
import { EChartsOption } from 'echarts';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import { PdfLogsService } from '../../../services/pdfLogs/pdf-logs.service';

@Component({
  selector: 'app-appointments-completed-by-time',
  standalone: true,
  imports: [CommonModule, NgxEchartsModule],
  templateUrl: './appointments-completed-by-time.component.html',
  styleUrl: './appointments-completed-by-time.component.css',
})
export class AppointmentsCompletedByTimeComponent {
  private destroy$ = new Subject<void>();

  // Datos del componente
  doctorCompletedCounts: DoctorCompletedAppointmentCount[] = [];
  loading = true;
  error: string | null = null;

  // Período de tiempo seleccionado
  selectedPeriod: TimePeriod;
  availablePeriods: TimePeriod[] = [
    { label: 'Último mes', value: 1, months: 1 },
    { label: 'Últimos 2 meses', value: 2, months: 2 },
    { label: 'Últimos 3 meses', value: 3, months: 3 },
    { label: 'Últimos 6 meses', value: 6, months: 6 },
    { label: 'Último año', value: 12, months: 12 },
  ];

  // Configuraciones de gráficos
  barChartOption: EChartsOption = {};
  pieChartOption: EChartsOption = {};
  efficiencyChartOption: EChartsOption = {};

  // Estadísticas
  totalDoctors = 0;
  totalCompletedAppointments = 0;
  averagePerDoctor = 0;
  topDoctor: DoctorCompletedAppointmentCount | null = null;
  overallEfficiency = 0;
  periodLabel = '';
  startDate = '';
  endDate = '';

  // Hacer Math disponible en el template
  Math = Math;

  constructor(
    private appointmentsService: LogsService,
    private pdfExportService: PdfLogsService
  ) {
    console.log('🏗️ Constructor AppointmentsCompletedByTimeComponent');
    // Período inicial: últimos 3 meses
    this.selectedPeriod = this.availablePeriods[2];
  }

  ngOnInit(): void {
    console.log('✅ Componente Appointments Completed By Time inicializado');
    this.loadCompletedData();
  }

  ngOnDestroy(): void {
    console.log('🗑️ Componente Appointments Completed By Time destruido');
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga todos los datos de turnos completados por médico
   */
  loadCompletedData(): void {
    this.loading = true;
    this.error = null;

    console.log(
      '📊 Cargando datos de turnos completados por médico...',
      this.selectedPeriod
    );

    // Cargar conteos de turnos completados por médico
    this.appointmentsService
      .getCompletedAppointmentsByDoctorInPeriod(this.selectedPeriod.months)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (completedCounts) => {
          console.log(
            '✅ Datos de turnos completados cargados:',
            completedCounts
          );
          this.doctorCompletedCounts = completedCounts;
          this.loadStats();
          this.setupCharts();
        },
        error: (error) => {
          console.error('❌ Error cargando turnos completados:', error);
          this.error =
            'Error al cargar los turnos completados. Inténtalo de nuevo.';
          this.loading = false;
        },
      });
  }

  /**
   * Carga las estadísticas de turnos completados
   */
  private loadStats(): void {
    this.appointmentsService
      .getCompletedAppointmentStats(this.selectedPeriod.months)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          console.log('📊 Estadísticas de completados cargadas:', stats);
          this.totalDoctors = stats.totalDoctors;
          this.totalCompletedAppointments = stats.totalCompletedAppointments;
          this.averagePerDoctor = stats.averagePerDoctor;
          this.topDoctor = stats.topDoctor;
          this.overallEfficiency = stats.overallEfficiency;
          this.periodLabel = stats.periodLabel;
          this.startDate = stats.startDate;
          this.endDate = stats.endDate;
          this.loading = false;
        },
        error: (error) => {
          console.error(
            '❌ Error cargando estadísticas de completados:',
            error
          );
          this.loading = false;
        },
      });
  }

  /**
   * Configura todos los gráficos
   */
  private setupCharts(): void {
    console.log('📊 Configurando gráficos de turnos completados...');

    if (this.doctorCompletedCounts.length === 0) {
      console.warn('⚠️ No hay datos de turnos completados para mostrar');
      return;
    }

    this.setupBarChart();
    this.setupPieChart();
    this.setupEfficiencyChart();

    console.log('✅ Gráficos de turnos completados configurados');
  }

  /**
   * Configura el gráfico de barras para turnos completados
   */
  private setupBarChart(): void {
    console.log('📊 Configurando gráfico de barras de completados...');

    const doctors = this.doctorCompletedCounts
      .slice(0, 10)
      .map((doctor) => doctor.doctorName);
    const counts = this.doctorCompletedCounts
      .slice(0, 10)
      .map((doctor) => doctor.cantidad);
    const colors = this.doctorCompletedCounts
      .slice(0, 10)
      .map((_, index) => this.getDoctorColor(index));

    this.barChartOption = {
      title: {
        text: `✅ Top 10 Médicos - Turnos Completados`,
        subtext: this.selectedPeriod.label,
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
          const doctor = this.doctorCompletedCounts[index];

          return `<strong>Dr. ${param.name}</strong><br/>
                  Completados: ${param.value}<br/>
                  Porcentaje: ${doctor?.porcentaje || 0}%<br/>
                  Eficiencia: ${doctor?.eficiencia || 0}%<br/>
                  Especialidad: ${doctor?.especialidad || 'N/A'}`;
        },
      },
      grid: {
        left: '5%',
        right: '5%',
        bottom: '20%',
        top: '20%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: doctors,
        axisLabel: {
          rotate: 45,
          fontSize: 10,
          interval: 0,
          formatter: (value: string) => {
            return value.length > 12 ? value.substring(0, 12) + '...' : value;
          },
        },
      },
      yAxis: {
        type: 'value',
        name: 'Turnos Completados',
        nameTextStyle: {
          fontSize: 12,
        },
      },
      series: [
        {
          type: 'bar',
          data: counts.map((value, index) => ({
            value: value,
            itemStyle: {
              color: colors[index],
            },
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
          label: {
            show: true,
            position: 'top',
            formatter: '{c}',
            fontSize: 11,
          },
        },
      ],
    };

    console.log('✅ Gráfico de barras de completados configurado');
  }

  /**
   * Configura el gráfico de torta para turnos completados
   */
  private setupPieChart(): void {
    console.log('🥧 Configurando gráfico de torta de completados...');

    const topDoctors = this.doctorCompletedCounts.slice(0, 8);
    const pieData = topDoctors.map((doctor, index) => ({
      name: `Dr. ${doctor.doctorName}`,
      value: doctor.cantidad,
      itemStyle: {
        color: this.getDoctorColor(index),
      },
    }));

    this.pieChartOption = {
      title: {
        text: `🥧 Distribución Turnos Completados`,
        subtext: `Top 8 - ${this.selectedPeriod.label}`,
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const doctorIndex = topDoctors.findIndex(
            (d) => `Dr. ${d.doctorName}` === params.name
          );
          const doctor = topDoctors[doctorIndex];

          return `<strong>${params.name}</strong><br/>
                  Completados: ${params.value}<br/>
                  Porcentaje: ${params.percent}%<br/>
                  Eficiencia: ${doctor?.eficiencia || 0}%`;
        },
      },
      legend: {
        type: 'scroll',
        orient: 'vertical',
        left: 'left',
        top: '15%',
        data: pieData.map((item) => item.name),
        textStyle: {
          fontSize: 11,
        },
      },
      series: [
        {
          type: 'pie',
          radius: ['30%', '70%'],
          center: ['65%', '50%'],
          data: pieData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
          label: {
            show: true,
            position: 'outside',
            formatter: '{b}\n{c} completados\n{d}%',
            fontSize: 10,
          },
        },
      ],
    };

    console.log('✅ Gráfico de torta de completados configurado');
  }

  /**
   * Configura el gráfico de eficiencia por médico
   */
  private setupEfficiencyChart(): void {
    console.log('📈 Configurando gráfico de eficiencia...');

    const doctors = this.doctorCompletedCounts
      .slice(0, 10)
      .map((doctor) => `Dr. ${doctor.doctorName}`);
    const efficiencies = this.doctorCompletedCounts
      .slice(0, 10)
      .map((doctor) => doctor.eficiencia || 0);

    // Colores basados en eficiencia
    const efficiencyColors = efficiencies.map((eff) => {
      if (eff >= 80) return '#10b981'; // Verde para alta eficiencia
      if (eff >= 60) return '#f59e0b'; // Naranja para media eficiencia
      return '#ef4444'; // Rojo para baja eficiencia
    });

    this.efficiencyChartOption = {
      title: {
        text: `📊 Eficiencia por Médico`,
        subtext: `% Turnos Completados - ${this.selectedPeriod.label}`,
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
          const doctor = this.doctorCompletedCounts[index];

          return `<strong>${param.name}</strong><br/>
                  Eficiencia: ${param.value}%<br/>
                  Completados: ${doctor?.cantidad || 0}<br/>
                  Clasificación: ${this.getEfficiencyLabel(param.value)}`;
        },
      },
      grid: {
        left: '25%',
        right: '10%',
        bottom: '10%',
        top: '20%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        name: 'Eficiencia (%)',
        max: 100,
        axisLabel: {
          formatter: '{value}%',
        },
      },
      yAxis: {
        type: 'category',
        data: doctors,
        axisLabel: {
          fontSize: 10,
          formatter: (value: string) => {
            return value.length > 18 ? value.substring(0, 18) + '...' : value;
          },
        },
      },
      series: [
        {
          type: 'bar',
          data: efficiencies.map((value, index) => ({
            value: value,
            itemStyle: {
              color: efficiencyColors[index],
            },
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
          label: {
            show: true,
            position: 'right',
            formatter: '{c}%',
            fontSize: 10,
          },
        },
      ],
    };

    console.log('✅ Gráfico de eficiencia configurado');
  }

  /**
   * Cambia el período de tiempo y recarga los datos
   */
  onPeriodChange(period: TimePeriod): void {
    if (this.selectedPeriod.value === period.value) return;

    console.log('📅 Cambiando período a:', period);
    this.selectedPeriod = period;
    this.loadCompletedData();
  }

  /**
   * Obtiene color para médico según índice
   */
  private getDoctorColor(index: number): string {
    const colors = [
      '#10b981',
      '#3b82f6',
      '#f59e0b',
      '#8b5cf6',
      '#ef4444',
      '#06b6d4',
      '#84cc16',
      '#f97316',
      '#6366f1',
      '#ec4899',
      '#14b8a6',
      '#a855f7',
      '#eab308',
      '#64748b',
      '#22c55e',
    ];
    return colors[index % colors.length];
  }

  /**
   * Obtiene la etiqueta de eficiencia
   */
  private getEfficiencyLabel(efficiency: number): string {
    if (efficiency >= 80) return 'Excelente';
    if (efficiency >= 60) return 'Buena';
    if (efficiency >= 40) return 'Regular';
    return 'Necesita mejora';
  }

  /**
   * Obtiene clase CSS según eficiencia
   */
  getEfficiencyClass(efficiency: number): string {
    if (efficiency >= 80) return 'excellent';
    if (efficiency >= 60) return 'good';
    if (efficiency >= 40) return 'regular';
    return 'poor';
  }

  /**
   * Obtiene clase CSS según cantidad de turnos completados
   */
  getCountClass(cantidad: number): string {
    if (cantidad >= this.averagePerDoctor * 1.5) return 'high';
    if (cantidad >= this.averagePerDoctor * 0.75) return 'medium';
    return 'low';
  }

  /**
   * Refresca los datos
   */
  refresh(): void {
    console.log('🔄 Refrescando datos de turnos completados...');
    this.loadCompletedData();
  }

  /**
   * Exporta los datos a CSV
   */
  exportToCSV(): void {
    console.log('📊 Exportando turnos completados a CSV...');

    if (this.doctorCompletedCounts.length === 0) {
      console.warn('⚠️ No hay datos de completados para exportar');
      return;
    }

    const csvHeader =
      'Médico,Turnos Completados,Porcentaje,Eficiencia (%),Especialidad,Período\n';
    const csvContent = this.doctorCompletedCounts
      .map(
        (doctor) =>
          `"Dr. ${doctor.doctorName}","${doctor.cantidad}","${
            doctor.porcentaje
          }%","${doctor.eficiencia}%","${doctor.especialidad || 'N/A'}","${
            this.periodLabel
          }"`
      )
      .join('\n');

    const csv = csvHeader + csvContent;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `turnos-completados-${this.selectedPeriod.value}meses-${
        new Date().toISOString().split('T')[0]
      }.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('✅ CSV de turnos completados exportado');
  }

  /**
   * Prueba el servicio de turnos completados
   */
  testService(): void {
    console.log('🧪 Probando servicio de turnos completados...');
    this.appointmentsService.testCompletedAppointmentsService();
  }

  /**
   * TrackBy function para optimizar *ngFor
   */
  trackByDoctor(
    index: number,
    doctor: DoctorCompletedAppointmentCount
  ): string {
    return doctor.doctorName;
  }

  /**
   * Exporta todo el componente a PDF
   */
  async exportToPDF(): Promise<void> {
    try {
      console.log('📄 Iniciando exportación completa a PDF...');

      const title = 'Turnos Completados por Médico';
      const subtitle = `${this.periodLabel} • ${this.totalDoctors} médicos • ${this.totalCompletedAppointments} completados • Eficiencia promedio: ${this.overallEfficiency}%`;

      await this.pdfExportService.exportElementToPdf(
        'appointments-completed-container', // ID del contenedor principal
        'turnos-completados-medico',
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

      const chartIds = ['chart-bar', 'chart-pie', 'chart-efficiency'];

      const title = 'Gráficos - Turnos Completados y Eficiencia';
      const subtitle = `${this.periodLabel} • ${this.totalCompletedAppointments} turnos completados • Eficiencia: ${this.overallEfficiency}%`;

      await this.pdfExportService.exportChartsOnlyToPdf(
        chartIds,
        'graficos-turnos-completados',
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
      console.log('📋 Exportando tabla a PDF...');

      const tableData = this.doctorCompletedCounts.map((doctor, index) => ({
        posicion: `#${index + 1}`,
        medico: `Dr. ${doctor.doctorName}`,
        especialidad: doctor.especialidad || 'No especificada',
        completados: doctor.cantidad,
        porcentaje: `${doctor.porcentaje}%`,
        eficiencia: `${doctor.eficiencia}%`,
        clasificacion:
          this.getEfficiencyClass(doctor.eficiencia || 0) === 'excellent'
            ? 'Excelente'
            : this.getEfficiencyClass(doctor.eficiencia || 0) === 'good'
            ? 'Buena'
            : this.getEfficiencyClass(doctor.eficiencia || 0) === 'regular'
            ? 'Regular'
            : 'Necesita mejora',
      }));

      const columns = [
        {
          key: 'posicion' as keyof (typeof tableData)[0],
          title: 'Pos.',
          width: 15,
        },
        {
          key: 'medico' as keyof (typeof tableData)[0],
          title: 'Médico',
          width: 45,
        },
        {
          key: 'especialidad' as keyof (typeof tableData)[0],
          title: 'Especialidad',
          width: 40,
        },
        {
          key: 'completados' as keyof (typeof tableData)[0],
          title: 'Completados',
          width: 25,
        },
        {
          key: 'eficiencia' as keyof (typeof tableData)[0],
          title: 'Eficiencia',
          width: 25,
        },
        {
          key: 'clasificacion' as keyof (typeof tableData)[0],
          title: 'Clasificación',
          width: 40,
        },
      ];

      const title = 'Ranking de Eficiencia - Turnos Completados';
      const subtitle = `${this.periodLabel} • ${this.doctorCompletedCounts.length} médicos • Eficiencia promedio: ${this.overallEfficiency}%`;

      this.pdfExportService.generateTablePdf(
        tableData,
        columns,
        'ranking-eficiencia-medicos',
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

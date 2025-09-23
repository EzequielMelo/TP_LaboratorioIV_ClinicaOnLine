import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import {
  LogsService,
  SpecialityCount,
  SpecialityChartData,
  DailyAppointmentCount,
  DoctorAppointmentCount,
  TimePeriod,
} from '../../../services/logs/logs.service';
import { EChartsOption } from 'echarts';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import { PdfLogsService } from '../../../services/pdfLogs/pdf-logs.service';

@Component({
  selector: 'app-appointments-requested-by-time',
  standalone: true,
  imports: [CommonModule, NgxEchartsModule],
  templateUrl: './appointments-requested-by-time.component.html',
  styleUrl: './appointments-requested-by-time.component.css',
})
export class AppointmentsRequestedByTimeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Datos del componente
  doctorCounts: DoctorAppointmentCount[] = [];
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
  horizontalBarChartOption: EChartsOption = {};

  // Estadísticas
  totalDoctors = 0;
  totalAppointments = 0;
  averagePerDoctor = 0;
  topDoctor: DoctorAppointmentCount | null = null;
  periodLabel = '';
  startDate = '';
  endDate = '';

  // Hacer Math disponible en el template
  Math = Math;

  constructor(
    private appointmentsService: LogsService,
    private pdfExportService: PdfLogsService
  ) {
    console.log('🏗️ Constructor AppointmentsRequestedByTimeComponent');
    // Período inicial: últimos 3 meses
    this.selectedPeriod = this.availablePeriods[2];
  }

  ngOnInit(): void {
    console.log('👨‍⚕️ Componente Appointments Requested By Time inicializado');
    this.loadDoctorData();
  }

  ngOnDestroy(): void {
    console.log('🗑️ Componente Appointments Requested By Time destruido');
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga todos los datos de turnos por médico
   */
  loadDoctorData(): void {
    this.loading = true;
    this.error = null;

    console.log(
      '📊 Cargando datos de turnos por médico...',
      this.selectedPeriod
    );

    // Cargar conteos por médico
    this.appointmentsService
      .getAppointmentsByDoctorInPeriod(this.selectedPeriod.months)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (doctorCounts) => {
          console.log('✅ Datos por médico cargados:', doctorCounts);
          this.doctorCounts = doctorCounts;
          this.loadStats();
          this.setupCharts();
        },
        error: (error) => {
          console.error('❌ Error cargando datos por médico:', error);
          this.error =
            'Error al cargar los datos por médico. Inténtalo de nuevo.';
          this.loading = false;
        },
      });
  }

  /**
   * Carga las estadísticas por médico
   */
  private loadStats(): void {
    this.appointmentsService
      .getDoctorAppointmentStats(this.selectedPeriod.months)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          console.log('📊 Estadísticas por médico cargadas:', stats);
          this.totalDoctors = stats.totalDoctors;
          this.totalAppointments = stats.totalAppointments;
          this.averagePerDoctor = stats.averagePerDoctor;
          this.topDoctor = stats.topDoctor;
          this.periodLabel = stats.periodLabel;
          this.startDate = stats.startDate;
          this.endDate = stats.endDate;
          this.loading = false;
        },
        error: (error) => {
          console.error('❌ Error cargando estadísticas por médico:', error);
          this.loading = false;
        },
      });
  }

  /**
   * Configura todos los gráficos
   */
  private setupCharts(): void {
    console.log('📊 Configurando gráficos por médico...');

    if (this.doctorCounts.length === 0) {
      console.warn('⚠️ No hay datos por médico para mostrar');
      return;
    }

    this.setupBarChart();
    this.setupPieChart();
    this.setupHorizontalBarChart();

    console.log('✅ Gráficos por médico configurados');
  }

  /**
   * Configura el gráfico de barras vertical
   */
  private setupBarChart(): void {
    console.log('📊 Configurando gráfico de barras vertical...');

    const doctors = this.doctorCounts
      .slice(0, 10)
      .map((doctor) => doctor.doctorName); // Top 10
    const counts = this.doctorCounts
      .slice(0, 10)
      .map((doctor) => doctor.cantidad);
    const colors = this.doctorCounts
      .slice(0, 10)
      .map((_, index) => this.getDoctorColor(index));

    this.barChartOption = {
      title: {
        text: `📊 Top 10 Médicos - ${this.selectedPeriod.label}`,
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
          const doctor = this.doctorCounts[index];

          return `<strong>Dr. ${param.name}</strong><br/>
                  Turnos: ${param.value}<br/>
                  Porcentaje: ${doctor?.porcentaje || 0}%<br/>
                  Especialidad: ${doctor?.especialidad || 'N/A'}`;
        },
      },
      grid: {
        left: '5%',
        right: '5%',
        bottom: '20%',
        top: '15%',
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
            // Acortar nombres largos
            return value.length > 12 ? value.substring(0, 12) + '...' : value;
          },
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

    console.log('✅ Gráfico de barras vertical configurado');
  }

  /**
   * Configura el gráfico de torta
   */
  private setupPieChart(): void {
    console.log('🥧 Configurando gráfico de torta...');

    const topDoctors = this.doctorCounts.slice(0, 8); // Top 8 para mejor visualización
    const pieData = topDoctors.map((doctor, index) => ({
      name: `Dr. ${doctor.doctorName}`,
      value: doctor.cantidad,
      itemStyle: {
        color: this.getDoctorColor(index),
      },
    }));

    this.pieChartOption = {
      title: {
        text: `🥧 Distribución Top 8 Médicos`,
        subtext: this.selectedPeriod.label,
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          return `<strong>${params.name}</strong><br/>
                  Turnos: ${params.value}<br/>
                  Porcentaje: ${params.percent}%`;
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
            formatter: '{b}\n{c} turnos',
            fontSize: 10,
          },
        },
      ],
    };

    console.log('✅ Gráfico de torta configurado');
  }

  /**
   * Configura el gráfico de barras horizontal
   */
  private setupHorizontalBarChart(): void {
    console.log('📊 Configurando gráfico de barras horizontal...');

    const doctors = this.doctorCounts
      .slice(0, 15)
      .map((doctor) => `Dr. ${doctor.doctorName}`);
    const counts = this.doctorCounts
      .slice(0, 15)
      .map((doctor) => doctor.cantidad);
    const colors = this.doctorCounts
      .slice(0, 15)
      .map((_, index) => this.getDoctorColor(index));

    this.horizontalBarChartOption = {
      title: {
        text: `📈 Ranking de Médicos - ${this.selectedPeriod.label}`,
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
          const doctor = this.doctorCounts[index];

          return `<strong>${param.name}</strong><br/>
                  Turnos: ${param.value}<br/>
                  Porcentaje: ${doctor?.porcentaje || 0}%`;
        },
      },
      grid: {
        left: '25%',
        right: '10%',
        bottom: '10%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        name: 'Cantidad de Turnos',
      },
      yAxis: {
        type: 'category',
        data: doctors,
        axisLabel: {
          fontSize: 10,
          formatter: (value: string) => {
            return value.length > 20 ? value.substring(0, 20) + '...' : value;
          },
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
            position: 'right',
            formatter: '{c}',
            fontSize: 10,
          },
        },
      ],
    };

    console.log('✅ Gráfico de barras horizontal configurado');
  }

  /**
   * Cambia el período de tiempo y recarga los datos
   */
  onPeriodChange(period: TimePeriod): void {
    if (this.selectedPeriod.value === period.value) return;

    console.log('📅 Cambiando período a:', period);
    this.selectedPeriod = period;
    this.loadDoctorData();
  }

  /**
   * Obtiene color para médico según índice
   */
  private getDoctorColor(index: number): string {
    const colors = [
      '#4CAF50',
      '#2196F3',
      '#FF9800',
      '#9C27B0',
      '#F44336',
      '#00BCD4',
      '#8BC34A',
      '#FF5722',
      '#607D8B',
      '#E91E63',
      '#3F51B5',
      '#FFC107',
      '#795548',
      '#9E9E9E',
      '#CDDC39',
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#96CEB4',
      '#FFEAA7',
    ];
    return colors[index % colors.length];
  }

  /**
   * Obtiene clase CSS según cantidad de turnos
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
    console.log('🔄 Refrescando datos por médico...');
    this.loadDoctorData();
  }

  /**
   * Exporta los datos a CSV
   */
  exportToCSV(): void {
    console.log('📊 Exportando datos por médico a CSV...');

    if (this.doctorCounts.length === 0) {
      console.warn('⚠️ No hay datos por médico para exportar');
      return;
    }

    const csvHeader =
      'Médico,Cantidad de Turnos,Porcentaje,Especialidad,Período\n';
    const csvContent = this.doctorCounts
      .map(
        (doctor) =>
          `"Dr. ${doctor.doctorName}","${doctor.cantidad}","${
            doctor.porcentaje
          }%","${doctor.especialidad || 'N/A'}","${this.periodLabel}"`
      )
      .join('\n');

    const csv = csvHeader + csvContent;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `turnos-por-medico-${this.selectedPeriod.value}meses-${
        new Date().toISOString().split('T')[0]
      }.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('✅ CSV por médico exportado');
  }

  /**
   * Prueba el servicio de médicos
   */
  testService(): void {
    console.log('🧪 Probando servicio de turnos por médico...');
    this.appointmentsService.testDoctorService();
  }

  /**
   * TrackBy function para optimizar *ngFor
   */
  trackByDoctor(index: number, doctor: DoctorAppointmentCount): string {
    return doctor.doctorName;
  }

  /**
   * Exporta todo el componente a PDF
   */
  async exportToPDF(): Promise<void> {
    try {
      console.log('📄 Iniciando exportación completa a PDF...');

      const title = 'Turnos Solicitados por Médico';
      const subtitle = `${this.periodLabel} • ${this.totalDoctors} médicos • ${this.totalAppointments} turnos • Promedio: ${this.averagePerDoctor} turnos/médico`;

      await this.pdfExportService.exportElementToPdf(
        'appointments-time-container', // ID del contenedor principal
        'turnos-solicitados-medico',
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
      console.log('Exportando solo gráficos a PDF...');

      const chartIds = ['chart-bar', 'chart-pie', 'chart-bar-horizontal'];

      const title = 'Gráficos - Turnos Solicitados por Médico';
      const subtitle = `${this.periodLabel} • Análisis de ${this.totalAppointments} turnos`;

      await this.pdfExportService.exportChartsOnlyToPdf(
        chartIds,
        'graficos-turnos-medicos',
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

      const tableData = this.doctorCounts.map((doctor, index) => ({
        posicion: `#${index + 1}`,
        medico: `Dr. ${doctor.doctorName}`,
        especialidad: doctor.especialidad || 'No especificada',
        turnos: doctor.cantidad,
        porcentaje: `${doctor.porcentaje}%`,
        estado:
          this.getCountClass(doctor.cantidad) === 'high'
            ? 'Alta demanda'
            : this.getCountClass(doctor.cantidad) === 'medium'
            ? 'Demanda media'
            : 'Baja demanda',
      }));

      const columns = [
        {
          key: 'posicion' as keyof (typeof tableData)[0],
          title: 'Pos.',
          width: 20,
        },
        {
          key: 'medico' as keyof (typeof tableData)[0],
          title: 'Médico',
          width: 50,
        },
        {
          key: 'especialidad' as keyof (typeof tableData)[0],
          title: 'Especialidad',
          width: 45,
        },
        {
          key: 'turnos' as keyof (typeof tableData)[0],
          title: 'Turnos',
          width: 25,
        },
        {
          key: 'porcentaje' as keyof (typeof tableData)[0],
          title: '%',
          width: 20,
        },
        {
          key: 'estado' as keyof (typeof tableData)[0],
          title: 'Estado',
          width: 30,
        },
      ];

      const title = 'Ranking de Médicos - Turnos Solicitados';
      const subtitle = `${this.periodLabel} • ${this.doctorCounts.length} médicos`;

      this.pdfExportService.generateTablePdf(
        tableData,
        columns,
        'ranking-medicos-solicitados',
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

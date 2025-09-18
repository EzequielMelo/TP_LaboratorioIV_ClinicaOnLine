import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import {
  LogsService,
  SpecialityCount,
  SpecialityChartData,
} from '../../../services/logs/logs.service';
import { EChartsOption } from 'echarts';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';

@Component({
  selector: 'app-appointments-per-specialty',
  standalone: true,
  imports: [CommonModule, NgxEchartsModule],
  templateUrl: './appointments-per-specialty.component.html',
  styleUrl: './appointments-per-specialty.component.css',
})
export class AppointmentsPerSpecialtyComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Datos del componente
  specialityCounts: SpecialityCount[] = [];
  loading = true;
  error: string | null = null;

  // Configuraciones de gráficos
  pieChartOption: EChartsOption = {};
  barChartOption: EChartsOption = {};

  // Estadísticas
  totalAppointments = 0;
  totalSpecialities = 0;
  topSpeciality: SpecialityCount | null = null;
  averagePerSpeciality = 0;

  constructor(private appointmentsService: LogsService) {
    console.log('🏗️ Constructor AppointmentsPerSpecialtyComponent');
  }

  ngOnInit(): void {
    console.log('🏥 Componente Appointments Per Specialty inicializado');
    this.loadSpecialityData();
  }

  ngOnDestroy(): void {
    console.log('🗑️ Componente Appointments Per Specialty destruido');
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga todos los datos de especialidades
   */
  loadSpecialityData(): void {
    this.loading = true;
    this.error = null;

    console.log('📊 Cargando datos de especialidades...');

    // Cargar conteos de especialidades
    this.appointmentsService
      .getAppointmentsBySpeciality()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (specialityCounts) => {
          console.log('✅ Datos de especialidades cargados:', specialityCounts);
          this.specialityCounts = specialityCounts;
          this.loadStats();
          this.setupCharts();
        },
        error: (error) => {
          console.error('❌ Error cargando especialidades:', error);
          this.error =
            'Error al cargar los datos de especialidades. Inténtalo de nuevo.';
          this.loading = false;
        },
      });
  }

  /**
   * Carga las estadísticas resumidas
   */
  private loadStats(): void {
    this.appointmentsService
      .getSpecialityStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          console.log('📊 Estadísticas cargadas:', stats);
          this.totalAppointments = stats.totalAppointments;
          this.totalSpecialities = stats.totalSpecialities;
          this.topSpeciality = stats.topSpeciality;
          this.averagePerSpeciality = stats.averagePerSpeciality;
          this.loading = false;
        },
        error: (error) => {
          console.error('❌ Error cargando estadísticas:', error);
          this.loading = false;
        },
      });
  }

  /**
   * Configura todos los gráficos
   */
  private setupCharts(): void {
    console.log('📊 Configurando gráficos de especialidades...');

    if (this.specialityCounts.length === 0) {
      console.warn('⚠️ No hay datos de especialidades para mostrar');
      return;
    }

    this.setupPieChart();
    this.setupBarChart();

    console.log('✅ Gráficos de especialidades configurados');
  }

  /**
   * Configura el gráfico de torta
   */
  private setupPieChart(): void {
    console.log('🥧 Configurando gráfico de torta...');

    const chartData = this.specialityCounts.map((item, index) => ({
      name: item.especialidad,
      value: item.cantidad,
      itemStyle: {
        color: this.getSpecialityColor(index),
      },
    }));

    this.pieChartOption = {
      title: {
        text: '🥧 Distribución de Turnos por Especialidad',
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
        orient: 'vertical',
        left: 'left',
        data: chartData.map((item) => item.name),
        textStyle: {
          fontSize: 12,
        },
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'], // Donut style
          center: ['60%', '50%'],
          avoidLabelOverlap: false,
          data: chartData,
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
            formatter: '{b}\n{c} turnos\n({d}%)',
            fontSize: 11,
          },
        },
      ],
    };

    console.log('✅ Gráfico de torta configurado');
  }

  /**
   * Configura el gráfico de barras
   */
  private setupBarChart(): void {
    console.log('📊 Configurando gráfico de barras...');

    const specialties = this.specialityCounts.map((item) => item.especialidad);
    const counts = this.specialityCounts.map((item) => item.cantidad);
    const colors = this.specialityCounts.map((item, index) =>
      this.getSpecialityColor(index)
    );

    this.barChartOption = {
      title: {
        text: '📊 Turnos por Especialidad (Ranking)',
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
          const percentage = Math.round(
            (param.value / this.totalAppointments) * 100
          );
          return `<strong>${param.name}</strong><br/>
                  Turnos: ${param.value}<br/>
                  Porcentaje: ${percentage}%`;
        },
      },
      grid: {
        left: '5%',
        right: '5%',
        bottom: '15%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: specialties,
        axisLabel: {
          rotate: 45,
          fontSize: 10,
          interval: 0, // Mostrar todas las etiquetas
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

    console.log('✅ Gráfico de barras configurado');
  }

  /**
   * Obtiene color para especialidad según índice
   */
  private getSpecialityColor(index: number): string {
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
    ];
    return colors[index % colors.length];
  }

  /**
   * Refresca los datos
   */
  refresh(): void {
    console.log('🔄 Refrescando datos de especialidades...');
    this.loadSpecialityData();
  }

  /**
   * Exporta los datos a CSV
   */
  exportToCSV(): void {
    console.log('📊 Exportando datos de especialidades a CSV...');

    if (this.specialityCounts.length === 0) {
      console.warn('⚠️ No hay datos de especialidades para exportar');
      return;
    }

    const csvHeader = 'Especialidad,Cantidad de Turnos,Porcentaje\n';
    const csvContent = this.specialityCounts
      .map(
        (item) =>
          `"${item.especialidad}","${item.cantidad}","${item.porcentaje}%"`
      )
      .join('\n');

    const csv = csvHeader + csvContent;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `especialidades-${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('✅ CSV de especialidades exportado');
  }

  /**
   * TrackBy function para la tabla
   */
  trackBySpecialty(index: number, specialty: SpecialityCount): string {
    return specialty.especialidad;
  }

  /**
   * Obtiene la clase CSS según la cantidad de turnos
   */
  getStatusClass(cantidad: number): string {
    const promedio = this.averagePerSpeciality;

    if (cantidad >= promedio * 1.5) return 'high';
    if (cantidad >= promedio * 0.75) return 'medium';
    return 'low';
  }

  /**
   * Obtiene la etiqueta del estado según la cantidad
   */
  getStatusLabel(cantidad: number): string {
    const promedio = this.averagePerSpeciality;

    if (cantidad >= promedio * 1.5) return 'Alta demanda';
    if (cantidad >= promedio * 0.75) return 'Demanda media';
    return 'Baja demanda';
  }
}

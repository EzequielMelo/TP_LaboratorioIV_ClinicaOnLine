import { Component } from '@angular/core';
import {
  LogsService,
  LoginLogDisplay,
} from '../../../services/logs/logs.service';
import { EChartsOption } from 'echarts';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import { PdfLogsService } from '../../../services/pdfLogs/pdf-logs.service';

@Component({
  selector: 'app-logged-users',
  standalone: true,
  imports: [CommonModule, NgxEchartsModule],
  templateUrl: './logged-users.component.html',
  styleUrls: ['./logged-users.component.css'],
})
export class LoggedUsersComponent {
  private destroy$ = new Subject<void>();

  // Datos del componente
  logs: LoginLogDisplay[] = [];
  loading = true;
  error: string | null = null;

  // Configuraciones de gráficos para ngx-echarts
  timelineChartOption: EChartsOption = {};
  dailyActivityChartOption: EChartsOption = {};
  userTypeChartOption: EChartsOption = {};

  // Estadísticas generales
  totalLogins = 0;
  loginsByUserType = {
    pacientes: 0,
    especialistas: 0,
    administradores: 0,
  };

  constructor(
    private logsService: LogsService,
    private pdfExportService: PdfLogsService
  ) {}

  ngOnInit(): void {
    console.log('🔐 Componente Logged Users inicializado');
    this.loadLoginData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga todos los datos de login y configura los gráficos
   */
  loadLoginData(): void {
    this.loading = true;
    this.error = null;

    console.log('📊 Cargando datos de login...');

    this.logsService
      .getAllLoginLogs()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (logs) => {
          console.log('✅ Datos de login cargados:', logs);
          this.logs = logs;
          this.calculateStats(logs);
          this.setupCharts();
          this.loading = false;
        },
        error: (error) => {
          console.error('❌ Error cargando datos de login:', error);
          this.error =
            'Error al cargar los datos de login. Inténtalo de nuevo.';
          this.loading = false;
        },
      });
  }

  /**
   * Calcula estadísticas generales
   */
  private calculateStats(logs: LoginLogDisplay[]): void {
    this.totalLogins = logs.length;

    // Resetear contadores
    this.loginsByUserType = {
      pacientes: 0,
      especialistas: 0,
      administradores: 0,
    };

    // Contar por tipo de usuario
    logs.forEach((log) => {
      switch (log.tipoUsuario.toLowerCase()) {
        case 'paciente':
          this.loginsByUserType.pacientes++;
          break;
        case 'especialista':
          this.loginsByUserType.especialistas++;
          break;
        case 'administrador':
          this.loginsByUserType.administradores++;
          break;
      }
    });

    console.log('📈 Estadísticas calculadas:', {
      total: this.totalLogins,
      byType: this.loginsByUserType,
    });
  }

  /**
   * Configura todos los gráficos
   */
  private setupCharts(): void {
    this.setupTimelineChart();
    this.setupDailyActivityChart();
    this.setupUserTypeChart();
  }

  /**
   * Configura el gráfico de timeline de logins
   */
  private setupTimelineChart(): void {
    console.log('📈 Configurando gráfico timeline...');

    // Preparar datos para el timeline
    const timelineData = this.logs.slice(0, 20).map((log, index) => ({
      name: log.usuario,
      value: [
        log.fechaCompleta.getTime(), // X axis (tiempo)
        index, // Y axis (posición)
        log.tipoUsuario, // Categoría
        `${log.fecha} ${log.hora}`, // Información adicional
      ],
      itemStyle: {
        color: this.getColorByUserType(log.tipoUsuario),
      },
    }));

    this.timelineChartOption = {
      title: {
        text: '🔐 Línea de Tiempo de Ingresos (Últimos 20)',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const data = params.data;
          return `
            <strong>${data.name}</strong><br/>
            Tipo: ${data.value[2]}<br/>
            Fecha: ${data.value[3]}
          `;
        },
      },
      xAxis: {
        type: 'time',
        name: 'Fecha y Hora',
        axisLabel: {
          formatter: (value: number) => {
            const date = new Date(value);
            return date.toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
            });
          },
        },
      },
      yAxis: {
        type: 'category',
        name: 'Usuarios',
        data: timelineData.map((item) => item.name),
      },
      series: [
        {
          type: 'scatter',
          data: timelineData,
          symbolSize: 8,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.3)',
            },
          },
        },
      ],
      grid: {
        left: '15%',
        right: '10%',
        bottom: '15%',
        top: '15%',
      },
    };
  }

  /**
   * Configura el gráfico de actividad diaria
   */
  private setupDailyActivityChart(): void {
    console.log('📅 Configurando gráfico de actividad diaria...');

    // Agrupar logs por fecha
    const logsByDate = new Map<string, number>();

    this.logs.forEach((log) => {
      const fecha = log.fecha;
      logsByDate.set(fecha, (logsByDate.get(fecha) || 0) + 1);
    });

    // Convertir a arrays para el gráfico
    const dates = Array.from(logsByDate.keys()).sort();
    const counts = dates.map((date) => logsByDate.get(date) || 0);

    this.dailyActivityChartOption = {
      title: {
        text: '📅 Logins por Día',
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
          return `Fecha: ${param.name}<br/>Logins: ${param.value}`;
        },
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: {
          rotate: 45,
        },
      },
      yAxis: {
        type: 'value',
        name: 'Cantidad de Logins',
      },
      series: [
        {
          data: counts,
          type: 'bar',
          itemStyle: {
            color: '#4CAF50',
          },
          emphasis: {
            itemStyle: {
              color: '#45a049',
            },
          },
        },
      ],
      grid: {
        left: '10%',
        right: '10%',
        bottom: '20%',
        top: '15%',
      },
    };
  }

  /**
   * Configura el gráfico de distribución por tipo de usuario
   */
  private setupUserTypeChart(): void {
    console.log('👥 Configurando gráfico por tipo de usuario...');

    const pieData = [
      {
        value: this.loginsByUserType.pacientes,
        name: 'Pacientes',
        itemStyle: { color: '#4CAF50' },
      },
      {
        value: this.loginsByUserType.especialistas,
        name: 'Especialistas',
        itemStyle: { color: '#2196F3' },
      },
      {
        value: this.loginsByUserType.administradores,
        name: 'Administradores',
        itemStyle: { color: '#FF9800' },
      },
    ];

    this.userTypeChartOption = {
      title: {
        text: '👥 Distribución por Tipo de Usuario',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'horizontal',
        bottom: '5%',
        left: 'center',
      },
      series: [
        {
          type: 'pie',
          radius: '70%',
          center: ['50%', '50%'],
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
            formatter: '{b}\n{c} logins',
          },
        },
      ],
    };
  }

  /**
   * Obtiene color según el tipo de usuario
   */
  private getColorByUserType(tipoUsuario: string): string {
    const colores: { [key: string]: string } = {
      Paciente: '#4CAF50', // Verde
      Especialista: '#2196F3', // Azul
      Administrador: '#FF9800', // Naranja
    };

    return colores[tipoUsuario] || '#9E9E9E';
  }

  /**
   * Refresca los datos
   */
  refresh(): void {
    console.log('🔄 Refrescando datos...');
    this.loadLoginData();
  }

  /**
   * Exporta los datos a CSV
   */
  exportToCSV(): void {
    console.log('📊 Exportando datos a CSV...');

    const csvHeader = 'Usuario,Tipo,Fecha,Hora,ID Usuario\n';
    const csvContent = this.logs
      .map(
        (log) =>
          `"${log.usuario}","${log.tipoUsuario}","${log.fecha}","${log.hora}","${log.userId}"`
      )
      .join('\n');

    const csv = csvHeader + csvContent;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `login-logs-${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('✅ CSV exportado');
  }

  trackByLogId(index: number, log: LoginLogDisplay): string {
    return log.id;
  }

  /**
   * Exporta todo el componente a PDF
   */
  async exportToPDF(): Promise<void> {
    try {
      console.log('📄 Iniciando exportación completa a PDF...');

      const title = 'Log de Ingresos al Sistema';
      const subtitle = `Reporte completo de ingresos de usuarios - Total: ${this.totalLogins} logins`;

      await this.pdfExportService.exportElementToPdf(
        'logged-users-container', // ID del contenedor principal
        'log-ingresos',
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

      const chartIds = ['chart-timeline', 'chart-daily', 'chart-usertype'];

      const title = 'Gráficos - Log de Ingresos';
      const subtitle = `Visualizaciones de ${this.totalLogins} logins registrados`;

      await this.pdfExportService.exportChartsOnlyToPdf(
        chartIds,
        'graficos-login',
        title,
        subtitle
      );

      console.log('✅ PDF de gráficos exportado');
    } catch (error) {
      console.error('❌ Error exportando gráficos PDF:', error);
      alert('Error al generar el PDF de gráficos. Inténtalo de nuevo.');
    }
  }

  exportTableToPDF(): void {
    try {
      console.log('📋 Exportando tabla a PDF...');

      const columns = [
        {
          key: 'usuario' as keyof LoginLogDisplay,
          title: 'Usuario',
          width: 50,
        },
        {
          key: 'tipoUsuario' as keyof LoginLogDisplay,
          title: 'Tipo',
          width: 30,
        },
        { key: 'fecha' as keyof LoginLogDisplay, title: 'Fecha', width: 30 },
        { key: 'hora' as keyof LoginLogDisplay, title: 'Hora', width: 25 },
        {
          key: 'userId' as keyof LoginLogDisplay,
          title: 'ID Usuario',
          width: 55,
        },
      ];

      const title = 'Tabla de Logins';
      const subtitle = `Detalle de todos los ingresos registrados (${this.logs.length} registros)`;

      this.pdfExportService.generateTablePdf(
        this.logs,
        columns,
        'tabla-logins',
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

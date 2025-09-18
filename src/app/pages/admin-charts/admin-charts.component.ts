import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LoggedUsersComponent } from '../../components/charts/logged-users/logged-users.component';
import { AppointmentsRequestedByTimeComponent } from '../../components/charts/appointments-requested-by-time/appointments-requested-by-time.component';
import { AppointmentsCompletedByTimeComponent } from '../../components/charts/appointments-completed-by-time/appointments-completed-by-time.component';
import { AppointmentsPerDayComponent } from '../../components/charts/appointments-per-day/appointments-per-day.component';
import { AppointmentsPerSpecialtyComponent } from '../../components/charts/appointments-per-specialty/appointments-per-specialty.component';

export enum TipoGrafico {
  LOGINS = 'logins',
  TURNOS_POR_ESPECIALIDAD = 'turnos-por-especialidad',
  TURNOS_POR_DIA = 'turnos-diarios',
  TURNOS_SOLICITADOS = 'turnos-solicitados',
  TURNOS_FINALIZADOS = 'turnos-finalizados',
}

// Interface para las opciones del menú
export interface OpcionGrafico {
  id: TipoGrafico;
  titulo: string;
  descripcion: string;
  icono: string;
  activo: boolean;
}

@Component({
  selector: 'app-admin-charts',
  standalone: true,
  imports: [
    CommonModule,
    LoggedUsersComponent,
    AppointmentsRequestedByTimeComponent,
    AppointmentsCompletedByTimeComponent,
    AppointmentsPerDayComponent,
    AppointmentsPerSpecialtyComponent,
  ],
  templateUrl: './admin-charts.component.html',
  styleUrl: './admin-charts.component.css',
})
export class AdminChartsComponent {
  graficoActual: TipoGrafico = TipoGrafico.LOGINS;

  // Enum disponible en el template
  TipoGrafico = TipoGrafico;

  // Opciones del menú lateral
  opcionesGraficos: OpcionGrafico[] = [
    {
      id: TipoGrafico.LOGINS,
      titulo: 'Resumen General',
      descripcion: 'Vista general de todas las estadísticas',
      icono: '📊',
      activo: true,
    },
    {
      id: TipoGrafico.TURNOS_POR_ESPECIALIDAD,
      titulo: 'Logins por Tipo',
      descripcion: 'Pacientes vs Especialistas vs Administradores',
      icono: '👥',
      activo: false,
    },
    {
      id: TipoGrafico.TURNOS_POR_DIA,
      titulo: 'Actividad Diaria',
      descripcion: 'Logins por día en los últimos 30 días',
      icono: '📅',
      activo: false,
    },
    {
      id: TipoGrafico.TURNOS_SOLICITADOS,
      titulo: 'Actividad Semanal',
      descripcion: 'Patrones de uso por día de la semana',
      icono: '📈',
      activo: false,
    },
    {
      id: TipoGrafico.TURNOS_FINALIZADOS,
      titulo: 'Usuarios Más Activos',
      descripcion: 'Ranking de usuarios por frecuencia de login',
      icono: '🏆',
      activo: false,
    },
  ];

  // Estados del componente
  cargando = false;
  error: string | null = null;
  ultimaActualizacion: Date | null = null;

  constructor() {}

  ngOnInit(): void {
    console.log('🏥 Dashboard Administrativo de Clínica inicializado');
    this.actualizarUltimaActualizacion();
  }

  /**
   * Cambia el gráfico activo
   */
  seleccionarGrafico(tipo: TipoGrafico): void {
    console.log('📊 Cambiando a gráfico:', tipo);

    if (tipo === this.graficoActual) {
      console.log('⚠️ Ya está seleccionado el mismo gráfico');
      return;
    }

    // Actualizar estado activo en las opciones
    this.opcionesGraficos.forEach((opcion) => {
      opcion.activo = opcion.id === tipo;
    });

    // Cambiar gráfico actual
    this.graficoActual = tipo;

    // Actualizar última actualización
    this.actualizarUltimaActualizacion();

    console.log('✅ Gráfico cambiado a:', tipo);
  }

  /**
   * Refresca los datos del gráfico actual
   */
  refrescarDatos(): void {
    console.log('🔄 Refrescando datos del dashboard...');
    this.cargando = true;
    this.error = null;

    // Simular tiempo de carga
    setTimeout(() => {
      this.cargando = false;
      this.actualizarUltimaActualizacion();
      console.log('✅ Datos refrescados');
    }, 1500);
  }

  /**
   * Obtiene la información del gráfico actual
   */
  getGraficoActualInfo(): OpcionGrafico | undefined {
    return this.opcionesGraficos.find(
      (opcion) => opcion.id === this.graficoActual
    );
  }

  /**
   * Obtiene el título del gráfico actual
   */
  getTituloGraficoActual(): string {
    const info = this.getGraficoActualInfo();
    return info ? info.titulo : 'Dashboard Administrativo';
  }

  /**
   * Obtiene la descripción del gráfico actual
   */
  getDescripcionGraficoActual(): string {
    const info = this.getGraficoActualInfo();
    return info
      ? info.descripcion
      : 'Panel de control administrativo de la clínica';
  }

  /**
   * Exporta los datos actuales
   */
  exportarDatos(): void {
    console.log('📥 Exportando datos del gráfico:', this.graficoActual);

    // Aquí implementarías la lógica de exportación
    // Por ahora, solo mostramos un mensaje
    alert(`📊 Exportando datos de: ${this.getTituloGraficoActual()}`);
  }

  /**
   * Actualiza la timestamp de última actualización
   */
  private actualizarUltimaActualizacion(): void {
    this.ultimaActualizacion = new Date();
  }

  /**
   * Formatea la fecha de última actualización
   */
  getUltimaActualizacionFormateada(): string {
    if (!this.ultimaActualizacion) return 'Nunca';

    return this.ultimaActualizacion.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Verifica si el usuario tiene permisos de administrador
   */
  tienePermisosAdmin(): boolean {
    // Aquí verificarías los permisos del usuario actual
    // Por ahora retornamos true
    return true;
  }

  /**
   * Maneja errores del dashboard
   */
  manejarError(error: any): void {
    console.error('❌ Error en el dashboard:', error);
    this.error = 'Error al cargar los datos. Inténtalo de nuevo.';
    this.cargando = false;
  }
}

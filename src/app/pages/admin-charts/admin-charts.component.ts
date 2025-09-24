import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LoggedUsersComponent } from '../../components/charts/logged-users/logged-users.component';
import { AppointmentsRequestedByTimeComponent } from '../../components/charts/appointments-requested-by-time/appointments-requested-by-time.component';
import { AppointmentsCompletedByTimeComponent } from '../../components/charts/appointments-completed-by-time/appointments-completed-by-time.component';
import { AppointmentsPerDayComponent } from '../../components/charts/appointments-per-day/appointments-per-day.component';
import { AppointmentsPerSpecialtyComponent } from '../../components/charts/appointments-per-specialty/appointments-per-specialty.component';
import { WebsiteVisitsComponent } from '../../components/charts/website-visits/website-visits.component';
import { SpecialtyStatisticsComponent } from '../../components/charts/specialty-statistics/specialty-statistics.component';
import { SurveyStatsComponent } from '../../components/charts/survey-stats/survey-stats.component';
import { UsersAppointmentsStatsComponent } from '../../components/charts/users-appointments-stats/users-appointments-stats.component';
import { animate, style, transition, trigger } from '@angular/animations';

export enum TipoGrafico {
  LOGINS = 'logins',
  TURNOS_POR_ESPECIALIDAD = 'turnos-por-especialidad',
  TURNOS_POR_DIA = 'turnos-diarios',
  TURNOS_SOLICITADOS = 'turnos-solicitados',
  TURNOS_FINALIZADOS = 'turnos-finalizados',
  VISITAS_AL_SITIO = 'visitas-al-sitio',
  DATOS_DE_ESPECIALIDADES = 'datos-de-especialidades',
  DATOS_DE_ENCUESTAS = 'datos-de-encuestas',
  DATOS_DE_PACIENTES = 'datos-de-pacientes',
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
    WebsiteVisitsComponent,
    SpecialtyStatisticsComponent,
    SurveyStatsComponent,
    UsersAppointmentsStatsComponent,
  ],
  templateUrl: './admin-charts.component.html',
  styleUrl: './admin-charts.component.css',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate(
          '300ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '200ms ease-in',
          style({ opacity: 0, transform: 'translateY(-10px)' })
        ),
      ]),
    ]),
  ],
})
export class AdminChartsComponent {
  graficoActual: TipoGrafico = TipoGrafico.LOGINS;

  // Enum disponible en el template
  TipoGrafico = TipoGrafico;

  // Opciones del menú lateral
  opcionesGraficos: OpcionGrafico[] = [
    {
      id: TipoGrafico.LOGINS,
      titulo: 'Ingresos al Sistema',
      descripcion: 'Usuario, día y horario de ingreso al sistema',
      icono: '🔐', // login / seguridad
      activo: true,
    },
    {
      id: TipoGrafico.TURNOS_POR_ESPECIALIDAD,
      titulo: 'Turnos Solicitados por Médico',
      descripcion: 'Turnos solicitados por médico en un período de tiempo',
      icono: '👨‍⚕️', // médico
      activo: false,
    },
    {
      id: TipoGrafico.TURNOS_POR_DIA,
      titulo: 'Turnos Completados por Médico',
      descripcion: 'Turnos finalizados por médico en un período de tiempo',
      icono: '✅', // completados
      activo: false,
    },
    {
      id: TipoGrafico.TURNOS_SOLICITADOS,
      titulo: 'Turnos por Día',
      descripcion: 'Distribución diaria de turnos programados',
      icono: '📅', // calendario
      activo: false,
    },
    {
      id: TipoGrafico.TURNOS_FINALIZADOS,
      titulo: 'Turnos por Especialidad',
      descripcion: 'Cantidad de turnos agrupados por especialidad médica',
      icono: '📊', // gráfico de barras
      activo: false,
    },
    {
      id: TipoGrafico.VISITAS_AL_SITIO,
      titulo: 'Visitas al Sitio',
      descripcion: 'Visitas que obtuvo la página web',
      icono: '🌐', // web / internet
      activo: false,
    },
    {
      id: TipoGrafico.DATOS_DE_ESPECIALIDADES,
      titulo: 'Datos sobre especialidades',
      descripcion: 'Datos relevantes sobre las especialidades médicas',
      icono: '🩺', // estetoscopio
      activo: false,
    },
    {
      id: TipoGrafico.DATOS_DE_ENCUESTAS,
      titulo: 'Datos sobre encuestas',
      descripcion: 'Datos relevantes sobre las encuestas de satisfacción',
      icono: '📝', // encuesta/cuestionario
      activo: false,
    },
    {
      id: TipoGrafico.DATOS_DE_PACIENTES,
      titulo: 'Datos sobre los turnos de pacientes',
      descripcion: 'Datos relevantes sobre los turnos de pacientes',
      icono: '🧑‍🤝‍🧑', // pacientes/personas
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

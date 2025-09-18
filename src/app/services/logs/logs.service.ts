import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  Timestamp,
  getDocs,
  query,
  orderBy,
} from '@angular/fire/firestore';
import { Observable, catchError, from, map, tap } from 'rxjs';

export interface LoginLog {
  lastName: string;
  name: string;
  time: Timestamp;
  userId: string;
  userType: string;
}

export interface LoginLogFirebase {
  lastName: string;
  name: string;
  time: any; // Firebase Timestamp
  userId: string;
  userType: string;
}

export interface LoginLogDisplay {
  id: string;
  usuario: string; // nombre + apellido
  tipoUsuario: string; // paciente, especialista, admin
  fecha: string; // fecha formateada: "16/09/2024"
  hora: string; // hora formateada: "14:30:25"
  fechaCompleta: Date; // fecha original para gráficos
  userId: string; // ID del usuario
}

// Interface para los datos de appointment en Firebase
export interface AppointmentFirebase {
  speciality: string;
  // ... otros campos que tengas como date, doctor, patient, etc.
  [key: string]: any; // Para otros campos adicionales
}

// Interface para los datos agrupados por especialidad
export interface SpecialityCount {
  especialidad: string;
  cantidad: number;
  porcentaje?: number; // Se calculará después
}

// Interface para datos del gráfico
export interface SpecialityChartData {
  name: string;
  value: number;
  itemStyle: {
    color: string;
  };
}

// Interface para los turnos agrupados por día
export interface DailyAppointmentCount {
  fecha: string; // YYYY-MM-DD
  cantidad: number; // Número de turnos ese día
  fechaObj: Date; // Objeto Date para ordenamiento
  diaSemana: string; // Lunes, Martes, etc.
  esFinDeSemana: boolean; // true si es sábado o domingo
}

@Injectable({
  providedIn: 'root',
})
export class LogsService {
  private readonly SPECIALTY_COLORS = [
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

  constructor(private firestore: Firestore) {}

  /**
   * Guarda un log de login en Firebase con debug completo
   */
  saveLoginLog(loginData: {
    lastName: string;
    name: string;
    userId: string;
    userType: 'paciente' | 'especialista' | 'admin';
  }): Observable<any> {
    console.log('🚀 Iniciando saveLoginLog con datos:', loginData);

    const loginLog: LoginLog = {
      ...loginData,
      time: Timestamp.now(),
    };

    console.log('📋 Datos completos del log a guardar:', loginLog);

    try {
      const loginLogsCollection = collection(this.firestore, 'loginLogs');
      const documentPromise = addDoc(loginLogsCollection, loginLog);

      return from(documentPromise).pipe(
        tap((docRef) => {}),
        catchError((error) => {
          throw error;
        })
      );
    } catch (syncError) {
      throw syncError;
    }
  }

  // Método de prueba simple para verificar conexión
  testFirestoreConnection(): Observable<any> {
    const testData = {
      test: 'Conexión de prueba',
      timestamp: Timestamp.now(),
    };

    const testCollection = collection(this.firestore, 'test');

    return from(addDoc(testCollection, testData)).pipe(
      tap((docRef) => {}),
      catchError((error) => {
        throw error;
      })
    );
  }

  getAllLoginLogs(): Observable<LoginLogDisplay[]> {
    console.log('📊 Obteniendo logs de loginLogs...');

    const loginLogsCollection = collection(this.firestore, 'loginLogs');

    // Ordenar por fecha descendente (más recientes primero)
    const orderedQuery = query(loginLogsCollection, orderBy('time', 'desc'));

    return from(getDocs(orderedQuery)).pipe(
      map((querySnapshot) => {
        console.log(`📋 ${querySnapshot.size} logs encontrados`);

        const logsFormateados: LoginLogDisplay[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data() as LoginLogFirebase;
          console.log('📄 Procesando log:', doc.id, data);

          // Convertir timestamp de Firebase a Date
          const fechaCompleta = data.time.toDate();

          // Formatear los datos
          const logFormateado: LoginLogDisplay = {
            id: doc.id,
            usuario: this.formatearNombreCompleto(data.name, data.lastName),
            tipoUsuario: this.formatearTipoUsuario(data.userType),
            fecha: this.formatearFecha(fechaCompleta),
            hora: this.formatearHora(fechaCompleta),
            fechaCompleta: fechaCompleta,
            userId: data.userId,
          };

          logsFormateados.push(logFormateado);
        });

        console.log('✅ Logs formateados para ngx-echarts:', logsFormateados);
        return logsFormateados;
      }),
      catchError((error) => {
        console.error('❌ Error al obtener logs:', error);
        throw error;
      })
    );
  }

  /**
   * Obtiene datos específicos para gráfico de timeline (ngx-echarts)
   */
  getLogTimelineData(): Observable<any[]> {
    return this.getAllLoginLogs().pipe(
      map((logs) => {
        console.log('📈 Preparando datos para timeline chart...');

        // Convertir logs a formato para timeline de echarts
        const timelineData = logs.map((log, index) => ({
          name: log.usuario,
          value: [
            index, // posición en el eje Y
            log.fechaCompleta.getTime(), // timestamp para eje X
            log.tipoUsuario, // categoría
            log.fecha + ' ' + log.hora, // tooltip
          ],
          itemStyle: {
            color: this.getColorByUserType(log.tipoUsuario),
          },
        }));

        console.log('✅ Timeline data preparado:', timelineData);
        return timelineData;
      })
    );
  }

  /**
   * Obtiene logs agrupados por día para gráfico de barras
   */
  getLogsByDayData(): Observable<{ dates: string[]; counts: number[] }> {
    return this.getAllLoginLogs().pipe(
      map((logs) => {
        console.log('📊 Agrupando logs por día...');

        // Agrupar logs por fecha
        const logsByDate = new Map<string, number>();

        logs.forEach((log) => {
          const fecha = log.fecha;
          logsByDate.set(fecha, (logsByDate.get(fecha) || 0) + 1);
        });

        // Convertir a arrays para echarts
        const dates = Array.from(logsByDate.keys()).sort();
        const counts = dates.map((date) => logsByDate.get(date) || 0);

        console.log('✅ Datos por día preparados:', { dates, counts });
        return { dates, counts };
      })
    );
  }

  /**
   * Obtiene logs agrupados por tipo de usuario
   */
  getLogsByUserTypeData(): Observable<any[]> {
    return this.getAllLoginLogs().pipe(
      map((logs) => {
        console.log('👥 Agrupando logs por tipo de usuario...');

        // Contar por tipo de usuario
        const userTypeCounts = new Map<string, number>();

        logs.forEach((log) => {
          const tipo = log.tipoUsuario;
          userTypeCounts.set(tipo, (userTypeCounts.get(tipo) || 0) + 1);
        });

        // Convertir a formato para pie chart
        const pieData = Array.from(userTypeCounts.entries()).map(
          ([name, value]) => ({
            name,
            value,
            itemStyle: {
              color: this.getColorByUserType(name),
            },
          })
        );

        console.log('✅ Datos por tipo de usuario preparados:', pieData);
        return pieData;
      })
    );
  }

  /**
   * Formatea el nombre completo del usuario
   */
  private formatearNombreCompleto(nombre: string, apellido: string): string {
    const nombreLimpio = (nombre || '').trim();
    const apellidoLimpio = (apellido || '').trim();

    if (nombreLimpio && apellidoLimpio) {
      return `${nombreLimpio} ${apellidoLimpio}`;
    } else if (nombreLimpio) {
      return nombreLimpio;
    } else if (apellidoLimpio) {
      return apellidoLimpio;
    } else {
      return 'Usuario sin nombre';
    }
  }

  /**
   * Formatea el tipo de usuario
   */
  private formatearTipoUsuario(tipoUsuario: string): string {
    const tipos: { [key: string]: string } = {
      patient: 'Paciente',
      specialist: 'Especialista',
      admin: 'Administrador',
    };

    return tipos[tipoUsuario] || tipoUsuario || 'No especificado';
  }

  /**
   * Formatea la fecha como DD/MM/YYYY
   */
  private formatearFecha(fecha: Date): string {
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const año = fecha.getFullYear();

    return `${dia}/${mes}/${año}`;
  }

  /**
   * Formatea la hora como HH:MM:SS
   */
  private formatearHora(fecha: Date): string {
    const horas = fecha.getHours().toString().padStart(2, '0');
    const minutos = fecha.getMinutes().toString().padStart(2, '0');
    const segundos = fecha.getSeconds().toString().padStart(2, '0');

    return `${horas}:${minutos}:${segundos}`;
  }

  /**
   * Obtiene color según el tipo de usuario para los gráficos
   */
  private getColorByUserType(tipoUsuario: string): string {
    const colores: { [key: string]: string } = {
      Paciente: '#4CAF50', // Verde
      Especialista: '#2196F3', // Azul
      Administrador: '#FF9800', // Naranja
    };

    return colores[tipoUsuario] || '#9E9E9E'; // Gris por defecto
  }

  /**
   * Obtiene todos los appointments de Firebase
   */
  getAllAppointments(): Observable<AppointmentFirebase[]> {
    console.log('📋 Obteniendo todos los appointments...');

    const appointmentsCollection = collection(this.firestore, 'appointments');

    return from(getDocs(appointmentsCollection)).pipe(
      map((querySnapshot) => {
        console.log(`📊 ${querySnapshot.size} appointments encontrados`);

        const appointments: AppointmentFirebase[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data() as AppointmentFirebase;
          console.log('📄 Procesando appointment:', doc.id, data);

          appointments.push({
            id: doc.id,
            ...data,
          });
        });

        console.log('✅ Appointments cargados:', appointments);
        return appointments;
      }),
      catchError((error) => {
        console.error('❌ Error al obtener appointments:', error);
        throw error;
      })
    );
  }

  /**
   * Obtiene el conteo de turnos por especialidad
   */
  getAppointmentsBySpeciality(): Observable<SpecialityCount[]> {
    console.log('🔢 Contando turnos por especialidad...');

    return this.getAllAppointments().pipe(
      map((appointments) => {
        // Contar especialidades usando Map para evitar duplicados
        const specialityCountMap = new Map<string, number>();

        appointments.forEach((appointment) => {
          // Limpiar y normalizar el nombre de la especialidad
          const speciality = this.normalizeSpecialityName(
            appointment.speciality
          );

          if (speciality) {
            const currentCount = specialityCountMap.get(speciality) || 0;
            specialityCountMap.set(speciality, currentCount + 1);
          } else {
            console.warn(
              '⚠️ Appointment sin especialidad encontrado:',
              appointment
            );
          }
        });

        // Convertir Map a Array y calcular porcentajes
        const totalAppointments = appointments.length;
        const specialityCounts: SpecialityCount[] = Array.from(
          specialityCountMap.entries()
        )
          .map(([especialidad, cantidad]) => ({
            especialidad,
            cantidad,
            porcentaje: Math.round((cantidad / totalAppointments) * 100),
          }))
          .sort((a, b) => b.cantidad - a.cantidad); // Ordenar por cantidad descendente

        console.log('📊 Conteo por especialidades:', specialityCounts);
        console.log(
          '📈 Total de especialidades únicas:',
          specialityCounts.length
        );

        return specialityCounts;
      })
    );
  }

  /**
   * Obtiene datos formateados para gráfico de ngx-echarts
   */
  getSpecialityChartData(): Observable<SpecialityChartData[]> {
    console.log('📊 Preparando datos para gráfico...');

    return this.getAppointmentsBySpeciality().pipe(
      map((specialityCounts) => {
        const chartData: SpecialityChartData[] = specialityCounts.map(
          (item, index) => ({
            name: item.especialidad,
            value: item.cantidad,
            itemStyle: {
              color: this.getColorForSpeciality(index),
            },
          })
        );

        console.log('🎨 Datos del gráfico preparados:', chartData);
        return chartData;
      })
    );
  }

  /**
   * Obtiene estadísticas resumidas
   */
  getSpecialityStats(): Observable<{
    totalAppointments: number;
    totalSpecialities: number;
    topSpeciality: SpecialityCount | null;
    averagePerSpeciality: number;
  }> {
    return this.getAppointmentsBySpeciality().pipe(
      map((specialityCounts) => {
        const totalAppointments = specialityCounts.reduce(
          (sum, item) => sum + item.cantidad,
          0
        );
        const totalSpecialities = specialityCounts.length;
        const topSpeciality = specialityCounts[0] || null;
        const averagePerSpeciality =
          totalSpecialities > 0
            ? Math.round(totalAppointments / totalSpecialities)
            : 0;

        const stats = {
          totalAppointments,
          totalSpecialities,
          topSpeciality,
          averagePerSpeciality,
        };

        console.log('📊 Estadísticas de especialidades:', stats);
        return stats;
      })
    );
  }

  /**
   * Normaliza el nombre de la especialidad para evitar duplicados
   */
  private normalizeSpecialityName(
    speciality: string | undefined | null
  ): string {
    if (!speciality) return '';

    return (
      speciality
        .toString()
        .trim()
        .toLowerCase()
        // Capitalizar primera letra de cada palabra
        .replace(/\b\w/g, (char) => char.toUpperCase())
    );
  }

  /**
   * Obtiene un color para la especialidad basado en su índice
   */
  private getColorForSpeciality(index: number): string {
    return this.SPECIALTY_COLORS[index % this.SPECIALTY_COLORS.length];
  }

  /**
   * Obtiene turnos agrupados por día
   */
  getAppointmentsByDay(): Observable<DailyAppointmentCount[]> {
    console.log('📅 Agrupando turnos por día...');

    return this.getAllAppointments().pipe(
      map((appointments) => {
        // Agrupar appointments por fecha
        const appointmentsByDate = new Map<string, number>();

        appointments.forEach((appointment) => {
          // Obtener fecha del appointment
          const appointmentDate = this.extractDate(
            appointment['appointmentDate']
          );

          if (appointmentDate) {
            const currentCount = appointmentsByDate.get(appointmentDate) || 0;
            appointmentsByDate.set(appointmentDate, currentCount + 1);
          } else {
            console.warn('⚠️ Appointment sin fecha encontrado:', appointment);
          }
        });

        // Convertir Map a Array y ordenar por fecha
        const dailyCounts: DailyAppointmentCount[] = Array.from(
          appointmentsByDate.entries()
        )
          .map(([fecha, cantidad]) => ({
            fecha,
            cantidad,
            fechaObj: new Date(fecha + 'T00:00:00'), // Para ordenamiento
            diaSemana: this.getDayOfWeek(fecha),
            esFinDeSemana: this.isWeekend(fecha),
          }))
          .sort((a, b) => a.fechaObj.getTime() - b.fechaObj.getTime()); // Ordenar cronológicamente

        console.log('📊 Turnos agrupados por día:', dailyCounts);
        console.log('📈 Total de días con turnos:', dailyCounts.length);

        return dailyCounts;
      })
    );
  }

  /**
   * Obtiene datos formateados para gráfico de líneas/barras por día
   */
  getDailyAppointmentChartData(): Observable<{
    dates: string[];
    counts: number[];
    dayLabels: string[];
    weekendFlags: boolean[];
  }> {
    console.log('📊 Preparando datos para gráfico diario...');

    return this.getAppointmentsByDay().pipe(
      map((dailyCounts) => {
        const dates = dailyCounts.map((item) => item.fecha);
        const counts = dailyCounts.map((item) => item.cantidad);
        const dayLabels = dailyCounts.map((item) => item.diaSemana);
        const weekendFlags = dailyCounts.map((item) => item.esFinDeSemana);

        console.log('🎨 Datos del gráfico diario preparados:', {
          dates: dates.length,
          maxCount: Math.max(...counts),
          minCount: Math.min(...counts),
        });

        return { dates, counts, dayLabels, weekendFlags };
      })
    );
  }

  /**
   * Obtiene estadísticas de turnos diarios
   */
  getDailyAppointmentStats(): Observable<{
    totalDays: number;
    totalAppointments: number;
    averagePerDay: number;
    maxDayCount: number;
    minDayCount: number;
    peakDay: DailyAppointmentCount | null;
    weekdayAverage: number;
    weekendAverage: number;
  }> {
    return this.getAppointmentsByDay().pipe(
      map((dailyCounts) => {
        if (dailyCounts.length === 0) {
          return {
            totalDays: 0,
            totalAppointments: 0,
            averagePerDay: 0,
            maxDayCount: 0,
            minDayCount: 0,
            peakDay: null,
            weekdayAverage: 0,
            weekendAverage: 0,
          };
        }

        const totalDays = dailyCounts.length;
        const totalAppointments = dailyCounts.reduce(
          (sum, item) => sum + item.cantidad,
          0
        );
        const averagePerDay = Math.round(totalAppointments / totalDays);
        const maxDayCount = Math.max(
          ...dailyCounts.map((item) => item.cantidad)
        );
        const minDayCount = Math.min(
          ...dailyCounts.map((item) => item.cantidad)
        );
        const peakDay =
          dailyCounts.find((item) => item.cantidad === maxDayCount) || null;

        // Calcular promedios de días laborables vs fines de semana
        const weekdays = dailyCounts.filter((item) => !item.esFinDeSemana);
        const weekends = dailyCounts.filter((item) => item.esFinDeSemana);

        const weekdayAverage =
          weekdays.length > 0
            ? Math.round(
                weekdays.reduce((sum, item) => sum + item.cantidad, 0) /
                  weekdays.length
              )
            : 0;

        const weekendAverage =
          weekends.length > 0
            ? Math.round(
                weekends.reduce((sum, item) => sum + item.cantidad, 0) /
                  weekends.length
              )
            : 0;

        const stats = {
          totalDays,
          totalAppointments,
          averagePerDay,
          maxDayCount,
          minDayCount,
          peakDay,
          weekdayAverage,
          weekendAverage,
        };

        console.log('📊 Estadísticas diarias calculadas:', stats);
        return stats;
      })
    );
  }

  /**
   * Extrae fecha en formato YYYY-MM-DD del campo appointmentDate
   */
  private extractDate(appointmentDate: any): string | null {
    if (!appointmentDate) return null;

    try {
      let dateObj: Date;

      // Si es un Timestamp de Firebase
      if (
        appointmentDate.toDate &&
        typeof appointmentDate.toDate === 'function'
      ) {
        dateObj = appointmentDate.toDate();
      }
      // Si es un string ISO
      else if (typeof appointmentDate === 'string') {
        dateObj = new Date(appointmentDate);
      }
      // Si ya es un objeto Date
      else if (appointmentDate instanceof Date) {
        dateObj = appointmentDate;
      }
      // Si es un timestamp numérico
      else if (typeof appointmentDate === 'number') {
        dateObj = new Date(appointmentDate);
      } else {
        console.warn('⚠️ Formato de fecha no reconocido:', appointmentDate);
        return null;
      }

      // Validar que la fecha sea válida
      if (isNaN(dateObj.getTime())) {
        console.warn('⚠️ Fecha inválida:', appointmentDate);
        return null;
      }

      // Formatear como YYYY-MM-DD
      const year = dateObj.getFullYear();
      const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      const day = dateObj.getDate().toString().padStart(2, '0');

      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('❌ Error procesando fecha:', appointmentDate, error);
      return null;
    }
  }

  /**
   * Obtiene el día de la semana en español
   */
  private getDayOfWeek(dateString: string): string {
    const date = new Date(dateString + 'T00:00:00');
    const days = [
      'Domingo',
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
    ];
    return days[date.getDay()];
  }

  /**
   * Verifica si es fin de semana
   */
  private isWeekend(dateString: string): boolean {
    const date = new Date(dateString + 'T00:00:00');
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Domingo o Sábado
  }

  /**
   * Método de prueba para verificar el servicio
   */
  testService(): void {
    console.log('🧪 Probando AppointmentsService...');

    this.getAppointmentsBySpeciality().subscribe({
      next: (specialityCounts) => {
        console.log('✅ Servicio funcionando correctamente');
        console.log('📊 Especialidades encontradas:', specialityCounts);

        if (specialityCounts.length > 0) {
          console.log('🏆 Especialidad más popular:', specialityCounts[0]);
        }
      },
      error: (error) => {
        console.error('❌ Error en el servicio:', error);
      },
    });
  }

  /**
   * Método de prueba específico para datos diarios
   */
  testDailyService(): void {
    console.log('🧪 Probando funciones diarias...');

    this.getAppointmentsByDay().subscribe({
      next: (dailyCounts) => {
        console.log('✅ Servicio diario funcionando');
        console.log('📅 Días con turnos:', dailyCounts);
      },
      error: (error) => {
        console.error('❌ Error en servicio diario:', error);
      },
    });
  }
}

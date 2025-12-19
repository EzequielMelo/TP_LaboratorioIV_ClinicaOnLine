import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Subscription } from 'rxjs';
import { UserTypes } from '../../models/user-types';
import { Patient } from '../../classes/patient.class';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { CalculateAgePipe } from '../../pipes/calculate-age.pipe';
import { FormatDniPipe } from '../../pipes/format-dni.pipe';
import { AppointmentsService } from '../../services/appointments/appointments.service';
import { Appointment } from '../../classes/appointment';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    TranslateModule,
    CalculateAgePipe,
    FormatDniPipe,
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css',
})
export class UserProfileComponent {
  user: UserTypes | null = null;
  private userSubscription: Subscription | undefined;
  private appointmentsSubscription?: Subscription;
  private appointmentsService = inject(AppointmentsService);

  // Appointments del paciente
  upcomingAppointments: Appointment[] = [];
  lastConsultationDate: string = '-';
  nextCheckupDate: string = '-';
  pendingStudies: number = 0;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.user$.subscribe((user) => {
      this.user = user;
      if (this.user) {
        this.loadUpcomingAppointments();
      }
    });
  }

  getCoverPicture(): string | null {
    if (this.user instanceof Patient) {
      return this.user.coverPicture; // Ahora puedes acceder a coverPicture si el usuario es de tipo Patient
    }
    return null; // O algún valor por defecto si no es un paciente
  }

  getHealthCareSystem(): string | null {
    if (this.user instanceof Patient) {
      return this.user.healthCareSystem; // Ahora puedes acceder a coverPicture si el usuario es de tipo Patient
    }
    return null; // O algún valor por defecto si no es un paciente
  }

  loadUpcomingAppointments(): void {
    if (!this.user) return;

    this.appointmentsSubscription = this.appointmentsService
      .getAllAppointments()
      .subscribe((appointments) => {
        const now = new Date();

        // Filtrar todos los appointments del paciente
        const myAppointments = appointments.filter(
          (appointment) => appointment.idPatient === this.user?.id
        );

        // Filtrar appointments futuros
        this.upcomingAppointments = myAppointments
          .filter((appointment) => {
            if (appointment.appointmentDate) {
              const appointmentDate = appointment.appointmentDate.toDate();
              return appointmentDate >= now;
            }
            return false;
          })
          .sort((a, b) => {
            // Ordenar por fecha ascendente (más próximos primero)
            if (a.appointmentDate && b.appointmentDate) {
              return (
                a.appointmentDate.toMillis() - b.appointmentDate.toMillis()
              );
            }
            return 0;
          });

        // Calcular última consulta (más reciente con estado Completado)
        const completedAppointments = myAppointments
          .filter(
            (appointment) =>
              appointment.appointmentStatus === 'Completado' &&
              appointment.appointmentDate
          )
          .sort((a, b) => {
            // Ordenar por fecha descendente (más reciente primero)
            if (a.appointmentDate && b.appointmentDate) {
              return (
                b.appointmentDate.toMillis() - a.appointmentDate.toMillis()
              );
            }
            return 0;
          });

        if (
          completedAppointments.length > 0 &&
          completedAppointments[0].appointmentDate
        ) {
          const lastDate = completedAppointments[0].appointmentDate.toDate();
          this.lastConsultationDate = this.formatDate(lastDate);
        } else {
          this.lastConsultationDate = '-';
        }

        // Calcular próxima consulta (más cercana a futuro)
        if (
          this.upcomingAppointments.length > 0 &&
          this.upcomingAppointments[0].appointmentDate
        ) {
          const nextDate =
            this.upcomingAppointments[0].appointmentDate.toDate();
          this.nextCheckupDate = this.formatDate(nextDate);
        } else {
          this.nextCheckupDate = '-';
        }

        // Contar estudios pendientes (Aceptado o Sin Asignar)
        this.pendingStudies = myAppointments.filter(
          (appointment) =>
            appointment.appointmentStatus === 'Aceptado' ||
            appointment.appointmentStatus === 'Sin Asignar'
        ).length;
      });
  }

  formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  getAppointmentDate(appointment: Appointment): string {
    if (appointment.appointmentDate) {
      const date = appointment.appointmentDate.toDate();
      const day = date.getDate();
      const month = date.toLocaleDateString('es-ES', { month: 'long' });
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${day} de ${month} ${year} - ${hours}:${minutes}hs`;
    }
    return '';
  }

  getAppointmentDay(appointment: Appointment): string {
    if (appointment.appointmentDate) {
      const date = appointment.appointmentDate.toDate();
      return date.getDate().toString();
    }
    return '';
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      Confirmado: 'bg-green-100 text-green-800',
      Aceptado: 'bg-green-100 text-green-800',
      Pendiente: 'bg-yellow-100 text-yellow-800',
      Cancelado: 'bg-red-100 text-red-800',
      Completado: 'bg-blue-100 text-blue-800',
      Rechazado: 'bg-gray-100 text-gray-800',
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusColorClass(status: string): string {
    const colorClasses: { [key: string]: string } = {
      Confirmado: 'from-green-50 to-emerald-50 border-green-200',
      Aceptado: 'from-green-50 to-emerald-50 border-green-200',
      Pendiente: 'from-yellow-50 to-amber-50 border-yellow-200',
      Cancelado: 'from-red-50 to-rose-50 border-red-200',
      Completado: 'from-blue-50 to-indigo-50 border-blue-200',
      Rechazado: 'from-gray-50 to-slate-50 border-gray-200',
    };
    return colorClasses[status] || 'from-gray-50 to-slate-50 border-gray-200';
  }

  getStatusIconColorClass(status: string): string {
    const iconColorClasses: { [key: string]: string } = {
      Confirmado: 'bg-green-600',
      Aceptado: 'bg-green-600',
      Pendiente: 'bg-yellow-600',
      Cancelado: 'bg-red-600',
      Completado: 'bg-blue-600',
      Rechazado: 'bg-gray-600',
    };
    return iconColorClasses[status] || 'bg-gray-600';
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
    this.appointmentsSubscription?.unsubscribe();
  }
}

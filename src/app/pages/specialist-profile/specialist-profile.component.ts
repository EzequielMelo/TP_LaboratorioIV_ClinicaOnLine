import { Component, inject } from '@angular/core';
import { UserTypes } from '../../models/user-types';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { Specialist } from '../../classes/specialist.class';
import { DayToSpanishPipe } from '../../pipes/day-to-spanish.pipe';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatabaseService } from '../../services/database/database.service';
import { RouterLink } from '@angular/router';
import { AppointmentsService } from '../../services/appointments/appointments.service';
import { Appointment } from '../../classes/appointment';

@Component({
  selector: 'app-specialist-profile',
  standalone: true,
  imports: [DayToSpanishPipe, CommonModule, FormsModule, RouterLink],
  templateUrl: './specialist-profile.component.html',
  styleUrl: './specialist-profile.component.css',
})
export class SpecialistProfileComponent {
  user: UserTypes | null = null;
  private userSubscription: Subscription | undefined;
  private appointmentsSubscription?: Subscription;
  private db = inject(DatabaseService);
  private appointmentsService = inject(AppointmentsService);
  isEditModalOpen: boolean = false;
  specialistWorkDays: string[] = [];
  specialistWorkHours: { start: string; end: string } = {
    start: '',
    end: '',
  };

  // Appointments del día
  todayAppointments: Appointment[] = [];
  scheduledAppointments: number = 0; // Aceptado
  completedAppointments: number = 0; // Completado
  pendingAppointments: number = 0; // Pendiente
  availableTime: string = '0h'; // Tiempo disponible

  // Propiedades para validación
  hasStartTimeError: boolean = false;
  hasEndTimeError: boolean = false;
  hasTimeRangeError: boolean = false;

  daysOfTheWeek: string[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.user$.subscribe((user) => {
      this.user = user;
      if (this.user) {
        this.loadTodayAppointments();
      }
    });
  }

  getSpecialistWorkDays(): string[] | null {
    const daysOfWeekOrder = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];

    if (this.user instanceof Specialist) {
      return this.user.workDays.sort(
        (a, b) => daysOfWeekOrder.indexOf(a) - daysOfWeekOrder.indexOf(b)
      );
    }
    return null;
  }

  getSpecialistWorkHours(): string[] | null {
    if (this.user instanceof Specialist) {
      const hours = Object.values(this.user.workHours);
      return hours.sort((a, b) => a.localeCompare(b));
    }
    return null;
  }

  specialistWorkHoursWithStartAndEnd(): { start: string; end: string } | null {
    if (this.user instanceof Specialist && this.user.workHours) {
      const hours = Object.values(this.user.workHours).sort((a, b) =>
        a.localeCompare(b)
      );
      if (hours.length > 1) {
        return { start: hours[0], end: hours[1] };
      }
    }
    return null;
  }

  getSpecialistSpecialtys(): string[] | null {
    if (this.user instanceof Specialist) {
      return this.user.specialty;
    }
    return null;
  }

  editWorkDays() {
    this.isEditModalOpen = true;
    this.loadSpecialistData();
  }

  saveWorkDays() {
    if (!this.isFormValid()) {
      return;
    }

    console.log('Días seleccionados: ', this.specialistWorkDays);
    console.log('Horarios seleccionados: ', this.specialistWorkHours);

    if (this.user instanceof Specialist) {
      this.db.updateSpecialistData(
        this.user.id,
        this.specialistWorkDays,
        this.specialistWorkHours
      );
    }
    this.isEditModalOpen = false;
  }

  closeModal() {
    this.isEditModalOpen = false;
    this.specialistWorkDays = this.getSpecialistWorkDays() || [];
    this.clearValidationErrors();
  }

  onDaySelectionChange(day: string, isSelected: boolean): void {
    if (isSelected) {
      this.specialistWorkDays.push(day);
    } else {
      const index = this.specialistWorkDays.indexOf(day);
      if (index !== -1) {
        this.specialistWorkDays.splice(index, 1);
      }
    }
  }

  loadSpecialistData() {
    if (this.user instanceof Specialist) {
      this.specialistWorkDays = this.getSpecialistWorkDays() || [];
      this.specialistWorkHours = this.specialistWorkHoursWithStartAndEnd() || {
        start: '08:00',
        end: '17:00',
      };
    }
    this.clearValidationErrors();
  }

  // Validación de hora de inicio
  validateStartTime(): void {
    this.hasStartTimeError = false;
    this.hasTimeRangeError = false;

    if (!this.specialistWorkHours.start) {
      return;
    }

    const startTime = this.specialistWorkHours.start;
    const [hours, minutes] = startTime.split(':').map(Number);

    // Validar rango 8:00 - 19:00
    if (hours < 8 || hours > 19 || (hours === 19 && minutes > 0)) {
      this.hasStartTimeError = true;
      return;
    }

    // Validar que la hora de inicio sea anterior a la de fin
    if (
      this.specialistWorkHours.end &&
      startTime >= this.specialistWorkHours.end
    ) {
      this.hasTimeRangeError = true;
    }
  }

  // Validación de hora de fin
  validateEndTime(): void {
    this.hasEndTimeError = false;
    this.hasTimeRangeError = false;

    if (!this.specialistWorkHours.end) {
      return;
    }

    const endTime = this.specialistWorkHours.end;
    const [hours, minutes] = endTime.split(':').map(Number);

    // Validar rango 8:00 - 19:00
    if (hours < 8 || hours > 19 || (hours === 19 && minutes > 0)) {
      this.hasEndTimeError = true;
      return;
    }

    // Validar que la hora de fin sea posterior a la de inicio
    if (
      this.specialistWorkHours.start &&
      endTime <= this.specialistWorkHours.start
    ) {
      this.hasTimeRangeError = true;
    }
  }

  // Limpiar errores de validación
  clearValidationErrors(): void {
    this.hasStartTimeError = false;
    this.hasEndTimeError = false;
    this.hasTimeRangeError = false;
  }

  // Validar formulario completo
  isFormValid(): boolean {
    if (this.specialistWorkDays.length === 0) {
      return false;
    }

    if (!this.specialistWorkHours.start || !this.specialistWorkHours.end) {
      return false;
    }

    // Validar formato de tiempo
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (
      !timeRegex.test(this.specialistWorkHours.start) ||
      !timeRegex.test(this.specialistWorkHours.end)
    ) {
      return false;
    }

    // Validar rangos
    this.validateStartTime();
    this.validateEndTime();

    return (
      !this.hasStartTimeError &&
      !this.hasEndTimeError &&
      !this.hasTimeRangeError
    );
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  loadTodayAppointments(): void {
    if (!this.user) return;

    this.appointmentsSubscription = this.appointmentsService
      .getAllAppointments()
      .subscribe((appointments) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Filtrar appointments del especialista logueado que sean de hoy
        this.todayAppointments = appointments
          .filter((appointment) => {
            if (
              appointment.idSpecialist === this.user?.id &&
              appointment.appointmentDate
            ) {
              const appointmentDate = appointment.appointmentDate.toDate();
              return appointmentDate >= today && appointmentDate < tomorrow;
            }
            return false;
          })
          .sort((a, b) => {
            // Ordenar por hora
            if (a.appointmentDate && b.appointmentDate) {
              return (
                a.appointmentDate.toMillis() - b.appointmentDate.toMillis()
              );
            }
            return 0;
          });

        // Calcular estadísticas del día
        const allMyAppointments = appointments.filter(
          (appointment) => appointment.idSpecialist === this.user?.id
        );

        this.scheduledAppointments = allMyAppointments.filter(
          (appointment) => appointment.appointmentStatus === 'Aceptado'
        ).length;

        this.completedAppointments = allMyAppointments.filter(
          (appointment) => appointment.appointmentStatus === 'Completado'
        ).length;

        this.pendingAppointments = allMyAppointments.filter(
          (appointment) => appointment.appointmentStatus === 'Pendiente'
        ).length;

        // Calcular tiempo disponible
        this.availableTime = this.calculateAvailableTime(
          this.todayAppointments.length
        );
      });
  }

  calculateAvailableTime(appointmentsCount: number): string {
    if (!(this.user instanceof Specialist)) return '0h';

    // Obtener horario de trabajo del especialista
    const workHours = this.user.workHours;
    if (!workHours || !workHours.start || !workHours.end) return '0h';

    // Calcular tiempo total de trabajo en minutos
    const [startHours, startMinutes] = workHours.start.split(':').map(Number);
    const [endHours, endMinutes] = workHours.end.split(':').map(Number);

    const totalWorkMinutes =
      endHours * 60 + endMinutes - (startHours * 60 + startMinutes);

    // Cada turno dura 45 minutos
    const occupiedMinutes = appointmentsCount * 45;

    // Tiempo disponible
    const availableMinutes = totalWorkMinutes - occupiedMinutes;

    if (availableMinutes <= 0) return '0h';

    // Convertir a formato legible
    const hours = Math.floor(availableMinutes / 60);
    const minutes = availableMinutes % 60;

    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  }

  getAppointmentTime(appointment: Appointment): string {
    if (appointment.appointmentDate) {
      const date = appointment.appointmentDate.toDate();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    return '';
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      Confirmado: 'bg-green-100 text-green-800',
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
      Pendiente: 'bg-yellow-600',
      Cancelado: 'bg-red-600',
      Completado: 'bg-blue-600',
      Rechazado: 'bg-gray-600',
    };
    return iconColorClasses[status] || 'bg-gray-600';
  }

  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
    this.appointmentsSubscription?.unsubscribe();
  }
}

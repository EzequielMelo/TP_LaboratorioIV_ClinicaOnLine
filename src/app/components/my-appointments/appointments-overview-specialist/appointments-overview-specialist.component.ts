import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Appointment } from '../../../classes/appointment';
import { AuthService } from '../../../services/auth/auth.service';
import { DatabaseService } from '../../../services/database/database.service';
import { User } from '../../../classes/user';
import { AppointmentsService } from '../../../services/appointments/appointments.service';
import { AppointmentsListSpecialistComponent } from '../appointments-list-specialist/appointments-list-specialist.component';
import { CommonModule } from '@angular/common';

interface AppointmentStatus {
  label: string;
  value: string;
  color: string;
  icon: string;
  shortLabel: string;
  bgClass: string;
  activeClass: string;
  progressClass: string;
}

@Component({
  selector: 'app-appointments-overview-specialist',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AppointmentsListSpecialistComponent,
  ],
  templateUrl: './appointments-overview-specialist.component.html',
  styleUrl: './appointments-overview-specialist.component.css',
})
export class AppointmentsOverviewSpecialistComponent {
  userId: string | null = null;
  allAppointments: Appointment[] = [];
  appointmentsPending: Appointment[] = [];
  appointmentsConfirmed: Appointment[] = [];
  appointmentsCompleted: Appointment[] = [];
  appointmentsCancelled: Appointment[] = [];
  displayedAppointments: Appointment[] = [];
  searchForm: FormGroup;
  selectedStatus: string = 'pending'; // Estado seleccionado para mostrar los turnos
  totalAppointments: number = 0;

  protected authService = inject(AuthService);
  private db = inject(DatabaseService);
  private appointmentService = inject(AppointmentsService);

  appointmentStatuses: AppointmentStatus[] = [
    {
      value: 'pending',
      label: 'En espera',
      shortLabel: 'Espera',
      color: 'yellow',
      icon: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/></svg>',
      bgClass: 'bg-yellow-100',
      activeClass: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      progressClass: 'bg-yellow-500',
    },
    {
      value: 'confirmed',
      label: 'Confirmado',
      shortLabel: 'Conf.',
      color: 'green',
      icon: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>',
      bgClass: 'bg-green-100',
      activeClass: 'bg-gradient-to-r from-green-500 to-emerald-500',
      progressClass: 'bg-green-500',
    },
    {
      value: 'completed',
      label: 'Completado',
      shortLabel: 'Comp.',
      color: 'blue',
      icon: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>',
      bgClass: 'bg-blue-100',
      activeClass: 'bg-gradient-to-r from-blue-500 to-indigo-500',
      progressClass: 'bg-blue-500',
    },
    {
      value: 'cancelled',
      label: 'Cancelado',
      shortLabel: 'Cancel.',
      color: 'red',
      icon: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>',
      bgClass: 'bg-red-100',
      activeClass: 'bg-gradient-to-r from-red-500 to-pink-500',
      progressClass: 'bg-red-500',
    },
  ];

  constructor(private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      keyWord: [''],
    });
  }

  ngOnInit() {
    this.authService.user$.subscribe((userClass: User | null) => {
      if (userClass && userClass.id) {
        this.userId = userClass.id;
      }
    });
    this.loadAppointments();

    // Suscribirse a cambios en el campo de búsqueda
    this.searchForm.get('keyWord')?.valueChanges.subscribe(() => {
      this.filterAppointments();
    });
  }

  loadAppointments() {
    this.appointmentService.getSpecialistAppointments(this.userId!).subscribe({
      next: (appointments) => {
        this.allAppointments = appointments;
        this.totalAppointments = appointments.length;

        // Mapear los estados de tu base de datos a los estados del HTML
        this.appointmentsPending = appointments.filter(
          (a) => a.appointmentStatus === 'Sin Asignar'
        );
        this.appointmentsConfirmed = appointments.filter(
          (a) => a.appointmentStatus === 'Aceptado'
        );
        this.appointmentsCompleted = appointments.filter(
          (a) => a.appointmentStatus === 'Completado'
        );
        this.appointmentsCancelled = appointments.filter(
          (a) => a.appointmentStatus === 'Cancelado'
        );

        // Mostrar todos los turnos por defecto
        this.displayedAppointments = this.appointmentsPending;
      },
      error: (err) => {
        console.error('Error al cargar los turnos:', err);
      },
    });
  }

  showAppointments(status: string) {
    this.selectedStatus = status;

    switch (status) {
      case 'all':
        this.displayedAppointments = this.allAppointments;
        break;
      case 'pending':
        this.displayedAppointments = this.appointmentsPending;
        break;
      case 'confirmed':
        this.displayedAppointments = this.appointmentsConfirmed;
        break;
      case 'completed':
        this.displayedAppointments = this.appointmentsCompleted;
        break;
      case 'cancelled':
        this.displayedAppointments = this.appointmentsCancelled;
        break;
      default:
        this.displayedAppointments = this.allAppointments;
    }

    // Aplicar filtro de búsqueda si hay texto
    this.filterAppointments();
  }

  onSearch() {
    this.filterAppointments();
  }

  private filterAppointments() {
    const keyWord = this.searchForm.get('keyWord')?.value?.toLowerCase() || '';

    if (!keyWord) {
      // Si no hay búsqueda, mostrar según el filtro de estado seleccionado
      this.showAppointments(this.selectedStatus);
      return;
    }

    // Obtener los turnos base según el estado seleccionado
    let baseAppointments: Appointment[] = [];
    switch (this.selectedStatus) {
      case 'all':
        baseAppointments = this.allAppointments;
        break;
      case 'pending':
        baseAppointments = this.appointmentsPending;
        break;
      case 'confirmed':
        baseAppointments = this.appointmentsConfirmed;
        break;
      case 'completed':
        baseAppointments = this.appointmentsCompleted;
        break;
      case 'cancelled':
        baseAppointments = this.appointmentsCancelled;
        break;
      default:
        baseAppointments = this.allAppointments;
    }

    // Filtrar por palabra clave
    this.displayedAppointments = baseAppointments.filter(
      (appointment) =>
        appointment.specialistName?.toLowerCase().includes(keyWord) ||
        appointment.speciality?.toLowerCase().includes(keyWord) ||
        appointment.patientName?.toLowerCase().includes(keyWord)
    );
  }

  clearSearch() {
    this.searchForm.patchValue({ keyWord: '' });
    this.filterAppointments();
  }

  // Método para obtener el número de turnos por estado
  getAppointmentCountByStatus(status: string): number {
    switch (status) {
      case 'pending':
        return this.appointmentsPending.length;
      case 'confirmed':
        return this.appointmentsConfirmed.length;
      case 'completed':
        return this.appointmentsCompleted.length;
      case 'cancelled':
        return this.appointmentsCancelled.length;
      default:
        return 0;
    }
  }

  // Método para obtener el porcentaje de cada estado
  getStatusPercentage(status: string): number {
    if (this.totalAppointments === 0) return 0;
    const count = this.getAppointmentCountByStatus(status);
    return (count / this.totalAppointments) * 100;
  }

  // Método para el tracking en ngFor
  trackByStatus(index: number, status: AppointmentStatus): string {
    return status.value;
  }

  // Método para obtener el título del filtro actual
  getFilterTitle(): string {
    switch (this.selectedStatus) {
      case 'all':
        return 'Todos los turnos';
      case 'pending':
        return 'Turnos en espera';
      case 'confirmed':
        return 'Turnos confirmados';
      case 'completed':
        return 'Turnos completados';
      case 'cancelled':
        return 'Turnos cancelados';
      default:
        return 'Turnos';
    }
  }

  // Método para obtener el mensaje cuando no hay turnos
  getEmptyStateMessage(): string {
    const keyWord = this.searchForm.get('keyWord')?.value;

    if (keyWord) {
      return `No se encontraron turnos que coincidan con "${keyWord}"`;
    }

    switch (this.selectedStatus) {
      case 'all':
        return 'No tienes turnos programados en este momento.';
      case 'pending':
        return 'No tienes turnos pendientes de confirmar.';
      case 'confirmed':
        return 'No tienes turnos confirmados.';
      case 'completed':
        return 'No tienes turnos completados.';
      case 'cancelled':
        return 'No tienes turnos cancelados.';
      default:
        return 'No hay turnos disponibles.';
    }
  }
}

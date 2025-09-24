import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { DatabaseService } from '../../../services/database/database.service';
import { User } from '../../../classes/user';
import { Appointment } from '../../../classes/appointment';
import { CommonModule } from '@angular/common';
import { AppointmentsListComponent } from '../appointments-list/appointments-list.component';
import { TranslateModule } from '@ngx-translate/core';

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
  selector: 'app-appointments-overview',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AppointmentsListComponent,
    TranslateModule,
  ],
  templateUrl: './appointments-overview.component.html',
  styleUrl: './appointments-overview.component.css',
})
export class AppointmentsOverviewComponent {
  userId: string | null = null;
  searchForm: FormGroup;

  // Arrays para almacenar todos los turnos por categoría
  allAppointments: Appointment[] = [];
  appointmentsNew: Appointment[] = [];
  appointmentsAccepted: Appointment[] = [];
  appointmentsCanceled: Appointment[] = [];

  // Array que se muestra en el template
  displayedAppointments: Appointment[] = [];

  // Estado seleccionado para mostrar los turnos
  selectedStatus: string = 'all';

  protected authService = inject(AuthService);
  private db = inject(DatabaseService);

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
    // Suscribirse a cambios del usuario
    this.authService.user$.subscribe((userClass: User | null) => {
      if (userClass && userClass.id) {
        this.userId = userClass.id;
        this.loadAppointments();
      }
    });

    // Suscribirse a cambios en el campo de búsqueda
    this.searchForm.get('keyWord')?.valueChanges.subscribe(() => {
      this.filterAndDisplayAppointments();
    });
  }

  loadAppointments() {
    if (!this.userId) return;

    this.db.getAppointments(this.userId).subscribe({
      next: (appointments) => {
        this.allAppointments = appointments;
        this.categorizeAppointments();
        this.filterAndDisplayAppointments();
      },
      error: (err) => {
        console.error('Error al cargar los turnos:', err);
      },
    });
  }

  private categorizeAppointments() {
    this.appointmentsNew = this.allAppointments.filter(
      (a) => a.appointmentStatus === 'Sin Asignar'
    );

    this.appointmentsAccepted = this.allAppointments.filter(
      (a) =>
        a.appointmentStatus === 'Aceptado' ||
        a.appointmentStatus === 'Completado'
    );

    this.appointmentsCanceled = this.allAppointments.filter(
      (a) =>
        a.appointmentStatus === 'Rechazado' ||
        a.appointmentStatus === 'Cancelado'
    );
  }

  // Mapear estados de la base de datos a estados del UI
  private mapAppointmentStatusToUI(dbStatus: string): string {
    switch (dbStatus) {
      case 'Sin Asignar':
        return 'pending';
      case 'Aceptado':
        return 'confirmed';
      case 'Completado':
        return 'completed';
      case 'Rechazado':
      case 'Cancelado':
        return 'cancelled';
      default:
        return 'pending';
    }
  }

  showAppointments(status: string) {
    this.selectedStatus = status;
    this.filterAndDisplayAppointments();
  }

  private filterAndDisplayAppointments() {
    let appointmentsToShow: Appointment[] = [];

    // Primero filtramos por estado
    switch (this.selectedStatus) {
      case 'all':
        appointmentsToShow = [...this.allAppointments];
        break;
      case 'pending':
        appointmentsToShow = [...this.appointmentsNew];
        break;
      case 'confirmed':
        appointmentsToShow = this.allAppointments.filter(
          (a) => a.appointmentStatus === 'Aceptado'
        );
        break;
      case 'completed':
        appointmentsToShow = this.allAppointments.filter(
          (a) => a.appointmentStatus === 'Completado'
        );
        break;
      case 'cancelled':
        appointmentsToShow = [...this.appointmentsCanceled];
        break;
      default:
        appointmentsToShow = [...this.allAppointments];
    }

    // Luego aplicamos el filtro de búsqueda
    const keyWord = this.searchForm.get('keyWord')?.value?.toLowerCase() || '';

    if (keyWord) {
      appointmentsToShow = appointmentsToShow.filter(
        (appointment) =>
          appointment.specialistName.toLowerCase().includes(keyWord) ||
          appointment.speciality.toLowerCase().includes(keyWord) ||
          appointment.appointmentDate
            ?.toDate()
            .toString()
            .toLowerCase()
            .includes(keyWord)
      );
    }

    this.displayedAppointments = appointmentsToShow;
  }

  onSearch() {
    // La búsqueda se maneja automáticamente por el valueChanges del FormControl
    this.filterAndDisplayAppointments();
  }

  trackByStatus(index: number, status: AppointmentStatus): string {
    return status.value;
  }

  getAppointmentCountByStatus(status: string): number {
    switch (status) {
      case 'all':
        return this.allAppointments.length;
      case 'pending':
        return this.appointmentsNew.length;
      case 'confirmed':
        return this.allAppointments.filter(
          (a) => a.appointmentStatus === 'Aceptado'
        ).length;
      case 'completed':
        return this.allAppointments.filter(
          (a) => a.appointmentStatus === 'Completado'
        ).length;
      case 'cancelled':
        return this.appointmentsCanceled.length;
      default:
        return 0;
    }
  }

  getStatusPercentage(status: string): number {
    const total = this.allAppointments.length;
    if (total === 0) return 0;

    const count = this.getAppointmentCountByStatus(status);
    return Math.round((count / total) * 100);
  }

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
        const statusObj = this.appointmentStatuses.find(
          (s) => s.value === this.selectedStatus
        );
        return `Turnos ${statusObj?.label.toLowerCase() || 'filtrados'}`;
    }
  }

  getEmptyStateMessage(): string {
    const searchTerm = this.searchForm.get('keyWord')?.value;

    if (searchTerm) {
      return `No se encontraron turnos que coincidan con "${searchTerm}".`;
    }

    switch (this.selectedStatus) {
      case 'all':
        return 'No tiene turnos médicos registrados. ¿Desea solicitar uno?';
      case 'pending':
        return 'No tiene turnos pendientes en este momento.';
      case 'confirmed':
        return 'No tiene turnos confirmados próximos.';
      case 'completed':
        return 'No tiene turnos completados en el período seleccionado.';
      case 'cancelled':
        return 'No tiene turnos cancelados.';
      default:
        return 'No se encontraron turnos con los filtros aplicados.';
    }
  }

  clearSearch(): void {
    this.searchForm.patchValue({ keyWord: '' });
    // filterAndDisplayAppointments se ejecutará automáticamente por valueChanges
  }

  get totalAppointments(): number {
    return this.allAppointments.length;
  }

  // Método auxiliar para debugging
  private logCurrentState(): void {
    console.log('Current state:', {
      selectedStatus: this.selectedStatus,
      allAppointments: this.allAppointments.length,
      appointmentsNew: this.appointmentsNew.length,
      appointmentsAccepted: this.appointmentsAccepted.length,
      appointmentsCanceled: this.appointmentsCanceled.length,
      displayedAppointments: this.displayedAppointments.length,
      searchTerm: this.searchForm.get('keyWord')?.value,
    });
  }
}

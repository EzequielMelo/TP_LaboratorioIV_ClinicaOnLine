import { Component, inject } from '@angular/core';
import { Appointment } from '../../../classes/appointment';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { DatabaseService } from '../../../services/database/database.service';
import { AppointmentsService } from '../../../services/appointments/appointments.service';
import { User } from '../../../classes/user';
import { CommonModule } from '@angular/common';
import { AppointmentsListSpecialistComponent } from '../appointments-list-specialist/appointments-list-specialist.component';
import { AppointmentsListAdminComponent } from '../appointments-list-admin/appointments-list-admin.component';
import { AppointmentsListComponent } from '../appointments-list/appointments-list.component';
import { HealthRecordService } from '../../../services/health-record/health-record.service';
import { ReviewService } from '../../../services/review/review.service';
import { HealthRecord } from '../../../classes/health-record';
import { forkJoin, of } from 'rxjs';
import { map } from 'rxjs/operators';

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
  selector: 'app-appointments-overview-admin',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AppointmentsListAdminComponent,
  ],
  templateUrl: './appointments-overview-admin.component.html',
  styleUrl: './appointments-overview-admin.component.css',
})
export class AppointmentsOverviewAdminComponent {
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

  // Orden de fecha seleccionado
  dateOrder: 'recent' | 'oldest' = 'recent';

  // Maps para datos pre-cargados
  healthRecordsMap: Map<string, HealthRecord> = new Map();
  reviewsMap: Map<string, string> = new Map();

  protected authService = inject(AuthService);
  private appointmentService = inject(AppointmentsService);
  private healthRecordService = inject(HealthRecordService);
  private reviewService = inject(ReviewService);

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

    this.appointmentService.getAllAppointments().subscribe({
      next: (appointments) => {
        this.allAppointments = appointments;
        this.categorizeAppointments();
        this.loadRelatedData();
        this.filterAndDisplayAppointments();
      },
      error: (err) => {
        console.error('Error al cargar los turnos:', err);
      },
    });
  }

  private loadRelatedData() {
    // Extraer IDs únicos de health records y reviews
    const healthRecordIds = Array.from(
      new Set(
        this.allAppointments
          .map((a) => a.idMedicalReport)
          .filter((id) => id !== null && id !== undefined && id !== '')
      )
    ) as string[];

    const reviewIds = Array.from(
      new Set(
        this.allAppointments
          .map((a) => a.idReviewForPatient)
          .filter((id) => id !== null && id !== undefined && id !== '')
      )
    ) as string[];

    console.log('Health Record IDs:', healthRecordIds);
    console.log('Review IDs:', reviewIds);

    // Cargar health records y reviews en paralelo
    forkJoin({
      healthRecords: this.loadHealthRecords(healthRecordIds),
      reviews: this.loadReviews(reviewIds),
    }).subscribe({
      next: ({ healthRecords, reviews }) => {
        this.healthRecordsMap = healthRecords;
        this.reviewsMap = reviews;
        console.log('Health Records Map:', this.healthRecordsMap);
        console.log('Reviews Map:', this.reviewsMap);
        // Actualizar la vista después de cargar los datos
        this.filterAndDisplayAppointments();
      },
      error: (err) => {
        console.error('Error al cargar datos relacionados:', err);
      },
    });
  }

  private loadHealthRecords(ids: string[]) {
    if (ids.length === 0) {
      return of(new Map<string, HealthRecord>());
    }

    const requests = ids.map((id) =>
      this.healthRecordService
        .getHealthRecord(id)
        .pipe(map((healthRecord) => ({ id, healthRecord })))
    );

    return forkJoin(requests).pipe(
      map((results) => {
        const map = new Map<string, HealthRecord>();
        results.forEach(({ id, healthRecord }) => {
          map.set(id, healthRecord);
        });
        return map;
      })
    );
  }

  private loadReviews(ids: string[]) {
    if (ids.length === 0) {
      return of(new Map<string, string>());
    }

    const requests = ids.map((id) =>
      this.reviewService
        .getReviewForPatient(id)
        .pipe(map((review) => ({ id, review: review.review })))
    );

    return forkJoin(requests).pipe(
      map((results) => {
        const map = new Map<string, string>();
        results.forEach(({ id, review }) => {
          map.set(id, review);
        });
        return map;
      })
    );
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

  onDateOrderChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.dateOrder = target.value as 'recent' | 'oldest';
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
    const keyWord = this.searchForm.get('keyWord')?.value || '';
    const keyWordLower = keyWord.toLowerCase();

    if (keyWord) {
      appointmentsToShow = appointmentsToShow.filter((appointment) => {
        // Búsqueda en campos básicos del appointment
        const basicMatch =
          appointment.specialistName.toLowerCase().includes(keyWordLower) ||
          appointment.speciality.toLowerCase().includes(keyWordLower) ||
          appointment.patientName.toLowerCase().includes(keyWordLower) ||
          appointment.appointmentDate
            ?.toDate()
            .toString()
            .toLowerCase()
            .includes(keyWordLower);

        if (basicMatch) return true;

        // Búsqueda en health record si existe
        if (appointment.idMedicalReport) {
          const healthRecord = this.healthRecordsMap.get(
            appointment.idMedicalReport
          );
          if (healthRecord) {
            const healthRecordMatch =
              healthRecord.height?.toString().includes(keyWord) ||
              healthRecord.weight?.toString().includes(keyWord) ||
              healthRecord.temperature?.toString().includes(keyWord) ||
              healthRecord.bloodPressure?.toString().includes(keyWord) ||
              healthRecord.painLevel?.toString().includes(keyWord) ||
              healthRecord.glucoseLevel?.toString().includes(keyWord) ||
              (healthRecord.dynamicData &&
                Object.values(healthRecord.dynamicData).some((value) =>
                  value?.toString().toLowerCase().includes(keyWordLower)
                ));

            if (healthRecordMatch) return true;
          }
        }

        // Búsqueda en review si existe
        if (appointment.idReviewForPatient) {
          const review = this.reviewsMap.get(appointment.idReviewForPatient);
          if (review && review.toLowerCase().includes(keyWordLower)) {
            return true;
          }
        }

        return false;
      });
    }

    // Ordenar por fecha según la preferencia
    appointmentsToShow.sort((a, b) => {
      const dateA = a.appointmentDate?.toDate().getTime() || 0;
      const dateB = b.appointmentDate?.toDate().getTime() || 0;
      return this.dateOrder === 'recent' ? dateB - dateA : dateA - dateB;
    });

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

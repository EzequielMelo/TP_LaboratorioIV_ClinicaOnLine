import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Appointment } from '../../../classes/appointment';
import { AuthService } from '../../../services/auth/auth.service';
import { DatabaseService } from '../../../services/database/database.service';
import { User } from '../../../classes/user';
import { AppointmentsService } from '../../../services/appointments/appointments.service';
import { AppointmentsListSpecialistComponent } from '../appointments-list-specialist/appointments-list-specialist.component';
import { CommonModule } from '@angular/common';
import { HealthRecordService } from '../../../services/health-record/health-record.service';
import { ReviewService } from '../../../services/review/review.service';
import { HealthRecord } from '../../../classes/health-record';
import { forkJoin, of } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  SortSelectDirective,
  SortCriteria,
} from '../../../directives/sort-select.directive';
import {
  TimeFilterDirective,
  TimeFilterCriteria,
} from '../../../directives/time-filter.directive';
import { trigger, transition, style, animate } from '@angular/animations';

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
    SortSelectDirective,
    TimeFilterDirective,
  ],
  templateUrl: './appointments-overview-specialist.component.html',
  styleUrl: './appointments-overview-specialist.component.css',
  animations: [
    trigger('listAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate(
          '250ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
  ],
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

  // Maps para datos pre-cargados
  healthRecordsMap: Map<string, HealthRecord> = new Map();
  reviewsMap: Map<string, string> = new Map();

  protected authService = inject(AuthService);
  private db = inject(DatabaseService);
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

        // Cargar health records y reviews
        this.loadRelatedData(appointments);
      },
      error: (err) => {
        console.error('Error al cargar los turnos:', err);
      },
    });
  }

  private loadRelatedData(appointments: Appointment[]) {
    // Extraer IDs únicos de health records y reviews (para especialista usa idReviewForSpecialist)
    const healthRecordIds = [
      ...new Set(
        appointments
          .map((a) => a.idMedicalReport)
          .filter((id): id is string => !!id)
      ),
    ];

    const reviewIds = [
      ...new Set(
        appointments
          .map((a) => a.idReviewForSpecialist)
          .filter((id): id is string => !!id)
      ),
    ];

    console.log('Health Record IDs:', healthRecordIds);
    console.log('Review IDs:', reviewIds);

    if (healthRecordIds.length === 0 && reviewIds.length === 0) {
      return;
    }

    forkJoin({
      healthRecords:
        healthRecordIds.length > 0
          ? this.loadHealthRecords(healthRecordIds)
          : of(new Map<string, HealthRecord>()),
      reviews:
        reviewIds.length > 0
          ? this.loadReviewsForSpecialist(reviewIds)
          : of(new Map<string, string>()),
    }).subscribe({
      next: (data) => {
        this.healthRecordsMap = data.healthRecords;
        this.reviewsMap = data.reviews;
        console.log('Health Records Map:', this.healthRecordsMap);
        console.log('Reviews Map:', this.reviewsMap);
        // Re-aplicar el filtro después de cargar los datos
        this.filterAppointments();
      },
      error: (err) => {
        console.error('Error al cargar datos relacionados:', err);
      },
    });
  }

  private loadHealthRecords(ids: string[]) {
    const requests = ids.map((id) =>
      this.healthRecordService.getHealthRecord(id)
    );

    return forkJoin(requests).pipe(
      map((records: (HealthRecord | null)[]) => {
        const recordsMap = new Map<string, HealthRecord>();
        records.forEach((record, index) => {
          if (record) {
            recordsMap.set(ids[index], record);
          }
        });
        return recordsMap;
      })
    );
  }

  private loadReviewsForSpecialist(ids: string[]) {
    const requests = ids.map((id) =>
      this.reviewService.getReviewForSpecialists(id)
    );

    return forkJoin(requests).pipe(
      map((reviews) => {
        const reviewsMap = new Map<string, string>();
        reviews.forEach((reviewObj, index) => {
          if (reviewObj && reviewObj.review) {
            reviewsMap.set(ids[index], reviewObj.review);
          }
        });
        return reviewsMap;
      })
    );
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

    // Aplicar filtro de búsqueda si hay texto (sin recursión)
    const keyWord = this.searchForm.get('keyWord')?.value || '';
    if (keyWord) {
      this.filterAppointments();
    }
  }

  onSearch() {
    this.filterAppointments();
  }

  private filterAppointments() {
    const keyWord = this.searchForm.get('keyWord')?.value || '';
    const keyWordLower = keyWord.toLowerCase();

    console.log('=== FILTRO DE BÚSQUEDA ===');
    console.log('Palabra clave:', keyWord);
    console.log('Health Records Map size:', this.healthRecordsMap.size);
    console.log('Reviews Map size:', this.reviewsMap.size);

    if (!keyWord) {
      // Si no hay búsqueda, mostrar según el filtro de estado seleccionado sin recursión
      switch (this.selectedStatus) {
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

    console.log('Base appointments:', baseAppointments.length);

    // Filtrar por palabra clave
    this.displayedAppointments = baseAppointments.filter((appointment) => {
      // Búsqueda en datos del appointment
      const matchesAppointment =
        appointment.specialistName?.toLowerCase().includes(keyWordLower) ||
        appointment.speciality?.toLowerCase().includes(keyWordLower) ||
        appointment.patientName?.toLowerCase().includes(keyWordLower);

      // Búsqueda en health record
      let matchesHealthRecord = false;
      if (appointment.idMedicalReport) {
        const healthRecord = this.healthRecordsMap.get(
          appointment.idMedicalReport
        );
        console.log(
          'Checking health record for appointment:',
          appointment.idMedicalReport,
          healthRecord
        );
        if (healthRecord) {
          matchesHealthRecord =
            healthRecord.height?.toString().includes(keyWord) ||
            healthRecord.weight?.toString().includes(keyWord) ||
            healthRecord.temperature?.toString().includes(keyWord) ||
            healthRecord.bloodPressure?.toString().includes(keyWord) ||
            healthRecord.painLevel?.toString().includes(keyWord) ||
            healthRecord.glucoseLevel?.toString().includes(keyWord) ||
            (healthRecord.dynamicData &&
              Object.entries(healthRecord.dynamicData).some(
                ([key, value]) =>
                  key.toLowerCase().includes(keyWordLower) ||
                  value.toString().toLowerCase().includes(keyWordLower)
              ));

          if (matchesHealthRecord) {
            console.log('MATCH encontrado en health record!', healthRecord);
          }
        }
      }

      // Búsqueda en review
      let matchesReview = false;
      if (appointment.idReviewForSpecialist) {
        const review = this.reviewsMap.get(appointment.idReviewForSpecialist);
        if (review) {
          matchesReview = review.toLowerCase().includes(keyWordLower);
        }
      }

      return matchesAppointment || matchesHealthRecord || matchesReview;
    });

    console.log('Resultados filtrados:', this.displayedAppointments.length);
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

  onSortChange(criteria: SortCriteria): void {
    this.displayedAppointments = this.sortAppointments(
      this.displayedAppointments,
      criteria
    );
  }

  onTimeFilterChange(criteria: TimeFilterCriteria): void {
    let sourceAppointments: Appointment[] = [];

    switch (this.selectedStatus) {
      case 'all':
        sourceAppointments = [...this.allAppointments];
        break;
      case 'pending':
        sourceAppointments = [...this.appointmentsPending];
        break;
      case 'confirmed':
        sourceAppointments = [...this.appointmentsConfirmed];
        break;
      case 'completed':
        sourceAppointments = [...this.appointmentsCompleted];
        break;
      case 'cancelled':
        sourceAppointments = [...this.appointmentsCancelled];
        break;
      default:
        sourceAppointments = [...this.allAppointments];
    }

    this.displayedAppointments = this.filterAppointmentsByTime(
      sourceAppointments,
      criteria
    );
  }

  private sortAppointments(
    appointments: Appointment[],
    criteria: SortCriteria
  ): Appointment[] {
    const sorted = [...appointments];

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (criteria.field) {
        case 'date':
          const dateA = a.appointmentDate?.toDate().getTime() || 0;
          const dateB = b.appointmentDate?.toDate().getTime() || 0;
          comparison = dateA - dateB;
          break;

        case 'specialty':
          comparison = (a.speciality || '').localeCompare(b.speciality || '');
          break;

        case 'patient':
          const patientA = (a.patientName || '').toLowerCase();
          const patientB = (b.patientName || '').toLowerCase();
          comparison = patientA.localeCompare(patientB);
          break;
      }

      return criteria.direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }

  private filterAppointmentsByTime(
    appointments: Appointment[],
    criteria: TimeFilterCriteria
  ): Appointment[] {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (criteria.type) {
      case 'all':
        return appointments;

      case 'next-30-days':
        const next30Days = new Date(today);
        next30Days.setDate(next30Days.getDate() + 30);
        return appointments.filter((app) => {
          const appDate = app.appointmentDate?.toDate();
          return appDate && appDate >= today && appDate <= next30Days;
        });

      case 'this-month':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return appointments.filter((app) => {
          const appDate = app.appointmentDate?.toDate();
          return appDate && appDate >= startOfMonth && appDate <= endOfMonth;
        });

      case 'last-3-months':
        const threeMonthsAgo = new Date(today);
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        return appointments.filter((app) => {
          const appDate = app.appointmentDate?.toDate();
          return appDate && appDate >= threeMonthsAgo && appDate <= today;
        });

      default:
        return appointments;
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

import { Component, inject, Input } from '@angular/core';
import { Appointment } from '../../../classes/appointment';
import { AppointmentsService } from '../../../services/appointments/appointments.service';
import { CommonModule, NgClass } from '@angular/common';
import Swal from 'sweetalert2';
import { HealthRecordService } from '../../../services/health-record/health-record.service';
import { HealthRecordOverviewComponent } from '../../health-record/health-record-overview/health-record-overview.component';
import { HealthRecord } from '../../../classes/health-record';
import { ReviewService } from '../../../services/review/review.service';
import { ReviewOverviewComponent } from '../../review/review-overview/review-overview.component';

@Component({
  selector: 'app-appointments-list-admin',
  standalone: true,
  imports: [
    CommonModule,
    NgClass,
    HealthRecordOverviewComponent,
    ReviewOverviewComponent,
  ],
  templateUrl: './appointments-list-admin.component.html',
  styleUrl: './appointments-list-admin.component.css',
})
export class AppointmentsListAdminComponent {
  @Input() appointments: Appointment[] | null = null;
  @Input() keyWord: string | null = null;
  @Input() healthRecordsMap: Map<string, HealthRecord> = new Map();
  @Input() reviewsMap: Map<string, string> = new Map();

  healthRecord: HealthRecord | null = null;
  isHealthRecordModalOpen: boolean = false;
  review: string = '';
  isReviewModalOpen: boolean = false;

  private appointmentService = inject(AppointmentsService);
  private healthRecordService = inject(HealthRecordService);
  private reviewService = inject(ReviewService);

  get filteredAppointments(): Appointment[] {
    // El padre ya filtra los appointments, solo retornarlos
    return this.appointments || [];
  }

  async cancelAppointment(appointment: Appointment): Promise<void> {
    if (!appointment.isCancelable) return;

    const { value: text } = await Swal.fire({
      input: 'textarea',
      inputLabel: 'Escriba el motivo de la cancelacion',
      inputPlaceholder: 'Introduzca el mensaje aqui...',
      inputAttributes: {
        'aria-label': 'Introduzca el mensaje aqui',
      },
      showCancelButton: true,
    });
    if (text) {
      this.appointmentService
        .cancelAppointment(appointment.id, text)
        .then(() => {
          appointment.isCancelable = false;
          appointment.appointmentStatus = 'Cancelado';
          appointment.message = text;
        })
        .catch((error) => {
          console.error('Error al cancelar el turno:', error);
          alert('Hubo un problema al cancelar el turno');
        });
    }
  }

  // Métodos para el modal de health record
  showHealthRecordModal(healthRecordId: string | null) {
    if (healthRecordId) {
      // Verificar si el health record ya está en el cache
      const cachedHealthRecord = this.healthRecordsMap.get(healthRecordId);
      if (cachedHealthRecord) {
        this.healthRecord = cachedHealthRecord;
        this.isHealthRecordModalOpen = true;
        return;
      }
      // Si no está en cache, hacer el request al servicio
      this.healthRecordService.getHealthRecord(healthRecordId).subscribe({
        next: (healthRecord) => {
          this.healthRecord = healthRecord;
          this.isHealthRecordModalOpen = true;
        },
        error: (error) => {
          console.error('Error al cargar el registro médico:', error);
          Swal.fire({
            title: 'Error',
            text: 'No se pudo cargar el registro médico',
            icon: 'error',
            confirmButtonText: 'Aceptar',
          });
        },
      });
    }
  }

  closeHealthRecordModal(data: { event: boolean }) {
    this.isHealthRecordModalOpen = data.event;
    this.healthRecord = null;
  }

  // Métodos para el modal de review
  showReviewModal(reviewId: string | null) {
    if (reviewId) {
      // Verificar si la reseña ya está en el cache
      const cachedReview = this.reviewsMap.get(reviewId);
      if (cachedReview) {
        this.review = cachedReview;
        this.isReviewModalOpen = true;
        return;
      }
      // Si no está en cache, hacer el request al servicio
      this.reviewService.getReviewForPatient(reviewId).subscribe({
        next: (review) => {
          this.review = review.review;
          this.isReviewModalOpen = true;
        },
        error: (error) => {
          console.error('Error al cargar la reseña:', error);
        },
      });
    }
  }

  closeReviewModal(data: { event: boolean }) {
    this.isReviewModalOpen = data.event;
  }
}

import { Specialist } from './../../../classes/user.model';
import { HealthRecord } from './../../../classes/health-record';
import { CommonModule, NgClass } from '@angular/common';
import { Component, inject, Input, input } from '@angular/core';
import { Appointment } from '../../../classes/appointment';
import { AppointmentsService } from '../../../services/appointments/appointments.service';
import Swal from 'sweetalert2';
import { ReviewService } from '../../../services/review/review.service';
import { ReviewForPatient } from '../../../classes/reviewForPatient';
import { ReviewOverviewComponent } from '../../review/review-overview/review-overview.component';
import { ReviewCreateComponent } from '../../review/review-create/review-create.component';
import { SurveyComponent } from '../../survey/survey/survey.component';
import { HealthRecordService } from '../../../services/health-record/health-record.service';
import { HealthRecordOverviewComponent } from '../../health-record/health-record-overview/health-record-overview.component';

@Component({
  selector: 'app-appointments-list',
  standalone: true,
  imports: [
    CommonModule,
    NgClass,
    ReviewOverviewComponent,
    ReviewCreateComponent,
    SurveyComponent,
    HealthRecordOverviewComponent,
  ],
  templateUrl: './appointments-list.component.html',
  styleUrl: './appointments-list.component.css',
})
export class AppointmentsListComponent {
  @Input() appointments: Appointment[] | null = null;
  @Input() keyWord: string | null = null;
  @Input() healthRecordsMap: Map<string, HealthRecord> = new Map();
  @Input() reviewsMap: Map<string, string> = new Map();

  healthRecord: HealthRecord | null = null;
  review: string | null = null;
  appointmentId: string | null = null;
  patientId: string | null = null;
  specialistId: string | null = null;
  isReviewModalOpen: boolean = false;
  isCreateReviewModalOpen: boolean = false;
  isHealthRecordModalOpen: boolean = false;

  // Propiedades para la encuesta de satisfacción
  showSurveyModal = false;
  surveyPatientId: string | null = null;
  surveySpecialistId: string | null = null;

  private appointmentService = inject(AppointmentsService);
  private reviewService = inject(ReviewService);
  private healthRecordService = inject(HealthRecordService);

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

  // Método para mostrar el modal de crear reseña
  showCreateReviewModal(
    appointmentId: string,
    patientId: string,
    specialistId?: null | string
  ) {
    this.appointmentId = appointmentId;
    this.patientId = patientId;
    this.specialistId = specialistId || null;
    this.isCreateReviewModalOpen = true;
  }

  // Método que se ejecuta cuando se cierra el modal de reseña
  closeCreateReviewModal(event: { event: boolean }) {
    this.isCreateReviewModalOpen = event.event;
  }

  // Método que se ejecuta cuando se debe mostrar la encuesta después de la reseña
  onShowSurvey(event: {
    patientId: string | null;
    specialistId: string | null;
  }) {
    this.surveyPatientId = event.patientId;
    this.surveySpecialistId = event.specialistId;
    this.showSurveyModal = true;

    console.log('Mostrando encuesta de satisfacción para:', {
      patient: event.patientId,
      specialist: event.specialistId,
    });
  }

  // Método para cerrar la encuesta
  onSurveyModalClosed() {
    this.showSurveyModal = false;
    this.surveyPatientId = null;
    this.surveySpecialistId = null;
    console.log('Encuesta cerrada');
  }

  // Método cuando se envía la encuesta
  onSurveySubmitted(surveyId: string) {
    console.log('Encuesta enviada con ID:', surveyId);

    // Mostrar mensaje de agradecimiento
    Swal.fire({
      title: '¡Gracias!',
      text: 'Tu encuesta de satisfacción ha sido enviada correctamente.',
      icon: 'success',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#3B82F6',
    });
  }

  // Métodos existentes para el modal de review
  showReviewModal(ReviewdId: string | null) {
    if (ReviewdId) {
      // Intentar obtener del Map primero
      const cachedReview = this.reviewsMap.get(ReviewdId);
      if (cachedReview) {
        this.review = cachedReview;
        this.isReviewModalOpen = true;
        return;
      }

      // Si no está en cache, hacer request
      this.reviewService.getReviewForPatient(ReviewdId).subscribe({
        next: (review) => {
          this.review = review.review;
          this.isReviewModalOpen = true;
        },
      });
    } else {
      this.isReviewModalOpen = true;
    }
  }

  closeReviewModal(data: { event: boolean }) {
    this.isReviewModalOpen = data.event;
  }

  // Métodos para el modal de health record
  showHealthRecordModal(healthRecordId: string | null) {
    if (healthRecordId) {
      // Intentar obtener del Map primero
      const cachedHealthRecord = this.healthRecordsMap.get(healthRecordId);
      if (cachedHealthRecord) {
        this.healthRecord = cachedHealthRecord;
        this.isHealthRecordModalOpen = true;
        return;
      }

      // Si no está en cache, hacer request
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
}

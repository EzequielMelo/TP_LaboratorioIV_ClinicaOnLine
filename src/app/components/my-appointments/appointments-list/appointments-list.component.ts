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

@Component({
  selector: 'app-appointments-list',
  standalone: true,
  imports: [
    CommonModule,
    NgClass,
    ReviewOverviewComponent,
    ReviewCreateComponent,
    SurveyComponent, // Cambiar por el componente correcto
  ],
  templateUrl: './appointments-list.component.html',
  styleUrl: './appointments-list.component.css',
})
export class AppointmentsListComponent {
  @Input() appointments: Appointment[] | null = null;
  @Input() keyWord: string | null = null;

  // Propiedades existentes
  healthRecord: HealthRecord | null = null;
  review: string | null = null;
  appointmentId: string | null = null;
  patientId: string | null = null;
  specialistId: string | null = null;
  isReviewModalOpen: boolean = false;
  isCreateReviewModalOpen: boolean = false;

  // Propiedades para la encuesta de satisfacción
  showSurveyModal = false;
  surveyPatientId: string | null = null;
  surveySpecialistId: string | null = null;

  private appointmentService = inject(AppointmentsService);
  private reviewService = inject(ReviewService);

  get filteredAppointments(): Appointment[] {
    if (!this.keyWord || this.keyWord.trim() === '') {
      return this.appointments || [];
    }
    const lowerCaseKeyWord = this.keyWord.trim().toLowerCase();
    return (this.appointments || []).filter(
      (appointment) =>
        (appointment.specialistName &&
          appointment.specialistName
            .toLowerCase()
            .includes(lowerCaseKeyWord)) ||
        (appointment.speciality &&
          appointment.speciality.toLowerCase().includes(lowerCaseKeyWord))
    );
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

    // Opcional: Puedes añadir aquí lógica adicional como:
    // - Actualizar algún estado en la aplicación
    // - Enviar notificación al administrador
    // - Redirigir a otra página
  }

  // Métodos existentes para el modal de review
  showReviewModal(ReviewdId: string | null) {
    if (ReviewdId) {
      this.reviewService.getReviewForPatient(ReviewdId).subscribe({
        next: (review) => {
          this.review = review.review;
        },
      });
    }
    this.isReviewModalOpen = true;
  }

  closeReviewModal(data: { event: boolean }) {
    this.isReviewModalOpen = data.event;
  }
}

import { Appointment } from './../../../classes/appointment';
import { Component, inject, Input } from '@angular/core';
import { AppointmentsService } from '../../../services/appointments/appointments.service';
import Swal from 'sweetalert2';
import { CommonModule, NgClass } from '@angular/common';
import { ReviewService } from '../../../services/review/review.service';
import { ReviewForPatient } from '../../../classes/reviewForPatient';
import { ReviewOverviewComponent } from '../../review/review-overview/review-overview.component';
import { HealthRecordCreateComponent } from '../../health-record/health-record-create/health-record-create.component';

@Component({
  selector: 'app-appointments-list-specialist',
  standalone: true,
  imports: [
    CommonModule,
    NgClass,
    ReviewOverviewComponent,
    HealthRecordCreateComponent,
  ],
  templateUrl: './appointments-list-specialist.component.html',
  styleUrl: './appointments-list-specialist.component.css',
})
export class AppointmentsListSpecialistComponent {
  @Input() appointments: Appointment[] | null = null;
  @Input() keyWord: string | null = null;
  review: string | null = null;
  AppointmentId: string | null = null;
  AppointmentIdPatient: string | null = null;
  AppointmentIdSpecialist: string | null = null;

  private appointmentService = inject(AppointmentsService);
  private reviewService = inject(ReviewService);
  isReviewModalOpen: boolean = false;
  isCreateReviewModalOpen: boolean = false;

  get filteredAppointments(): Appointment[] {
    if (!this.keyWord || this.keyWord.trim() === '') {
      return this.appointments || [];
    }
    const lowerCaseKeyWord = this.keyWord.trim().toLowerCase();
    return (this.appointments || []).filter(
      (appointment) =>
        (appointment.patientName &&
          appointment.patientName.toLowerCase().includes(lowerCaseKeyWord)) ||
        (appointment.speciality &&
          appointment.speciality.toLowerCase().includes(lowerCaseKeyWord))
    );
  }

  acceptAppointment(appointment: Appointment) {
    this.appointmentService
      .acceptAppointment(appointment.id)
      .then(() => {
        appointment.isCancelable = false;
        appointment.appointmentStatus = 'Cancelado';
        appointment.message = 'Recuerde agendar el turno para asistir al mismo';
      })
      .catch((error) => {
        console.error('Error al aceptar el turno:', error);
        alert('Hubo un problema al aceptar el turno');
      });
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

  async rejectAppointment(appointment: Appointment): Promise<void> {
    if (!appointment.isCancelable) return;

    const { value: text } = await Swal.fire({
      input: 'textarea',
      inputLabel: 'Escriba el motivo del rechazo',
      inputPlaceholder: 'Introduzca el mensaje aqui...',
      inputAttributes: {
        'aria-label': 'Introduzca el mensaje aqui',
      },
      showCancelButton: true,
    });
    if (text) {
      this.appointmentService
        .rejectAppointment(appointment.id, text)
        .then(() => {
          appointment.isCancelable = false;
          appointment.appointmentStatus = 'Rechazado';
          appointment.message = text;
        })
        .catch((error) => {
          console.error('Error al rechazar el turno:', error);
          alert('Hubo un problema al rechazar el turno');
        });
    }
  }

  showCreateReviewModal(
    appointmentId: string | null,
    AppointmentIdPatient: string | null,
    AppointmentIdSpecialist: string | null
  ) {
    if (appointmentId) {
      this.AppointmentId = appointmentId;
      this.AppointmentIdPatient = AppointmentIdPatient;
      this.AppointmentIdSpecialist = AppointmentIdSpecialist;
    }
    this.isCreateReviewModalOpen = true;
  }

  closeCreateReviewModal(data: { event: boolean }) {
    this.isCreateReviewModalOpen = data.event;
  }

  showReviewModal(ReviewdId: string | null) {
    if (ReviewdId) {
      this.reviewService.getReviewForSpecialists(ReviewdId).subscribe({
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

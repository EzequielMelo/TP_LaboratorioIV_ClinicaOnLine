import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../../../services/review/review.service';
import { ReviewForSpecialist } from '../../../classes/reviewForSpecialist';
import { AppointmentsService } from '../../../services/appointments/appointments.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-review-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './review-create.component.html',
  styleUrl: './review-create.component.css',
})
export class ReviewCreateComponent {
  @Input() appointmentId: string | null = null;
  @Input() patientId: string | null = null;
  @Output() eventCloseModal = new EventEmitter<{ event: boolean }>();

  reviewText = '';

  private reviewService = inject(ReviewService);
  private appointmentsService = inject(AppointmentsService);

  saveReview() {
    if (!this.reviewText.trim()) {
      console.error('El texto de la reseña está vacío');
      return;
    }

    if (!this.appointmentId) {
      console.error('No se proporcionó id de appointment');
      return;
    }

    if (!this.patientId) {
      console.log(this.patientId);
      console.error('No se proporcionó id de paciente');
      return;
    }

    const review: Partial<ReviewForSpecialist> = {
      review: this.reviewText,
      idPatient: this.patientId,
    };

    this.reviewService
      .createReviewForSpecialist(review)
      .pipe(
        switchMap((reviewId) => {
          // Ahora actualizamos el appointment con el ID de la nueva reseña
          return this.appointmentsService.updateAppointment(
            this.appointmentId!,
            {
              idReviewForSpecialist: reviewId,
            }
          );
        })
      )
      .subscribe({
        next: () => {
          console.log('Reseña creada y appointment actualizado correctamente');
          this.eventCloseModal.emit({ event: false });
        },
        error: (err) => console.error('Error guardando reseña', err),
      });
  }

  closeModal() {
    this.eventCloseModal.emit({ event: false });
  }
}

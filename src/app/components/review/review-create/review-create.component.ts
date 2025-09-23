import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../../../services/review/review.service';
import { ReviewForSpecialist } from '../../../classes/reviewForSpecialist';
import { AppointmentsService } from '../../../services/appointments/appointments.service';
import { switchMap } from 'rxjs/operators';
import { CaptchaDirective } from '../../../directives/captcha.directive';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';
import { UserTypes } from '../../../models/user-types';
import { Patient } from '../../../classes/patient.class';

@Component({
  selector: 'app-review-create',
  standalone: true,
  imports: [CommonModule, FormsModule, CaptchaDirective],
  templateUrl: './review-create.component.html',
  styleUrl: './review-create.component.css',
})
export class ReviewCreateComponent {
  @Input() appointmentId: string | null = null;
  @Input() patientId: string | null = null;
  @Input() specialistId: string | null = null; // Nuevo input para el ID del especialista
  @Output() eventCloseModal = new EventEmitter<{ event: boolean }>();
  @Output() eventShowSurvey = new EventEmitter<{
    patientId: string | null;
    specialistId: string | null;
  }>(); // Nuevo output

  private userSubscription: Subscription;
  protected authService = inject(AuthService);
  user: UserTypes | null = null;

  reviewText = '';
  captchaEnabled = true;
  captchaOk = false;
  captchaTouched = false;

  private reviewService = inject(ReviewService);
  private appointmentsService = inject(AppointmentsService);

  constructor() {
    this.userSubscription = this.authService.user$.subscribe((user) => {
      this.user = user;
      if (user instanceof Patient) {
        this.captchaEnabled = user.settings?.useCaptcha ?? true;
        if (!this.captchaEnabled) {
          this.captchaOk = true; // pasa automáticamente la validación
        }
      } else {
        this.captchaEnabled = true;
        this.captchaOk = true;
      }
    });
  }

  saveReview() {
    if (!this.captchaOk) {
      console.error('Captcha no resuelto');
      return;
    }

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

          // Cerrar el modal de reseña
          this.eventCloseModal.emit({ event: false });

          // Emitir evento para mostrar la encuesta de satisfacción
          this.eventShowSurvey.emit({
            patientId: this.patientId,
            specialistId: this.specialistId,
          });
        },
        error: (err) => console.error('Error guardando reseña', err),
      });
  }

  closeModal() {
    this.eventCloseModal.emit({ event: false });
  }

  onCaptchaResult(success: boolean) {
    this.captchaTouched = true;
    this.captchaOk = success;
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}

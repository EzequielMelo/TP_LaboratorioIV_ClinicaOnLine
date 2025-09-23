import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormArray,
} from '@angular/forms';
import { switchMap } from 'rxjs/operators';

import { AppointmentsService } from '../../../services/appointments/appointments.service';
import { HealthRecordService } from '../../../services/health-record/health-record.service';
import { ReviewService } from '../../../services/review/review.service';

import { HealthRecord } from '../../../classes/health-record';
import { ReviewForPatient } from '../../../classes/reviewForPatient';
import { UserTypes } from '../../../models/user-types';
import { AuthService } from '../../../services/auth/auth.service';
import { Subscription } from 'rxjs';
import { CaptchaDirective } from '../../../directives/captcha.directive';
import { Specialist } from '../../../classes/specialist.class';

@Component({
  selector: 'app-health-record-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CaptchaDirective],
  templateUrl: './health-record-create.component.html',
  styleUrl: './health-record-create.component.css',
})
export class HealthRecordCreateComponent {
  @Input() appointmentId: string | null = null;
  @Input() AppointmentIdPatient: string | null = null;
  @Input() AppointmentIdSpecialist: string | null = null;
  @Output() eventCloseModal = new EventEmitter<{ event: boolean }>();

  private fb = inject(FormBuilder);
  private appointmentService = inject(AppointmentsService);
  private healthRecordService = inject(HealthRecordService);
  private reviewService = inject(ReviewService);
  private userSubscription: Subscription;
  protected authService = inject(AuthService);
  user: UserTypes | null = null;

  captchaEnabled = true;
  captchaOk = false;
  captchaTouched = false;

  constructor() {
    this.userSubscription = this.authService.user$.subscribe((user) => {
      this.user = user;
      if (user instanceof Specialist) {
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

  form = this.fb.group({
    height: [
      '',
      [Validators.required, Validators.min(30), Validators.max(250)],
    ],
    weight: ['', [Validators.required, Validators.min(1), Validators.max(500)]],
    temperature: [
      '',
      [Validators.required, Validators.min(30), Validators.max(45)],
    ],
    bloodPressure: [
      '',
      [Validators.required, Validators.pattern(/^\d{2,3}\/\d{2,3}$/)],
    ], // ej 120/80
    painLevel: [
      0,
      [Validators.required, Validators.min(0), Validators.max(100)],
    ],
    glucoseLevel: [
      '',
      [Validators.required, Validators.min(40), Validators.max(400)],
    ],
    smoker: [false, Validators.required],
    dynamicData: this.fb.array([]),
    review: ['', [Validators.required, Validators.minLength(5)]],
  });

  maxDynamicFields = 3;

  get dynamicData(): FormArray {
    return this.form.get('dynamicData') as FormArray;
  }

  addDynamicField() {
    if (this.dynamicData.length < this.maxDynamicFields) {
      this.dynamicData.push(
        this.fb.group({
          key: ['', Validators.required],
          value: ['', Validators.required],
        })
      );
    }
  }

  removeDynamicField(index: number) {
    this.dynamicData.removeAt(index);
  }

  submitRecord() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      console.warn('Formulario inválido');
      return;
    }
    if (!this.appointmentId) {
      console.error('No se proporcionó appointmentId');
      return;
    }

    const formValue = this.form.value;

    // Pasar FormArray a objeto clave: valor
    const dynamicDataObject: { [key: string]: string | number } = {};
    (formValue.dynamicData || []).forEach((field: any) => {
      if (field.key.trim()) {
        dynamicDataObject[field.key] = field.value;
      }
    });

    const record: Partial<HealthRecord> = {
      height: Number(formValue.height),
      weight: Number(formValue.weight),
      temperature: Number(formValue.temperature),
      bloodPressure: formValue.bloodPressure
        ? String(formValue.bloodPressure)
        : undefined,
      painLevel: formValue.painLevel != null ? formValue.painLevel : undefined,
      glucoseLevel: Number(formValue.glucoseLevel),
      smoker: formValue.smoker ?? false,
      dynamicData: dynamicDataObject,
      idPatient: this.AppointmentIdPatient || '',
      idSpecialist: this.AppointmentIdSpecialist || '',
    };

    let healthRecordIdGenerado = '';

    this.healthRecordService
      .createHealthRecord(record)
      .pipe(
        switchMap((healthRecordId: string) => {
          healthRecordIdGenerado = healthRecordId;

          const reviewData: Partial<ReviewForPatient> = {
            review: formValue.review ?? '',
            healthRecordId: healthRecordId,
          };

          return this.reviewService.createReviewForPatient(reviewData);
        }),
        switchMap((reviewId: string) => {
          return this.appointmentService.updateAppointment(
            this.appointmentId!,
            {
              idMedicalReport: healthRecordIdGenerado,
              idReviewForPatient: reviewId,
              appointmentStatus: 'Completado',
            }
          );
        })
      )
      .subscribe({
        next: () => {
          console.log('Todo guardado correctamente');
          this.eventCloseModal.emit({ event: false });
        },
        error: (err) => console.error('Error guardando datos', err),
      });
  }

  closeModal() {
    this.eventCloseModal.emit({ event: false });
  }

  onCaptchaResult(success: boolean) {
    this.captchaTouched = true;
    this.captchaOk = success;
  }
}

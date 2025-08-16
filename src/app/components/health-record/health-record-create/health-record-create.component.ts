import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { switchMap } from 'rxjs/operators';

import { AppointmentsService } from '../../../services/appointments/appointments.service';
import { HealthRecordService } from '../../../services/health-record/health-record.service';
import { ReviewService } from '../../../services/review/review.service';

import { HealthRecord } from '../../../classes/health-record';
import { ReviewForPatient } from '../../../classes/reviewForPatient'; // asumo que existe

@Component({
  selector: 'app-health-record-create',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './health-record-create.component.html',
  styleUrl: './health-record-create.component.css',
})
export class HealthRecordCreateComponent {
  height = '';
  weight = '';
  temperature = '';
  bloodPressure = '';
  review = '';

  dynamicData: { key: string; value: string }[] = [];
  maxDynamicFields = 3;

  @Input() appointmentId: string | null = null;
  @Input() AppointmentIdPatient: string | null = null;
  @Input() AppointmentIdSpecialist: string | null = null;
  @Output() eventCloseModal = new EventEmitter<{ event: boolean }>();

  private appointmentService = inject(AppointmentsService);
  private healthRecordService = inject(HealthRecordService);
  private reviewService = inject(ReviewService);

  addDynamicField() {
    if (this.dynamicData.length < this.maxDynamicFields) {
      this.dynamicData.push({ key: '', value: '' });
    }
  }

  submitRecord() {
    if (!this.appointmentId) {
      console.error('No se proporcionó appointmentId');
      return;
    }

    // Convertir el array de campos dinámicos en un objeto { clave: valor }
    const dynamicDataObject: { [key: string]: string | number } = {};
    this.dynamicData.forEach((field) => {
      if (field.key.trim()) {
        dynamicDataObject[field.key] = field.value;
      }
    });

    const record: Partial<HealthRecord> = {
      height: Number(this.height),
      weight: Number(this.weight),
      temperature: Number(this.temperature),
      bloodPressure: Number(this.bloodPressure),
      dynamicData: dynamicDataObject,
      idPatient: this.AppointmentIdPatient || '', // Asegurarse de que no sea null
      idSpecialist: this.AppointmentIdSpecialist || '', // Esto también
    };

    let healthRecordIdGenerado = '';

    this.healthRecordService
      .createHealthRecord(record)
      .pipe(
        switchMap((healthRecordId: string) => {
          healthRecordIdGenerado = healthRecordId;

          const reviewData: Partial<ReviewForPatient> = {
            review: this.review,
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
}

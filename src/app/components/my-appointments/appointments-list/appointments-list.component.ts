import { HealthRecord } from './../../../classes/health-record';
import { CommonModule, NgClass } from '@angular/common';
import { Component, inject, Input, input } from '@angular/core';
import { Appointment } from '../../../classes/appointment';
import { AppointmentsService } from '../../../services/appointments/appointments.service';
import Swal from 'sweetalert2';
import { HealthRecordService } from '../../../services/health-record/health-record.service';
import { HealthRecordOverviewComponent } from '../../health-record/health-record-overview/health-record-overview.component';

@Component({
  selector: 'app-appointments-list',
  standalone: true,
  imports: [CommonModule, NgClass, HealthRecordOverviewComponent],
  templateUrl: './appointments-list.component.html',
  styleUrl: './appointments-list.component.css',
})
export class AppointmentsListComponent {
  @Input() appointments: Appointment[] | null = null;
  @Input() keyWord: string | null = null;
  healthRecord: HealthRecord | null = null;

  private appointmentService = inject(AppointmentsService);
  private healthRecordService = inject(HealthRecordService);
  isEditModalOpen: boolean = false;

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

  showReviewModal(HealthRecordId: string | null) {
    if (HealthRecordId) {
      this.healthRecordService.getHealthRecord(HealthRecordId).subscribe({
        next: (healthRecord) => {
          this.healthRecord = healthRecord;
        },
      });
    }
    this.isEditModalOpen = true;
  }

  closeModal(data: { event: boolean }) {
    this.isEditModalOpen = data.event;
  }
}

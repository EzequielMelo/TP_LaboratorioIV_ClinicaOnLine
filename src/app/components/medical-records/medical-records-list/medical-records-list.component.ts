import { Component, inject, Input } from '@angular/core';
import { PatientAppointmentData } from '../../../classes/patient-appointment';
import { CommonModule } from '@angular/common';
import { PdfService } from '../../../services/pdf/pdf.service';

@Component({
  selector: 'app-medical-records-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './medical-records-list.component.html',
  styleUrl: './medical-records-list.component.css',
})
export class MedicalRecordsListComponent {
  @Input() medicalRecords: PatientAppointmentData[] | null = null;
  @Input() keyWord: string | null = null;

  private pdfService = inject(PdfService);

  onDownloadPDF(record: PatientAppointmentData) {
    this.pdfService.generateMedicalRecordPDF(record);
  }

  getDayName(date: Date): string {
    return date.toLocaleDateString('es-ES', { weekday: 'long' });
  }

  get filteredRecords(): PatientAppointmentData[] {
    if (!this.keyWord || this.keyWord.trim() === '') {
      return this.medicalRecords || [];
    }
    const lowerCaseKeyWord = this.keyWord.trim().toLowerCase();
    return (this.medicalRecords || []).filter(
      (medicalRecords) =>
        (medicalRecords.specialistName &&
          medicalRecords.specialistName
            .toLowerCase()
            .includes(lowerCaseKeyWord)) ||
        (medicalRecords.speciality &&
          medicalRecords.speciality.toLowerCase().includes(lowerCaseKeyWord))
    );
  }
}

import {
  Component,
  inject,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { Patient } from '../../../classes/patient.class';
import { HealthRecord } from '../../../classes/health-record';
import { HealthRecordService } from '../../../services/health-record/health-record.service';
import { PatientAppointmentData } from '../../../classes/patient-appointment';
import { CommonModule } from '@angular/common';
import { PdfService } from '../../../services/pdf/pdf.service';

@Component({
  selector: 'app-patient-medical-records',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-medical-records.component.html',
  styleUrl: './patient-medical-records.component.css',
})
export class PatientMedicalRecordsComponent implements OnChanges {
  @Input() patient: Patient | null = null;
  displayedRecords: PatientAppointmentData[] = [];

  private healthRecordService = inject(HealthRecordService);
  private pdfService = inject(PdfService);

  medicalRecords: HealthRecord[] = [];
  isLoading = false;

  ngOnInit(): void {
    if (this.patient) {
      this.loadMedicalRecords();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['patient'] && changes['patient'].currentValue) {
      this.loadMedicalRecords();
    }
  }

  private loadMedicalRecords(): void {
    if (!this.patient) return;

    this.isLoading = true;

    // Aquí harías tu llamada a Firebase para obtener los registros médicos
    // Por ahora, simulamos la carga
    this.healthRecordService
      .getAppointmentsByPatient(this.patient.id)
      .subscribe(
        (data: PatientAppointmentData[]) => {
          this.displayedRecords = data;
        },
        (error) => {
          console.error('Error loading medical records:', error);
        }
      );
  }

  onDownloadPDF(record: PatientAppointmentData) {
    this.pdfService.generateMedicalRecordPDF(record);
  }
}

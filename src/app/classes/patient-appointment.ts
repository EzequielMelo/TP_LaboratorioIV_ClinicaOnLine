import { Timestamp } from '@angular/fire/firestore';

export class PatientAppointmentData {
  id: string;
  speciality: string;
  specialistName: string;
  patientName: string;
  appointmentDate: Timestamp | null;
  idMedicalReport?: string;
  idReviewForPatient?: string;

  healthRecord: {
    id: string;
    bloodPressure: number;
    dynamicData: Record<string, any>;
    height: number;
    temperature: number;
    weight: string;
  } | null;

  review: {
    id: string;
    review: string;
  } | null;

  constructor(
    id: string,
    speciality: string,
    specialistName: string,
    patientName: string,
    appointmentDate: Timestamp | null,
    healthRecord: any = null,
    review: any = null,
    idMedicalReport?: string,
    idReviewForPatient?: string
  ) {
    this.id = id;
    this.speciality = speciality;
    this.specialistName = specialistName;
    this.patientName = patientName;
    this.appointmentDate = appointmentDate;
    this.healthRecord = healthRecord;
    this.review = review;
    this.idMedicalReport = idMedicalReport;
    this.idReviewForPatient = idReviewForPatient;
  }
}

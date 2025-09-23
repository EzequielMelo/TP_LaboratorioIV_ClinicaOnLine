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
    idPatient: string;
    idSpecialist: string;
    height: number;
    weight: number;
    bloodPressure: string;
    temperature: number;
    painLevel: number;
    glucoseLevel: number;
    smoker: boolean;
    dynamicData: Record<string, any>;
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

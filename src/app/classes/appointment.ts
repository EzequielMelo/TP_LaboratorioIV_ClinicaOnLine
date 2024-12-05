import { Timestamp } from '@angular/fire/firestore';

export class Appointment {
  id: string;
  idPatient: string;
  idSpecialist: string | null;
  message: string;
  speciality: string;
  requestedDate: Timestamp;
  appointmentDate: Timestamp | null;
  appointmentStatus: string;
  isCancelable: boolean;
  specialistName: string;
  idMedicalReport: string | null;

  constructor(
    id: string,
    idPatient: string,
    idSpecialist: string | null,
    message: string,
    speciality: string,
    requestedDate: Timestamp,
    appointmentDate: Timestamp | null,
    appointmentStatus: string,
    isCancelable: boolean,
    specialistName: string,
    idMedicalReport: string | null
  ) {
    this.id = id;
    this.idPatient = idPatient;
    this.idSpecialist = idSpecialist;
    this.message = message;
    this.speciality = speciality;
    this.requestedDate = requestedDate;
    this.appointmentDate = appointmentDate;
    this.appointmentStatus = appointmentStatus;
    this.isCancelable = isCancelable;
    this.specialistName = specialistName;
    this.idMedicalReport = idMedicalReport;
  }
}

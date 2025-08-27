import { inject, Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import {
  catchError,
  forkJoin,
  from,
  map,
  Observable,
  of,
  switchMap,
} from 'rxjs';
import { HealthRecord } from '../../classes/health-record';
import { documentId } from 'firebase/firestore';

interface HealthRecordInterface {
  id: string;
  bloodPressure: number;
  dynamicData: Record<string, any>;
  height: number;
  temperature: number;
  weight: string;
}

interface ReviewForPatient {
  id: string;
  review: string;
}

interface FirebaseAppointmentData {
  speciality: string;
  specialistName: string;
  idMedicalReport?: string;
  idReviewForPatient?: string;
  appointmentDate: any; // Firebase Timestamp
}

@Injectable({
  providedIn: 'root',
})
export class HealthRecordService {
  private firestore = inject(AngularFirestore);

  createHealthRecord(record: Partial<HealthRecord>): Observable<string> {
    const id = this.firestore.createId();
    return from(
      this.firestore.collection('healthRecords').doc(id).set(record)
    ).pipe(map(() => id));
  }

  getHealthRecord(healthRecordId: string): Observable<HealthRecord> {
    return this.firestore
      .collection<HealthRecord>('healthRecords')
      .doc(healthRecordId)
      .snapshotChanges()
      .pipe(
        map((snapshot) => {
          if (snapshot.payload.exists) {
            const data = snapshot.payload.data() as HealthRecord;
            const id = snapshot.payload.id;
            return { ...data, id };
          }
          throw new Error('No HealthRecord found for the given ID');
        })
      );
  }

  getAppointmentsByPatient(patientId: string): Observable<any[]> {
    return this.firestore
      .collection('appointments', (ref) =>
        ref
          .where('idPatient', '==', patientId)
          .where('idMedicalReport', '!=', null)
          .orderBy('appointmentDate', 'desc')
      )
      .snapshotChanges()
      .pipe(
        switchMap((actions) => {
          if (actions.length === 0) return of([]);

          const appointments = actions.map((a) => {
            const data = a.payload.doc.data() as any;
            const id = a.payload.doc.id;
            return {
              id,
              speciality: data.speciality,
              specialistName: data.specialistName,
              patientName: data.patientName,
              idMedicalReport: data.idMedicalReport,
              idReviewForPatient: data.idReviewForPatient,
              appointmentDate: data.appointmentDate,
            };
          });

          const medicalReportIds = appointments
            .map((a) => a.idMedicalReport)
            .filter((id: string) => !!id);

          const reviewIds = appointments
            .map((a) => a.idReviewForPatient)
            .filter((id: string) => !!id);

          const healthRecords$ =
            medicalReportIds.length > 0
              ? this.firestore
                  .collection('healthRecords', (ref) =>
                    ref.where(documentId(), 'in', medicalReportIds)
                  )
                  .snapshotChanges()
                  .pipe(
                    map((hrActions) =>
                      hrActions.map((hr) => {
                        const data = hr.payload.doc.data() as any;
                        const id = hr.payload.doc.id;
                        return {
                          id,
                          bloodPressure: data.bloodPressure,
                          dynamicData: data.dynamicData,
                          height: data.height,
                          temperature: data.temperature,
                          weight: data.weight,
                        };
                      })
                    )
                  )
              : of([]);

          const reviews$ =
            reviewIds.length > 0
              ? this.firestore
                  .collection('reviewsForPatients', (ref) =>
                    ref.where(documentId(), 'in', reviewIds)
                  )
                  .snapshotChanges()
                  .pipe(
                    map((revActions) =>
                      revActions.map((rev) => {
                        const data = rev.payload.doc.data() as any;
                        const id = rev.payload.doc.id;
                        return { id, review: data.review };
                      })
                    )
                  )
              : of([]);

          return healthRecords$.pipe(
            switchMap((healthRecords) => {
              return reviews$.pipe(
                map((reviews) => {
                  return appointments.map((app) => {
                    const healthRecord = healthRecords.find(
                      (hr: any) => hr.id === app.idMedicalReport
                    );
                    const review = reviews.find(
                      (r: any) => r.id === app.idReviewForPatient
                    );
                    return {
                      ...app,
                      healthRecord: healthRecord || null,
                      review: review || null,
                    };
                  });
                })
              );
            })
          );
        })
      );
  }
}

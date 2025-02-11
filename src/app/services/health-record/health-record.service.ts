import { inject, Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Firestore } from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';
import { HealthRecord } from '../../classes/health-record';

@Injectable({
  providedIn: 'root',
})
export class HealthRecordService {
  private firestore = inject(AngularFirestore);
  private fire = inject(Firestore);

  getAppointmentsByPatient(patientId: string): Observable<HealthRecord[]> {
    return this.firestore
      .collection('healthRecords', (ref) =>
        ref.where('idPatient', '==', patientId)
      )
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data() as HealthRecord;
            const id = a.payload.doc.id;
            return { ...data, id } as HealthRecord;
          })
        )
      );
  }
}

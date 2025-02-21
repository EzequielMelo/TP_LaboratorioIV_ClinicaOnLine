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

  getHealthRecord(healthRecordId: string): Observable<HealthRecord> {
    return this.firestore
      .collection('healthRecords')
      .doc(healthRecordId)
      .snapshotChanges()
      .pipe(
        map((snapshot) => {
          if (snapshot.payload.exists) {
            const data = snapshot.payload.data() as HealthRecord;
            const id = snapshot.payload.id;
            return { ...data, id } as HealthRecord;
          }
          throw new Error('No HealthRecord found for the given ID');
        })
      );
  }
}

import { inject, Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Firestore } from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';
import { Review } from '../../classes/reviewForPatient';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private firestore = inject(AngularFirestore);
  private fire = inject(Firestore);

  getReviewForPatient(healthRecordId: string): Observable<Review> {
    return this.firestore
      .collection('reviewsForPatients')
      .doc(healthRecordId)
      .snapshotChanges()
      .pipe(
        map((snapshot) => {
          if (snapshot.payload.exists) {
            const data = snapshot.payload.data() as Review;
            const id = snapshot.payload.id;
            return { ...data, id } as Review;
          }
          throw new Error('No review found for the given ID');
        })
      );
  }
}

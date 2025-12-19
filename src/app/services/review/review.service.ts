import { inject, Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Firestore } from '@angular/fire/firestore';
import { from, map, Observable } from 'rxjs';
import { ReviewForPatient } from '../../classes/reviewForPatient';
import { ReviewForSpecialist } from '../../classes/reviewForSpecialist';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private firestore = inject(AngularFirestore);
  private fire = inject(Firestore);

  getReviewForPatient(healthRecordId: string): Observable<ReviewForPatient> {
    return this.firestore
      .collection('reviewsForPatients')
      .doc(healthRecordId)
      .get()
      .pipe(
        map((snapshot) => {
          if (snapshot.exists) {
            const data = snapshot.data() as ReviewForPatient;
            const id = snapshot.id;
            return { ...data, id } as ReviewForPatient;
          }
          throw new Error('No review found for the given ID');
        })
      );
  }

  getReviewForSpecialists(
    healthRecordId: string
  ): Observable<ReviewForSpecialist> {
    return this.firestore
      .collection('reviewsForSpecialists')
      .doc(healthRecordId)
      .get()
      .pipe(
        map((snapshot) => {
          if (snapshot.exists) {
            const data = snapshot.data() as ReviewForSpecialist;
            const id = snapshot.id;
            return { ...data, id } as ReviewForSpecialist;
          }
          throw new Error('No review found for the given ID');
        })
      );
  }

  createReviewForPatient(
    review: Partial<ReviewForPatient>
  ): Observable<string> {
    const id = this.firestore.createId();
    return from(
      this.firestore.collection('reviewsForPatients').doc(id).set(review)
    ).pipe(map(() => id));
  }

  createReviewForSpecialist(
    review: Partial<ReviewForSpecialist>
  ): Observable<string> {
    const id = this.firestore.createId();
    return from(
      this.firestore.collection('reviewsForSpecialists').doc(id).set(review)
    ).pipe(map(() => id));
  }
}

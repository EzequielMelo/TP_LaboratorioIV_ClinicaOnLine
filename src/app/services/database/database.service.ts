import { inject, Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { catchError, from, map, Observable, throwError } from 'rxjs';
import { Patient } from '../../classes/patient.class';
import {
  Firestore,
  doc,
  setDoc,
  getDoc,
  runTransaction,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private firestore = inject(AngularFirestore);
  private fire = inject(Firestore);
  constructor() {}

  checkDNIExists(dni: string): Observable<boolean> {
    return this.firestore
      .collection('users', (ref) => ref.where('dni', '==', dni))
      .get()
      .pipe(map((snapshot) => !snapshot.empty));
  }

  addPatient(patient: Partial<Patient>, colID: string): Observable<void> {
    const userDocRef = doc(this.fire, `users/${colID}`);
    return from(setDoc(userDocRef, patient)).pipe(
      catchError((error) => {
        console.error('Error al añadir paciente:', error); // Mostrar el error en la consola
        return throwError(() => ({ message: 'Error al añadir paciente.' })); // Reenviar el error
      })
    );
  }

  getPatientData(uid: string): Observable<Patient | null> {
    const userDocRef = doc(this.fire, `users/${uid}`);
    return from(
      getDoc(userDocRef).then((docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          return new Patient(
            uid,
            data['name'],
            data['lastName'],
            data['email'],
            data['age'],
            data['dni'],
            data['healthCareSystem'],
            data['profilePicture'],
            data['coverPicture'],
            data['userType']
          );
        }
        return null;
      })
    );
  }
}

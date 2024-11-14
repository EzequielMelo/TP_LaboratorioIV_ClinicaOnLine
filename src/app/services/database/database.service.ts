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
import { Admin } from '../../classes/admin.class';
import { Specialist } from '../../classes/specialist.class';
import { User } from '../../classes/user';

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

  addUser(patient: Partial<Patient>, colID: string): Observable<void> {
    const userDocRef = doc(this.fire, `users/${colID}`);
    return from(setDoc(userDocRef, patient)).pipe(
      catchError((error) => {
        console.error('Error al añadir paciente:', error); // Mostrar el error en la consola
        return throwError(() => ({ message: 'Error al añadir paciente.' })); // Reenviar el error
      })
    );
  }

  getUserData(uid: string): Observable<User | null> {
    const userDocRef = doc(this.fire, `users/${uid}`);
    return from(
      getDoc(userDocRef).then((docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          const userType = data['userType'];

          // Según el tipo de usuario, creamos la instancia correspondiente
          if (userType === 'patient') {
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
              userType
            );
          } else if (userType === 'specialist') {
            return new Specialist(
              uid,
              data['name'],
              data['lastName'],
              data['email'],
              data['age'],
              data['dni'],
              data['specialty'], // Solo presente en Specialist
              data['profilePicture'],
              data['accountConfirmed'],
              userType
            );
          } else if (userType === 'admin') {
            return new Admin(
              uid,
              data['name'],
              data['lastName'],
              data['email'],
              data['age'],
              data['dni'],
              data['profilePicture'],
              userType
            );
          }
        }
        return null; // Si no existe, devolvemos null
      })
    );
  }

  getSpecialists(): Observable<Specialist[]> {
    const usersColl = this.firestore.collection('users', (ref) =>
      ref.where('userType', '==', 'specialist')
    );

    return usersColl.snapshotChanges().pipe(
      map((actions) =>
        actions.map((a) => {
          const data = a.payload.doc.data() as Specialist;
          const id = a.payload.doc.id;
          return { ...data, id };
        })
      )
    );
  }

  getPatients(): Observable<Patient[]> {
    const usersColl = this.firestore.collection<Patient>('users', (ref) =>
      ref.where('userType', '==', 'patient')
    );
    return usersColl.snapshotChanges().pipe(
      map((actions) =>
        actions.map((a) => {
          const data = a.payload.doc.data() as Patient;
          const id = a.payload.doc.id;
          return { ...data, id };
        })
      )
    );
  }

  getAdmins(): Observable<Admin[]> {
    const usersColl = this.firestore.collection<Admin>('users', (ref) =>
      ref.where('userType', '==', 'admin')
    );
    return usersColl.snapshotChanges().pipe(
      map((actions) =>
        actions.map((a) => {
          const data = a.payload.doc.data() as Admin;
          const id = a.payload.doc.id;
          return { ...data, id };
        })
      )
    );
  }

  updateAccountConfirmed(userId: string, isConfirmed: boolean): Promise<void> {
    return this.firestore
      .collection('users')
      .doc(userId)
      .update({ accountConfirmed: isConfirmed });
  }
}

import { inject, Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { catchError, from, map, Observable, throwError } from 'rxjs';
import { Patient } from '../../classes/patient.class';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Admin } from '../../classes/admin.class';
import { Specialist } from '../../classes/specialist.class';
import { User } from '../../classes/user';
import { Appointment } from '../../classes/appointment';

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
              data['workDays'],
              data['workHours'],
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

  addAppointment(appointment: Partial<Appointment>): Observable<void> {
    const userDocRef = doc(this.fire, `appointments`);
    return from(setDoc(userDocRef, appointment)).pipe(
      catchError((error) => {
        console.error('Error al añadir el turno:', error);
        return throwError(() => ({ message: 'Error al añadir turno.' }));
      })
    );
  }

  getAppointments(idPatient: string): Observable<Appointment[]> {
    return this.firestore
      .collection('appointments', (ref) =>
        ref.where('idPatient', '==', idPatient)
      )
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data() as Appointment;
            const id = a.payload.doc.id;
            return { ...data, id } as Appointment;
          })
        )
      );
  }

  getSpecialtys() {
    const specialtysColl = this.firestore.collection<{ specialty: string }>(
      'specialtys'
    );
    return specialtysColl.get().pipe(
      map((snapshot) => snapshot.docs.map((doc) => doc.data().specialty)) // Devuelve solo los nombres
    );
  }

  getSpecialistsBySpecialty(selectedSpecialty: string) {
    return this.firestore
      .collection('users', (ref) =>
        ref
          .where('userType', '==', 'specialist')
          .where('specialty', 'array-contains', selectedSpecialty)
      )
      .get()
      .pipe(
        map((snapshot) =>
          snapshot.docs.map((doc) => {
            const data = doc.data() as Specialist; // Datos del especialista
            return { ...data, id: doc.id }; // Combinas los datos con el id
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

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
  tap,
  throwError,
} from 'rxjs';
import { Patient } from '../../classes/patient.class';
import {
  Firestore,
  doc,
  setDoc,
  getDoc,
  collectionData,
} from '@angular/fire/firestore';
import { Admin } from '../../classes/admin.class';
import { Specialist } from '../../classes/specialist.class';
import { User } from '../../classes/user';
import { Appointment } from '../../classes/appointment';
import { AppUser } from '../../classes/user.model';

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
              userType,
              data['settings']
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
              userType,
              data['settings']
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
      .collection<Appointment>(
        'appointments',
        (ref) =>
          ref
            .where('idPatient', '==', idPatient)
            .orderBy('appointmentDate', 'desc') // orden ascendente por fecha
      )
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data() as Appointment;
            const id = a.payload.doc.id;
            return { ...data, id };
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
            const data = doc.data() as Specialist;
            return { ...data, id: doc.id };
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

  updateSpecialistData(
    userId: string,
    workDays: string[],
    workHours: { start: string; end: string }
  ): Promise<void> {
    return this.firestore.collection('users').doc(userId).update({
      workDays,
      workHours,
    });
  }

  getAllUsers(): Observable<AppUser[]> {
    return this.firestore
      .collection<AppUser>('users')
      .valueChanges({ idField: 'id' });
  }

  registerVisit(): Promise<void> {
    const visita = {
      timestamp: new Date(),
    };

    return this.firestore
      .collection('site_visits')
      .add(visita)
      .then(() => {})
      .catch((err) => {
        console.error('Error registrando visita:', err);
      });
  }

  addNewSpecialties(specialties: string[]): Observable<void> {
    // Función auxiliar para normalizar texto
    const normalizeSpecialty = (specialty: string): string => {
      return (
        specialty
          .trim()
          .toLowerCase()
          // Reemplazar caracteres acentuados
          .replace(/á/g, 'a')
          .replace(/é/g, 'e')
          .replace(/í/g, 'i')
          .replace(/ó/g, 'o')
          .replace(/ú/g, 'u')
          .replace(/ñ/g, 'n')
          .replace(/ü/g, 'u')
          // Remover signos de puntuación y caracteres especiales
          .replace(/[^a-zA-Z0-9\s]/g, '')
          // Capitalizar primera letra
          .replace(/^\w/, (char) => char.toUpperCase())
      );
    };

    // Normalizar las especialidades recibidas
    const normalizedSpecialties = specialties
      .map((specialty) => normalizeSpecialty(specialty))
      .filter((specialty) => specialty.length > 0); // Filtrar strings vacíos

    if (normalizedSpecialties.length === 0) {
      return of(void 0); // No hay especialidades válidas para agregar
    }

    // Obtener especialidades existentes para evitar duplicados
    return this.getSpecialtys().pipe(
      // CAMBIO: usar this.getSpecialtys() en lugar de this.firestore.getSpecialtys()
      switchMap((existingSpecialties: string[]) => {
        // Normalizar especialidades existentes para comparación
        const normalizedExisting = existingSpecialties.map((specialty) =>
          normalizeSpecialty(specialty)
        );

        // Filtrar solo las especialidades que no existen
        const newSpecialties = normalizedSpecialties.filter(
          (specialty) => !normalizedExisting.includes(specialty)
        );

        if (newSpecialties.length === 0) {
          console.log(
            'Todas las especialidades ya existen en la base de datos'
          );
          return of(void 0); // No hay nuevas especialidades para agregar
        }

        // Crear observables para cada nueva especialidad
        const addOperations = newSpecialties.map((specialty) => {
          const specialtyDoc = {
            specialty: specialty,
          };

          // CAMBIO: usar this.firestore.collection().add() en lugar de doc().set()
          return from(
            this.firestore.collection('specialtys').add(specialtyDoc)
          ).pipe(
            tap(() => console.log(`Especialidad agregada: ${specialty}`)),
            catchError((error) => {
              console.error(
                `Error al agregar especialidad ${specialty}:`,
                error
              );
              return throwError(() => error);
            })
          );
        });

        // Ejecutar todas las operaciones en paralelo
        return forkJoin(addOperations).pipe(
          map(() => void 0), // Convertir el resultado a void
          tap(() => {
            console.log(
              `Se agregaron ${newSpecialties.length} nuevas especialidades:`,
              newSpecialties
            );
          })
        );
      }),
      catchError((error) => {
        console.error('Error al procesar especialidades:', error);
        return throwError(() => ({
          message: 'Error al agregar nuevas especialidades a la base de datos.',
        }));
      })
    );
  }
}

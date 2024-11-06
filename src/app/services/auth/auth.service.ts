import { inject, Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  Unsubscribe,
  User,
  UserCredential,
} from '@angular/fire/auth';
import {
  BehaviorSubject,
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
import { DatabaseService } from '../database/database.service';
import { Patient } from '../../classes/patient.class';
import { StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authUserSubject = new BehaviorSubject<User | null>(null);
  public authUser$ = this.authUserSubject.asObservable();
  private patientSubject = new BehaviorSubject<Patient | null>(null);
  public patient$ = this.patientSubject.asObservable();
  authSubscription?: Unsubscribe;

  private auth = inject(Auth);
  private db = inject(DatabaseService);
  private storage = inject(StorageService);

  constructor() {
    this.authSubscription = this.auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        this.authUserSubject.next(authUser);
        this.loadPatientData(authUser.uid);
      } else {
        this.authUserSubject.next(null);
        this.patientSubject.next(null);
      }
    });
  }

  register(
    name: string,
    lastName: string,
    email: string,
    password: string,
    age: string,
    dni: string,
    healthCareSystem: string,
    userType: string,
    profilePicture: Blob,
    coverPicture: Blob
  ): Observable<void> {
    return this.db.checkDNIExists(dni).pipe(
      switchMap((exists) => {
        if (exists) {
          return throwError(() => ({
            message: 'Ya existe una cuenta con ese DNI.',
          }));
        }

        // Crear la cuenta con correo y contraseña
        return from(
          createUserWithEmailAndPassword(this.auth, email, password)
        ).pipe(
          switchMap((userCredential) => {
            const uid = userCredential.user.uid;

            // Subir las imágenes de perfil y portada por separado
            const profileUpload$ = this.storage.uploadProfilePicture(
              uid,
              profilePicture
            );
            const coverUpload$ = this.storage.uploadCoverPicture(
              uid,
              coverPicture
            );

            return forkJoin({
              profileUrl: profileUpload$,
              coverUrl: coverUpload$,
            }).pipe(
              switchMap(({ profileUrl, coverUrl }) => {
                // Crear objeto usuario con URLs de imágenes
                const user: Partial<Patient> = {
                  name,
                  lastName,
                  age,
                  dni,
                  healthCareSystem,
                  profilePicture: profileUrl,
                  coverPicture: coverUrl,
                  userType,
                };

                // Guardar el usuario en la base de datos
                return this.db.addPatient(user, uid).pipe(
                  switchMap(() => {
                    // Enviar correo de verificación
                    if (this.auth.currentUser) {
                      return from(sendEmailVerification(this.auth.currentUser));
                    } else {
                      return throwError(() => ({
                        message:
                          'Error al obtener el usuario actual para enviar el correo de verificación.',
                      }));
                    }
                  })
                );
              })
            );
          })
        );
      }),
      catchError((error) => {
        console.error('Error en el registro:', error);
        return throwError(() => ({
          message: error.message || 'Ocurrió un error al registrar el usuario.',
        }));
      })
    );
  }

  login(email: string, password: string): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  checkEmailVerification(): Observable<boolean> {
    const authUser = this.auth.currentUser;
    if (authUser) {
      return from(authUser.reload()).pipe(map(() => authUser.emailVerified));
    } else {
      return of(false);
    }
  }

  private loadPatientData(uid: string): void {
    this.db.getPatientData(uid).subscribe((patientData) => {
      if (patientData) {
        const fullPatient = new Patient(
          uid,
          patientData.name,
          patientData.lastName,
          this.authUserSubject.getValue()?.email ?? '', // Obtiene el email desde el observable
          patientData.age,
          patientData.dni,
          patientData.healthCareSystem,
          patientData.profilePicture,
          patientData.coverPicture,
          patientData.userType
        );
        this.patientSubject.next(fullPatient); // Actualiza los datos completos del usuario
      } else {
        this.patientSubject.next(null);
      }
    });
  }

  logOut() {
    this.auth.signOut();
  }
}

import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  combineLatest,
  forkJoin,
  from,
  map,
  Observable,
  of,
  switchMap,
  throwError,
} from 'rxjs';
import { DatabaseService } from '../database/database.service';
import { StorageService } from '../storage/storage.service';
import { Patient } from '../../classes/patient.class';
import { Specialist } from '../../classes/specialist.class';
import { Admin } from '../../classes/admin.class';
import { UserTypes } from './../../models/user-types';
import { environment } from '../../../environments/environment';
import { LoadingService } from '../loading/loading.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authUserSubject = new BehaviorSubject<User | null>(null);
  public authUser$ = this.authUserSubject.asObservable();
  private userSubject = new BehaviorSubject<UserTypes | null>(null);
  public user$ = this.userSubject.asObservable();
  private apiKey = environment.firebaseConfig.apiKey;
  authSubscription?: Unsubscribe;

  private auth = inject(Auth);
  private db = inject(DatabaseService);
  private storage = inject(StorageService);
  private http = inject(HttpClient);
  private loadingService = inject(LoadingService);

  constructor() {
    this.authSubscription = this.auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        this.authUserSubject.next(authUser);
        this.loadUserData(authUser.uid);
      } else {
        this.authUserSubject.next(null);
        this.userSubject.next(null);
        this.loadingService.stopLoading(); // Deja de cargar si no hay usuario
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
                return this.db.addUser(user, uid).pipe(
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

  registerSpecialist(
    name: string,
    lastName: string,
    email: string,
    password: string,
    age: string,
    dni: string,
    specialty: string[],
    userType: string,
    profilePicture: Blob
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

            return forkJoin({
              profileUrl: profileUpload$,
            }).pipe(
              switchMap(({ profileUrl }) => {
                // Crear objeto usuario con URLs de imágenes
                const user: Partial<Specialist> = {
                  name,
                  lastName,
                  age,
                  dni,
                  specialty,
                  profilePicture: profileUrl,
                  accountConfirmed: false,
                  userType,
                };

                // Guardar el usuario en la base de datos
                return this.db.addUser(user, uid).pipe(
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

  registerAdmin(
    name: string,
    lastName: string,
    email: string,
    password: string,
    age: string,
    dni: string,
    userType: string,
    profilePicture: Blob
  ): Observable<{ success: boolean; message: string }> {
    return this.db.checkDNIExists(dni).pipe(
      switchMap((exists) => {
        if (exists) {
          return throwError(() => ({
            success: false,
            message: 'Ya existe una cuenta con ese DNI.',
          }));
        }

        // Crear usuario sin iniciar sesión
        const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${this.apiKey}`;
        return this.http
          .post<{ localId: string }>(url, {
            email,
            password,
            returnSecureToken: false,
          })
          .pipe(
            switchMap(({ localId }) =>
              this.storage.uploadProfilePicture(localId, profilePicture).pipe(
                switchMap((profileUrl) => {
                  const user: Partial<Admin> = {
                    name,
                    lastName,
                    age,
                    dni,
                    profilePicture: profileUrl,
                    userType,
                  };

                  return this.db.addUser(user, localId).pipe(
                    map(() => ({
                      success: true,
                      message: 'Administrador creado correctamente.',
                    }))
                  );
                })
              )
            )
          );
      }),
      catchError((error) => {
        console.error('Error en el registro:', error);
        return throwError(() => ({
          success: false,
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

  private loadUserData(uid: string): void {
    this.loadingService.startLoading();
    this.db.getUserData(uid).subscribe(
      (userData) => {
        if (userData) {
          let user: UserTypes;

          if (userData instanceof Patient) {
            user = new Patient(
              uid,
              userData.name,
              userData.lastName,
              this.authUserSubject.getValue()?.email ?? '',
              userData.age,
              userData.dni,
              userData.healthCareSystem,
              userData.profilePicture,
              userData.coverPicture,
              userData.userType
            );
          } else if (userData instanceof Specialist) {
            user = new Specialist(
              uid,
              userData.name,
              userData.lastName,
              this.authUserSubject.getValue()?.email ?? '',
              userData.age,
              userData.dni,
              userData.specialty, // Propiedad específica de Specialist
              userData.profilePicture,
              userData.accountConfirmed,
              userData.workDays,
              userData.workHours,
              userData.userType
            );
          } else if (userData instanceof Admin) {
            user = new Admin(
              uid,
              userData.name,
              userData.lastName,
              this.authUserSubject.getValue()?.email ?? '',
              userData.age,
              userData.dni,
              userData.profilePicture,
              userData.userType
            );
          } else {
            user = null;
          }
          this.userSubject.next(user);
        } else {
          this.userSubject.next(null);
        }
        this.loadingService.stopLoading();
      },
      (error) => {
        console.error('Error al cargar los datos del usuario:', error);
        this.userSubject.next(null);
        this.loadingService.stopLoading(); // Detener la carga en caso de error
      }
    );
  }

  logOut() {
    this.auth.signOut();
  }
}

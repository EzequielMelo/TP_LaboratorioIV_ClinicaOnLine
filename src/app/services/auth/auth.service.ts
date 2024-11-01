import { inject, Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import {
  catchError,
  forkJoin,
  from,
  Observable,
  switchMap,
  throwError,
} from 'rxjs';
import { DatabaseService } from '../database/database.service';
import { Patient } from '../../classes/patient.class';
import { StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);
  private db = inject(DatabaseService);
  private storage = inject(StorageService);

  constructor() {}

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

            // Ejecutar ambas subidas en paralelo y obtener URLs
            return forkJoin({
              profileUrl: profileUpload$,
              coverUrl: coverUpload$,
            }).pipe(
              switchMap(({ profileUrl, coverUrl }) => {
                console.log(profileUrl);
                console.log(coverUrl);
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

                return this.db.addPatient(user, uid);
              })
            );
          })
        );
      }),
      catchError((error) => {
        console.error('Error en el registro:', error); // Mostrar el error en la consola para depuración
        return throwError(() => ({
          message: error.message || 'Ocurrió un error al registrar el usuario.', // Usa el mensaje de error real o un mensaje genérico
        }));
      })
    );
  }
}

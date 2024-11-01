import { inject, Injectable } from '@angular/core';
import {
  Storage,
  getDownloadURL,
  ref,
  uploadBytes,
} from '@angular/fire/storage';
import { from, Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private storage = inject(Storage);

  constructor() {}

  uploadProfilePicture(uid: string, profilePicture: Blob): Observable<string> {
    const profileRef = ref(this.storage, `users/${uid}/profilePicture.jpg`);
    return from(uploadBytes(profileRef, profilePicture)).pipe(
      switchMap(() => getDownloadURL(profileRef))
    );
  }

  uploadCoverPicture(uid: string, coverPicture: Blob): Observable<string> {
    const coverRef = ref(this.storage, `users/${uid}/coverPicture.jpg`);
    return from(uploadBytes(coverRef, coverPicture)).pipe(
      switchMap(() => getDownloadURL(coverRef))
    );
  }
}

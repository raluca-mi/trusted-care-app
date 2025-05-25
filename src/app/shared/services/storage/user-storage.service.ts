import { inject, Injectable } from '@angular/core';
import {
  deleteObject,
  getDownloadURL,
  ref,
  Storage,
  uploadBytes,
} from '@angular/fire/storage';
import { catchError, from, Observable, of, switchMap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserStorageService {
  private storage: Storage = inject(Storage);
  constructor() {}

  uploadProfilePicture(file: File, userId: string): Observable<string> {
    const timestamp = Date.now();
    const safeFileNamePart = file.name
      .split('.')[0]
      .replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileExtension = file.name.split('.').pop();
    const fileName = `${safeFileNamePart}_${timestamp}.${fileExtension}`;
    const filePath = `profile_pictures/${userId}/${fileName}`;
    const storageRef = ref(this.storage, filePath);

    return from(uploadBytes(storageRef, file)).pipe(
      switchMap(() => from(getDownloadURL(storageRef))),
      catchError((error) => {
        return throwError(
          () => new Error('Failed to upload profile picture:', error)
        );
      })
    );
  }

  deleteProfilePicture(imageUrl: string | null | undefined): Observable<void> {
    if (!imageUrl) {
      return of(undefined);
    }

    try {
      const imageRef = ref(this.storage, imageUrl);
      return from(deleteObject(imageRef)).pipe(
        catchError(() => {
          return of(undefined);
        })
      );
    } catch (error) {
      return throwError(
        () => new Error('Invalid image URL for deletion.', error)
      );
    }
  }
}

import { Injectable, inject } from '@angular/core';
import { Firestore, doc, docData, setDoc } from '@angular/fire/firestore';

import { Observable, from } from 'rxjs';
import { UserInterface } from '../../../auth/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  private firestore: Firestore = inject(Firestore);

  getUserProfileById(uid: string): Observable<UserInterface | null> {
    const userDocRef = doc(this.firestore, `users/${uid}`);
    return docData(userDocRef, {
      idField: 'uid',
    }) as Observable<UserInterface | null>;
  }

  createUserProfile(userData: UserInterface): Observable<void> {
    const userDocRef = doc(this.firestore, `users/${userData.uid}`);
    return from(setDoc(userDocRef, userData));
  }
}

import { Injectable, inject } from '@angular/core';
import { Firestore, doc, docData, setDoc } from '@angular/fire/firestore';

import {
  collection,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { Observable, from, map } from 'rxjs';
import { AssistanceType } from '../../../auth/enums/assistance-type.enum';
import { UserType } from '../../../auth/enums/user-type.enum';
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

  updateUserProfile(
    uid: string,
    updatedUserData: Partial<UserInterface>
  ): Observable<void> {
    const userDocRef = doc(this.firestore, `users/${uid}`);
    return from(updateDoc(userDocRef, updatedUserData));
  }

  getCareAssistantsByAssistanceType(
    assistanceType: AssistanceType
  ): Observable<UserInterface[]> {
    const usersCollectionRef = collection(this.firestore, 'users');
    const q = query(
      usersCollectionRef,
      where('userType', '==', UserType.CareAssistant),
      where('assistanceType', '==', assistanceType)
    );

    return from(getDocs(q)).pipe(
      map((querySnapshot) => {
        const assistants: UserInterface[] = [];
        querySnapshot.forEach((doc) => {
          assistants.push({ uid: doc.id, ...doc.data() } as UserInterface);
        });

        return assistants;
      })
    );
  }
}

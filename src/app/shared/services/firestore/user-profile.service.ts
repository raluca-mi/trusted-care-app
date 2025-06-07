import { Injectable, inject } from '@angular/core';
import { Firestore, doc, docData, setDoc } from '@angular/fire/firestore';

import {
  collection,
  documentId,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { Observable, catchError, forkJoin, from, map, of } from 'rxjs';
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

  getUserProfilesByIds(uids: string[]): Observable<UserInterface[]> {
    if (!uids || uids.length === 0) {
      return of([]);
    }

    const usersCollectionRef = collection(this.firestore, 'users');
    const batchSize = 30;
    const batches: string[][] = [];

    for (let i = 0; i < uids.length; i += batchSize) {
      batches.push(uids.slice(i, i + batchSize));
    }

    if (batches.length === 0) {
      return of([]);
    }

    const batchObservables: Observable<UserInterface[]>[] = batches.map(
      (batchUids) => {
        if (batchUids.length === 0) {
          return of([]);
        }
        const q = query(
          usersCollectionRef,
          where(documentId(), 'in', batchUids)
        );
        return from(getDocs(q)).pipe(
          map((querySnapshot) => {
            const users: UserInterface[] = [];
            querySnapshot.forEach((docSnap) => {
              if (docSnap.exists()) {
                users.push({
                  uid: docSnap.id,
                  ...docSnap.data(),
                } as UserInterface);
              }
            });
            return users;
          })
        );
      }
    );

    return forkJoin(batchObservables).pipe(
      map((arrayOfUserArrays) => {
        const allUsers = arrayOfUserArrays.reduce(
          (acc, userArray) => acc.concat(userArray),
          []
        );
        return allUsers;
      }),
      catchError((_) => {
        return of([]);
      })
    );
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
      where('assistanceType', '==', assistanceType),
      where('isVerified', '==', true),
      orderBy('createdAt', 'desc')
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

  getResearchers(): Observable<UserInterface[]> {
    const usersCollectionRef = collection(this.firestore, 'users');
    const q = query(
      usersCollectionRef,
      where('userType', '==', UserType.Researcher),
      orderBy('createdAt', 'desc')
    );

    return from(getDocs(q)).pipe(
      map((querySnapshot) => {
        const researchers: UserInterface[] = [];
        querySnapshot.forEach((doc) => {
          researchers.push({ uid: doc.id, ...doc.data() } as UserInterface);
        });
        return researchers;
      }),
      catchError((error) => {
        return of([]);
      })
    );
  }

  updateFavouriteAssistants(
    userId: string,
    favouriteAssistantUids: string[]
  ): Observable<void> {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    return from(
      updateDoc(userDocRef, { favouriteAssistantUids: favouriteAssistantUids })
    );
  }
}

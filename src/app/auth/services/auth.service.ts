import { Injectable, inject, signal } from '@angular/core';
import {
  Auth,
  AuthError,
  GoogleAuthProvider,
  UserCredential,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  user,
} from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import {
  AUTH_ERROR_MAP,
  AUTH_GENERIC_ERROR_MESSAGE,
  USER_DATA_NOT_AVAILABLE_MESSAGE,
} from '../constants/auth-message.constants';
import { UserAuth } from '../models/user-auth.model';
import { UserType } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private firebaseAuth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);

  user$ = user(this.firebaseAuth);
  currentUser = signal<UserAuth | null | undefined>(undefined);

  async registerWithEmailPassword(
    email: string,
    password: string,
    userType: UserType,
    firstName: string,
    lastName: string
  ): Promise<UserCredential> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.firebaseAuth,
        email,
        password
      );
      const user = userCredential.user;

      if (user) {
        await this.createUserProfileDocument(
          user.uid,
          email,
          userType,
          firstName,
          lastName
        );
      } else {
        throw new Error(USER_DATA_NOT_AVAILABLE_MESSAGE);
      }

      return userCredential;
    } catch (error) {
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.firebaseAuth, email);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }

  private async createUserProfileDocument(
    userId: string,
    email: string,
    userType: string,
    firstName: string,
    lastName: string
  ): Promise<void> {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    const userData = {
      uid: userId,
      email: email,
      userType: userType,
      firstName: firstName,
      lastName: lastName,
      displayName: `${firstName} ${lastName}`,
      createdAt: new Date(),
      profileComplete: userType === UserType.Researcher,
    };

    try {
      await setDoc(userDocRef, userData);
    } catch (error) {
      console.error(
        'Error creating user profile document in Firestore:',
        error
      );
      throw new Error('Failed to create user profile in database.');
    }
  }

  async loginWithEmailPassword(
    email: string,
    password: string
  ): Promise<UserCredential> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.firebaseAuth,
        email,
        password
      );
      return userCredential;
    } catch (error) {
      throw error;
    }
  }

  async signInWithGoogle(): Promise<UserCredential> {
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(this.firebaseAuth, provider);
      // **IMPORTANT NOTE for later:**
      // If a user signs in with Google for the *first time*, their profile
      // document might not exist in Firestore. We need a strategy later to:
      // 1. Check if the Firestore doc `users/{uid}` exists after Google Sign-in.
      // 2. If not, potentially prompt them for their User Type ('researcher'/'care_assistant')
      //    and THEN create the Firestore document.
      // For now, this method just handles the login/linking part.
      return userCredential;
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.firebaseAuth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  getFirebaseAuthErrorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const errorCode = (error as AuthError).code;
      const specificMessage = AUTH_ERROR_MAP[errorCode];
      return specificMessage || AUTH_GENERIC_ERROR_MESSAGE;
    } else {
      console.error('Non-Auth Error encountered:', error);
      return AUTH_GENERIC_ERROR_MESSAGE;
    }
  }
}

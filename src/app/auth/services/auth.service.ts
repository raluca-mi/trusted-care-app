import { Injectable, inject } from '@angular/core';
import { Auth, AuthError, GoogleAuthProvider, UserCredential, authState, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut } from '@angular/fire/auth'; // Import Auth functions
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { UserType } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private firebaseAuth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);

  readonly authState$: Observable<any | null> = authState(this.firebaseAuth);

  async registerWithEmailPassword(email: string, password: string, userType: UserType, firstName: string, lastName: string): Promise<UserCredential> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.firebaseAuth, email, password);
      const user = userCredential.user;

      if (user) {
        await this.createUserProfileDocument(user.uid, email, userType, firstName, lastName);
      } else {
        throw new Error("User creation failed, user data not available.");
      }

      return userCredential;
    } catch (error) {
      throw error;
    }
  }

  private async createUserProfileDocument(userId: string, email: string, userType: string, firstName: string, lastName: string): Promise<void> {
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
      console.error("Error creating user profile document in Firestore:", error);

      throw new Error("Failed to create user profile in database.");
    }
  }

  async loginWithEmailPassword(email: string, password: string): Promise<UserCredential> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.firebaseAuth, email, password);
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
      console.error("Error signing out:", error);
      throw error;
    }
  }

  getFirebaseAuthErrorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const authError = error as AuthError;
      switch (authError.code) {
        case 'auth/invalid-email':
          return 'Please enter a valid email address.';
        case 'auth/user-disabled':
          return 'This user account has been disabled.';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          return 'Invalid email or password. Please try again.';
        case 'auth/email-already-in-use':
          return 'This email address is already registered.';
        case 'auth/weak-password':
          return 'The password is too weak. Please choose a stronger password.';
        case 'auth/operation-not-allowed':
          return 'Email/Password authentication is not enabled.';
        default:
          console.error("Unhandled Auth Error:", authError);
          return 'An unexpected authentication error occurred. Please try again.';
      }
    }
    console.error("Unknown Auth Error:", error);
    return 'An unexpected error occurred. Please try again.';
  }
}



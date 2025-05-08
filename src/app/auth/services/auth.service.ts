import { Injectable, computed, inject, signal } from '@angular/core';
import {
  Auth,
  AuthError,
  UserCredential,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  user,
} from '@angular/fire/auth';
import { firstValueFrom } from 'rxjs';
import { UserProfileService } from '../../shared/services/firestore/user-profile.service';
import { LoggerService } from '../../shared/services/logger.service';
import {
  AUTH_ERROR_MAP,
  AUTH_GENERIC_ERROR_MESSAGE,
  USER_DATA_NOT_AVAILABLE_MESSAGE,
} from '../constants/auth-message.constants';
import { UserInterface, UserType } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private firebaseAuth: Auth = inject(Auth);
  private userProfileService = inject(UserProfileService);
  private logger = inject(LoggerService);

  user$ = user(this.firebaseAuth);
  currentUser = signal<UserInterface | null | undefined>(undefined);

  public readonly isLoggedIn = computed(() => {
    const user = this.currentUser();
    return user !== null && user !== undefined;
  });
  public readonly isLoggedOut = computed(() => {
    const user = this.currentUser();
    return user === null && user !== undefined;
  });

  async register(
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
        const initialUserData: UserInterface = {
          uid: user.uid,
          email: email.toLowerCase(),
          userType: userType,
          firstName: firstName,
          lastName: lastName,
          displayName: `${firstName} ${lastName}`,
          createdAt: new Date(),
          profileComplete: userType === UserType.Researcher,
        };

        await firstValueFrom(
          this.userProfileService.createUserProfile(initialUserData)
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
      this.logger.error('Error sending password reset email:', error);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<UserCredential> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.firebaseAuth,
        email,
        password
      );
      return userCredential;
    } catch (error) {
      this.logger.error('Error signing in:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.firebaseAuth);
    } catch (error) {
      this.logger.error('Error signing out:', error);
      throw error;
    }
  }

  getFirebaseAuthErrorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const errorCode = (error as AuthError).code;
      const specificMessage = AUTH_ERROR_MAP[errorCode];
      return specificMessage || AUTH_GENERIC_ERROR_MESSAGE;
    } else {
      this.logger.error('Non-Auth Error encountered:', error);
      return AUTH_GENERIC_ERROR_MESSAGE;
    }
  }
}

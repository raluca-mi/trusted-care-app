import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  inject,
  OnInit,
  signal,
  Signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  debounceTime,
  distinctUntilChanged,
  firstValueFrom,
  Subscription,
} from 'rxjs';
import { UserInterface, UserType } from '../../../auth/models/user.model';
import { AuthService } from '../../../auth/services/auth.service';
import { UserProfileService } from '../../../shared/services/firestore/user-profile.service';
import { LoggerService } from '../../../shared/services/logger.service';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'user-settings',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './user-settings.component.html',
  styleUrl: './user-settings.component.scss',
})
export class UserSettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private userProfileService = inject(UserProfileService);
  private notificationService = inject(NotificationService);
  private logger = inject(LoggerService);

  readonly currentUserProfile: Signal<UserInterface | null | undefined> =
    this.authService.currentUser;
  isSaving = signal(false);
  settingsForm!: FormGroup;
  private initialFormValues: any = {};

  hasActualChanges = signal(false);
  private formChangesSubscription: Subscription | null = null;

  constructor() {
    effect(() => {
      const profile = this.currentUserProfile();
      this.logger.log(
        '[UserSettings Effect] currentUserProfile signal changed:',
        profile
      );
      if (profile) {
        if (this.settingsForm) {
          this.patchForm(profile);
        }
      } else if (profile === null) {
        if (this.settingsForm) {
          this.settingsForm.reset();
          this.settingsForm.disable();
          this.hasActualChanges.set(false);
        }
      }
    });
  }

  ngOnInit(): void {
    this.initializeForm();
    const initialProfile = this.currentUserProfile();
    if (initialProfile) {
      this.patchForm(initialProfile);
    } else if (initialProfile === undefined) {
      this.logger.log('[UserSettings OnInit] Waiting for profile data...');
    } else {
      this.settingsForm.disable();
    }
  }

  ngOnDestroy(): void {
    this.formChangesSubscription?.unsubscribe();
  }

  private trackFormChanges(): void {
    this.formChangesSubscription = this.settingsForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        const currentValues = this.settingsForm.getRawValue();
        const hasChanges =
          JSON.stringify(currentValues) !==
          JSON.stringify(this.initialFormValues);
        this.hasActualChanges.set(hasChanges);
      });
  }

  private initializeForm(): void {
    this.settingsForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
    });

    this.initialFormValues = this.settingsForm.getRawValue();
    this.trackFormChanges();
  }

  private patchForm(profile: UserInterface): void {
    this.settingsForm.patchValue({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
    });

    this.initialFormValues = this.settingsForm.getRawValue();
    this.hasActualChanges.set(false);
  }

  async saveSettings(): Promise<void> {
    const currentProfile = this.currentUserProfile();
    if (
      !currentProfile ||
      this.settingsForm.invalid ||
      !this.hasActualChanges()
    ) {
      this.logger.log(
        'Save aborted. Profile missing, form invalid, or no actual changes.'
      );
      if (this.settingsForm.dirty && !this.hasActualChanges()) {
        this.settingsForm.markAsPristine();
      }
      return;
    }

    this.isSaving.set(true);
    const formValues = this.settingsForm.value;
    const updatedData: Partial<UserInterface> = {
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      displayName: `${formValues.firstName} ${formValues.lastName}`,
    };

    try {
      await firstValueFrom(
        this.userProfileService.updateUserProfile(
          currentProfile.uid,
          updatedData
        )
      );

      this.authService.currentUser.update((profile) => {
        if (!profile) return null;
        return { ...profile, ...updatedData };
      });

      this.initialFormValues = { ...this.settingsForm.value };
      this.settingsForm.markAsPristine();
      this.hasActualChanges.set(false);
      this.notificationService.showSuccess('Profile updated successfully!');
      this.logger.log('Profile update successful:', updatedData);
    } catch (error) {
      this.logger.error('Error saving profile settings:', error);
      this.notificationService.showError(
        'Failed to update profile. Please try again.'
      );
    } finally {
      this.isSaving.set(false);
    }
  }

  changePassword(): void {
    this.logger.log('Change password clicked');

    const email = this.currentUserProfile()?.email;
    if (email) {
      this.authService
        .sendPasswordResetEmail(email)
        .then(() => {
          this.notificationService.showInfo(
            'Password reset email sent. Please check your inbox.'
          );
        })
        .catch((error) => {
          this.logger.error(
            'Failed to send password reset email from settings:',
            error
          );
          this.notificationService.showError(
            this.authService.getFirebaseAuthErrorMessage(error)
          );
        });
    } else {
      this.notificationService.showError(
        'Cannot initiate password reset: Email not found.'
      );
    }
  }

  deleteAccount(): void {
    this.logger.warn('Delete account clicked - requires implementation');
    this.notificationService.showWarning(
      'Account deletion not yet implemented.'
    );
  }

  get UserTypeEnum() {
    return UserType;
  }
}

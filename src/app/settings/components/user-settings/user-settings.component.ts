import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  ElementRef,
  inject,
  OnInit,
  signal,
  Signal,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import {
  debounceTime,
  distinctUntilChanged,
  firstValueFrom,
  Subscription,
} from 'rxjs';
import {
  AssistanceType,
  GenderType,
  UserInterface,
  UserType,
} from '../../../auth/models/user.model';
import { AuthService } from '../../../auth/services/auth.service';
import { UserProfileService } from '../../../shared/services/firestore/user-profile.service';
import { LoggerService } from '../../../shared/services/logger.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { UserStorageService } from '../../../shared/services/storage/user-storage.service';
import { USER_SETTINGS_TEXT } from '../../constants/user-settings.constants';

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
    MatSelectModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatStepperModule,
  ],
  templateUrl: './user-settings.component.html',
  styleUrl: './user-settings.component.scss',
})
export class UserSettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private userProfileService = inject(UserProfileService);
  private userStorageService = inject(UserStorageService);
  private notificationService = inject(NotificationService);
  private logger = inject(LoggerService);

  readonly currentUserProfile: Signal<UserInterface | null | undefined> =
    this.authService.currentUser;
  isSaving = signal(false);
  isProcessingPicture = signal(false);
  settingsForm!: FormGroup;
  private initialFormValues: any = {};
  private initialProfilePictureUrl: string | null | undefined = null;

  hasActualChanges = signal(false);
  private formChangesSubscription: Subscription | null = null;

  text = USER_SETTINGS_TEXT;

  @ViewChild('profilePictureInput')
  
  profilePictureInput!: ElementRef<HTMLInputElement>;
  selectedImagePreviewUrl: string | ArrayBuffer | null = null;
  private selectedImageFile: File | null = null;

  readonly genderOptions = Object.values(GenderType);
  readonly allAssistanceTypes: AssistanceType[] = [
    'Child Care',
    'Elderly Care',
    'House Keeping',
    'Pets Care',
    'Special Needs Care',
    'Other',
  ];
  readonly allAvailabilityOptions = [
    'Weekdays',
    'Weekends',
    'Mornings',
    'Afternoons',
    'Evenings',
    'Overnights',
    'Flexible',
  ];

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
        this.selectedImagePreviewUrl = profile.profilePictureUrl || null;
        this.initialProfilePictureUrl = profile.profilePictureUrl;
        this.selectedImageFile = null;
      } else if (profile === null) {
        if (this.settingsForm) {
          this.settingsForm.reset();
          this.settingsForm.disable();
          this.hasActualChanges.set(false);
        }
        this.selectedImagePreviewUrl = null;
        this.initialProfilePictureUrl = null;
        this.selectedImageFile = null;
      }
    });
  }

  ngOnInit(): void {
    this.initializeForm();
    const initialProfile = this.currentUserProfile();
    if (initialProfile) {
      this.patchForm(initialProfile);
      this.selectedImagePreviewUrl = initialProfile.profilePictureUrl || null;
      this.initialProfilePictureUrl = initialProfile.profilePictureUrl;
    } else if (initialProfile === undefined) {
      this.logger.log('[UserSettings OnInit] Waiting for profile data...');
    } else {
      this.settingsForm.disable();
      this.selectedImagePreviewUrl = null;
      this.initialProfilePictureUrl = null;
    }
  }

  ngOnDestroy(): void {
    this.formChangesSubscription?.unsubscribe();
  }

  private trackFormChanges(): void {
    this.formChangesSubscription?.unsubscribe();
    this.formChangesSubscription = this.settingsForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        )
      )
      .subscribe(() => {
        const currentValues = this.settingsForm.getRawValue();
        const formValuesChanged =
          JSON.stringify(currentValues) !==
          JSON.stringify(this.initialFormValues);

        this.hasActualChanges.set(
          formValuesChanged || !!this.selectedImageFile
        );
        this.logger.log(
          'Form value changed, hasActualChanges set to:',
          this.hasActualChanges()
        );
      });
  }

  private initializeForm(): void {
    this.settingsForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phoneNumber: [
        '',
        [Validators.pattern('^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\\s\\./0-9]*$')],
      ],
      location: [''],
      bio: ['', [Validators.maxLength(1500)]],
      dateOfBirth: [null],
      gender: [null],
      experienceYears: [null, [Validators.min(0), Validators.max(70)]],
      hourlyRate: [null, [Validators.min(0)]],
      assistanceTypes: [[]],
      availability: [[]],
      additionalDetails: this.fb.group({
        nonSmoker: [false],
        hasOwnTransportation: [false],
        willingToTravelKm: [null, [Validators.min(0), Validators.max(500)]],
      }),
    });
    this.initialFormValues = this.settingsForm.getRawValue();
    this.settingsForm.disable();
    this.trackFormChanges();
  }

  private patchForm(profile: UserInterface): void {
    const patchData = {
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      phoneNumber: profile.phoneNumber || '',
      location: profile.location || '',
      bio: profile.bio || '',
      dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth) : null,
      gender: profile.gender || null,
      experienceYears: profile.experienceYears ?? null,
      hourlyRate: profile.hourlyRate ?? null,
      assistanceTypes: profile.assistanceTypes || [],
      availability: profile.availability || [],
      additionalDetails: {
        nonSmoker: profile.additionalDetails?.nonSmoker ?? false,
        hasOwnTransportation:
          profile.additionalDetails?.hasOwnTransportation ?? false,
        willingToTravelKm: profile.additionalDetails?.willingToTravelKm ?? null,
      },
    };
    this.settingsForm.patchValue(patchData, { emitEvent: false });
    this.initialFormValues = this.settingsForm.getRawValue();
    this.selectedImagePreviewUrl = profile.profilePictureUrl || null;
    this.initialProfilePictureUrl = profile.profilePictureUrl;
    this.selectedImageFile = null;
    this.settingsForm.enable();
    this.settingsForm.markAsPristine();
    this.hasActualChanges.set(false);
    this.logger.log(
      'Settings form patched. Initial values stored:',
      this.initialFormValues
    );
  }

  triggerProfilePictureUpload(): void {
    if (this.isProcessingPicture() || this.isSaving()) return;
    this.profilePictureInput.nativeElement.click();
  }

  onProfilePictureSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;

    if (fileList && fileList[0]) {
      const file = fileList[0];
      if (!file.type.startsWith('image/')) {
        this.notificationService.showError(
          'Invalid file type. Please select an image.'
        );
        element.value = '';
        return;
      }
      this.selectedImageFile = file;
      const reader = new FileReader();
      reader.onload = (e) =>
        (this.selectedImagePreviewUrl = e.target?.result || null);
      reader.readAsDataURL(file);
      this.hasActualChanges.set(true);
      this.notificationService.showInfo(this.text.newImageSelectedNotification);
      element.value = '';
    }
  }

  async saveSettings(): Promise<void> {
    const currentProfile = this.currentUserProfile();
    if (!currentProfile) {
      this.logger.error('Save aborted: Current profile is not available.');
      this.notificationService.showError(
        this.text.cannotSaveSettingsUserDataMissingNotification
      );
      return;
    }
    if (this.settingsForm.invalid) {
      this.logger.log('Save aborted: Form is invalid.');
      this.settingsForm.markAllAsTouched();
      this.notificationService.showError(
        this.text.pleaseCorrentErrorsInFormNotification
      );
      return;
    }
    if (!this.hasActualChanges() && !this.selectedImageFile) {
      this.logger.log('Save aborted: No actual changes to save.');
      this.notificationService.showInfo(this.text.noChangesToSaveNotification);
      return;
    }

    this.isSaving.set(true);
    let newImageDownloadURL: string | null | undefined =
      this.initialProfilePictureUrl;

    try {
      if (this.selectedImageFile) {
        this.isProcessingPicture.set(true);
        this.notificationService.showInfo(
          this.text.uploadingNewProfilePictureNotification
        );

        if (this.initialProfilePictureUrl) {
          this.logger.log(
            'Attempting to delete old profile picture:',
            this.initialProfilePictureUrl
          );
          try {
            await firstValueFrom(
              this.userStorageService.deleteProfilePicture(
                this.initialProfilePictureUrl
              )
            );
            this.logger.log('Old profile picture deleted successfully.');
          } catch (deleteError) {
            this.logger.warn(
              'Could not delete old profile picture, or it did not exist. Proceeding with upload.',
              deleteError
            );
          }
        }

        newImageDownloadURL = await firstValueFrom(
          this.userStorageService.uploadProfilePicture(
            this.selectedImageFile,
            currentProfile.uid
          )
        );
        this.logger.log(
          'New profile picture uploaded. URL:',
          newImageDownloadURL
        );
        this.isProcessingPicture.set(false);
      }

      const formValues = this.settingsForm.value;
      const updatedData: Partial<UserInterface> = {
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        displayName: `${formValues.firstName} ${formValues.lastName}`,
      };
      if (typeof newImageDownloadURL === 'string') {
        updatedData.profilePictureUrl = newImageDownloadURL;
      }

      if (currentProfile.userType === UserType.CareAssistant) {
        updatedData.phoneNumber = formValues.phoneNumber || null;
        updatedData.location = formValues.location || undefined;
        updatedData.bio = formValues.bio || undefined;
        updatedData.dateOfBirth = formValues.dateOfBirth
          ? new Date(formValues.dateOfBirth).toISOString().split('T')[0]
          : null;
        updatedData.gender = formValues.gender || null;
        updatedData.experienceYears =
          formValues.experienceYears === null
            ? undefined
            : Number(formValues.experienceYears);
        updatedData.hourlyRate =
          formValues.hourlyRate === null
            ? undefined
            : Number(formValues.hourlyRate);
        updatedData.assistanceTypes =
          formValues.assistanceTypes && formValues.assistanceTypes.length > 0
            ? formValues.assistanceTypes
            : null;
        updatedData.availability =
          formValues.availability && formValues.availability.length > 0
            ? formValues.availability
            : null;
        updatedData.additionalDetails = {
          nonSmoker: formValues.additionalDetails.nonSmoker,
          hasOwnTransportation:
            formValues.additionalDetails.hasOwnTransportation,
          willingToTravelKm:
            formValues.additionalDetails.willingToTravelKm === null
              ? undefined
              : Number(formValues.additionalDetails.willingToTravelKm),
        };
        updatedData.profileComplete = !!(
          (newImageDownloadURL || currentProfile.profilePictureUrl) &&
          formValues.phoneNumber &&
          formValues.experienceYears &&
          formValues.hourlyRate &&
          formValues.bio &&
          formValues.location &&
          formValues.dateOfBirth &&
          formValues.assistanceTypes?.length > 0 &&
          formValues.availability?.length > 0
        );
      }

      await firstValueFrom(
        this.userProfileService.updateUserProfile(
          currentProfile.uid,
          updatedData
        )
      );

      this.authService.currentUser.update((profile) => {
        if (!profile) return null;
        return { ...profile, ...updatedData } as UserInterface;
      });

      this.initialFormValues = { ...this.settingsForm.getRawValue() };
      this.initialProfilePictureUrl = newImageDownloadURL;
      this.selectedImagePreviewUrl = newImageDownloadURL || null;
      this.selectedImageFile = null;

      this.settingsForm.markAsPristine();
      this.hasActualChanges.set(false);
      this.notificationService.showSuccess(
        this.text.profileUpdatedSuccessfullyNotification
      );
      this.logger.log('Profile update successful:', updatedData);
    } catch (error) {
      this.logger.error('Error saving profile settings:', error);
      this.notificationService.showError(
        this.text.profileUpdateFailedNotification
      );
    } finally {
      this.isSaving.set(false);
      this.isProcessingPicture.set(false);
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
            this.text.passwordResetEmailSentNotification
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
      this.notificationService.showError(this.text.emailNotFoundNotification);
    }
  }

  deleteAccount(): void {
    this.notificationService.showWarning(
      'Account deletion not yet implemented.'
    );
  }

  get UserTypeEnum() {
    return UserType;
  }
}

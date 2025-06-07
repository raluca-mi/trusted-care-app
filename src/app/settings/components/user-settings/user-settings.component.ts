import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  ElementRef,
  inject,
  OnDestroy,
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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GeoPoint } from 'firebase/firestore';
import {
  debounceTime,
  distinctUntilChanged,
  firstValueFrom,
  Subscription,
} from 'rxjs';
import { ASSISTANCE_TYPE_SKILLS } from '../../../auth/constants/assistance-type-skills.constants';
import { AssistanceType } from '../../../auth/enums/assistance-type.enum';
import { AvailabilityOption } from '../../../auth/enums/availability-option.enum';
import { Gender } from '../../../auth/enums/gender.enum';
import { Skill } from '../../../auth/enums/skill.enum';
import { UserType } from '../../../auth/enums/user-type.enum';
import { UserInterface } from '../../../auth/models/user.model';
import { AuthService } from '../../../auth/services/auth.service';
import { SelectLocationDialogComponent } from '../../../location/components/select-location-dialog/select-location-dialog.component';
import { SearchPlaceResult } from '../../../location/models/search-place-result.model';
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
    MatTooltipModule,
    MatDialogModule,
  ],
  templateUrl: './user-settings.component.html',
  styleUrl: './user-settings.component.scss',
})
export class UserSettingsComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private userProfileService = inject(UserProfileService);
  private userStorageService = inject(UserStorageService);
  private notificationService = inject(NotificationService);
  private logger = inject(LoggerService);
  private dialog = inject(MatDialog);

  @ViewChild('profilePictureInput')
  profilePictureInput!: ElementRef<HTMLInputElement>;

  readonly currentUserProfile: Signal<UserInterface | null | undefined> =
    this.authService.currentUser;
  isSaving = signal(false);
  isProcessingPicture = signal(false);
  settingsForm!: FormGroup;
  private initialFormValues: any = {};
  initialProfilePictureUrl: string | null | undefined = null;

  private initialPlace: SearchPlaceResult | undefined;

  hasActualChanges = signal(false);
  private formChangesSubscription: Subscription | null = null;

  selectedImagePreviewUrl: string | ArrayBuffer | null = null;
  private selectedImageFile: File | null = null;
  private pictureMarkedForRemoval = false;

  skillOptions: Skill[];
  private firstAssistanceTypeChange = true;

  text = USER_SETTINGS_TEXT;
  readonly genderOptions = Object.values(Gender);
  readonly assistanceTypes = Object.values(AssistanceType);
  readonly availabilityOptions = Object.values(AvailabilityOption);

  selectedPlace = signal<SearchPlaceResult | undefined>(undefined);

  constructor() {
    effect(() => {
      const profile = this.currentUserProfile();
      this.firstAssistanceTypeChange = true;
      if (profile) {
        if (this.settingsForm) {
          this.patchForm(profile);
        }
        this.selectedImagePreviewUrl = profile.profilePictureUrl || null;
        this.initialProfilePictureUrl = profile.profilePictureUrl;
        this.selectedImageFile = null;
        this.pictureMarkedForRemoval = false;

        this.setInitialPlace(profile);
      } else if (profile === null) {
        if (this.settingsForm) {
          this.settingsForm.reset();
          this.settingsForm.disable();
          this.hasActualChanges.set(false);
        }
        this.selectedImagePreviewUrl = null;
        this.initialProfilePictureUrl = null;
        this.initialPlace = null;
        this.selectedImageFile = null;
        this.pictureMarkedForRemoval = false;
        this.selectedPlace.set(undefined);
      }
    });

    effect(() => {
      if (this.selectedPlace()) {
        const locationChanged = this.isLocationChanged();

        if (this.settingsForm && locationChanged) {
          this.hasActualChanges.set(true);
        }
      }
    });
  }

  private setInitialPlace(profile: UserInterface) {
    if (profile.location && profile.coordinates) {
      this.initialPlace = {
        address: profile.location,
        formattedAddress: profile.location,
        coordinates: new google.maps.LatLng(
          profile.coordinates.latitude,
          profile.coordinates.longitude
        ),
      };

      this.selectedPlace.set(this.initialPlace);
    } else {
      this.selectedPlace.set(undefined);
    }
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

    this.settingsForm
      .get('assistanceType')
      ?.valueChanges.subscribe((selectedType: AssistanceType) => {
        this.skillOptions = ASSISTANCE_TYPE_SKILLS[selectedType] || [];
        if (!this.firstAssistanceTypeChange) {
          this.settingsForm.get('skills')?.setValue([]);
        }
        this.firstAssistanceTypeChange = false;
      });
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

        const locationChanged = this.isLocationChanged();

        this.hasActualChanges.set(
          formValuesChanged ||
            !!this.selectedImageFile ||
            this.pictureMarkedForRemoval ||
            locationChanged
        );
        this.logger.log(
          'Form value changed, hasActualChanges set to:',
          this.hasActualChanges()
        );
      });
  }

  private isLocationChanged(): boolean {
    let locationChanged = false;
    if (this.initialPlace && this.selectedPlace()) {
      locationChanged =
        this.selectedPlace().coordinates.lat() !=
          this.initialPlace.coordinates.lat() ||
        this.selectedPlace().coordinates.lng() !=
          this.initialPlace.coordinates.lng();
    } else if (
      (!this.initialPlace && this.selectedPlace()) ||
      (this.initialPlace && !this.selectedPlace())
    ) {
      locationChanged = true;
    }
    return locationChanged;
  }

  private initializeForm(): void {
    this.settingsForm = this.fb.group({
      // Step 1 Controls
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      profilePictureUrl: [''],

      // Step 2 Controls (Caregiver Details)
      experienceYears: [null, [Validators.min(0), Validators.max(70)]],
      hourlyRate: [null, [Validators.min(0)]],
      assistanceType: [],
      skills: [[]],
      availability: [[]],
      additionalDetails: this.fb.group({
        nonSmoker: [false],
        hasOwnTransportation: [false],
      }),

      // Step 3 Controls (Additional Details)
      phoneNumber: [
        '',
        [Validators.pattern('^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\\s\\./0-9]*$')],
      ],
      gender: [null],
      dateOfBirth: [null],
      bio: ['', [Validators.maxLength(1500)]],
    });
    this.initialFormValues = this.settingsForm.getRawValue();
    this.settingsForm.disable();
    this.trackFormChanges();
  }

  private patchForm(profile: UserInterface): void {
    const patchData = {
      firstName: profile.firstName || null,
      lastName: profile.lastName || null,
      profilePictureUrl: profile.profilePictureUrl || null,
      phoneNumber: profile.phoneNumber || null,
      bio: profile.bio || null,
      dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth) : null,
      gender: profile.gender || null,
      experienceYears: profile.experienceYears ?? null,
      hourlyRate: profile.hourlyRate ?? null,
      assistanceType: profile.assistanceType || null,
      skills: profile.skills || [],
      availability: profile.availability || [],
      additionalDetails: {
        nonSmoker: profile.additionalDetails?.nonSmoker ?? false,
        hasOwnTransportation:
          profile.additionalDetails?.hasOwnTransportation ?? false,
      },
    };
    this.settingsForm.patchValue(patchData, { emitEvent: false });
    this.initialFormValues = this.settingsForm.getRawValue();
    this.selectedImagePreviewUrl = profile.profilePictureUrl || null;
    this.initialProfilePictureUrl = profile.profilePictureUrl;
    this.selectedImageFile = null;
    this.pictureMarkedForRemoval = false;
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
          this.text.invalidFileTypeNotification
        );
        element.value = '';
        return;
      }
      const currentAuthUser = this.authService.currentUser();
      if (!currentAuthUser?.uid) {
        this.notificationService.showError(
          'User not identified. Cannot process picture.'
        );
        element.value = '';
        return;
      }
      this.selectedImageFile = file;
      const reader = new FileReader();
      reader.onload = (e) =>
        (this.selectedImagePreviewUrl = e.target?.result || null);
      reader.readAsDataURL(file);
      this.pictureMarkedForRemoval = false;
      this.hasActualChanges.set(true);
      this.notificationService.showInfo(this.text.newImageSelectedNotification);
      element.value = '';
    }
  }

  removeProfilePicture(): void {
    if (this.isProcessingPicture() || this.isSaving()) return;
    if (this.selectedImagePreviewUrl || this.initialProfilePictureUrl) {
      this.selectedImagePreviewUrl = null;
      this.selectedImageFile = null;
      this.pictureMarkedForRemoval = true;
      this.settingsForm.get('profilePictureUrl')?.setValue(null);
      this.hasActualChanges.set(true);
      this.notificationService.showInfo(
        this.text.pictureMarkedForRemovalNotification
      );
    } else {
      this.notificationService.showInfo('No profile picture to remove.');
    }
  }

  openSelectLocationModal() {
    const dialogRef = this.dialog.open(SelectLocationDialogComponent, {
      width: '2000px',
      height: '700px',
      data: { initialPlace: this.selectedPlace() },
    });

    dialogRef
      .afterClosed()
      .subscribe((result: SearchPlaceResult | undefined) => {
        if (result) {
          this.selectedPlace.set(result);
        }
      });
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
    if (!this.hasActualChanges()) {
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
              'Could not delete old profile picture. Proceeding with new upload.',
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
        this.settingsForm
          .get('profilePictureUrl')
          ?.setValue(newImageDownloadURL);
        this.isProcessingPicture.set(false);
      } else if (this.pictureMarkedForRemoval) {
        this.isProcessingPicture.set(true);
        this.notificationService.showInfo('Removing profile picture...');
        if (this.initialProfilePictureUrl) {
          try {
            await firstValueFrom(
              this.userStorageService.deleteProfilePicture(
                this.initialProfilePictureUrl
              )
            );
            this.logger.log('Profile picture deleted successfully.');
            newImageDownloadURL = null;
            this.settingsForm.get('profilePictureUrl')?.setValue(null);
          } catch (deleteError) {
            this.logger.error(
              'Failed to delete profile picture from storage.',
              deleteError
            );
            this.notificationService.showError(
              'Failed to remove picture. Please try again.'
            );
            this.isSaving.set(false);
            this.isProcessingPicture.set(false);
            return;
          }
        } else {
          newImageDownloadURL = null;
          this.settingsForm.get('profilePictureUrl')?.setValue(null);
        }
        this.isProcessingPicture.set(false);
      }

      const formValues = this.settingsForm.value;

      const getLocationAndCoordinates = () => {
        if (this.selectedPlace()) {
          return {
            location:
              this.selectedPlace()?.formattedAddress ||
              this.selectedPlace()?.address,
            coordinates: new GeoPoint(
              this.selectedPlace().coordinates.lat(),
              this.selectedPlace().coordinates.lng()
            ),
          };
        }
        return {};
      };

      const getFilteredSkills = (
        selectedType: AssistanceType | null,
        skills: Skill[]
      ): Skill[] => {
        const validSkills: Skill[] = selectedType
          ? ASSISTANCE_TYPE_SKILLS[selectedType] || []
          : [];
        return (Array.isArray(skills) ? skills : []).filter((skill: Skill) =>
          validSkills.includes(skill)
        );
      };

      const updatedData: Partial<UserInterface> = {
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        displayName: `${formValues.firstName} ${formValues.lastName}`,
        profilePictureUrl: newImageDownloadURL,
        phoneNumber: formValues.phoneNumber || null,
        bio: formValues.bio || null,
        dateOfBirth: formValues.dateOfBirth
          ? new Date(formValues.dateOfBirth).toISOString().split('T')[0]
          : null,
        gender: formValues.gender || null,
        ...getLocationAndCoordinates(),
      };

      if (currentProfile.userType === UserType.CareAssistant) {
        updatedData.experienceYears =
          formValues.experienceYears === null
            ? null
            : Number(formValues.experienceYears);
        updatedData.hourlyRate =
          formValues.hourlyRate === null ? null : Number(formValues.hourlyRate);
        updatedData.assistanceType = formValues.assistanceType || null;

        const selectedType: AssistanceType | null =
          formValues.assistanceType || null;
        const filteredSkills: Skill[] = getFilteredSkills(
          selectedType,
          formValues.skills
        );
        updatedData.skills = filteredSkills;

        updatedData.availability =
          formValues.availability && formValues.availability.length > 0
            ? formValues.availability
            : null;
        updatedData.additionalDetails = {
          nonSmoker: formValues.additionalDetails.nonSmoker,
          hasOwnTransportation:
            formValues.additionalDetails.hasOwnTransportation,
        };

        if (currentProfile.isVerified == true) {
          updatedData.isVerified = false;
        }
        if (currentProfile.isRejected) {
          updatedData.isRejected = false;
        }

        const finalProfileDataForCheck = { ...currentProfile, ...updatedData };
        updatedData.profileComplete = !!(
          finalProfileDataForCheck.email &&
          finalProfileDataForCheck.displayName &&
          finalProfileDataForCheck.firstName &&
          finalProfileDataForCheck.lastName &&
          finalProfileDataForCheck.profilePictureUrl &&
          finalProfileDataForCheck.phoneNumber &&
          finalProfileDataForCheck.location &&
          finalProfileDataForCheck.coordinates &&
          finalProfileDataForCheck.bio &&
          finalProfileDataForCheck.dateOfBirth &&
          finalProfileDataForCheck.gender &&
          finalProfileDataForCheck.assistanceType &&
          finalProfileDataForCheck.skills &&
          finalProfileDataForCheck.skills.length > 0 &&
          finalProfileDataForCheck.experienceYears !== null &&
          finalProfileDataForCheck.experienceYears !== undefined &&
          finalProfileDataForCheck.availability &&
          finalProfileDataForCheck.availability.length > 0 &&
          finalProfileDataForCheck.hourlyRate !== null &&
          finalProfileDataForCheck.hourlyRate !== undefined
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
      this.pictureMarkedForRemoval = false;

      this.settingsForm.markAsPristine();
      this.hasActualChanges.set(false);

      if (currentProfile.userType == UserType.CareAssistant) {
        this.notificationService.showSuccess(
          this.text.profileUpdatedForValidationSuccessfullyNotification
        );
      } else {
        this.notificationService.showSuccess(
          this.text.profileUpdatedSuccessfullyNotification
        );
      }
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

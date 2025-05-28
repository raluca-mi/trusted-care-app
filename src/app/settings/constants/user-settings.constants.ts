export const USER_SETTINGS_TEXT = {
  // Page Title
  userSettingsTitle: 'User Settings',

  // Loading & Error Messages
  loadingProfile: 'Loading profile...',
  couldNotLoadUserData:
    'Could not load user profile data or user is logged out.',

  // Stepper Labels
  accountInformationStep: 'Account Information',
  caregiverDetailsStep: 'Caregiver Details',
  servicesAndAvailabilityStep: 'Services & Availability',
  otherDetailsStep: 'Other Details',
  additionalDetailsStep: 'Additional Details',

  // --- Step 1: Account Information ---
  // Profile Picture Section
  uploadPhotoTooltip: 'Upload new profile picture',
  changeButton: 'Change',
  addButton: 'Add',
  photo: 'Photo',
  removeButton: 'Remove',
  removePhotoTooltip: 'Remove profile picture',
  profilePictureHint:
    'A clear photo helps build trust. Recommended: 200x200px.',

  // Personal Details Card
  personalDetailsTitle: 'Personal Details',
  emailLabel: 'Email',
  firstNameLabel: 'First Name',
  firstNameRequired: 'First name is required',
  lastNameLabel: 'Last Name',
  lastNameRequired: 'Last name is required',
  accountTypeLabel: 'Account Type',
  careAssistantRole: 'Care Assistant / Provider',
  researcherRole: 'Researcher',
  changePasswordButton: 'Change Password',

  // --- Step 2: Caregiver Details (Professional Information) ---
  professionalInformationTitle: 'Professional Information',
  yearsOfExperienceLabel: 'Years of Experience',
  experiencePlaceholder: 'e.g., 5',
  hourlyRateLabel: 'Hourly Rate',
  hourlyRatePlaceholder: 'e.g., 20',
  assistanceTypeLabel: 'Assistance Type You Offer',
  skillsLabel: 'Skills',
  availabilityLabel: 'Your General Availability',
  otherDetailsLabel: 'Other Details',
  nonSmokerLabel: 'Non-Smoker',
  haveOwnTransportationLabel: 'I have my own transportation',
  travelKmPlaceholder: 'e.g., 20',
  kmSuffix: 'km',

  // --- Step 3: Additional Details (Contact, Personal, Location, Bio) ---
  phoneNumberLabel: 'Phone Number',
  phoneNumberPlaceholder: 'e.g., +40 123 456 789',
  phoneNumberInvalid: 'Please enter a valid phone number.',
  genderLabel: 'Gender',
  preferNotToSay: 'Prefer not to say',
  dateOfBirthLabel: 'Date of Birth',
  dobPlaceholder: 'DD/MM/YYYY',
  locationLabel: 'Location',
  locationPlaceholder: 'Brașov, Brașov',
  aboutMeBioLabel: 'About Me / Bio',
  bioPlaceholder:
    'Tell us about yourself, your experience, and what makes you a great caregiver...',

  // Stepper Buttons
  nextButton: 'Next',
  backButton: 'Back',

  // Save Button Area
  saveChangesButton: 'Save Changes',
  savingButton: 'Saving...',

  // Notifications (from component logic)
  invalidFileTypeNotification: 'Invalid file type. Please select an image.',
  newImageSelectedNotification:
    'New image selected. Click "Save Changes" to upload and apply.',
  pictureMarkedForRemovalNotification:
    'Profile picture will be removed upon saving changes.',
  cannotSaveSettingsUserDataMissingNotification:
    'Cannot save settings: User data is missing.',
  pleaseCorrentErrorsInFormNotification:
    'Please correct the errors in the form.',
  noChangesToSaveNotification: 'No changes to save.',
  uploadingNewProfilePictureNotification: 'Uploading new profile picture...',
  profileUpdatedSuccessfullyNotification: 'Profile updated successfully!',
  profileUpdateFailedNotification:
    'Failed to update profile. Please try again.',
  passwordResetEmailSentNotification:
    'Password reset email sent. Please check your inbox.',
  emailNotFoundNotification: 'Cannot initiate password reset: Email not found.',
} as const;

export enum UserTypeEnum {
  Researcher = 'researcher',
  CareAssistant = 'care_assistant',
}

export enum AssistanceTypeEnum {
  ChildCare = 'Child Care',
  ElderlyCare = 'Elderly Care',
  PetsCare = 'Pets Care',
  HouseKeeping = 'House Keeping',
}

export enum AvailabilityOptionEnum {
  Weekdays = 'Weekdays',
  Weekends = 'Weekends',
  Mornings = 'Mornings',
  Afternoons = 'Afternoons',
  Evenings = 'Evenings',
  Overnights = 'Overnights',
  Flexible = 'Flexible',
}

export enum GenderEnum {
  Female = 'Female',
  Male = 'Male',
  Other = 'Other',
}

export interface UserInterface {
  // Core Firebase Auth Info
  uid: string;
  email: string;
  displayName: string;

  // App-Specific Core Info
  userType: UserTypeEnum;
  firstName: string;
  lastName: string;
  createdAt: Date;
  profileComplete?: boolean;

  // Common Profile Details (for both, but more for Care Assistant)
  profilePictureUrl?: string;
  phoneNumber?: string | null;

  // Care Assistant Specific Details (optional for Researchers)
  location?: string;
  bio?: string;
  dateOfBirth?: string | null;
  gender?: GenderEnum | null;
  assistanceTypes?: AssistanceTypeEnum[] | null;
  experienceYears?: number;
  availability?: AvailabilityOptionEnum[] | null;
  hourlyRate?: number | null;
  additionalDetails?: {
    nonSmoker?: boolean;
    hasOwnTransportation?: boolean;
    willingToTravelKm?: number | null;
  } | null;
}

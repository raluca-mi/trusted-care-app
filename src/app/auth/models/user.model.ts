export enum UserType {
  Researcher = 'researcher',
  CareAssistant = 'care_assistant',
}

export type AssistanceType =
  | 'Child Care'
  | 'Elderly Care'
  | 'House Keeping'
  | 'Pets Care'
  | 'Special Needs Care'
  | 'Other';

export enum GenderType {
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
  userType: UserType;
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
  gender?: GenderType | null;
  assistanceTypes?: AssistanceType[] | null;
  experienceYears?: number;
  availability?: string[];
  hourlyRate?: number | null;
  additionalDetails?: {
    nonSmoker?: boolean;
    hasOwnTransportation?: boolean;
    willingToTravelKm?: number | null;
  } | null;
}

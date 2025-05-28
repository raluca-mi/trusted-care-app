import { AssistanceType } from '../enums/assistance-type.enum';
import { AvailabilityOption } from '../enums/availability-option.enum';
import { Gender } from '../enums/gender.enum';
import { UserType } from '../enums/user-type.enum';

export interface UserInterface {
  // Core Firebase Auth Info
  uid: string;
  email: string;
  displayName: string;

  // App-Specific Core Info
  isAdmin: boolean;
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
  gender?: Gender | null;
  assistanceType?: AssistanceType | null;
  experienceYears?: number;
  availability?: AvailabilityOption[] | null;
  hourlyRate?: number | null;
  additionalDetails?: {
    nonSmoker?: boolean;
    hasOwnTransportation?: boolean;
  } | null;
}

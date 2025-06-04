import { GeoPoint } from 'firebase/firestore';
import { AssistanceType } from '../enums/assistance-type.enum';
import { AvailabilityOption } from '../enums/availability-option.enum';
import { Gender } from '../enums/gender.enum';
import { Skill } from '../enums/skill.enum';
import { UserType } from '../enums/user-type.enum';

export interface UserInterface {
  // Core Firebase Auth Info
  uid: string;
  email: string;
  displayName: string;

  // App-Specific Core Info
  isAdmin?: boolean | false;
  userType: UserType;
  firstName: string;
  lastName: string;
  createdAt: Date;
  profileComplete?: boolean;

  // Common Profile Details (for both, but more for Care Assistant)
  profilePictureUrl?: string;
  phoneNumber?: string | null;

  // Care Assistant Specific Details (optional for Researchers)
  isVerified?: boolean;
  location?: string; //the formatted address
  coordinates?: GeoPoint | null;
  bio?: string;
  dateOfBirth?: string | null;
  gender?: Gender | null;
  assistanceType?: AssistanceType | null;
  skills?: Skill[] | null;
  experienceYears?: number;
  availability?: AvailabilityOption[] | null;
  hourlyRate?: number | null;
  additionalDetails?: {
    nonSmoker?: boolean;
    hasOwnTransportation?: boolean;
  } | null;
}

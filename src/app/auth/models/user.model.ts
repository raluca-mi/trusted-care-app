export enum UserType {
    Researcher = 'researcher',
    CareAssistant = 'care_assistant'
}

export interface UserInterface{
    uid: string;
    email: string;
    userType: UserType;
    firstName: string;
    lastName: string;
    displayName: string;
    createdAt: Date;
    profileComplete?: boolean;
    profilePictureUrl?: string;
    location?: string;
    bio?: string;
    careTypes?: string[];
    experienceYears?: number;
    availability?: string[];
    hourlyRate?: number | null;
}
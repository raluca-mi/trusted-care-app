import { AssistanceType } from '../../auth/enums/assistance-type.enum';
import { NavigationAssistanceTypeDetail } from '../models/navigation-assistance-type-detail.model';

export const ASSISTANCE_PAGES_CONFIG: NavigationAssistanceTypeDetail[] = [
  {
    id: 'child-care',
    displayName: AssistanceType.ChildCare,
    pageDescription:
      'Find trusted nannies, babysitters, and daycare options for your children of all ages.',
    headerImageUrl: 'assets/icons/hero-child-care.jpg',
    route: '/child-care',
  },
  {
    id: 'elderly-care',
    displayName: AssistanceType.ElderlyCare,
    pageDescription:
      'Browse caregivers specializing in senior care, including companionship, personal care, and in-home assistance.',
    headerImageUrl: 'assets/icons/hero-elderly-care.png',
    route: '/elderly-care',
  },
  {
    id: 'pets-care',
    displayName: AssistanceType.PetsCare,
    pageDescription:
      'Discover reliable pet sitters, dog walkers, and grooming services for your furry friends.',
    headerImageUrl: 'assets/icons/hero-pets-care.png',
    route: '/pets-care',
  },
  {
    id: 'housekeeping',
    displayName: AssistanceType.HouseKeeping,
    pageDescription:
      'Find professional housekeepers for cleaning, organizing, and home maintenance tasks.',
    headerImageUrl: 'assets/icons/hero-housekeeping.jpg',
    route: '/housekeeping',
  },
];

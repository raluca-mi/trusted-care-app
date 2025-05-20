import { AssistanceTypeEnum } from '../../auth/models/user.model';
import { NavigationAssistanceTypeDetail } from '../../layouts/components/models/navigation-assistance-type-detail.model';

export const ASSISTANCE_TYPES_DETAILS: NavigationAssistanceTypeDetail[] = [
  {
    id: 'child-care',
    displayName: AssistanceTypeEnum.ChildCare,
    route: '/child-care',
  },
  {
    id: 'elderly-care',
    displayName: AssistanceTypeEnum.ElderlyCare,
    route: '/elderly-care',
  },
  {
    id: 'pets-care',
    displayName: AssistanceTypeEnum.PetsCare,
    route: '/pets-care',
  },
  {
    id: 'housekeeping',
    displayName: AssistanceTypeEnum.HouseKeeping,
    route: '/housekeeping',
  },
];

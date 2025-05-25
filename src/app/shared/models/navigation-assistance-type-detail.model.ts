import { AssistanceTypeEnum } from '../../auth/models/user.model';

export interface NavigationAssistanceTypeDetail {
  id: string;
  displayName: AssistanceTypeEnum;
  pageDescription: string;
  headerImageUrl: string;
  route: string;
}

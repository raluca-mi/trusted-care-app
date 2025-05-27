import { AssistanceType } from "../../auth/enums/assistance-type.enum";

export interface NavigationAssistanceTypeDetail {
  id: string;
  displayName: AssistanceType;
  pageDescription: string;
  headerImageUrl: string;
  route: string;
}

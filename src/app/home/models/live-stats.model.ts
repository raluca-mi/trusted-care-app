import { Timestamp } from '@angular/fire/firestore';

export interface LiveStats {
  totalVerifiedAssistants: number;
  totalResearchers: number;
  totalConnectionsMade: number;
  categoryCounts: { [key: string]: number };
  averageRates: { [key: string]: number };
  lastUpdated: Timestamp;

  //Admin specific stats
  assistantSignupsLast30Days: { [key: string]: number };
  researcherSignupsLast30Days: { [key: string]: number };
  categoryVerificationBreakdown: {
    [key: string]: { [key: string]: number };
  };
  verificationStatusCounts: {
    [key: string]: number;
  };
}

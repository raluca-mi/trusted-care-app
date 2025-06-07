import { Timestamp } from 'firebase/firestore';
import { ConnectionRequestStatus } from '../enums/connection-request-status.enum';

export interface ConnectionRequest {
  requestId: string;
  researcherUid: string;
  assistantUid: string;
  status: ConnectionRequestStatus;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

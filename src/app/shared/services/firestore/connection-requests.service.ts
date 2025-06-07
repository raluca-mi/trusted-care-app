import { inject, Injectable } from '@angular/core';
import {
  collection,
  doc,
  Firestore,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { from, map, Observable } from 'rxjs';
import { ConnectionRequestStatus } from '../../../connection-requests/enums/connection-request-status.enum';
import { ConnectionRequest } from '../../../connection-requests/models/connection-request.model';
import { LoggerService } from '../logger.service';

@Injectable({
  providedIn: 'root',
})
export class ConnectionRequestsService {
  constructor() {}

  private firestore = inject(Firestore);
  private logger = inject(LoggerService);
  private readonly requestsCollection = 'requests';

  createRequestDocument(
    requestData: Omit<
      ConnectionRequest,
      'requestId' | 'createdAt' | 'updatedAt'
    >
  ): Observable<ConnectionRequest> {
    const newRequestRef = doc(
      collection(this.firestore, this.requestsCollection)
    );
    const now = Timestamp.now();
    const fullRequest: ConnectionRequest = {
      ...requestData,
      requestId: newRequestRef.id,
      createdAt: now,
      updatedAt: now,
    };
    this.logger.log('RequestService: Creating request document:', fullRequest);
    return from(setDoc(newRequestRef, fullRequest)).pipe(
      map(() => fullRequest)
    );
  }

  /**
   * Updates the status of an existing request document in Firestore.
   */
  updateRequestStatus(
    requestId: string,
    status: ConnectionRequestStatus
  ): Observable<Partial<ConnectionRequest>> {
    const requestDocRef = doc(
      this.firestore,
      this.requestsCollection,
      requestId
    );
    const updatePayload = {
      status: status,
      updatedAt: Timestamp.now(),
    };
    this.logger.log(
      `RequestService: Updating request ${requestId} status to ${status}`
    );
    return from(updateDoc(requestDocRef, updatePayload)).pipe(
      map(() => updatePayload as Partial<ConnectionRequest>)
    );
  }

  /**
   * Fetches all requests sent by a specific researcher.
   */
  fetchSentRequests(researcherUid: string): Observable<ConnectionRequest[]> {
    this.logger.log(
      'RequestService: Fetching sent requests for researcherUid:',
      researcherUid
    );
    const q = query(
      collection(this.firestore, this.requestsCollection),
      where('researcherUid', '==', researcherUid),
      orderBy('createdAt', 'desc')
    );

    return from(getDocs(q)).pipe(
      map((snapshot) => {
        const requests = snapshot.docs.map(
          (d) => ({ requestId: d.id, ...d.data() } as ConnectionRequest)
        );
        this.logger.log(
          `RequestService: Found ${requests.length} sent requests.`
        );
        return requests;
      })
    );
  }

  /**
   * Fetches all requests received by a specific assistant.
   */
  fetchReceivedRequests(assistantUid: string): Observable<ConnectionRequest[]> {
    this.logger.log(
      'RequestService: Fetching received requests for assistantUid:',
      assistantUid
    );
    const q = query(
      collection(this.firestore, this.requestsCollection),
      where('assistantUid', '==', assistantUid),
      orderBy('createdAt', 'desc')
    );

    return from(getDocs(q)).pipe(
      map((snapshot) => {
        const requests = snapshot.docs.map(
          (d) => ({ requestId: d.id, ...d.data() } as ConnectionRequest)
        );
        this.logger.log(
          `RequestService: Found ${requests.length} received requests.`
        );
        return requests;
      })
    );
  }

  /**
   * Fetches a single request by its ID (useful for respondToRequestSuccess).
   */
  getRequestById(requestId: string): Observable<ConnectionRequest | null> {
    const requestDocRef = doc(
      this.firestore,
      this.requestsCollection,
      requestId
    );
    return from(getDoc(requestDocRef)).pipe(
      map((docSnap) => {
        if (docSnap.exists()) {
          return {
            requestId: docSnap.id,
            ...docSnap.data(),
          } as ConnectionRequest;
        }
        return null;
      })
    );
  }
}

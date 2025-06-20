import { Injectable, inject } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ConnectionRequestStatus } from '../../connection-requests/enums/connection-request-status.enum';
import { ConnectionRequest } from '../../connection-requests/models/connection-request.model';
import * as RequestsActions from './requests.actions';
import { RequestsSelectors } from './requests.selectors';
import { RequestsState } from './requests.state';

@Injectable({
  providedIn: 'root',
})
export class RequestsFacade {
  private readonly store = inject(Store<RequestsState>);

  isLoadingSentRequests$: Observable<boolean> = this.store.pipe(
    select(RequestsSelectors.selectIsLoadingSentRequests)
  );
  isLoadingReceivedRequests$: Observable<boolean> = this.store.pipe(
    select(RequestsSelectors.selectIsLoadingReceivedRequests)
  );
  requestsError$: Observable<string | null> = this.store.pipe(
    select(RequestsSelectors.selectRequestsError)
  );

  constructor() {}

  allRequests$: Observable<ConnectionRequest[]> = this.store.pipe(
    select(RequestsSelectors.selectAllRequests)
  );

  getSentRequestsByStatus$(
    researcherUid: string,
    status: ConnectionRequestStatus
  ): Observable<ConnectionRequest[]> {
    return this.store.pipe(
      select(RequestsSelectors.selectSentRequestsByStatus(status), {
        researcherUid,
      })
    );
  }

  getReceivedRequestsByStatus$(
    assistantUid: string,
    status: ConnectionRequestStatus
  ): Observable<ConnectionRequest[]> {
    return this.store.pipe(
      select(RequestsSelectors.selectReceivedRequestsByStatus(status), {
        assistantUid,
      })
    );
  }

  getActiveRequestBetweenUsers$(
    researcherUid: string,
    assistantUid: string
  ): Observable<ConnectionRequest | null> {
    return this.store.pipe(
      select(
        RequestsSelectors.selectActiveRequestBetweenUsers(
          researcherUid,
          assistantUid
        )
      )
    );
  }

  getDeclinedRequestBetweenUsers$(
    researcherUid: string,
    assistantUid: string
  ): Observable<ConnectionRequest | null> {
    return this.store.pipe(
      select(
        RequestsSelectors.selectDeclinedRequestBetweenUsers(
          researcherUid,
          assistantUid
        )
      )
    );
  }

  sendRequest(researcherUid: string, assistantUid: string): void {
    this.store.dispatch(
      RequestsActions.sendRequest({ researcherUid, assistantUid })
    );
  }

  cancelRequest(requestId: string, researcherUid: string): void {
    this.store.dispatch(
      RequestsActions.cancelRequest({ requestId, researcherUid })
    );
  }

  respondToRequest(
    requestId: string,
    newStatus:
      | ConnectionRequestStatus.Accepted
      | ConnectionRequestStatus.Declined,
    assistantUid: string
  ): void {
    this.store.dispatch(
      RequestsActions.respondToRequest({ requestId, newStatus, assistantUid })
    );
  }

  loadSentRequests(researcherUid: string): void {
    this.store.dispatch(RequestsActions.loadSentRequests({ researcherUid }));
  }

  loadReceivedRequests(assistantUid: string): void {
    this.store.dispatch(RequestsActions.loadReceivedRequests({ assistantUid }));
  }

  clearRequestsState(): void {
    this.store.dispatch(RequestsActions.clearRequestsState());
  }
}

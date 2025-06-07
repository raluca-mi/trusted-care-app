import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import {
  catchError,
  exhaustMap,
  filter,
  map,
  switchMap,
  withLatestFrom,
} from 'rxjs/operators';

import { toObservable } from '@angular/core/rxjs-interop';
import { AuthService } from '../../auth/services/auth.service';
import { ConnectionRequestStatus } from '../../connection-requests/enums/connection-request-status.enum';
import { ConnectionRequestsService } from '../../shared/services/firestore/connection-requests.service';
import { LoggerService } from '../../shared/services/logger.service';
import * as RequestsActions from './requests.actions';

@Injectable()
export class RequestsEffects {
  private actions$ = inject(Actions);
  private requestService = inject(ConnectionRequestsService);
  private authService = inject(AuthService);
  private logger = inject(LoggerService);

  sendRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RequestsActions.sendRequest),
      exhaustMap((action) => {
        const requestDataToCreate = {
          researcherUid: action.researcherUid,
          assistantUid: action.assistantUid,
          status: ConnectionRequestStatus.Pending,
        };
        this.logger.log(
          '[RequestsEffects] Sending request:',
          requestDataToCreate
        );
        return this.requestService
          .createRequestDocument(requestDataToCreate)
          .pipe(
            map((createdRequestWithId) =>
              RequestsActions.sendRequestSuccess({
                request: createdRequestWithId,
              })
            ),
            catchError((error) => {
              this.logger.error(
                '[RequestsEffects] Error sending request:',
                error
              );
              return of(RequestsActions.sendRequestFailure({ error }));
            })
          );
      })
    )
  );

  cancelRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RequestsActions.cancelRequest),
      exhaustMap((action) => {
        this.logger.log(
          '[RequestsEffects] Cancelling request:',
          action.requestId
        );
        return this.requestService
          .updateRequestStatus(
            action.requestId,
            ConnectionRequestStatus.Deleted
          )
          .pipe(
            map(() =>
              RequestsActions.cancelRequestSuccess({
                requestId: action.requestId,
              })
            ),
            catchError((error) => {
              this.logger.error(
                '[RequestsEffects] Error cancelling request:',
                action.requestId,
                error
              );
              return of(RequestsActions.cancelRequestFailure({ error }));
            })
          );
      })
    )
  );

  respondToRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RequestsActions.respondToRequest),
      exhaustMap((action) => {
        this.logger.log(
          `[RequestsEffects] Responding to request ${action.requestId} with status ${action.newStatus}`
        );
        return this.requestService
          .updateRequestStatus(action.requestId, action.newStatus)
          .pipe(
            switchMap(() =>
              this.requestService.getRequestById(action.requestId)
            ),
            map((updatedRequest) => {
              if (updatedRequest) {
                return RequestsActions.respondToRequestSuccess({
                  request: updatedRequest,
                });
              }
              return RequestsActions.respondToRequestFailure({
                error: 'Updated request not found after response.',
              });
            }),
            catchError((error) => {
              this.logger.error(
                '[RequestsEffects] Error responding to request:',
                action.requestId,
                error
              );
              return of(RequestsActions.respondToRequestFailure({ error }));
            })
          );
      })
    )
  );

  loadSentRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RequestsActions.loadSentRequests),
      withLatestFrom(toObservable(this.authService.currentUser)),
      filter(([action, currentUserProfile]) => {
        if (
          !currentUserProfile ||
          !currentUserProfile.uid ||
          currentUserProfile.uid !== action.researcherUid
        ) {
          this.logger.warn(
            `[RequestsEffects] Load Sent Requests: User ${action.researcherUid} is not current or profile not loaded. Aborting.`
          );
          return false;
        }
        this.logger.log(
          `[RequestsEffects] Current user ${currentUserProfile.uid} matches action researcherUid ${action.researcherUid}. Proceeding to load sent requests.`
        );
        return true;
      }),
      switchMap(([action, currentUserProfile]) => {
        this.logger.log(
          '[RequestsEffects] Loading sent requests for researcher:',
          action.researcherUid
        );
        return this.requestService.fetchSentRequests(action.researcherUid).pipe(
          map((requests) =>
            RequestsActions.loadSentRequestsSuccess({ requests })
          ),
          catchError((error) => {
            this.logger.error(
              '[RequestsEffects] Error loading sent requests:',
              error
            );
            return of(RequestsActions.loadSentRequestsFailure({ error }));
          })
        );
      })
    )
  );

  loadReceivedRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RequestsActions.loadReceivedRequests),

      withLatestFrom(toObservable(this.authService.currentUser)),

      filter(([action, currentUserProfile]) => {
        if (
          !currentUserProfile ||
          !currentUserProfile.uid ||
          currentUserProfile.uid !== action.assistantUid
        ) {
          this.logger.warn(
            `[RequestsEffects] Load Received Requests: User ${action.assistantUid} is not current or profile not loaded. Aborting.`
          );
          return false;
        }
        this.logger.log(
          `[RequestsEffects] Current user ${currentUserProfile.uid} matches action assistantUid ${action.assistantUid}. Proceeding to load received requests.`
        );
        return true;
      }),
      switchMap(([action, currentUserProfile]) => {
        this.logger.log(
          '[RequestsEffects] Loading received requests for assistant:',
          action.assistantUid
        );
        return this.requestService
          .fetchReceivedRequests(action.assistantUid)
          .pipe(
            map((requests) =>
              RequestsActions.loadReceivedRequestsSuccess({ requests })
            ),
            catchError((error) => {
              this.logger.error(
                '[RequestsEffects] Error loading received requests:',
                error
              );
              return of(RequestsActions.loadReceivedRequestsFailure({ error }));
            })
          );
      })
    )
  );

  constructor() {}
}

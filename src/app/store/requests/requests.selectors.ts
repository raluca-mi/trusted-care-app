import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ConnectionRequestStatus } from '../../connection-requests/enums/connection-request-status.enum';
import { ConnectionRequest as ConnectionRequest } from '../../connection-requests/models/connection-request.model';
import { RequestsState, requestsAdapter } from './requests.state';

export const REQUESTS_FEATURE_KEY = 'requests';

export const selectRequestsState =
  createFeatureSelector<RequestsState>(REQUESTS_FEATURE_KEY);

const {
  selectIds: selectRequestIds,
  selectEntities: selectRequestEntities,
  selectAll: selectAllRequestsInternal,
  selectTotal: selectTotalRequests,
} = requestsAdapter.getSelectors(selectRequestsState);

export const selectAllRequests = selectAllRequestsInternal;

export const selectSentRequestsByStatus = (status: ConnectionRequestStatus) =>
  createSelector(
    selectAllRequests,
    (requests: ConnectionRequest[], props: { researcherUid: string }) =>
      requests.filter(
        (req) =>
          req.researcherUid === props.researcherUid && req.status === status
      )
  );

export const selectReceivedRequestsByStatus = (
  status: ConnectionRequestStatus
) =>
  createSelector(
    selectAllRequests,
    (requests: ConnectionRequest[], props: { assistantUid: string }) =>
      requests.filter(
        (req) =>
          req.assistantUid === props.assistantUid && req.status === status
      )
  );

export const selectActiveRequestBetweenUsers = (
  researcherUid: string,
  assistantUid: string
) =>
  createSelector(
    selectAllRequests,
    (requests: ConnectionRequest[]) =>
      requests.find(
        (req) =>
          req.researcherUid === researcherUid &&
          req.assistantUid === assistantUid &&
          (req.status === ConnectionRequestStatus.Pending ||
            req.status === ConnectionRequestStatus.Accepted)
      ) || null
  );

export const selectDeclinedRequestBetweenUsers = (
  researcherUid: string,
  assistantUid: string
) =>
  createSelector(
    selectAllRequests,
    (requests: ConnectionRequest[]) =>
      requests.find(
        (req) =>
          req.researcherUid === researcherUid &&
          req.assistantUid === assistantUid &&
          req.status === ConnectionRequestStatus.Declined
      ) || null
  );

export const selectIsLoadingSentRequests = createSelector(
  selectRequestsState,
  (state) => state.isLoadingSent
);

export const selectIsLoadingReceivedRequests = createSelector(
  selectRequestsState,
  (state) => state.isLoadingReceived
);

export const selectRequestsError = createSelector(
  selectRequestsState,
  (state) => state.error
);

export const RequestsSelectors = {
  selectRequestsState,
  selectRequestIds,
  selectRequestEntities,
  selectAllRequests,
  selectTotalRequests,
  selectSentRequestsByStatus,
  selectReceivedRequestsByStatus,
  selectDeclinedRequestBetweenUsers,
  selectActiveRequestBetweenUsers,
  selectIsLoadingSentRequests,
  selectIsLoadingReceivedRequests,
  selectRequestsError,
};

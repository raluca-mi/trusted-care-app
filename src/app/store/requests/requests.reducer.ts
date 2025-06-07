import { Action, createReducer, on } from '@ngrx/store';
import { ConnectionRequestStatus } from '../../connection-requests/enums/connection-request-status.enum';
import * as RequestsActions from './requests.actions';
import {
  RequestsState,
  initialRequestsState,
  requestsAdapter,
} from './requests.state';

const requestsReducerInternal = createReducer(
  initialRequestsState,

  // Send Request
  on(RequestsActions.sendRequest, (state) => ({ ...state, error: null })),
  on(RequestsActions.sendRequestSuccess, (state, { request }) => {
    return requestsAdapter.addOne(request, state);
  }),
  on(RequestsActions.sendRequestFailure, (state, { error }) => ({
    ...state,
    error,
  })),

  // Cancel Request
  on(RequestsActions.cancelRequest, (state) => ({ ...state, error: null })),
  on(RequestsActions.cancelRequestSuccess, (state, { requestId }) => {
    return requestsAdapter.mapOne(
      {
        id: requestId,
        map: (request) => ({
          ...request,
          status: ConnectionRequestStatus.Deleted,
          updatedAt: new Date(),
        }),
      },
      state
    );
  }),
  on(RequestsActions.cancelRequestFailure, (state, { error }) => ({
    ...state,
    error,
  })),

  // Respond to Request
  on(RequestsActions.respondToRequest, (state) => ({ ...state, error: null })),
  on(RequestsActions.respondToRequestSuccess, (state, { request }) => {
    return requestsAdapter.upsertOne(request, state);
  }),
  on(RequestsActions.respondToRequestFailure, (state, { error }) => ({
    ...state,
    error,
  })),

  // Load Sent Requests
  on(RequestsActions.loadSentRequests, (state) => ({
    ...state,
    isLoadingSent: true,
    error: null,
  })),
  on(RequestsActions.loadSentRequestsSuccess, (state, { requests }) => {
    return requestsAdapter.addMany(requests, {
      ...state,
      isLoadingSent: false,
    });
  }),
  on(RequestsActions.loadSentRequestsFailure, (state, { error }) => ({
    ...state,
    isLoadingSent: false,
    error,
  })),

  // Load Received Requests
  on(RequestsActions.loadReceivedRequests, (state) => ({
    ...state,
    isLoadingReceived: true,
    error: null,
  })),
  on(RequestsActions.loadReceivedRequestsSuccess, (state, { requests }) => {
    return requestsAdapter.addMany(requests, {
      ...state,
      isLoadingReceived: false,
    });
  }),
  on(RequestsActions.loadReceivedRequestsFailure, (state, { error }) => ({
    ...state,
    isLoadingReceived: false,
    error,
  })),

  // Listener updates
  on(RequestsActions.upsertRequestFromListener, (state, { request }) => {
    return requestsAdapter.upsertOne(request, state);
  }),
  on(
    RequestsActions.removeRequestLocallyFromListener,
    (state, { requestId }) => {
      return requestsAdapter.removeOne(requestId, state);
    }
  ),

  on(RequestsActions.clearRequestsState, (state) => {
    return requestsAdapter.removeAll(state);
  })
);

export function requestsReducer(
  state: RequestsState | undefined,
  action: Action
) {
  return requestsReducerInternal(state, action);
}

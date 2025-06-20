import { createAction, props } from '@ngrx/store';
import { ConnectionRequestStatus } from '../../connection-requests/enums/connection-request-status.enum';
import { ConnectionRequest as ConnectionRequest } from '../../connection-requests/models/connection-request.model';
import { RequestActionTypes } from './requests.action-types';

export const sendRequest = createAction(
  RequestActionTypes.SEND_REQUEST,
  props<{ researcherUid: string; assistantUid: string }>()
);
export const sendRequestSuccess = createAction(
  RequestActionTypes.SEND_REQUEST_SUCCESS,
  props<{ request: ConnectionRequest }>()
);
export const sendRequestFailure = createAction(
  RequestActionTypes.SEND_REQUEST_FAILURE,
  props<{ error: any }>()
);

export const cancelRequest = createAction(
  RequestActionTypes.CANCEL_REQUEST,
  props<{ requestId: string; researcherUid: string }>()
);
export const cancelRequestSuccess = createAction(
  RequestActionTypes.CANCEL_REQUEST_SUCCESS,
  props<{ requestId: string }>()
);
export const cancelRequestFailure = createAction(
  RequestActionTypes.CANCEL_REQUEST_FAILURE,
  props<{ error: any }>()
);

export const respondToRequest = createAction(
  RequestActionTypes.RESPOND_TO_REQUEST,
  props<{
    requestId: string;
    newStatus:
      | ConnectionRequestStatus.Accepted
      | ConnectionRequestStatus.Declined;
    assistantUid: string;
  }>()
);
export const respondToRequestSuccess = createAction(
  RequestActionTypes.RESPOND_TO_REQUEST_SUCCESS,
  props<{ request: ConnectionRequest }>()
);
export const respondToRequestFailure = createAction(
  RequestActionTypes.RESPOND_TO_REQUEST_FAILURE,
  props<{ error: any }>()
);

export const loadSentRequests = createAction(
  RequestActionTypes.LOAD_SENT_REQUESTS,
  props<{ researcherUid: string }>()
);
export const loadSentRequestsSuccess = createAction(
  RequestActionTypes.LOAD_SENT_REQUESTS_SUCCESS,
  props<{ requests: ConnectionRequest[] }>()
);
export const loadSentRequestsFailure = createAction(
  RequestActionTypes.LOAD_SENT_REQUESTS_FAILURE,
  props<{ error: any }>()
);

export const loadReceivedRequests = createAction(
  RequestActionTypes.LOAD_RECEIVED_REQUESTS,
  props<{ assistantUid: string }>()
);
export const loadReceivedRequestsSuccess = createAction(
  RequestActionTypes.LOAD_RECEIVED_REQUESTS_SUCCESS,
  props<{ requests: ConnectionRequest[] }>()
);
export const loadReceivedRequestsFailure = createAction(
  RequestActionTypes.LOAD_RECEIVED_REQUESTS_FAILURE,
  props<{ error: any }>()
);

export const upsertRequestFromListener = createAction(
  RequestActionTypes.UPSERT_REQUEST,
  props<{ request: ConnectionRequest }>()
);
export const removeRequestLocallyFromListener = createAction(
  RequestActionTypes.REMOVE_REQUEST_LOCALLY,
  props<{ requestId: string }>()
);

export const clearRequestsState = createAction(
  RequestActionTypes.CLEAR_REQUESTS_STATE
);

export const RequestActionTypes = {
  SEND_REQUEST: '[Requests] Send Connection Request',
  SEND_REQUEST_SUCCESS: '[Requests API] Send Connection Request Success',
  SEND_REQUEST_FAILURE: '[Requests API] Send Connection Request Failure',

  CANCEL_REQUEST: '[Requests] Cancel Sent Request',
  CANCEL_REQUEST_SUCCESS: '[Requests API] Cancel Sent Request Success',
  CANCEL_REQUEST_FAILURE: '[Requests API] Cancel Sent Request Failure',

  RESPOND_TO_REQUEST: '[Requests] Respond to Received Request',
  RESPOND_TO_REQUEST_SUCCESS:
    '[Requests API] Respond to Received Request Success',
  RESPOND_TO_REQUEST_FAILURE:
    '[Requests API] Respond to Received Request Failure',

  LOAD_SENT_REQUESTS: '[Requests] Load Sent Requests',
  LOAD_SENT_REQUESTS_SUCCESS: '[Requests API] Load Sent Requests Success',
  LOAD_SENT_REQUESTS_FAILURE: '[Requests API] Load Sent Requests Failure',

  LOAD_RECEIVED_REQUESTS: '[Requests] Load Received Requests',
  LOAD_RECEIVED_REQUESTS_SUCCESS:
    '[Requests API] Load Received Requests Success',
  LOAD_RECEIVED_REQUESTS_FAILURE:
    '[Requests API] Load Received Requests Failure',

  UPSERT_REQUEST: '[Requests] Upsert Request From Listener',
  REMOVE_REQUEST_LOCALLY: '[Requests] Remove Request From Listener',

  CLEAR_REQUESTS_STATE: '[Requests] Clear Requests State',
};

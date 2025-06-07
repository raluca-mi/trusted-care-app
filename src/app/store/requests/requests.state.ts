import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { ConnectionRequest as ConnectionRequest } from '../../connection-requests/models/connection-request.model';

export interface RequestsState extends EntityState<ConnectionRequest> {
  isLoadingSent: boolean;
  isLoadingReceived: boolean;
  error: string | null;
}

export const requestsAdapter: EntityAdapter<ConnectionRequest> =
  createEntityAdapter<ConnectionRequest>({
    selectId: (request: ConnectionRequest) => request.requestId,

    sortComparer: (a: ConnectionRequest, b: ConnectionRequest): number => {
      const dateA =
        a.createdAt instanceof Date
          ? a.createdAt.getTime()
          : (a.createdAt as any)?.toMillis();
      const dateB =
        b.createdAt instanceof Date
          ? b.createdAt.getTime()
          : (b.createdAt as any)?.toMillis();
      return dateB - dateA;
    },
  });

export const initialRequestsState: RequestsState =
  requestsAdapter.getInitialState({
    isLoadingSent: false,
    isLoadingReceived: false,
    error: null,
  });

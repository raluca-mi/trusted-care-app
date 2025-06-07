import { inject, Injectable } from '@angular/core';
import {
  Functions,
  httpsCallable,
  HttpsCallableResult,
} from '@angular/fire/functions';
import { catchError, from, map, Observable } from 'rxjs';
import { LoggerService } from '../../shared/services/logger.service';

export interface DeleteUserResult {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private functions = inject(Functions);
  private logger = inject(LoggerService);

  constructor() {}

  /**
   * Calls the 'deleteUser' HTTPS Callable Cloud Function to permanently
   * delete a user and all their associated data.
   * This should only be called from an admin-protected component.
   * @param uid The UID of the user to be deleted.
   * @returns An Observable that emits the success result from the function.
   */
  deleteUser(uid: string): Observable<DeleteUserResult> {
    this.logger.log(
      `AdminService: Preparing to call 'deleteUser' Cloud Function for UID: ${uid}`
    );

    // Get a reference to the 'deleteUser' Cloud Function
    const deleteUserCallable = httpsCallable<{ uid: string }, DeleteUserResult>(
      this.functions,
      'deleteUser'
    );

    // Call the function, passing the uid in the data object
    // Convert the resulting promise to an observable
    return from(deleteUserCallable({ uid: uid })).pipe(
      map((result: HttpsCallableResult<DeleteUserResult>) => {
        this.logger.log(
          'Cloud Function `deleteUser` returned success:',
          result.data
        );
        return result.data;
      }),
      catchError((error) => {
        this.logger.error(
          'AdminService: Error calling "deleteUser" Cloud Function:',
          error
        );
        // The error object from a callable function is structured and contains details
        // We can re-throw it so the component's error handler gets the detailed message
        throw error; // Propagate the HttpsError to the component
      })
    );
  }
}

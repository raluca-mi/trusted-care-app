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

  deleteUser(uid: string): Observable<DeleteUserResult> {
    this.logger.log(
      `AdminService: Preparing to call 'deleteUser' Cloud Function for UID: ${uid}`
    );

    const deleteUserCallable = httpsCallable<{ uid: string }, DeleteUserResult>(
      this.functions,
      'deleteUser'
    );

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

        throw error; 
      })
    );
  }
}

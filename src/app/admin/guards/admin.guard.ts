import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { map, Observable, skipWhile, take } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';
import { LoggerService } from '../../shared/services/logger.service';

export const adminGuard: CanActivateFn = (): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const logger = inject(LoggerService);

  return toObservable(authService.currentUser).pipe(
    skipWhile((userProfile) => userProfile === undefined),

    take(1),

    map((userProfile) => {
      const isAdmin = !!userProfile?.isAdmin;

      if (isAdmin) {
        logger.log('[AdminGuard] Access granted. User is an admin.');
        return true;
      } else {
        logger.warn(
          '[AdminGuard] Access denied. User is not an admin. Redirecting to /home.'
        );
        return router.createUrlTree(['/home']);
      }
    })
  );
};

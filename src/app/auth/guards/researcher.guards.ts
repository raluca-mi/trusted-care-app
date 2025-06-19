import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { map, Observable, skipWhile, take } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserType } from '../enums/user-type.enum';

export const researcherGuard: CanActivateFn = (): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return toObservable(authService.currentUser).pipe(
    skipWhile((userProfile) => userProfile === undefined),
    take(1),
    map((userProfile) => {
      const isResearcher = userProfile?.userType === UserType.Researcher;
      if (isResearcher) {
        return true;
      } else {
        return router.createUrlTree(['/home']);
      }
    })
  );
};

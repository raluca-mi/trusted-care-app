import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (): boolean | UrlTree => {

    const authService = inject(AuthService);
    const router = inject(Router);

    const isLoggedIn = !!authService.currentUser();

    if (isLoggedIn) {
        return true;
    } else {
        return router.createUrlTree(['/login']);
    }
};









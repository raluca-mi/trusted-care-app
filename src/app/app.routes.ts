import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        loadComponent: () => import('./auth/components/login/login.component').then(m => m.LoginComponent),
        title: 'Login - Trusted Care',
    },
    {
        path: 'register',
        loadComponent: () => import('./auth/components/register/register.component').then(m => m.RegisterComponent),
        title: 'Register - Trusted Care',
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/components/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Dashboard - Trusted Care',
        canActivate: [authGuard]
    },
    {
        path: '**',
        redirectTo: 'login'
    }

];

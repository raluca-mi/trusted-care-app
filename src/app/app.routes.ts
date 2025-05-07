import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth.guard';
import { AuthLayoutComponent } from './layouts/components/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layouts/components/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./auth/components/login/login.component').then(
            (m) => m.LoginComponent
          ),
        title: 'Login - Trusted Care',
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./auth/components/register/register.component').then(
            (m) => m.RegisterComponent
          ),
        title: 'Register - Trusted Care',
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/components/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
        title: 'Dashboard - Trusted Care',
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },

  {
    path: '**',
    redirectTo: 'login',
  },
];

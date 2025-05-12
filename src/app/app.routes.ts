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
        path: 'home',
        loadComponent: () =>
          import('./home-page/components/home-page/home-page.component').then(
            (m) => m.HomePageComponent
          ),
        title: 'Home - Trusted Care',
      },
      {
        path: 'settings',
        loadComponent: () =>
          import(
            './settings/components/user-settings/user-settings.component'
          ).then((m) => m.UserSettingsComponent),
        title: 'Settings - Trusted Care',
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },

      {
        path: '**',
        redirectTo: 'home',
      },
    ],
  },

  {
    path: '**',
    redirectTo: 'login',
  },
];

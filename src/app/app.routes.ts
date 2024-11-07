import { Routes } from '@angular/router';
import { emailVerifiedGuard } from './guards/email-verified.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component').then((c) => c.HomeComponent),
  },
  {
    path: 'select-login',
    loadComponent: () =>
      import('./auth/auth.component').then((c) => c.AuthComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/auth.component').then((c) => c.AuthComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./auth/auth.component').then((c) => c.AuthComponent),
  },
  {
    path: 'login-specialist',
    loadComponent: () =>
      import('./auth/auth.component').then((c) => c.AuthComponent),
  },
  {
    path: 'register-specialist',
    loadComponent: () =>
      import('./auth/auth.component').then((c) => c.AuthComponent),
  },
  {
    path: 'verify-email',
    loadComponent: () =>
      import('./pages/verify-email/verify-email.component').then(
        (c) => c.VerifyEmailComponent
      ),
  },
  {
    path: 'user-profile',
    loadComponent: () =>
      import('./pages/user-profile/user-profile.component').then(
        (c) => c.UserProfileComponent
      ),
    canActivate: [emailVerifiedGuard],
  },
  {
    path: 'specialist-profile',
    loadComponent: () =>
      import('./pages/specialist-profile/specialist-profile.component').then(
        (c) => c.SpecialistProfileComponent
      ),
    canActivate: [emailVerifiedGuard],
  },
];

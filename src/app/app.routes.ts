import { authGuard } from './guards/auth.guard';
import { Routes } from '@angular/router';
import { emailVerifiedGuard } from './guards/email-verified.guard';
import { patientGuard } from './guards/patient.guard';
import { specialistGuard } from './guards/specialist.guard';
import { authRedirectGuard } from './guards/auth-redirect.guard';
import { adminGuard } from './guards/admin.guard';

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
    canActivate: [authRedirectGuard],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/auth.component').then((c) => c.AuthComponent),
    canActivate: [authRedirectGuard],
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./auth/auth.component').then((c) => c.AuthComponent),
    canActivate: [authRedirectGuard],
  },
  {
    path: 'login-specialist',
    loadComponent: () =>
      import('./auth/auth.component').then((c) => c.AuthComponent),
    canActivate: [authRedirectGuard],
  },
  {
    path: 'register-specialist',
    loadComponent: () =>
      import('./auth/auth.component').then((c) => c.AuthComponent),
    canActivate: [authRedirectGuard],
  },
  {
    path: 'login-admin',
    loadComponent: () =>
      import('./auth/auth.component').then((c) => c.AuthComponent),
    canActivate: [authRedirectGuard],
  },
  {
    path: 'verify-email',
    loadComponent: () =>
      import('./pages/verify-email/verify-email.component').then(
        (c) => c.VerifyEmailComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'user-profile',
    loadComponent: () =>
      import('./pages/user-profile/user-profile.component').then(
        (c) => c.UserProfileComponent
      ),
    canActivate: [authGuard, emailVerifiedGuard, patientGuard],
  },
  {
    path: 'specialist-profile',
    loadComponent: () =>
      import('./pages/specialist-profile/specialist-profile.component').then(
        (c) => c.SpecialistProfileComponent
      ),
    canActivate: [authGuard, emailVerifiedGuard, specialistGuard],
  },
  {
    path: 'admin-dashboard',
    loadComponent: () =>
      import('./pages/specialist-profile/specialist-profile.component').then(
        (c) => c.SpecialistProfileComponent
      ),
    canActivate: [authGuard, adminGuard],
  },
];

import { authGuard } from './guards/auth.guard';
import { Routes } from '@angular/router';
import { emailVerifiedGuard } from './guards/email-verified.guard';
import { patientGuard } from './guards/patient.guard';
import { specialistGuard } from './guards/specialist.guard';
import { authRedirectGuard } from './guards/auth-redirect.guard';
import { adminGuard } from './guards/admin.guard';
import { specialistAccountVerifiedGuard } from './guards/specialist-account-verified.guard';

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
    path: 'verify-account',
    loadComponent: () =>
      import('./pages/verify-account/verify-account.component').then(
        (c) => c.VerifyAccountComponent
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
    canActivate: [
      authGuard,
      emailVerifiedGuard,
      specialistGuard,
      specialistAccountVerifiedGuard,
    ],
  },
  {
    path: 'admin-dashboard',
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-dashboard.component').then(
        (c) => c.AdminDashboardComponent
      ),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'admin-my-users',
    loadComponent: () =>
      import('./pages/my-users/my-users.component').then(
        (c) => c.MyUsersComponent
      ),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'admin-add-admin',
    loadComponent: () =>
      import('./pages/add-admin/add-admin.component').then(
        (c) => c.AddAdminComponent
      ),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'my-appointments',
    loadComponent: () =>
      import('./pages/my-appointments/my-appointments.component').then(
        (c) => c.MyAppointmentsComponent
      ),
    canActivate: [authGuard, emailVerifiedGuard, patientGuard],
  },
  {
    path: 'my-medical-records',
    loadComponent: () =>
      import('./pages/my-medical-records/my-medical-records.component').then(
        (c) => c.MyMedicalRecordsComponent
      ),
    canActivate: [authGuard, emailVerifiedGuard, patientGuard],
  },
  {
    path: 'appointments',
    loadComponent: () =>
      import(
        './pages/my-appointments-specialist/my-appointments-specialist.component'
      ).then((c) => c.MyAppointmentsSpecialistComponent),
    canActivate: [
      authGuard,
      emailVerifiedGuard,
      specialistGuard,
      specialistAccountVerifiedGuard,
    ],
  },
  {
    path: 'my-patients',
    loadComponent: () =>
      import(
        './pages/my-patients-specialist/my-patients-specialist.component'
      ).then((c) => c.MyPatientsSpecialistComponent),
    canActivate: [
      authGuard,
      emailVerifiedGuard,
      specialistGuard,
      specialistAccountVerifiedGuard,
    ],
  },
  {
    path: 'admin-appointments',
    loadComponent: () =>
      import('./pages/appointments-admin/appointments-admin.component').then(
        (c) => c.AppointmentsAdminComponent
      ),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'admin-appointment-request',
    loadComponent: () =>
      import(
        './pages/admin-appointment-request/admin-appointment-request.component'
      ).then((c) => c.AdminAppointmentRequestComponent),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then(
        (c) => c.NotFoundComponent
      ),
  },
];

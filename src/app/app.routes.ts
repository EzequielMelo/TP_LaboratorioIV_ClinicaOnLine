import { Routes } from '@angular/router';

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
    path: 'login',
    loadComponent: () =>
      import('./auth/auth.component').then((c) => c.AuthComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./auth/auth.component').then((c) => c.AuthComponent),
  },
];

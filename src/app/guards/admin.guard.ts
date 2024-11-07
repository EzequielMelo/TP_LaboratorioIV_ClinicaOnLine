import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  let auth = false;

  const authService = inject(AuthService);
  const router = inject(Router);

  authService.user$.subscribe((user) => {
    if (user?.userType === 'admin') {
      auth = true;
    } else {
      router.navigate(['']);
      auth = false;
    }
  });
  return auth;
};

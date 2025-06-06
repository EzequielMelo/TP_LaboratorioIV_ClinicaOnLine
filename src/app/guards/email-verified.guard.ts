import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const emailVerifiedGuard: CanActivateFn = async (route, state) => {
  let auth = false;

  const authService = inject(AuthService);
  const router = inject(Router);

  authService.authUser$.subscribe((user) => {
    if (user != null) {
      if (user?.emailVerified) {
        auth = true;
      } else {
        router.navigate(['/verify-email']);
        auth = false;
      }
    } else {
      router.navigate(['']);
      auth = false;
    }
  });
  return auth;
};

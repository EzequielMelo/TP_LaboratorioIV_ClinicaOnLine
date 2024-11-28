import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { inject } from '@angular/core';
import { Specialist } from '../classes/specialist.class';
import { firstValueFrom } from 'rxjs';

export const specialistAccountVerifiedGuard: CanActivateFn = async (
  route,
  state
) => {
  let auth = false;

  const authService = inject(AuthService);
  const router = inject(Router);

  const user = await firstValueFrom(authService.user$);

  if (user?.userType == 'specialist' && (user as Specialist).accountConfirmed) {
    auth = true;
  } else {
    router.navigate(['/verify-account']);
    auth = false;
  }

  return auth;
};

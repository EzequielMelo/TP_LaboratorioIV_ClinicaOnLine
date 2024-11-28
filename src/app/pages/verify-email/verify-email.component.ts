import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.css',
})
export class VerifyEmailComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  onVerifyEmail() {
    this.auth.checkEmailVerification().subscribe((isVerified) => {
      if (isVerified) {
        this.router.navigate(['/user-profile']);
      }
    });
  }
}

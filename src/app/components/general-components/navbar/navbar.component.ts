import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { UserTypes } from '../../../models/user-types';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  user: UserTypes | null = null;
  auth: boolean = false;
  private userSubscription: Subscription;

  protected authService = inject(AuthService);

  constructor() {
    this.authService.authUser$.subscribe((response) => {
      if (response) {
        this.auth = true;
      } else {
        this.auth = false;
      }
    });
    this.userSubscription = this.authService.user$.subscribe((user) => {
      this.user = user;
    });
  }

  logOut() {
    this.authService.logOut();
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}

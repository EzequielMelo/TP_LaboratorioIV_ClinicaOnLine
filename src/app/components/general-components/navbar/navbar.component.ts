import { LoadingService } from './../../../services/loading/loading.service';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { UserTypes } from '../../../models/user-types';
import { Observable, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  user: UserTypes | null = null;
  auth: boolean = false;
  isLoading$: Observable<boolean>;
  private userSubscription: Subscription;

  protected authService = inject(AuthService);
  private loadingService = inject(LoadingService);

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
    this.isLoading$ = this.loadingService.isLoading$;
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

import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Subscription } from 'rxjs';
import { UserTypes } from '../../models/user-types';
import { UsersSectionComponent } from '../../components/admin-dashboard-components/users-section/users-section.component';
import { CreateNewAdminSectionComponent } from '../../components/admin-dashboard-components/create-new-admin-section/create-new-admin-section.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [UsersSectionComponent, CreateNewAdminSectionComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent {
  user: UserTypes | null = null;
  auth: boolean = false;
  currentSection: 'users' | 'addAdmin' | null = null;

  protected authService = inject(AuthService);
  private userSubscription: Subscription;

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

  sectionSelector(section: 'users' | 'addAdmin' | null) {
    this.currentSection = section;
  }
}

import { Component } from '@angular/core';
import { UserTypes } from '../../models/user-types';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { Specialist } from '../../classes/specialist.class';

@Component({
  selector: 'app-specialist-profile',
  standalone: true,
  imports: [],
  templateUrl: './specialist-profile.component.html',
  styleUrl: './specialist-profile.component.css',
})
export class SpecialistProfileComponent {
  user: UserTypes | null = null;
  private userSubscription: Subscription | undefined;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.user$.subscribe((user) => {
      this.user = user;
    });
  }

  getSpecialistWorkDays(): string[] | null {
    if (this.user instanceof Specialist) {
      return this.user.workDays;
    }
    return null;
  }

  getSpecialistSpecialtys(): string[] | null {
    if (this.user instanceof Specialist) {
      return this.user.specialty;
    }
    return null;
  }
}

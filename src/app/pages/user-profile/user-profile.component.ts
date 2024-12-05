import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Subscription } from 'rxjs';
import { UserTypes } from '../../models/user-types';
import { Patient } from '../../classes/patient.class';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css',
})
export class UserProfileComponent {
  user: UserTypes | null = null;
  private userSubscription: Subscription | undefined;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.user$.subscribe((user) => {
      this.user = user;
    });
  }

  getCoverPicture(): string | null {
    if (this.user instanceof Patient) {
      return this.user.coverPicture; // Ahora puedes acceder a coverPicture si el usuario es de tipo Patient
    }
    return null; // O algún valor por defecto si no es un paciente
  }
}

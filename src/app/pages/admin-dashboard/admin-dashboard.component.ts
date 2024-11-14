import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Subscription } from 'rxjs';
import { UserTypes } from '../../models/user-types';
import { DatabaseService } from '../../services/database/database.service';
import { SpecialistListComponent } from '../../components/admin-dashboard-components/specialist-list/specialist-list.component';
import { AdminListComponent } from '../../components/admin-dashboard-components/admin-list/admin-list.component';
import { PatientListComponent } from '../../components/admin-dashboard-components/patient-list/patient-list.component';
import { Specialist } from '../../classes/specialist.class';
import { Patient } from '../../classes/patient.class';
import { Admin } from '../../classes/admin.class';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [SpecialistListComponent, PatientListComponent, AdminListComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent {
  user: UserTypes | null = null;
  auth: boolean = false;
  specialists: Specialist[] = [];
  patients: Patient[] = [];
  admins: Admin[] = [];
  currentList: 'specialists' | 'patients' | 'admins' | null = null;

  protected authService = inject(AuthService);
  private userSubscription: Subscription;
  private db = inject(DatabaseService);

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

  loadSpecialists() {
    this.clearLists();
    this.currentList = 'specialists';
    this.db.getSpecialists().subscribe((data) => {
      this.specialists = data;
    });
  }

  loadPatients() {
    this.clearLists();
    this.currentList = 'patients';
    this.db.getPatients().subscribe((data) => {
      this.patients = data;
    });
  }

  loadAdmins() {
    this.clearLists();
    this.currentList = 'admins';
    this.db.getAdmins().subscribe((data) => {
      this.admins = data;
    });
  }

  clearLists() {
    this.specialists = [];
    this.patients = [];
    this.admins = [];
  }
}

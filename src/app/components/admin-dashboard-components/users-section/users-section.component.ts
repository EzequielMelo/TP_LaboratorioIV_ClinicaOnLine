import { Component, inject } from '@angular/core';
import { UserTypes } from '../../../models/user-types';
import { Specialist } from '../../../classes/specialist.class';
import { Patient } from '../../../classes/patient.class';
import { Admin } from '../../../classes/admin.class';
import { AuthService } from '../../../services/auth/auth.service';
import { Subscription } from 'rxjs';
import { DatabaseService } from '../../../services/database/database.service';
import { SpecialistListComponent } from '../specialist-list/specialist-list.component';
import { PatientListComponent } from '../patient-list/patient-list.component';
import { AdminListComponent } from '../admin-list/admin-list.component';

@Component({
  selector: 'app-users-section',
  standalone: true,
  imports: [SpecialistListComponent, PatientListComponent, AdminListComponent],
  templateUrl: './users-section.component.html',
  styleUrl: './users-section.component.css',
})
export class UsersSectionComponent {
  specialists: Specialist[] = [];
  patients: Patient[] = [];
  admins: Admin[] = [];
  currentList: 'specialists' | 'patients' | 'admins' | null = null;

  private db = inject(DatabaseService);

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

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Specialist } from '../../../classes/specialist.class';
import { AppUser } from '../../../classes/user.model';
import { Patient } from '../../../classes/patient.class';

@Component({
  selector: 'app-users-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users-table.component.html',
  styleUrl: './users-table.component.css',
})
export class UsersTableComponent {
  @Input() data: any[] = [];
  @Input() userType: string = '';

  // Eventos hacia el padre
  @Output() accountConfirmedChange = new EventEmitter<Specialist>();
  @Output() patientSelected = new EventEmitter<Patient>();

  onSelectPatient(user: Patient) {
    this.patientSelected.emit(user);
  }

  onCheckboxClick(event: Event, user: Specialist) {
    event.stopPropagation();
    this.accountConfirmedChange.emit(user);
  }

  trackById(index: number, user: AppUser) {
    return user.id;
  }
}

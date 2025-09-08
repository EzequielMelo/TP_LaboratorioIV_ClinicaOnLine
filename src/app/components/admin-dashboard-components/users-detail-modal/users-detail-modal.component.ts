import { PatientMedicalRecordsComponent } from './../../my-patients/patient-medical-records/patient-medical-records.component';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MedicalRecordsListComponent } from '../../medical-records/medical-records-list/medical-records-list.component';

@Component({
  selector: 'app-users-detail-modal',
  standalone: true,
  imports: [CommonModule, PatientMedicalRecordsComponent],
  templateUrl: './users-detail-modal.component.html',
  styleUrl: './users-detail-modal.component.css',
})
export class UsersDetailModalComponent {
  @Input() showPatientHealthRecord: boolean = false;
  @Input() selectedPatient: any = null;
  @Output() closeModalEvent = new EventEmitter<void>();

  closeModal(): void {
    this.closeModalEvent.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  getUserHeaderClass(userType: string): string {
    switch (userType) {
      case 'admin':
        return 'bg-gradient-to-r from-purple-600 to-purple-700';
      case 'specialist':
        return 'bg-gradient-to-r from-green-600 to-green-700';
      case 'patient':
        return 'bg-gradient-to-r from-blue-600 to-blue-700';
      default:
        return 'bg-gradient-to-r from-gray-600 to-gray-700';
    }
  }

  getUserAvatarClass(userType: string): string {
    switch (userType) {
      case 'admin':
        return 'bg-purple-800 text-white';
      case 'specialist':
        return 'bg-green-800 text-white';
      case 'patient':
        return 'bg-blue-800 text-white';
      default:
        return 'bg-gray-800 text-white';
    }
  }

  getUserTypeChipClass(userType: string): string {
    switch (userType) {
      case 'admin':
        return 'bg-white bg-opacity-20 text-purple-100';
      case 'specialist':
        return 'bg-white bg-opacity-20 text-green-100';
      case 'patient':
        return 'bg-white bg-opacity-20 text-blue-100';
      default:
        return 'bg-white bg-opacity-20 text-gray-100';
    }
  }

  getUserTypeLabel(userType: string): string {
    switch (userType) {
      case 'admin':
        return 'Administrador';
      case 'specialist':
        return 'Especialista';
      case 'patient':
        return 'Paciente';
      default:
        return 'Usuario';
    }
  }

  getInitials(name?: string, lastName?: string): string {
    if (!name && !lastName) return 'U';
    const nameInitial = name ? name.charAt(0).toUpperCase() : '';
    const lastNameInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return nameInitial + lastNameInitial || 'U';
  }
}

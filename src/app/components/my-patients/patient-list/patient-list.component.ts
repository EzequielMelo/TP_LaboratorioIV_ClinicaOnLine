import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Patient } from '../../../classes/patient.class';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-list.component.html',
  styleUrl: './patient-list.component.css',
})
export class PatientListComponent {
  @Input() patients: Patient[] | null = null;
  @Input() keyWord: string | null = null;
  @Output() patientSelected = new EventEmitter<Patient>();

  getInitials(name: string, lastName: string): string {
    // Verificar que al menos uno de los parámetros tenga valor
    if (!name && !lastName) return 'N/A';

    let initials = '';

    // Obtener inicial del nombre
    if (name && name.trim()) {
      initials += name.trim().charAt(0).toUpperCase();
    }

    // Obtener inicial del apellido
    if (lastName && lastName.trim()) {
      initials += lastName.trim().charAt(0).toUpperCase();
    }

    // Si solo tenemos una inicial, intentar obtener otra del nombre completo
    if (initials.length === 1 && name && name.trim()) {
      const nameParts = name.trim().split(' ');
      if (nameParts.length > 1) {
        // Si el nombre tiene múltiples partes, usar la primera y última
        initials =
          nameParts[0].charAt(0).toUpperCase() +
          nameParts[nameParts.length - 1].charAt(0).toUpperCase();
      }
    }

    // Si aún tenemos solo una inicial, intentar con el apellido
    if (initials.length === 1 && lastName && lastName.trim()) {
      const lastNameParts = lastName.trim().split(' ');
      if (lastNameParts.length > 1) {
        initials =
          initials.charAt(0) + lastNameParts[0].charAt(0).toUpperCase();
      }
    }

    return initials || 'N/A';
  }

  viewPatientHistory(patient: Patient) {
    // Implementar navegación al historial detallado
    // this.router.navigate(['/patient-history', patientId]);
    console.log('Ver historial del paciente:', patient.id);
    this.patientSelected.emit(patient);

    // O abrir modal con el historial
    // this.openPatientHistoryModal(patientId);
  }
}

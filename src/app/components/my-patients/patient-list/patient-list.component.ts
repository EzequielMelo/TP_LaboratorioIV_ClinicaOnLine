import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Patient } from '../../../classes/patient.class';
import { HealthRecordService } from '../../../services/health-record/health-record.service';
import { PatientAppointmentData } from '../../../classes/patient-appointment';
import { FormatDniPipe } from '../../../pipes/format-dni.pipe';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, FormatDniPipe],
  templateUrl: './patient-list.component.html',
  styleUrl: './patient-list.component.css',
})
export class PatientListComponent {
  @Input() patients: Patient[] | null = null;
  @Input() keyWord: string | null = null;
  @Output() patientSelected = new EventEmitter<Patient>();

  // Nuevas propiedades
  patientAppointments: { [patientId: string]: PatientAppointmentData[] } = {};
  loadingAppointments: { [patientId: string]: boolean } = {};

  private healthRecordService = inject(HealthRecordService);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['patients'] && changes['patients'].currentValue) {
      this.loadAppointmentsForAllPatients();
    }
  }

  // Método para obtener pacientes filtrados
  get filteredPatients(): Patient[] {
    if (!this.patients) {
      return [];
    }

    if (!this.keyWord || this.keyWord.trim() === '') {
      return this.patients;
    }

    const keyword = this.keyWord.toLowerCase().trim();

    const filtered = this.patients.filter((patient) => {
      // Filtrar por nombre
      const fullName = `${patient.name || ''} ${patient.lastName || ''}`
        .toLowerCase()
        .trim();

      if (fullName.includes(keyword)) {
        return true;
      }

      // Filtrar por DNI solo si el keyword contiene números
      if (patient.dni) {
        const keywordClean = keyword.replace(/\D/g, '');

        // Solo buscar por DNI si el keyword tiene al menos un número
        if (keywordClean.length > 0) {
          const dniClean = patient.dni.replace(/\D/g, '');
          if (dniClean.includes(keywordClean)) {
            return true;
          }
        }
      }

      return false;
    });

    return filtered;
  }

  private loadAppointmentsForAllPatients(): void {
    if (!this.patients) return;

    this.patients.forEach((patient) => {
      this.loadPatientAppointments(patient.id);
    });
  }

  private loadPatientAppointments(patientId: string): void {
    if (this.loadingAppointments[patientId]) return;

    this.loadingAppointments[patientId] = true;

    this.healthRecordService.getAppointmentsByPatient(patientId).subscribe({
      next: (data: PatientAppointmentData[]) => {
        // Ordenar por fecha y tomar solo los últimos 3
        this.patientAppointments[patientId] = data
          .sort((a, b) => {
            const dateA = a.appointmentDate
              ? a.appointmentDate.toDate().getTime()
              : 0;
            const dateB = b.appointmentDate
              ? b.appointmentDate.toDate().getTime()
              : 0;
            return dateB - dateA;
          })
          .slice(0, 3);

        this.loadingAppointments[patientId] = false;
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        this.patientAppointments[patientId] = [];
        this.loadingAppointments[patientId] = false;
      },
    });
  }

  getLastThreeAppointments(patientId: string): PatientAppointmentData[] {
    return this.patientAppointments[patientId] || [];
  }

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
  }

  trackByPatient(index: number, patient: Patient): string {
    return patient.id;
  }
}

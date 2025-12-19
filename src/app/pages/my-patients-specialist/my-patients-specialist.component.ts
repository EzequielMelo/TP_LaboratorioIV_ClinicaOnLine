import { User } from './../../classes/user';
import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { AppointmentsService } from '../../services/appointments/appointments.service';
import { Patient } from '../../classes/patient.class';
import { PatientListComponent } from '../../components/my-patients/patient-list/patient-list.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PatientMedicalRecordsComponent } from '../../components/my-patients/patient-medical-records/patient-medical-records.component';

@Component({
  selector: 'app-my-patients-specialist',
  standalone: true,
  imports: [
    PatientListComponent,
    PatientMedicalRecordsComponent,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './my-patients-specialist.component.html',
  styleUrl: './my-patients-specialist.component.css',
})
export class MyPatientsSpecialistComponent {
  userId: string | null = null;
  patients: Patient[] = [];
  loading: boolean = false;
  searchForm: FormGroup;
  showPatientList = true;
  showMedicalRecords = false;
  selectedPatient: any = null;
  currentSearchKeyword: string = '';

  protected authService = inject(AuthService);
  private appointmentService = inject(AppointmentsService);

  constructor(private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      keyWord: [''],
    });

    // Suscribirse a los cambios del formulario
    this.searchForm.get('keyWord')?.valueChanges.subscribe((value) => {
      this.currentSearchKeyword = value || '';
    });
  }

  ngOnInit() {
    this.authService.user$.subscribe((userClass: User | null) => {
      if (userClass && userClass.id) {
        this.userId = userClass.id;
      }
    });
    this.loadPatients();
  }

  async loadPatients() {
    this.loading = true;
    try {
      this.appointmentService
        .getPatientsAttendedBySpecialist(this.userId!)
        .subscribe({
          next: (patients) => {
            this.patients = patients;
            this.loading = false;
          },
          error: (error) => {
            console.error('Error:', error);
            this.loading = false;
          },
        });
    } catch (error) {
      console.error('Error cargando pacientes:', error);
    } finally {
      this.loading = false;
    }
  }

  onPatientSelected(patient: Patient): void {
    this.selectedPatient = patient;
    this.showPatientList = false;
    this.showMedicalRecords = true;
  }

  // Método para volver a la lista de pacientes
  backToPatientList(): void {
    this.selectedPatient = null;
    this.showPatientList = true;
    this.showMedicalRecords = false;
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

  getTotalPatients(): number {
    return this.patients?.length || 0;
  }

  // Método para obtener fecha y hora actual
  getCurrentDateTime(): string {
    return new Date().toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  clearSearch(): void {
    this.searchForm.patchValue({ keyWord: '' });
  }

  onSearch(): void {
    // El filtrado se maneja automáticamente en el componente hijo
    // a través del binding de keyWord
  }
}

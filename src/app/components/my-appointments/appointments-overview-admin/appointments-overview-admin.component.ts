import { Component, inject } from '@angular/core';
import { Appointment } from '../../../classes/appointment';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { DatabaseService } from '../../../services/database/database.service';
import { AppointmentsService } from '../../../services/appointments/appointments.service';
import { User } from '../../../classes/user';
import { CommonModule } from '@angular/common';
import { AppointmentsListSpecialistComponent } from '../appointments-list-specialist/appointments-list-specialist.component';
import { AppointmentsListAdminComponent } from '../appointments-list-admin/appointments-list-admin.component';

@Component({
  selector: 'app-appointments-overview-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AppointmentsListAdminComponent],
  templateUrl: './appointments-overview-admin.component.html',
  styleUrl: './appointments-overview-admin.component.css',
})
export class AppointmentsOverviewAdminComponent {
  userId: string | null = null;
  appointmentsNew: Appointment[] = [];
  appointmentsAccepted: Appointment[] = [];
  appointmentsCompleted: Appointment[] = [];
  appointmentsRejected: Appointment[] = [];
  appointmentsCanceled: Appointment[] = [];
  displayedAppointments: Appointment[] = [];
  searchForm: FormGroup;

  protected authService = inject(AuthService);
  private db = inject(DatabaseService);
  private appointmentService = inject(AppointmentsService);

  constructor(private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      keyWord: [''],
    });
  }

  ngOnInit() {
    this.authService.user$.subscribe((userClass: User | null) => {
      if (userClass && userClass.id) {
        this.userId = userClass.id;
      }
    });
    this.loadAppointments();
    this.searchForm.get('keyWord')?.valueChanges.subscribe;
  }

  loadAppointments() {
    this.appointmentService.getAllAppointments().subscribe({
      next: (appointments) => {
        this.appointmentsNew = appointments.filter(
          (a) => a.appointmentStatus === 'Sin Asignar'
        );
        this.appointmentsAccepted = appointments.filter(
          (a) => a.appointmentStatus === 'Aceptado'
        );
        this.appointmentsCompleted = appointments.filter(
          (a) => a.appointmentStatus === 'Realizado'
        );
        this.appointmentsRejected = appointments.filter(
          (a) => a.appointmentStatus === 'Rechazado'
        );
        this.appointmentsCanceled = appointments.filter(
          (a) => a.appointmentStatus === 'Cancelado'
        );
        this.displayedAppointments = this.appointmentsNew;
      },
      error: (err) => {
        console.error('Error al cargar los turnos:', err);
      },
    });
  }

  showAppointments(status: string) {
    switch (status) {
      case 'Sin Asignar':
        this.displayedAppointments = this.appointmentsNew;
        break;
      case 'Aceptado':
        this.displayedAppointments = this.appointmentsAccepted;
        break;
      case 'Realizado':
        this.displayedAppointments = this.appointmentsCompleted;
        break;
      case 'Rechazado':
        this.displayedAppointments = this.appointmentsRejected;
        break;
      case 'Cancelado':
        this.displayedAppointments = this.appointmentsCanceled;
        break;
    }
  }

  onSearch() {
    const keyWord = this.searchForm.get('keyWord')?.value;
    console.log('Search submitted:', keyWord);

    if (keyWord) {
      this.displayedAppointments = this.displayedAppointments.filter(
        (appointment) =>
          appointment.specialistName
            .toLowerCase()
            .includes(keyWord.toLowerCase()) ||
          appointment.speciality.toLowerCase().includes(keyWord.toLowerCase())
      );
    } else {
      this.db.getAppointments(this.userId!).subscribe((appointments) => {
        this.displayedAppointments = appointments;
      });
    }
  }
}

import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { DatabaseService } from '../../../services/database/database.service';
import { User } from '../../../classes/user';
import { Appointment } from '../../../classes/appointment';
import { CommonModule } from '@angular/common';
import { AppointmentsListComponent } from '../appointments-list/appointments-list.component';

@Component({
  selector: 'app-appointments-overview',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AppointmentsListComponent],
  templateUrl: './appointments-overview.component.html',
  styleUrl: './appointments-overview.component.css',
})
export class AppointmentsOverviewComponent {
  userId: string | null = null;
  searchForm: FormGroup;
  appointmentsNew: Appointment[] = [];
  appointmentsAccepted: Appointment[] = [];
  appointmentsCanceled: Appointment[] = [];
  displayedAppointments: Appointment[] = [];

  protected authService = inject(AuthService);
  private db = inject(DatabaseService);

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
    this.db.getAppointments(this.userId!).subscribe({
      next: (appointments) => {
        this.appointmentsNew = appointments.filter(
          (a) => a.appointmentStatus === 'Sin Asignar'
        );
        this.appointmentsAccepted = appointments.filter(
          (a) =>
            a.appointmentStatus === 'Aceptado' ||
            a.appointmentStatus === 'Completado'
        );
        this.appointmentsCanceled = appointments.filter(
          (a) =>
            a.appointmentStatus === 'Rechazado' ||
            a.appointmentStatus === 'Cancelado'
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

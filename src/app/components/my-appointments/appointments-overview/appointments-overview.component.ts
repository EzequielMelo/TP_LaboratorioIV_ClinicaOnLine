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
  appointments: Appointment[] = [];

  protected authService = inject(AuthService);
  private db = inject(DatabaseService);

  constructor(private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      keyWord: [''], // Inicializamos keyWord vacío
    });
  }

  ngOnInit() {
    this.authService.user$.subscribe((userClass: User | null) => {
      if (userClass && userClass.id) {
        this.userId = userClass.id;
        this.db.getAppointments(this.userId).subscribe((appointments) => {
          this.appointments = appointments;
        });
      }
    });

    this.searchForm.get('keyWord')?.valueChanges.subscribe((value: string) => {
      console.log('Search keyword changed:', value);
      // Aquí podrías filtrar los datos directamente en appointments o hacer un nuevo fetch.
    });
  }

  onSearch() {
    const keyWord = this.searchForm.get('keyWord')?.value;
    console.log('Search submitted:', keyWord);

    if (keyWord) {
      // Filtrar los turnos existentes
      this.appointments = this.appointments.filter(
        (appointment) =>
          appointment.specialistName
            .toLowerCase()
            .includes(keyWord.toLowerCase()) ||
          appointment.speciality.toLowerCase().includes(keyWord.toLowerCase())
      );
    } else {
      // Si no hay búsqueda, recargar los turnos desde el servicio
      this.db.getAppointments(this.userId!).subscribe((appointments) => {
        this.appointments = appointments;
      });
    }
  }
}

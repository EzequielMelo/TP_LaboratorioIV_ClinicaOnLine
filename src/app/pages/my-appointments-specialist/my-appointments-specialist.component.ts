import { Component } from '@angular/core';
import { AppointmentsOverviewSpecialistComponent } from '../../components/my-appointments/appointments-overview-specialist/appointments-overview-specialist.component';

@Component({
  selector: 'app-my-appointments-specialist',
  standalone: true,
  imports: [AppointmentsOverviewSpecialistComponent],
  templateUrl: './my-appointments-specialist.component.html',
  styleUrl: './my-appointments-specialist.component.css',
})
export class MyAppointmentsSpecialistComponent {}

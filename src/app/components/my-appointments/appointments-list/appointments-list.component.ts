import { CommonModule } from '@angular/common';
import { Component, Input, input } from '@angular/core';
import { Appointment } from '../../../classes/appointment';

@Component({
  selector: 'app-appointments-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointments-list.component.html',
  styleUrl: './appointments-list.component.css',
})
export class AppointmentsListComponent {
  @Input() appointments: Appointment[] | null = null;
  @Input() keyWord: string | null = null;

  get filteredAppointments(): Appointment[] {
    if (!this.keyWord || this.keyWord.trim() === '') {
      return this.appointments || [];
    }
    const lowerCaseKeyWord = this.keyWord.trim().toLowerCase();
    return (this.appointments || []).filter(
      (appointment) =>
        (appointment.specialistName &&
          appointment.specialistName
            .toLowerCase()
            .includes(lowerCaseKeyWord)) ||
        (appointment.speciality &&
          appointment.speciality.toLowerCase().includes(lowerCaseKeyWord))
    );
  }
}

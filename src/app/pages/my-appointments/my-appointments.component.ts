import { Component } from '@angular/core';
import { AppointmentsOverviewComponent } from '../../components/my-appointments/appointments-overview/appointments-overview.component';
import { AppointmentRequestComponent } from '../../components/my-appointments/appointment-request/appointment-request.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-appointments',
  standalone: true,
  imports: [
    AppointmentsOverviewComponent,
    AppointmentRequestComponent,
    CommonModule,
  ],
  templateUrl: './my-appointments.component.html',
  styleUrl: './my-appointments.component.css',
})
export class MyAppointmentsComponent {
  // Variable para controlar qué componente mostrar
  showAppointmentRequest: boolean = true;

  activeView: 'overview' | 'request' = 'overview'; // vista por defecto

  setActiveView(view: 'overview' | 'request') {
    this.activeView = view;
  }

  get isOverview(): boolean {
    return this.activeView === 'overview';
  }

  get isRequest(): boolean {
    return this.activeView === 'request';
  }

  // Método para cambiar el estado según el botón presionado
  toggleView(view: string) {
    if (view === 'request') {
      this.showAppointmentRequest = true;
    } else if (view === 'overview') {
      this.showAppointmentRequest = false;
    }
  }
}

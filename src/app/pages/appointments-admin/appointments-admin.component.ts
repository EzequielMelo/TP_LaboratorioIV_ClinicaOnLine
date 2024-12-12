import { Component } from '@angular/core';
import { AppointmentsOverviewAdminComponent } from '../../components/my-appointments/appointments-overview-admin/appointments-overview-admin.component';

@Component({
  selector: 'app-appointments-admin',
  standalone: true,
  imports: [AppointmentsOverviewAdminComponent],
  templateUrl: './appointments-admin.component.html',
  styleUrl: './appointments-admin.component.css',
})
export class AppointmentsAdminComponent {}

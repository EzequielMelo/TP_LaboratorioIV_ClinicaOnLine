import { Component } from '@angular/core';
import { MedicalRecordsOverviewComponent } from '../../components/medical-records/medical-records-overview/medical-records-overview.component';

@Component({
  selector: 'app-my-medical-records',
  standalone: true,
  imports: [MedicalRecordsOverviewComponent],
  templateUrl: './my-medical-records.component.html',
  styleUrl: './my-medical-records.component.css',
})
export class MyMedicalRecordsComponent {}

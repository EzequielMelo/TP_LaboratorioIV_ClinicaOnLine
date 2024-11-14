import { Component, Input } from '@angular/core';
import { Patient } from '../../../classes/patient.class';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [],
  templateUrl: './patient-list.component.html',
  styleUrl: './patient-list.component.css',
})
export class PatientListComponent {
  @Input() data: Patient[] | null = null;
}

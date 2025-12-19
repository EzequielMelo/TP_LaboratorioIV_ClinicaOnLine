import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Patient } from '../../../classes/patient.class';
import { FormatDniPipe } from '../../../pipes/format-dni.pipe';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [FormatDniPipe],
  templateUrl: './patient-list.component.html',
  styleUrl: './patient-list.component.css',
})
export class PatientListComponent {
  @Input() data: Patient[] | null = null;
  @Output() patientEvent: EventEmitter<any> = new EventEmitter<any>();

  selectedPatient(patient: any) {
    this.patientEvent.emit(patient);
  }
}

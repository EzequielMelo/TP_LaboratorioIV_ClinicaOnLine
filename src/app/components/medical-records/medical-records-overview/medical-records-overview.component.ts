import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MedicalRecordsListComponent } from '../medical-records-list/medical-records-list.component';
import { AuthService } from '../../../services/auth/auth.service';
import { User } from '../../../classes/user';
import { HealthRecordService } from '../../../services/health-record/health-record.service';
import { PatientAppointmentData } from '../../../classes/patient-appointment';

@Component({
  selector: 'app-medical-records-overview',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MedicalRecordsListComponent],
  templateUrl: './medical-records-overview.component.html',
  styleUrl: './medical-records-overview.component.css',
})
export class MedicalRecordsOverviewComponent {
  userId: string | null = null;
  searchForm: FormGroup;
  displayedRecords: PatientAppointmentData[] = [];

  protected authService = inject(AuthService);
  private healthRecordService = inject(HealthRecordService);

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
    this.loadMedicalRecords();
    this.searchForm.get('keyWord')?.valueChanges.subscribe;
  }

  private loadMedicalRecords() {
    if (!this.userId) return;

    this.healthRecordService.getAppointmentsByPatient(this.userId).subscribe(
      (data: PatientAppointmentData[]) => {
        this.displayedRecords = data;
      },
      (error) => {
        console.error('Error loading medical records:', error);
      }
    );
  }

  onSearch() {
    const keyWord = this.searchForm.get('keyWord')?.value;
    console.log('Search submitted:', keyWord);

    if (keyWord) {
      this.displayedRecords = this.displayedRecords.filter(
        (medicalRecord) =>
          medicalRecord.specialistName
            .toLowerCase()
            .includes(keyWord.toLowerCase()) ||
          medicalRecord.speciality.toLowerCase().includes(keyWord.toLowerCase())
      );
    } else {
      this.healthRecordService
        .getAppointmentsByPatient(this.userId!)
        .subscribe((medicalRecords) => {
          this.displayedRecords = medicalRecords;
        });
    }
  }
}

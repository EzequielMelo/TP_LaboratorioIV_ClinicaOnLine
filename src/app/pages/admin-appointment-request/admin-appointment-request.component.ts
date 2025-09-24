import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DatabaseService } from '../../services/database/database.service';
import { AppointmentsService } from '../../services/appointments/appointments.service';
import { Specialist } from '../../classes/specialist.class';
import { UserTypes } from '../../models/user-types';
import { AuthService } from '../../services/auth/auth.service';
import { Subscription } from 'rxjs';
import { Appointment } from '../../classes/appointment';
import { Timestamp } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { PatientListComponent } from '../../components/admin-dashboard-components/patient-list/patient-list.component';
import { Patient } from '../../classes/patient.class';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-appointment-request',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    PatientListComponent,
  ],
  templateUrl: './admin-appointment-request.component.html',
  styleUrl: './admin-appointment-request.component.css',
})
export class AdminAppointmentRequestComponent {
  schedule: any[] = [];
  newAppointmentForm: FormGroup;
  searchForm: FormGroup;
  specialtys: string[] = [];
  selectedSpecialist: Specialist | null = null;
  specialists: Specialist[] = [];
  patients: Patient[] = [];
  selectedDaySlots: string[] = [];
  user: UserTypes | null = null;
  patient: Patient | null = null;

  private formBuilder = inject(FormBuilder);
  private db = inject(DatabaseService);
  private appointment = inject(AppointmentsService);
  private userSubscription: Subscription;
  protected authService = inject(AuthService);

  constructor() {
    this.userSubscription = this.authService.user$.subscribe((user) => {
      this.user = user;
    });

    this.newAppointmentForm = this.formBuilder.group({
      selectedPatient: ['', [Validators.required]],
      specialty: ['', Validators.required],
      specialistName: ['', Validators.required],
      selectedDay: ['', Validators.required],
      selectedSlot: ['', Validators.required],
    });

    this.db.getPatients().subscribe((data) => {
      this.patients = data;
    });

    this.searchForm = this.formBuilder.group({
      keyWord: [''],
    });
  }

  ngOnInit() {
    this.db.getSpecialtys().subscribe((specialtys) => {
      if (specialtys) {
        this.specialtys = specialtys as string[];
        console.log(this.specialtys);
      }
    });

    this.newAppointmentForm
      .get('specialty')
      ?.valueChanges.subscribe((selectedSpecialty) => {
        if (selectedSpecialty) {
          this.db
            .getSpecialistsBySpecialty(selectedSpecialty)
            .subscribe((specialists) => {
              this.specialists = specialists;
            });
        }
      });

    this.newAppointmentForm
      .get('specialistName')
      ?.valueChanges.subscribe((selectedSpecialistId) => {
        const selectedSpecialist = this.specialists.find(
          (spec) => spec.id === selectedSpecialistId
        );
        if (selectedSpecialist) {
          // Obtener horario del especialista
          this.appointment
            .getSpecialistSchedule(selectedSpecialist)
            .subscribe((schedule) => {
              this.schedule = schedule.map((day) => ({
                ...day,
                date: day.date,
              }));
              console.log(this.schedule);
            });
        }
      });
  }

  onDayChange(event: Event) {
    const selectedIndex = (event.target as HTMLSelectElement).value;
    if (selectedIndex !== '') {
      const selectedDay = this.schedule[parseInt(selectedIndex, 10)];
      const selectedDate = selectedDay.date;
      const specialistId = this.newAppointmentForm.get('specialistName')?.value;

      console.log('Fecha seleccionada: ', selectedDate);

      this.appointment
        .getAppointmentsBySpecialistAndDate(specialistId, selectedDate)
        .subscribe({
          next: (appointments) => {
            const takenSlots = appointments.map((appt: any) => {
              const date = appt.appointmentDate.toDate();
              console.log('Fecha turnos de Firestore: ', date);

              const hours = date.getHours();
              const minutes = date.getMinutes();
              const formattedSlot = `${hours}:${minutes
                .toString()
                .padStart(2, '0')}`;

              console.log(`Turno ocupado: ${formattedSlot}`);
              return formattedSlot;
            });

            this.selectedDaySlots = this.schedule[
              parseInt(selectedIndex, 10)
            ].slots.filter((slot: string) => {
              const [slotHour, slotMinute] = slot.split(':').map(Number);
              const formattedSlot = `${slotHour}:${slotMinute
                .toString()
                .padStart(2, '0')}`;

              console.log(`Slot disponible: ${formattedSlot}`);
              console.log(
                `Comparando con turno ocupado: ${takenSlots.join(', ')}`
              );

              return !takenSlots.includes(formattedSlot);
            });

            console.log('Horarios disponibles: ', this.selectedDaySlots);

            Swal.close(); // Cerrar el loading
          },
          error: (error) => {
            Swal.close();
            Swal.fire({
              icon: 'error',
              title: 'Error al cargar horarios',
              text: 'No se pudieron cargar los horarios disponibles',
              confirmButtonColor: '#dc3545',
              confirmButtonText: 'Reintentar',
            });
          },
        });
    }
  }

  onSpecialistChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedSpecialistId = selectElement.value;

    const selectedSpecialist = this.specialists.find(
      (specialist) => specialist.id === selectedSpecialistId
    );

    if (selectedSpecialist) {
      this.selectedSpecialist = selectedSpecialist;
      const fullName = `${selectedSpecialist.name} ${selectedSpecialist.lastName}`;
      this.newAppointmentForm.patchValue({ specialistName: fullName });

      // Toast para confirmar selección de especialista
      Swal.fire({
        icon: 'success',
        title: 'Especialista seleccionado',
        text: `Dr. ${fullName}`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
    }
  }

  onSubmit() {
    if (!this.newAppointmentForm.valid) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor completa todos los campos requeridos.',
        confirmButtonColor: '#ffc107',
        confirmButtonText: 'Entendido',
      });
      return;
    }

    if (!this.patient) {
      Swal.fire({
        icon: 'warning',
        title: 'Paciente requerido',
        text: 'Debes seleccionar un paciente para crear la cita.',
        confirmButtonColor: '#ffc107',
        confirmButtonText: 'Entendido',
      });
      return;
    }

    // Mostrar confirmación antes de crear la cita
    const formValues = this.newAppointmentForm.value;
    const selectedDay = this.schedule[formValues.selectedDay];
    const selectedSlot = this.selectedDaySlots[formValues.selectedSlot];

    Swal.fire({
      title: '¿Confirmar creación de cita?',
      html: `
        <div style="text-align: left;">
          <p><strong>Paciente:</strong> ${this.patient.name} ${this.patient.lastName}</p>
          <p><strong>Especialidad:</strong> ${formValues.specialty}</p>
          <p><strong>Especialista:</strong> ${formValues.specialistName}</p>
          <p><strong>Fecha:</strong> ${selectedDay.date}</p>
          <p><strong>Hora:</strong> ${selectedSlot}</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#dc3545',
      confirmButtonText: 'Sí, crear cita',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.createAppointment();
      }
    });
  }

  private createAppointment() {
    const formValues = this.newAppointmentForm.value;
    const selectedDay = this.schedule[formValues.selectedDay];
    const selectedSlot = this.selectedDaySlots[formValues.selectedSlot];
    const [hour, minute] = selectedSlot.split(':');

    const appointmentDate = new Date(selectedDay.date + 'T00:00:00');
    appointmentDate.setHours(Number(hour));
    appointmentDate.setMinutes(Number(minute));

    const appointment: Partial<Appointment> = {
      idPatient: this.patient?.id,
      patientName: `${this.patient?.name} ${this.patient?.lastName}`,
      idSpecialist: this.selectedSpecialist?.id,
      message: 'Se solicita un nuevo turno',
      speciality: formValues.specialty,
      requestedDate: Timestamp.fromDate(new Date()),
      appointmentDate: Timestamp.fromDate(appointmentDate),
      appointmentStatus: 'Sin Asignar',
      isCancelable: true,
      specialistName: formValues.specialistName,
      idMedicalReport: null,
    };

    // Mostrar loading durante la creación
    Swal.fire({
      title: 'Creando cita médica...',
      text: 'Por favor espera mientras procesamos la información',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.appointment.addAppointment(appointment).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Cita creada exitosamente!',
          html: `
            <div style="text-align: left;">
              <p>La cita médica ha sido programada para:</p>
              <p><strong>Paciente:</strong> ${this.patient?.name} ${this.patient?.lastName}</p>
              <p><strong>Fecha:</strong> ${selectedDay.date}</p>
              <p><strong>Hora:</strong> ${selectedSlot}</p>
              <p><strong>Especialista:</strong> ${formValues.specialistName}</p>
            </div>
          `,
          confirmButtonColor: '#28a745',
          confirmButtonText: 'Excelente',
          timer: 5000,
          timerProgressBar: true,
        }).then(() => {
          this.resetForm();
        });
      },
      error: (err) => {
        console.error('Error al crear el turno:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error al crear la cita',
          text: 'Hubo un error al intentar crear la cita médica. Por favor inténtalo de nuevo.',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Reintentar',
          footer:
            '<span style="color: #6c757d;">Si el problema persiste, contacta al soporte técnico</span>',
        });
      },
    });
  }

  private resetForm() {
    this.newAppointmentForm.reset();
    this.patient = null;
    this.selectedSpecialist = null;
    this.selectedDaySlots = [];
    this.schedule = [];
  }

  receivePatient(selectedPatient: Patient): void {
    this.patient = selectedPatient;
    this.newAppointmentForm.controls['selectedPatient'].setValue(
      selectedPatient.id
    );

    // Confirmar selección de paciente
    Swal.fire({
      icon: 'success',
      title: 'Paciente seleccionado',
      text: `${selectedPatient.name} ${selectedPatient.lastName} - DNI: ${selectedPatient.dni}`,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
  }

  formatPatient(patient: Patient): string {
    return `${patient.dni} - ${patient.name} ${patient.lastName}`;
  }

  onSearch() {
    const keyWord = this.searchForm.get('keyWord')?.value;
    console.log('Search submitted:', keyWord);

    if (keyWord) {
      const filteredPatients = this.patients.filter(
        (patients) =>
          patients.name.toLowerCase().includes(keyWord.toLowerCase()) ||
          patients.lastName.toLowerCase().includes(keyWord.toLowerCase()) ||
          patients.dni.toLowerCase().includes(keyWord.toLowerCase())
      );

      this.patients = filteredPatients;

      if (filteredPatients.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'Sin resultados',
          text: 'No se encontraron pacientes que coincidan con la búsqueda.',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Búsqueda completada',
          text: `${filteredPatients.length} paciente(s) encontrado(s)`,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });
      }
    } else {
      this.db.getPatients().subscribe((data) => {
        this.patients = data;
      });
    }
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }
}

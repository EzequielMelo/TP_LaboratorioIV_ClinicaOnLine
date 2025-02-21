import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, LOCALE_ID } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DatabaseService } from '../../../services/database/database.service';
import { AppointmentsService } from '../../../services/appointments/appointments.service';
import { Specialist } from '../../../classes/specialist.class';
import { Appointment } from '../../../classes/appointment';
import { Timestamp } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { UserTypes } from '../../../models/user-types';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-appointment-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './appointment-request.component.html',
  styleUrl: './appointment-request.component.css',
})
export class AppointmentRequestComponent implements OnInit {
  schedule: any[] = [];
  newAppointmentForm: FormGroup;
  specialtys: string[] = [];
  selectedSpecialist: Specialist | null = null;
  specialists: Specialist[] = [];
  selectedDaySlots: string[] = [];
  user: UserTypes | null = null;

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
      specialty: ['', Validators.required],
      specialistName: ['', Validators.required],
      selectedDay: ['', Validators.required],
      selectedSlot: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.db.getSpecialtys().subscribe((specialtys) => {
      if (specialtys) {
        this.specialtys = specialtys as string[]; // Asigna los datos obtenidos
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
                date: day.date, // Deja la fecha tal cual, ya está en formato correcto
              })); // Actualizar el horario completo
              console.log(this.schedule);
            });
        }
      });
  }

  onDayChange(event: Event) {
    const selectedIndex = (event.target as HTMLSelectElement).value;
    if (selectedIndex !== '') {
      const selectedDay = this.schedule[parseInt(selectedIndex, 10)];
      const selectedDate = selectedDay.date; // Fecha seleccionada
      const specialistId = this.newAppointmentForm.get('specialistName')?.value;

      console.log('Fecha seleccionada: ', selectedDate);

      // Obtener las citas existentes para este especialista y día
      this.appointment
        .getAppointmentsBySpecialistAndDate(specialistId, selectedDate)
        .subscribe((appointments) => {
          const takenSlots = appointments.map((appt: any) => {
            const date = appt.appointmentDate.toDate(); // Convertir Timestamp a Date
            console.log('Fecha turnos de Firestore: ', date);

            // Usar la hora local en vez de UTC
            const hours = date.getHours();
            const minutes = date.getMinutes();
            const formattedSlot = `${hours}:${minutes
              .toString()
              .padStart(2, '0')}`;

            console.log(`Turno ocupado: ${formattedSlot}`);
            return formattedSlot;
          });

          // Filtrar los horarios disponibles
          this.selectedDaySlots = this.schedule[
            parseInt(selectedIndex, 10)
          ].slots.filter((slot: string) => {
            // Obtener la hora y minuto del slot en formato local
            const [slotHour, slotMinute] = slot.split(':').map(Number);
            const formattedSlot = `${slotHour}:${slotMinute
              .toString()
              .padStart(2, '0')}`;

            // Comparar si la hora del slot está ocupada
            console.log(`Slot disponible: ${formattedSlot}`);
            console.log(
              `Comparando con turno ocupado: ${takenSlots.join(', ')}`
            );

            return !takenSlots.includes(formattedSlot); // Solo mostrar el slot si no está ocupado
          });

          // Imprimir los horarios disponibles después del filtro
          console.log('Horarios disponibles: ', this.selectedDaySlots);
        });
    }
  }

  onSpecialistChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedSpecialistId = selectElement.value;

    // Buscar el especialista en la lista de especialistas
    const selectedSpecialist = this.specialists.find(
      (specialist) => specialist.id === selectedSpecialistId
    );

    if (selectedSpecialist) {
      this.selectedSpecialist = selectedSpecialist; // Actualizamos la variable con el especialista seleccionado
      // Juntar nombre y apellido y actualizar el formulario
      const fullName = `${selectedSpecialist.name} ${selectedSpecialist.lastName}`;
      this.newAppointmentForm.patchValue({ specialistName: fullName });
    }
  }

  onSubmit() {
    if (this.newAppointmentForm.valid) {
      const formValues = this.newAppointmentForm.value;

      // Obtener el día seleccionado
      const selectedDay = this.schedule[formValues.selectedDay];

      // Obtener la hora seleccionada (hora y minuto) y combinarlo con el día seleccionado
      const selectedSlot = this.selectedDaySlots[formValues.selectedSlot];
      const [hour, minute] = selectedSlot.split(':'); // Asumiendo que el formato es 'HH:mm'

      // Crear la fecha completa
      const appointmentDate = new Date(selectedDay.date + 'T00:00:00'); // Agrega tiempo explícito si solo tienes la fecha
      appointmentDate.setHours(Number(hour));
      appointmentDate.setMinutes(Number(minute));

      // Crear el objeto de cita
      const appointment: Partial<Appointment> = {
        idPatient: this.user?.id, // ID del paciente autenticado
        patientName: `${this.user?.name} ${this.user?.lastName}`,
        idSpecialist: this.selectedSpecialist?.id,
        message: 'Se solicita un nuevo turno',
        speciality: formValues.specialty,
        requestedDate: Timestamp.fromDate(new Date()), // Fecha de solicitud actual
        appointmentDate: Timestamp.fromDate(appointmentDate), // La fecha y hora combinadas
        appointmentStatus: 'Sin Asignar',
        isCancelable: true,
        specialistName: formValues.specialistName,
        idMedicalReport: null,
      };

      // Llamar al servicio para agregar el turno
      this.appointment.addAppointment(appointment).subscribe({
        next: () => {
          alert('Turno creado exitosamente');
          this.newAppointmentForm.reset(); // Limpiar el formulario
        },
        error: (err) => {
          console.error('Error al crear el turno:', err);
          alert('Hubo un error al intentar crear el turno.');
        },
      });
    } else {
      alert('Por favor completa todos los campos requeridos.');
    }
  }
}

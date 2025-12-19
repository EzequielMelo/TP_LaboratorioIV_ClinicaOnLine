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
import { CaptchaDirective } from '../../../directives/captcha.directive';
import { Patient } from '../../../classes/patient.class';
import Swal from 'sweetalert2';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-appointment-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, CaptchaDirective],
  templateUrl: './appointment-request.component.html',
  styleUrl: './appointment-request.component.css',
  animations: [
    trigger('stepAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(30px)' }),
        animate(
          '300ms ease-out',
          style({ opacity: 1, transform: 'translateX(0)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '200ms ease-in',
          style({ opacity: 0, transform: 'translateX(-30px)' })
        ),
      ]),
    ]),
  ],
})
export class AppointmentRequestComponent implements OnInit {
  // Estados de los pasos
  currentStep: number = 1;

  // Datos seleccionados
  selectedSpecialty: string = '';
  selectedSpecialist: Specialist | null = null;
  selectedDay: any = null;
  selectedDayIndex: number = -1;
  selectedTimeSlot: string = '';
  selectedTimeSlotIndex: number = -1;

  // Datos del formulario
  schedule: any[] = [];
  specialtys: string[] = [];
  specialists: Specialist[] = [];
  selectedDaySlots: string[] = [];

  // Estado del usuario y captcha
  user: UserTypes | null = null;
  captchaEnabled = true;
  captchaOk = false;
  captchaTouched = false;

  // Servicios
  private formBuilder = inject(FormBuilder);
  private db = inject(DatabaseService);
  private appointment = inject(AppointmentsService);
  private userSubscription: Subscription;
  protected authService = inject(AuthService);

  constructor() {
    this.userSubscription = this.authService.user$.subscribe((user) => {
      this.user = user;
      if (user instanceof Patient) {
        this.captchaEnabled = user.settings?.useCaptcha ?? true;
        if (!this.captchaEnabled) {
          this.captchaOk = true;
        }
      } else {
        this.captchaEnabled = true;
        this.captchaOk = true;
      }
    });
  }

  ngOnInit() {
    this.loadSpecialties();
    this.updateStepIndicator();
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  // Cargar especialidades al inicio
  loadSpecialties() {
    this.db.getSpecialtys().subscribe((specialtys) => {
      if (specialtys) {
        this.specialtys = specialtys as string[];
        console.log('Especialidades cargadas:', this.specialtys);
      }
    });
  }

  // Actualizar indicador de pasos
  updateStepIndicator() {
    // Esta función puede usarse para actualizar el indicador visual de pasos
    console.log('Paso actual:', this.currentStep);
  }

  // PASO 1: Seleccionar especialidad
  selectSpecialty(specialty: string) {
    this.selectedSpecialty = specialty;
    this.currentStep = 2;
    this.loadSpecialists(specialty);
    this.updateStepIndicator();
  }

  // Cargar especialistas por especialidad
  loadSpecialists(specialty: string) {
    this.db.getSpecialistsBySpecialty(specialty).subscribe((specialists) => {
      this.specialists = specialists;
      console.log('Especialistas cargados:', specialists);
    });
  }

  // PASO 2: Seleccionar especialista
  selectSpecialist(specialist: Specialist) {
    this.selectedSpecialist = specialist;
    this.currentStep = 3;
    this.loadSpecialistSchedule(specialist);
    this.updateStepIndicator();
  }

  // Cargar horario del especialista
  loadSpecialistSchedule(specialist: Specialist) {
    this.appointment.getSpecialistSchedule(specialist).subscribe((schedule) => {
      this.schedule = schedule.map((day) => ({
        ...day,
        date: day.date,
      }));
      console.log('Horario cargado:', this.schedule);
    });
  }

  // PASO 3: Seleccionar día
  selectDay(dayIndex: number) {
    this.selectedDayIndex = dayIndex;
    this.selectedDay = this.schedule[dayIndex];
    this.currentStep = 4;
    this.loadAvailableSlots(dayIndex);
    this.updateStepIndicator();
  }

  // Cargar horarios disponibles para el día seleccionado
  loadAvailableSlots(dayIndex: number) {
    const selectedDay = this.schedule[dayIndex];
    const selectedDate = selectedDay.date;
    const specialistId = this.selectedSpecialist?.id;

    if (!specialistId) return;

    console.log('Cargando slots para fecha:', selectedDate);

    this.appointment
      .getAppointmentsBySpecialistAndDate(specialistId, selectedDate)
      .subscribe((appointments) => {
        const takenSlots = appointments.map((appt: any) => {
          const date = appt.appointmentDate.toDate();
          const hours = date.getHours();
          const minutes = date.getMinutes();
          const formattedSlot = `${hours}:${minutes
            .toString()
            .padStart(2, '0')}`;
          console.log(`Turno ocupado: ${formattedSlot}`);
          return formattedSlot;
        });

        // Filtrar horarios disponibles
        this.selectedDaySlots = this.schedule[dayIndex].slots.filter(
          (slot: string) => {
            const [slotHour, slotMinute] = slot.split(':').map(Number);
            const formattedSlot = `${slotHour}:${slotMinute
              .toString()
              .padStart(2, '0')}`;
            return !takenSlots.includes(formattedSlot);
          }
        );

        console.log('Horarios disponibles:', this.selectedDaySlots);
      });
  }

  // PASO 4: Seleccionar horario
  selectTimeSlot(slotIndex: number) {
    this.selectedTimeSlotIndex = slotIndex;
    this.selectedTimeSlot = this.selectedDaySlots[slotIndex];
    console.log('Horario seleccionado:', this.selectedTimeSlot);
  }

  // Navegación hacia atrás
  goBackToStep(step: number) {
    this.currentStep = step;

    // Limpiar datos según el paso
    if (step === 1) {
      this.selectedSpecialty = '';
      this.selectedSpecialist = null;
      this.selectedDay = null;
      this.selectedTimeSlot = '';
      this.specialists = [];
      this.schedule = [];
      this.selectedDaySlots = [];
    } else if (step === 2) {
      this.selectedSpecialist = null;
      this.selectedDay = null;
      this.selectedTimeSlot = '';
      this.schedule = [];
      this.selectedDaySlots = [];
    } else if (step === 3) {
      this.selectedDay = null;
      this.selectedTimeSlot = '';
      this.selectedDaySlots = [];
    }

    this.updateStepIndicator();
  }

  // Formatear fecha (DD/MM)
  formatDate(date: any): string {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  }

  // Obtener nombre del día
  getDayName(date: any): string {
    const d = new Date(date);
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return days[d.getDay()];
  }

  // Formatear hora (HH:MMam/pm)
  formatTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const ampm = hours >= 12 ? 'pm' : 'am';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')}${ampm}`;
  }

  // Obtener imagen de especialidad
  getSpecialtyImage(specialty: string): string {
    // Mapeo de especialidades a imágenes (ajusta según tus imágenes)
    const specialtyImages: { [key: string]: string } = {
      Cardiologia: '/cardiologia.png',
      Pediatria: '/pediatria.png',
      Oftalmologia: 'oftalmologia.png',
    };

    return specialtyImages[specialty] || '/assets/images/default-specialty.jpg';
  }

  // Obtener imagen del especialista
  getSpecialistImage(specialist: Specialist): string {
    // Asume que el especialista tiene una propiedad profileImage
    return (
      (specialist as any).profilePicture || '/assets/images/default-doctor.jpg'
    );
  }

  // Manejar error de imagen de especialidad
  onSpecialtyImageError(event: any) {
    event.target.src = '/logo.png'; // Logo de la clínica
  }

  // Manejar error de imagen genérico
  onImageError(event: any) {
    event.target.src = '/assets/images/default-avatar.jpg';
  }

  // Validar si el formulario está completo
  isFormValid(): boolean {
    return !!(
      this.selectedSpecialty &&
      this.selectedSpecialist &&
      this.selectedDay &&
      this.selectedTimeSlot
    );
  }

  // Enviar formulario
  onSubmit() {
    if (!this.isFormValid()) {
      Swal.fire({
        icon: 'warning',
        title: 'Solicitud incompleta',
        text: 'Por favor complete todos los pasos antes de continuar.',
        confirmButtonColor: '#ffc107',
        confirmButtonText: 'Entendido',
      });
      return;
    }

    if (!this.captchaOk) {
      Swal.fire({
        icon: 'warning',
        title: 'Captcha requerido',
        text: 'Por favor resuelve el captcha antes de continuar.',
        confirmButtonColor: '#ffc107',
        confirmButtonText: 'Entendido',
      });
      return;
    }

    this.createAppointment();
  }

  // Crear la cita médica
  private createAppointment() {
    const [hour, minute] = this.selectedTimeSlot.split(':');
    const appointmentDate = new Date(this.selectedDay.date + 'T00:00:00');
    appointmentDate.setHours(Number(hour));
    appointmentDate.setMinutes(Number(minute));

    const appointment: Partial<Appointment> = {
      idPatient: this.user?.id,
      patientName: `${this.user?.name} ${this.user?.lastName}`,
      idSpecialist: this.selectedSpecialist?.id,
      message: 'Se solicita un nuevo turno',
      speciality: this.selectedSpecialty,
      requestedDate: Timestamp.fromDate(new Date()),
      appointmentDate: Timestamp.fromDate(appointmentDate),
      appointmentStatus: 'Sin Asignar',
      isCancelable: true,
      specialistName: `${this.selectedSpecialist?.name} ${this.selectedSpecialist?.lastName}`,
      idMedicalReport: null,
      idReviewForPatient: null,
      idReviewForSpecialist: null,
    };

    // Mostrar loading durante la creación
    Swal.fire({
      title: 'Enviando solicitud...',
      text: 'Por favor espera mientras procesamos tu solicitud',
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
          title: '¡Solicitud enviada exitosamente!',
          html: `
            <div style="text-align: left;">
              <p>Tu solicitud de turno ha sido enviada con los siguientes datos:</p>
              <p><strong>Especialidad:</strong> ${this.selectedSpecialty}</p>
              <p><strong>Especialista:</strong> Dr. ${
                this.selectedSpecialist?.name
              } ${this.selectedSpecialist?.lastName}</p>
              <p><strong>Fecha:</strong> ${this.formatDate(
                this.selectedDay.date
              )}</p>
              <p><strong>Hora:</strong> ${this.formatTime(
                this.selectedTimeSlot
              )}</p>
              <br>
              <p style="color: #6c757d; font-size: 0.9em;">Recibirás una confirmación una vez que el especialista revise tu solicitud.</p>
            </div>
          `,
          confirmButtonColor: '#28a745',
          confirmButtonText: 'Perfecto',
          timer: 8000,
          timerProgressBar: true,
        }).then(() => {
          this.resetForm();
        });
      },
      error: (err) => {
        console.error('Error al crear el turno:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error al enviar solicitud',
          text: 'Hubo un error al intentar enviar tu solicitud. Por favor inténtalo de nuevo.',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Reintentar',
        });
      },
    });
  }

  // Resetear formulario
  resetForm() {
    this.currentStep = 1;
    this.selectedSpecialty = '';
    this.selectedSpecialist = null;
    this.selectedDay = null;
    this.selectedTimeSlot = '';
    this.specialists = [];
    this.schedule = [];
    this.selectedDaySlots = [];
    this.captchaOk = false;
    this.captchaTouched = false;
    this.updateStepIndicator();
  }

  // Métodos de utilidad
  trackByIndex(index: number, item: any): number {
    return index;
  }

  onCaptchaResult(success: boolean) {
    this.captchaTouched = true;
    this.captchaOk = success;
  }
}

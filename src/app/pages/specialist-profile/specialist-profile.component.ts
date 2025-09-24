import { Component, inject } from '@angular/core';
import { UserTypes } from '../../models/user-types';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { Specialist } from '../../classes/specialist.class';
import { DayToSpanishPipe } from '../../pipes/day-to-spanish.pipe';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatabaseService } from '../../services/database/database.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-specialist-profile',
  standalone: true,
  imports: [DayToSpanishPipe, CommonModule, FormsModule, RouterLink],
  templateUrl: './specialist-profile.component.html',
  styleUrl: './specialist-profile.component.css',
})
export class SpecialistProfileComponent {
  user: UserTypes | null = null;
  private userSubscription: Subscription | undefined;
  private db = inject(DatabaseService);
  isEditModalOpen: boolean = false;
  specialistWorkDays: string[] = [];
  specialistWorkHours: { start: string; end: string } = {
    start: '',
    end: '',
  };

  // Propiedades para validación
  hasStartTimeError: boolean = false;
  hasEndTimeError: boolean = false;
  hasTimeRangeError: boolean = false;

  daysOfTheWeek: string[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.user$.subscribe((user) => {
      this.user = user;
    });
  }

  getSpecialistWorkDays(): string[] | null {
    const daysOfWeekOrder = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];

    if (this.user instanceof Specialist) {
      return this.user.workDays.sort(
        (a, b) => daysOfWeekOrder.indexOf(a) - daysOfWeekOrder.indexOf(b)
      );
    }
    return null;
  }

  getSpecialistWorkHours(): string[] | null {
    if (this.user instanceof Specialist) {
      const hours = Object.values(this.user.workHours);
      return hours.sort((a, b) => a.localeCompare(b));
    }
    return null;
  }

  specialistWorkHoursWithStartAndEnd(): { start: string; end: string } | null {
    if (this.user instanceof Specialist && this.user.workHours) {
      const hours = Object.values(this.user.workHours).sort((a, b) =>
        a.localeCompare(b)
      );
      if (hours.length > 1) {
        return { start: hours[0], end: hours[1] };
      }
    }
    return null;
  }

  getSpecialistSpecialtys(): string[] | null {
    if (this.user instanceof Specialist) {
      return this.user.specialty;
    }
    return null;
  }

  editWorkDays() {
    this.isEditModalOpen = true;
    this.loadSpecialistData();
  }

  saveWorkDays() {
    if (!this.isFormValid()) {
      return;
    }

    console.log('Días seleccionados: ', this.specialistWorkDays);
    console.log('Horarios seleccionados: ', this.specialistWorkHours);

    if (this.user instanceof Specialist) {
      this.db.updateSpecialistData(
        this.user.id,
        this.specialistWorkDays,
        this.specialistWorkHours
      );
    }
    this.isEditModalOpen = false;
  }

  closeModal() {
    this.isEditModalOpen = false;
    this.specialistWorkDays = this.getSpecialistWorkDays() || [];
    this.clearValidationErrors();
  }

  onDaySelectionChange(day: string, isSelected: boolean): void {
    if (isSelected) {
      this.specialistWorkDays.push(day);
    } else {
      const index = this.specialistWorkDays.indexOf(day);
      if (index !== -1) {
        this.specialistWorkDays.splice(index, 1);
      }
    }
  }

  loadSpecialistData() {
    if (this.user instanceof Specialist) {
      this.specialistWorkDays = this.getSpecialistWorkDays() || [];
      this.specialistWorkHours = this.specialistWorkHoursWithStartAndEnd() || {
        start: '08:00',
        end: '17:00',
      };
    }
    this.clearValidationErrors();
  }

  // Validación de hora de inicio
  validateStartTime(): void {
    this.hasStartTimeError = false;
    this.hasTimeRangeError = false;

    if (!this.specialistWorkHours.start) {
      return;
    }

    const startTime = this.specialistWorkHours.start;
    const [hours, minutes] = startTime.split(':').map(Number);

    // Validar rango 8:00 - 19:00
    if (hours < 8 || hours > 19 || (hours === 19 && minutes > 0)) {
      this.hasStartTimeError = true;
      return;
    }

    // Validar que la hora de inicio sea anterior a la de fin
    if (
      this.specialistWorkHours.end &&
      startTime >= this.specialistWorkHours.end
    ) {
      this.hasTimeRangeError = true;
    }
  }

  // Validación de hora de fin
  validateEndTime(): void {
    this.hasEndTimeError = false;
    this.hasTimeRangeError = false;

    if (!this.specialistWorkHours.end) {
      return;
    }

    const endTime = this.specialistWorkHours.end;
    const [hours, minutes] = endTime.split(':').map(Number);

    // Validar rango 8:00 - 19:00
    if (hours < 8 || hours > 19 || (hours === 19 && minutes > 0)) {
      this.hasEndTimeError = true;
      return;
    }

    // Validar que la hora de fin sea posterior a la de inicio
    if (
      this.specialistWorkHours.start &&
      endTime <= this.specialistWorkHours.start
    ) {
      this.hasTimeRangeError = true;
    }
  }

  // Limpiar errores de validación
  clearValidationErrors(): void {
    this.hasStartTimeError = false;
    this.hasEndTimeError = false;
    this.hasTimeRangeError = false;
  }

  // Validar formulario completo
  isFormValid(): boolean {
    if (this.specialistWorkDays.length === 0) {
      return false;
    }

    if (!this.specialistWorkHours.start || !this.specialistWorkHours.end) {
      return false;
    }

    // Validar formato de tiempo
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (
      !timeRegex.test(this.specialistWorkHours.start) ||
      !timeRegex.test(this.specialistWorkHours.end)
    ) {
      return false;
    }

    // Validar rangos
    this.validateStartTime();
    this.validateEndTime();

    return (
      !this.hasStartTimeError &&
      !this.hasEndTimeError &&
      !this.hasTimeRangeError
    );
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
  }
}

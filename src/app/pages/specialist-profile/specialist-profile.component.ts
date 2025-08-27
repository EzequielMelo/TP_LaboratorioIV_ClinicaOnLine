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
  specialistWorkDays: string[] = []; // Aquí se guardan los días seleccionados
  specialistWorkHours: { start: string; end: string } = {
    start: '',
    end: '',
  };
  daysOfTheWeek: string[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
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
      'Sunday',
    ];

    if (this.user instanceof Specialist) {
      // Ordena los días seleccionados en base al orden de `daysOfWeekOrder`
      return this.user.workDays.sort(
        (a, b) => daysOfWeekOrder.indexOf(a) - daysOfWeekOrder.indexOf(b)
      );
    }
    return null;
  }

  getSpecialistWorkHours(): string[] | null {
    if (this.user instanceof Specialist) {
      const hours = Object.values(this.user.workHours);
      return hours.sort((a, b) => a.localeCompare(b)); // Ordena los horarios del menor al mayor
    }
    return null;
  }

  specialistWorkHoursWithStartAndEnd(): { start: string; end: string } | null {
    if (this.user instanceof Specialist && this.user.workHours) {
      const hours = Object.values(this.user.workHours).sort((a, b) =>
        a.localeCompare(b)
      );
      // Suponiendo que hay al menos dos valores, uno para start y otro para end:
      if (hours.length > 1) {
        return { start: hours[0], end: hours[1] };
      }
    }
    return null; // Devuelve null si no hay datos o el formato no es válido
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
    // Prellenar los datos en el modal si es necesario
  }

  // Guardar cambios (enviar a backend o actualizar estado)
  saveWorkDays() {
    // Lógica para guardar los días y horarios modificados
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

  // Cerrar el popup sin guardar
  closeModal() {
    this.isEditModalOpen = false;
    this.specialistWorkDays = this.getSpecialistWorkDays() || [];
  }

  onDaySelectionChange(day: string, isSelected: boolean): void {
    if (isSelected) {
      // Si se selecciona el checkbox, agrega el día
      this.specialistWorkDays.push(day);
    } else {
      // Si se des-selecciona el checkbox, elimina el día
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
        start: '',
        end: '',
      };
    }
  }

  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
  }
}

import { inject, Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import {
  addDoc,
  collection,
  doc,
  Firestore,
  setDoc,
  Timestamp,
} from '@angular/fire/firestore';
import { catchError, from, map, Observable, throwError } from 'rxjs';
import { addDays, format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { Specialist } from '../../classes/specialist.class';
import { Appointment } from '../../classes/appointment';

@Injectable({
  providedIn: 'root',
})
export class AppointmentsService {
  private firestore = inject(AngularFirestore);
  private fire = inject(Firestore);

  private getWorkingDays(workDays: string[]): string[] {
    const workingDays: string[] = [];
    let dayCount = 0;

    const timeZone = 'America/Argentina/Buenos_Aires'; // Ajusta según tu zona horaria

    while (workingDays.length < 15) {
      const date = addDays(new Date(), dayCount);
      const dayName = formatInTimeZone(date, timeZone, 'EEEE'); // Nombre del día

      if (workDays.includes(dayName)) {
        workingDays.push(formatInTimeZone(date, timeZone, 'yyyy-MM-dd')); // Fecha ajustada
      }
      dayCount++;
    }

    console.log('Días laborales generados:', workingDays);
    return workingDays;
  }

  // Generar slots disponibles según el horario de trabajo
  private getAvailableSlots(start: string, end: string): string[] {
    const startMinutes = this.convertToMinutes(start);
    const endMinutes = this.convertToMinutes(end);
    const slotDuration = 45; // 45 minutos por turno
    const slots: string[] = [];

    for (let time = startMinutes; time < endMinutes; time += slotDuration) {
      slots.push(this.convertToTimeString(time));
    }
    return slots;
  }

  private convertToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private convertToTimeString(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }

  // Generar turnos disponibles para un especialista
  public getSpecialistSchedule(specialist: Specialist): Observable<any[]> {
    const workDays = specialist.workDays; // Ejemplo: ["Monday", "Wednesday"]
    const workHours = specialist.workHours; // Ejemplo: { start: "09:00", end: "15:00" }

    // Generar horario completo (sin filtrar turnos ocupados)
    const schedule = this.getWorkingDays(workDays).map((day) => ({
      date: day, // Ya en formato "yyyy-MM-dd"
      slots: this.getAvailableSlots(workHours.start, workHours.end),
    }));

    // Filtrar turnos ocupados desde Firebase
    return this.firestore
      .collection('appointments', (ref) =>
        ref.where('idSpecialist', '==', specialist.id)
      )
      .valueChanges()
      .pipe(
        map((appointments: any[]) => {
          const occupiedSlots = appointments.map((appt) => {
            const appointmentDate = appt.appointmentDate.toDate(); // Convertir a Date
            const formattedDate = format(appointmentDate, 'yyyy-MM-dd'); // Asegurar mismo formato
            const formattedTime = format(appointmentDate, 'HH:mm'); // Solo la hora

            return `${formattedDate} ${formattedTime}`;
          });

          // Filtrar slots ocupados
          return schedule.map((day) => ({
            date: day.date,
            slots: day.slots.filter(
              (slot) => !occupiedSlots.includes(`${day.date} ${slot}`)
            ),
          }));
        })
      );
  }

  getAppointmentsBySpecialistAndDate(specialistId: string, date: string) {
    return this.firestore
      .collection('appointments', (ref) =>
        ref
          .where('idSpecialist', '==', specialistId)
          .where('appointmentDate', '>=', Timestamp.fromDate(new Date(date)))
          .where(
            'appointmentDate',
            '<',
            Timestamp.fromDate(new Date(date + 'T23:59:59'))
          )
      )
      .valueChanges();
  }

  addAppointment(appointment: Partial<Appointment>): Observable<void> {
    // Crear una referencia a la colección 'appointments'
    const appointmentsCollection = collection(this.fire, 'appointments');

    // Usar addDoc para agregar un nuevo documento con ID generado automáticamente
    return from(addDoc(appointmentsCollection, appointment)).pipe(
      map(() => {}), // Convertir el resultado en `void`
      catchError((error) => {
        console.error('Error al añadir el turno:', error);
        return throwError(() => new Error('Error al añadir turno.'));
      })
    );
  }
}

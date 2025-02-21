import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dayToSpanish',
  standalone: true,
})
export class DayToSpanishPipe implements PipeTransform {
  transform(value: string): string {
    const daysInSpanish: { [key: string]: string } = {
      Monday: 'Lunes',
      Tuesday: 'Martes',
      Wednesday: 'Miércoles',
      Thursday: 'Jueves',
      Friday: 'Viernes',
      Saturday: 'Sábado',
      Sunday: 'Domingo',
    };
    return daysInSpanish[value] || value;
  }
}

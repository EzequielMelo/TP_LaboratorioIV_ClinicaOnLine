import { Pipe, PipeTransform } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';

@Pipe({
  name: 'calculateAge',
  standalone: true,
})
export class CalculateAgePipe implements PipeTransform {
  transform(
    birthDate: Timestamp | Date | null | undefined,
    format: 'full' | 'short' = 'full'
  ): string | number {
    if (!birthDate) {
      return format === 'short' ? 0 : '0 años';
    }

    // Convertir Timestamp de Firebase a Date si es necesario
    let date: Date;
    if (birthDate instanceof Timestamp) {
      date = birthDate.toDate();
    } else if (birthDate instanceof Date) {
      date = birthDate;
    } else {
      return format === 'short' ? 0 : '0 años';
    }

    // Calcular edad
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();

    // Ajustar si aún no cumplió años este año
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < date.getDate())
    ) {
      age--;
    }

    // Retornar formato solicitado
    return format === 'short' ? age : `${age} años`;
  }
}

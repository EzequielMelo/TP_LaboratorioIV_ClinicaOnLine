import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatDni',
  standalone: true,
})
export class FormatDniPipe implements PipeTransform {
  transform(value: string | number | null | undefined): string {
    if (!value) {
      return '';
    }

    // Convertir a string y eliminar cualquier carácter que no sea número
    const dniString = value.toString().replace(/\D/g, '');

    // Si está vacío después de limpiar, retornar vacío
    if (dniString.length === 0) {
      return '';
    }

    // Formatear según la longitud
    if (dniString.length <= 6) {
      // Para DNIs cortos, no formatear
      return dniString;
    } else if (dniString.length === 7) {
      // Formato: X.XXX.XXX (ej: 1.234.567)
      return `${dniString.slice(0, 1)}.${dniString.slice(
        1,
        4
      )}.${dniString.slice(4, 7)}`;
    } else if (dniString.length === 8) {
      // Formato: XX.XXX.XXX (ej: 12.345.678)
      return `${dniString.slice(0, 2)}.${dniString.slice(
        2,
        5
      )}.${dniString.slice(5, 8)}`;
    } else {
      // Para DNIs más largos (9+ dígitos), formato XXX.XXX.XXX o más
      const length = dniString.length;
      const firstGroup = length % 3 === 0 ? 3 : length % 3;
      let formatted = dniString.slice(0, firstGroup);

      for (let i = firstGroup; i < length; i += 3) {
        formatted += '.' + dniString.slice(i, i + 3);
      }

      return formatted;
    }
  }
}

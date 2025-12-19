import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function dniValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const dniPattern = /^\d{8}$/;
    const isValid = dniPattern.test(control.value);
    return isValid ? null : { invalidDni: true };
  };
}

export function fileValidator(maxSizeInMB: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const file = control.value;
    if (file) {
      const allowedMimeTypes = /image\/(jpeg|jpg|png)$/;
      if (!allowedMimeTypes.test(file.type)) {
        return { invalidFileType: true };
      }

      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        return { fileTooLarge: true };
      }
    }
    return null;
  };
}

export function numericValidator(
  control: AbstractControl
): ValidationErrors | null {
  const numericPattern = /^\d+$/;
  return numericPattern.test(control.value) ? null : { nonNumeric: true };
}

export function passwordMatchValidator(
  control: AbstractControl
): ValidationErrors | null {
  const password = control.get('password');
  const repeatPassword = control.get('repeat_password');

  if (!password || !repeatPassword) {
    return null;
  }

  if (repeatPassword.value === '') {
    return null;
  }

  return password.value === repeatPassword.value
    ? null
    : { passwordMismatch: true };
}

// Validador para fecha de nacimiento con edad mínima y máxima
export function birthDateValidator(
  minAge: number,
  maxAge: number
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // Si está vacío, lo maneja el required
    }

    const birthDate = new Date(control.value);
    const today = new Date();

    // Calcular edad
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    // Validar rango
    if (age < minAge) {
      return { minAge: { requiredAge: minAge, actualAge: age } };
    }

    if (age > maxAge) {
      return { maxAge: { requiredAge: maxAge, actualAge: age } };
    }

    // Validar que no sea fecha futura
    if (birthDate > today) {
      return { futureDate: true };
    }

    return null;
  };
}

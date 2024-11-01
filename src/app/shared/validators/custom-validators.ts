import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function dniValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const dniPattern = /^\d{2}\.?\d{3}\.?\d{3}$/;
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

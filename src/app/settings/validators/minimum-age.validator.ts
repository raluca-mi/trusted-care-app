import { AbstractControl, ValidationErrors } from '@angular/forms';

export function minimumAgeValidator(minAge: number) {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;
    const birthDate = new Date(value);
    const today = new Date();

    if (birthDate > today) {
      return { invalidDate: true };
    }

    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= minAge
      ? null
      : { minimumAge: { requiredAge: minAge, actualAge: age } };
  };
}

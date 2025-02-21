import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { dniValidator } from '../../shared/validators/custom-validators';
import { numericValidator } from '../../shared/validators/custom-validators';
import { NgxCaptchaModule } from 'ngx-captcha';

@Component({
  selector: 'app-register-specialist',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgxCaptchaModule],
  templateUrl: './register-specialist.component.html',
  styleUrl: './register-specialist.component.css',
})
export class RegisterSpecialistComponent {
  registerForm: FormGroup;
  specialties: string[] = ['Cardiología', 'Dermatología', 'Pediatría'];
  otherSpecialty: string = '';
  selectedUserAvatar: Blob | null = null;
  selectedUserAvatarName: string | null = null;
  siteKey = '6LeqB9QqAAAAALMr8SZOctATmbR9P8e1pvU3pBuY';

  private formBuilder = inject(FormBuilder);
  private auth = inject(AuthService);

  constructor() {
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      repeat_password: ['', [Validators.required, Validators.minLength(6)]],
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(15),
        ],
      ],
      last_name: [
        '',
        [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(15),
        ],
      ],
      age: [
        '',
        [
          Validators.required,
          Validators.min(2),
          Validators.max(99),
          numericValidator,
        ],
      ],
      dni: ['', [Validators.required, dniValidator()]],
      medical_specialty: [[], Validators.required],
      user_avatar: ['', [Validators.required]],
      recaptcha: ['', Validators.required],
    });
  }

  handleSuccess($event: string) {
    console.log($event);
  }

  register() {
    // Verificar si el formulario es válido
    if (this.registerForm.invalid) {
      console.error('Formulario no válido, por favor verifica los campos.');
      // Opcionalmente, puedes marcar todos los campos como "tocados" para mostrar los errores
      this.registerForm.markAllAsTouched();
      return; // Salir de la función si el formulario no es válido
    }

    const formValues = this.registerForm.value;
    const profilePicture = this.selectedUserAvatar; // Blob de la imagen de perfil

    if (!profilePicture) {
      console.error('La imagen es necesaria para registrarse');
      return; // Salir de la función si alguna es nula
    }

    this.auth
      .registerSpecialist(
        formValues.name,
        formValues.last_name,
        formValues.email,
        formValues.password,
        formValues.age,
        formValues.dni,
        formValues.medical_specialty,
        'specialist',
        profilePicture
      )
      .subscribe({
        next: () => console.log('Usuario registrado con éxito'),
        error: (error) => console.error('Error en el registro:', error.message),
      });
  }

  addSpecialty() {
    if (this.otherSpecialty.trim() !== '') {
      this.specialties.push(this.otherSpecialty.trim());
      this.otherSpecialty = '';
    }
  }

  onFileChange(event: Event, controlName: string) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const control = this.registerForm.get(controlName);

      if (control) {
        control.setErrors(null); // Limpiar errores anteriores

        // Validar tipo de archivo
        if (file.type === 'image/jpeg' || file.type === 'image/png') {
          const fileBlob = new Blob([file], { type: file.type });

          // Almacena el archivo en la propiedad correspondiente
          if (controlName === 'user_avatar') {
            this.selectedUserAvatar = fileBlob;
            this.selectedUserAvatarName = file.name;
          }

          control.updateValueAndValidity();
        } else {
          control.setErrors({ invalidFileType: true });
        }
      }
    } else {
      // Marca el control como requerido si no se selecciona ningún archivo
      this.registerForm.get(controlName)?.setErrors({ required: true });

      // Limpia la propiedad correspondiente si no se selecciona archivo
      if (controlName === 'user_avatar') {
        this.selectedUserAvatar = null;
      }
    }
  }
}

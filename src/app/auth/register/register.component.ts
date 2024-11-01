import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { dniValidator } from '../../shared/validators/custom-validators';
import { numericValidator } from '../../shared/validators/custom-validators';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  registerForm: FormGroup;
  selectedUserAvatar: Blob | null = null;
  selectedUserAvatarName: string | null = null;
  selectedUserCover: Blob | null = null;
  selectedUserCoverName: string | null = null;

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
      healthcare_system: ['', Validators.required],
      user_avatar: ['', [Validators.required]],
      user_cover: ['', [Validators.required]],
    });
  }

  register() {
    const formValues = this.registerForm.value;
    const profilePicture = this.selectedUserAvatar; // Blob de la imagen de perfil
    const coverPicture = this.selectedUserCover; // Blob de la imagen de portada

    if (!profilePicture || !coverPicture) {
      console.error('Ambas imágenes son necesarias para el registro.');
      return; // Salir de la función si alguna es nula
    }

    this.auth
      .register(
        formValues.name,
        formValues.last_name,
        formValues.email,
        formValues.password,
        formValues.age,
        formValues.dni,
        formValues.healthcare_system,
        'patient',
        profilePicture,
        coverPicture
      )
      .subscribe({
        next: () => console.log('Usuario registrado con éxito'),
        error: (error) => console.error('Error en el registro:', error.message),
      });
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
          } else if (controlName === 'user_cover') {
            this.selectedUserCover = fileBlob;
            this.selectedUserCoverName = file.name;
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
      } else if (controlName === 'user_cover') {
        this.selectedUserCover = null;
      }
    }
  }
}

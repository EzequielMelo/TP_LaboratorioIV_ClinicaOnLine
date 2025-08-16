import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import {
  dniValidator,
  numericValidator,
} from '../../../shared/validators/custom-validators';

@Component({
  selector: 'app-create-new-admin-section',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './create-new-admin-section.component.html',
  styleUrl: './create-new-admin-section.component.css',
})
export class CreateNewAdminSectionComponent {
  registerForm: FormGroup;
  selectedUserAvatar: Blob | null = null;
  selectedUserAvatarName: string | null = null;

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
      user_avatar: ['', [Validators.required]],
    });
  }

  register() {
    const formValues = this.registerForm.value;
    const profilePicture = this.selectedUserAvatar; // Blob de la imagen de perfil

    if (!profilePicture) {
      console.error('La imagen es necesaria para registrarse');
      return;
    }

    this.auth
      .registerAdmin(
        formValues.name,
        formValues.last_name,
        formValues.email,
        formValues.password,
        formValues.age,
        formValues.dni,
        'admin',
        profilePicture
      )
      .subscribe({
        next: (res) => {
          if (res.success) {
            console.log(res.message);
            alert(res.message); // Mostrar al usuario
            this.registerForm.reset(); // Opcional: limpiar formulario
          } else {
            console.warn(res.message);
          }
        },
        error: (error) => {
          console.error('Error en el registro:', error.message);
          alert(error.message);
        },
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

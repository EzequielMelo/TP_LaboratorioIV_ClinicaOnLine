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
import Swal from 'sweetalert2';

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
    const profilePicture = this.selectedUserAvatar;

    if (!profilePicture) {
      Swal.fire({
        icon: 'warning',
        title: 'Imagen requerida',
        text: 'Debes seleccionar una imagen de perfil para continuar',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Entendido',
      });
      return;
    }

    // Mostrar loading mientras se procesa la solicitud
    Swal.fire({
      title: 'Creando administrador...',
      text: 'Por favor espera mientras procesamos la información',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

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
          Swal.close(); // Cerrar el loading

          if (res.success) {
            Swal.fire({
              icon: 'success',
              title: '¡Administrador creado!',
              text: res.message,
              confirmButtonColor: '#28a745',
              confirmButtonText: 'Excelente',
              timer: 3000,
              timerProgressBar: true,
            }).then(() => {
              this.registerForm.reset();
              this.selectedUserAvatar = null;
              this.selectedUserAvatarName = null;
            });
          } else {
            Swal.fire({
              icon: 'warning',
              title: 'Atención',
              text: res.message,
              confirmButtonColor: '#ffc107',
              confirmButtonText: 'Entendido',
            });
          }
        },
        error: (error) => {
          Swal.close(); // Cerrar el loading

          Swal.fire({
            icon: 'error',
            title: 'Error en el registro',
            text: error.message || 'Ha ocurrido un error inesperado',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Reintentar',
            footer:
              '<span style="color: #6c757d;">Si el problema persiste, contacta al soporte técnico</span>',
          });
        },
      });
  }

  onFileChange(event: Event, controlName: string) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const control = this.registerForm.get(controlName);

      if (control) {
        control.setErrors(null);

        // Validar tipo de archivo
        if (file.type === 'image/jpeg' || file.type === 'image/png') {
          const fileBlob = new Blob([file], { type: file.type });

          // Almacena el archivo en la propiedad correspondiente
          if (controlName === 'user_avatar') {
            this.selectedUserAvatar = fileBlob;
            this.selectedUserAvatarName = file.name;

            // Mostrar confirmación de imagen seleccionada
            Swal.fire({
              icon: 'success',
              title: 'Imagen seleccionada',
              text: `Archivo: ${file.name}`,
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 2000,
              timerProgressBar: true,
            });
          }

          control.updateValueAndValidity();
        } else {
          control.setErrors({ invalidFileType: true });

          Swal.fire({
            icon: 'error',
            title: 'Formato no válido',
            text: 'Por favor selecciona una imagen en formato JPG o PNG',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Entendido',
          });
        }
      }
    } else {
      // Marca el control como requerido si no se selecciona ningún archivo
      this.registerForm.get(controlName)?.setErrors({ required: true });

      // Limpia la propiedad correspondiente si no se selecciona archivo
      if (controlName === 'user_avatar') {
        this.selectedUserAvatar = null;
        this.selectedUserAvatarName = null;
      }
    }
  }
}

import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import {
  dniValidator,
  passwordMatchValidator,
  birthDateValidator,
} from '../../shared/validators/custom-validators';
import { NgxCaptchaModule } from 'ngx-captcha';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-register-specialist',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgxCaptchaModule],
  templateUrl: './register-specialist.component.html',
  styleUrl: './register-specialist.component.css',
})
export class RegisterSpecialistComponent {
  registerForm: FormGroup;
  otherSpecialty: string = '';
  selectedUserAvatar: Blob | null = null;
  selectedUserAvatarName: string | null = null;
  siteKey = '6LeqB9QqAAAAALMr8SZOctATmbR9P8e1pvU3pBuY';
  errorMessage: string | null = null;
  selectedSpecialties: string[] = [];
  specialties: string[] = [
    'Cardiología',
    'Dermatología',
    'Endocrinología',
    'Gastroenterología',
    'Ginecología',
    'Neurología',
    'Oncología',
    'Pediatría',
    'Psiquiatría',
    'Traumatología',
    'Urología',
    'Oftalmología',
    'Radiología',
    'Anestesiología',
    'Medicina Interna',
    'Medicina Familiar',
    'Reumatología',
    'Neumología',
    'Nefrología',
    'Hematología',
  ];

  private formBuilder = inject(FormBuilder);
  private auth = inject(AuthService);

  constructor() {
    this.registerForm = this.formBuilder.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        repeat_password: ['', [Validators.required, Validators.minLength(6)]],
        name: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(50),
          ],
        ],
        last_name: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(50),
          ],
        ],
        birthDate: ['', [Validators.required, birthDateValidator(20, 120)]],
        dni: ['', [Validators.required, dniValidator()]],
        medical_specialty: [
          '',
          [Validators.required, this.specialtyValidator.bind(this)],
        ],
        user_avatar: ['', [Validators.required]],
        recaptcha: ['', Validators.required],
      },
      { validators: passwordMatchValidator }
    );
  }

  handleSuccess($event: string) {
    console.log($event);
  }

  register() {
    // Limpiar mensajes de error previos
    this.errorMessage = null;

    // Verificar si el formulario es válido
    if (this.registerForm.invalid) {
      console.error('Formulario no válido, por favor verifica los campos.');
      this.errorMessage = 'Por favor, completa todos los campos correctamente.';
      // Opcionalmente, puedes marcar todos los campos como "tocados" para mostrar los errores
      this.registerForm.markAllAsTouched();
      return; // Salir de la función si el formulario no es válido
    }

    const formValues = this.registerForm.value;
    const profilePicture = this.selectedUserAvatar; // Blob de la imagen de perfil

    if (!profilePicture) {
      console.error('La imagen es necesaria para registrarse');
      this.errorMessage = 'Debes seleccionar una imagen de perfil.';
      return; // Salir de la función si alguna es nula
    }

    // Convertir fecha de nacimiento string a Timestamp
    const birthDateTimestamp = Timestamp.fromDate(
      new Date(formValues.birthDate)
    );

    this.auth
      .registerSpecialist(
        formValues.name,
        formValues.last_name,
        formValues.email,
        formValues.password,
        birthDateTimestamp,
        formValues.dni,
        formValues.medical_specialty,
        'specialist',
        profilePicture
      )
      .subscribe({
        next: () => {
          console.log('Usuario registrado con éxito');
          this.errorMessage = null;
        },
        error: (error) => {
          console.error('Error en el registro:', error);

          // Mostrar mensaje específico para DNI duplicado
          if (error.message && error.message.includes('DNI')) {
            this.errorMessage = error.message;
          } else if (error.message) {
            this.errorMessage = error.message;
          } else {
            this.errorMessage =
              'Ocurrió un error al registrar. Por favor, intenta nuevamente.';
          }

          // Limpiar el mensaje después de 5 segundos
          setTimeout(() => {
            this.errorMessage = null;
          }, 5000);
        },
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

  /**
   * Verifica si una especialidad está seleccionada
   */
  isSpecialtySelected(specialty: string): boolean {
    return this.selectedSpecialties.includes(specialty);
  }

  /**
   * Alterna la selección de una especialidad
   */
  toggleSpecialty(specialty: string): void {
    const index = this.selectedSpecialties.indexOf(specialty);

    if (index > -1) {
      // Si está seleccionada, la removemos
      this.selectedSpecialties.splice(index, 1);
    } else {
      // Si no está seleccionada, la agregamos
      this.selectedSpecialties.push(specialty);
    }

    // Actualizamos el FormControl
    this.updateMedicalSpecialtyControl();
  }

  /**
   * Remueve una especialidad específica
   */
  removeSpecialty(specialty: string): void {
    const index = this.selectedSpecialties.indexOf(specialty);
    if (index > -1) {
      this.selectedSpecialties.splice(index, 1);
      this.updateMedicalSpecialtyControl();
    }
  }

  /**
   * Agrega una especialidad personalizada
   */
  addCustomSpecialty(): void {
    const customSpecialty = this.otherSpecialty.trim();

    if (
      customSpecialty &&
      !this.selectedSpecialties.includes(customSpecialty)
    ) {
      this.selectedSpecialties.push(customSpecialty);
      this.otherSpecialty = ''; // Limpiar el input
      this.updateMedicalSpecialtyControl();
    }
  }
  clearAllSpecialties(): void {
    this.selectedSpecialties = [];
    this.updateMedicalSpecialtyControl();
  }

  /**
   * Obtiene el número de especialidades seleccionadas
   */
  getSelectedSpecialtiesCount(): number {
    return this.selectedSpecialties.length;
  }

  /**
   * Obtiene la lista de especialidades seleccionadas
   */
  getSelectedSpecialtiesList(): string[] {
    return [...this.selectedSpecialties];
  }

  /**
   * Actualiza el FormControl de medical_specialty con las especialidades seleccionadas
   */
  private updateMedicalSpecialtyControl(): void {
    this.registerForm
      .get('medical_specialty')
      ?.setValue(this.selectedSpecialties);
    this.registerForm.get('medical_specialty')?.markAsTouched();
  }

  private specialtyValidator(
    control: AbstractControl
  ): ValidationErrors | null {
    if (!this.selectedSpecialties || this.selectedSpecialties.length === 0) {
      return { required: true };
    }
    return null;
  }
}

import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-login-admin',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './login-admin.component.html',
  styleUrl: './login-admin.component.css',
})
export class LoginAdminComponent {
  loginForm: FormGroup;
  errorMessage = '';

  private authService = inject(AuthService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);

  constructor() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
    this.authService.user$.subscribe((respuesta) => {
      if (respuesta != null) {
        this.router.navigateByUrl('');
      }
    });
  }

  ngAfterViewInit(): void {
    initFlowbite();
  }

  login() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).subscribe({
        next: () => {
          this.router.navigateByUrl('');
        },
        error: (errorMessage: string) => {
          this.errorMessage = errorMessage;
        },
      });
    }
    console.log();
  }

  usuarioPrueba1() {
    this.loginForm.patchValue({
      email: 'admin@admin.com',
      password: '123456',
    });
  }
}

import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
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
      email: 'bocim96780@kazvi.com',
      password: '123456',
    });
  }

  usuarioPrueba2() {
    this.loginForm.patchValue({
      email: 'bovir78503@kimasoft.com',
      password: '123456',
    });
  }

  usuarioPrueba3() {
    this.loginForm.patchValue({
      email: 'tepadif169@nozamas.com',
      password: '123456',
    });
  }

  // Especialistas
  usuarioPrueba4() {
    this.loginForm.patchValue({
      email: 'nogos24666@merotx.com',
      password: '123456',
    });
  }

  usuarioPrueba5() {
    this.loginForm.patchValue({
      email: 'varof80546@artvara.com',
      password: '1234567',
    });
  }

  // Admin
  usuarioPrueba6() {
    this.loginForm.patchValue({
      email: 'admin@admin.com',
      password: '123456',
    });
  }
}

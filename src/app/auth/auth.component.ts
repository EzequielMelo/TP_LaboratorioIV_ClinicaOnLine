import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { RegisterSpecialistComponent } from './register-specialist/register-specialist.component';
import { LoginSpecialistComponent } from './login-specialist/login-specialist.component';
import { LoginAdminComponent } from './login-admin/login-admin.component';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    LoginComponent,
    RegisterComponent,
    LoginSpecialistComponent,
    RegisterSpecialistComponent,
    LoginAdminComponent,
  ],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent implements OnInit {
  isLogin: boolean = false;
  isRegister: boolean = false;
  isLoginSpecialist: boolean = false;
  isRegisterSpecialist: boolean = false;
  isLoginAdmin: boolean = false;
  isComponentSelected: boolean = false; // Nueva variable

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.url.subscribe((url) => {
      const path = url[0].path;
      this.resetStates();
      if (path === 'login') this.showLogin();
      if (path === 'register') this.showRegister();
      if (path === 'login-specialist') this.showLoginSpecialist();
      if (path === 'register-specialist') this.showRegisterSpecialist();
      if (path === 'login-admin') this.showLoginAdmin();
    });
  }

  navigateToLogin(type: string): void {
    this.router.navigate([`/${type}`]);
  }

  private resetStates(): void {
    this.isLogin = false;
    this.isRegister = false;
    this.isLoginSpecialist = false;
    this.isRegisterSpecialist = false;
    this.isLoginAdmin = false;
    this.isComponentSelected = false;
  }

  showLogin(): void {
    this.resetStates();
    this.isLogin = true;
    this.isComponentSelected = true;
  }

  showRegister(): void {
    this.resetStates();
    this.isRegister = true;
    this.isComponentSelected = true;
  }

  showLoginSpecialist(): void {
    this.resetStates();
    this.isLoginSpecialist = true;
    this.isComponentSelected = true;
  }

  showRegisterSpecialist(): void {
    this.resetStates();
    this.isRegisterSpecialist = true;
    this.isComponentSelected = true;
  }

  showLoginAdmin(): void {
    this.resetStates();
    this.isLoginAdmin = true;
    this.isComponentSelected = true;
  }
}

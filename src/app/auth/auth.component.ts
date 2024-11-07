import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { RegisterSpecialistComponent } from './register-specialist/register-specialist.component';
import { LoginSpecialistComponent } from './login-specialist/login-specialist.component';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    LoginComponent,
    RegisterComponent,
    LoginSpecialistComponent,
    RegisterSpecialistComponent,
  ],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent implements OnInit {
  isLogin: boolean = false;
  isRegister: boolean = false;
  isLoginSpecialist: boolean = false;
  isRegisterSpecialist: boolean = false;
  isComponentSelected: boolean = false; // Nueva variable

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.url.subscribe((url) => {
      const path = url[0].path;
      this.resetStates();
      if (path === 'login') this.showLogin();
      else if (path === 'register') this.showRegister();
      else if (path === 'login-specialist') this.showLoginSpecialist();
      else if (path === 'register-specialist') this.showRegisterSpecialist();
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
}

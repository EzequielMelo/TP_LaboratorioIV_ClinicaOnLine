import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { RegisterSpecialistComponent } from './register-specialist/register-specialist.component';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [LoginComponent, RegisterComponent, RegisterSpecialistComponent],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent implements OnInit {
  isLogin: boolean = false;
  isRegister: boolean = false;
  isRegisterSpecialist: boolean = false;
  isSelectRegister: boolean = false; // Pantalla de selección de tipo de registro

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.url.subscribe((url) => {
      const path = url[0].path;
      this.resetStates();
      if (path === 'login') this.showLogin();
      if (path === 'select-register') this.showSelectRegister();
      if (path === 'register') this.showRegister();
      if (path === 'register-specialist') this.showRegisterSpecialist();
    });
  }

  navigateToRegister(type: string): void {
    this.router.navigate([`/${type}`]);
  }

  private resetStates(): void {
    this.isLogin = false;
    this.isRegister = false;
    this.isRegisterSpecialist = false;
    this.isSelectRegister = false;
  }

  showLogin(): void {
    this.resetStates();
    this.isLogin = true;
  }

  showSelectRegister(): void {
    this.resetStates();
    this.isSelectRegister = true;
  }

  showRegister(): void {
    this.resetStates();
    this.isRegister = true;
  }

  showRegisterSpecialist(): void {
    this.resetStates();
    this.isRegisterSpecialist = true;
  }
}

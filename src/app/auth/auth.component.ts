import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.url.subscribe((url) => {
      const path = url[0].path;
      this.isLogin = path === 'login';
      this.isRegister = path === 'register';
      this.isRegisterSpecialist = path === 'register-specialist';
    });
  }
}

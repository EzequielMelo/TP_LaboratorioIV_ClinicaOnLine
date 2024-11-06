import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginSpecialistComponent } from './login-specialist.component';

describe('LoginSpecialistComponent', () => {
  let component: LoginSpecialistComponent;
  let fixture: ComponentFixture<LoginSpecialistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginSpecialistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginSpecialistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

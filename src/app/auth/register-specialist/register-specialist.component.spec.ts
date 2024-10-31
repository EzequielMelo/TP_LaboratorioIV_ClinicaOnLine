import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterSpecialistComponent } from './register-specialist.component';

describe('RegisterSpecialistComponent', () => {
  let component: RegisterSpecialistComponent;
  let fixture: ComponentFixture<RegisterSpecialistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterSpecialistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterSpecialistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

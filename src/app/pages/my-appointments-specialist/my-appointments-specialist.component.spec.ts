import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyAppointmentsSpecialistComponent } from './my-appointments-specialist.component';

describe('MyAppointmentsSpecialistComponent', () => {
  let component: MyAppointmentsSpecialistComponent;
  let fixture: ComponentFixture<MyAppointmentsSpecialistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyAppointmentsSpecialistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyAppointmentsSpecialistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

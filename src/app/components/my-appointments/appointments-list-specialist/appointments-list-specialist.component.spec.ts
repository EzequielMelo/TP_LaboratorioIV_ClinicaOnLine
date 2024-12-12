import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentsListSpecialistComponent } from './appointments-list-specialist.component';

describe('AppointmentsListSpecialistComponent', () => {
  let component: AppointmentsListSpecialistComponent;
  let fixture: ComponentFixture<AppointmentsListSpecialistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentsListSpecialistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentsListSpecialistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

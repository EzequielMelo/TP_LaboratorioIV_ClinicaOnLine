import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentsOverviewSpecialistComponent } from './appointments-overview-specialist.component';

describe('AppointmentsOverviewSpecialistComponent', () => {
  let component: AppointmentsOverviewSpecialistComponent;
  let fixture: ComponentFixture<AppointmentsOverviewSpecialistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentsOverviewSpecialistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentsOverviewSpecialistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

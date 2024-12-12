import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAppointmentRequestComponent } from './admin-appointment-request.component';

describe('AdminAppointmentRequestComponent', () => {
  let component: AdminAppointmentRequestComponent;
  let fixture: ComponentFixture<AdminAppointmentRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAppointmentRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAppointmentRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

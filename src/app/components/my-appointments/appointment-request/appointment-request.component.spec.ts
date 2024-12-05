import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentRequestComponent } from './appointment-request.component';

describe('AppointmentRequestComponent', () => {
  let component: AppointmentRequestComponent;
  let fixture: ComponentFixture<AppointmentRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

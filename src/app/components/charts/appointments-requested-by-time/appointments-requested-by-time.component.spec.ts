import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentsRequestedByTimeComponent } from './appointments-requested-by-time.component';

describe('AppointmentsRequestedByTimeComponent', () => {
  let component: AppointmentsRequestedByTimeComponent;
  let fixture: ComponentFixture<AppointmentsRequestedByTimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentsRequestedByTimeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentsRequestedByTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

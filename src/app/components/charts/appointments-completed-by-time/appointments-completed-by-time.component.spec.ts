import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentsCompletedByTimeComponent } from './appointments-completed-by-time.component';

describe('AppointmentsCompletedByTimeComponent', () => {
  let component: AppointmentsCompletedByTimeComponent;
  let fixture: ComponentFixture<AppointmentsCompletedByTimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentsCompletedByTimeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentsCompletedByTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

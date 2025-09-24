import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersAppointmentsStatsComponent } from './users-appointments-stats.component';

describe('UsersAppointmentsStatsComponent', () => {
  let component: UsersAppointmentsStatsComponent;
  let fixture: ComponentFixture<UsersAppointmentsStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersAppointmentsStatsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersAppointmentsStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

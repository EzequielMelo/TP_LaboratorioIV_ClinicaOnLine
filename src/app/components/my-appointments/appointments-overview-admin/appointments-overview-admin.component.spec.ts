import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentsOverviewAdminComponent } from './appointments-overview-admin.component';

describe('AppointmentsOverviewAdminComponent', () => {
  let component: AppointmentsOverviewAdminComponent;
  let fixture: ComponentFixture<AppointmentsOverviewAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentsOverviewAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentsOverviewAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

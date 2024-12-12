import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentsAdminComponent } from './appointments-admin.component';

describe('AppointmentsAdminComponent', () => {
  let component: AppointmentsAdminComponent;
  let fixture: ComponentFixture<AppointmentsAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentsAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentsAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

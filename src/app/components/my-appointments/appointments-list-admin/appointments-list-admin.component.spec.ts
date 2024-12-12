import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentsListAdminComponent } from './appointments-list-admin.component';

describe('AppointmentsListAdminComponent', () => {
  let component: AppointmentsListAdminComponent;
  let fixture: ComponentFixture<AppointmentsListAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentsListAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentsListAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

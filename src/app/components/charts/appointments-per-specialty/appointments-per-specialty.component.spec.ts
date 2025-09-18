import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentsPerSpecialtyComponent } from './appointments-per-specialty.component';

describe('AppointmentsPerSpecialtyComponent', () => {
  let component: AppointmentsPerSpecialtyComponent;
  let fixture: ComponentFixture<AppointmentsPerSpecialtyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentsPerSpecialtyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentsPerSpecialtyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

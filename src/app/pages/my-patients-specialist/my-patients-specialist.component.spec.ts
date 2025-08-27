import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyPatientsSpecialistComponent } from './my-patients-specialist.component';

describe('MyPatientsSpecialistComponent', () => {
  let component: MyPatientsSpecialistComponent;
  let fixture: ComponentFixture<MyPatientsSpecialistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyPatientsSpecialistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyPatientsSpecialistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

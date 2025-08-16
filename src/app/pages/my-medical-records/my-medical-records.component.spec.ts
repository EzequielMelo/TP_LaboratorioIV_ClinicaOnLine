import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyMedicalRecordsComponent } from './my-medical-records.component';

describe('MyMedicalRecordsComponent', () => {
  let component: MyMedicalRecordsComponent;
  let fixture: ComponentFixture<MyMedicalRecordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyMedicalRecordsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyMedicalRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

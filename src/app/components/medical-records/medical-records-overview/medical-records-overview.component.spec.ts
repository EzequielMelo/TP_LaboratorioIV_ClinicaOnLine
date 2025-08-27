import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalRecordsOverviewComponent } from './medical-records-overview.component';

describe('MedicalRecordsOverviewComponent', () => {
  let component: MedicalRecordsOverviewComponent;
  let fixture: ComponentFixture<MedicalRecordsOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicalRecordsOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalRecordsOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

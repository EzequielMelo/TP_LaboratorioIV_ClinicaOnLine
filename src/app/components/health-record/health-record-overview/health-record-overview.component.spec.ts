import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthRecordOverviewComponent } from './health-record-overview.component';

describe('HealthRecordOverviewComponent', () => {
  let component: HealthRecordOverviewComponent;
  let fixture: ComponentFixture<HealthRecordOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HealthRecordOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HealthRecordOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

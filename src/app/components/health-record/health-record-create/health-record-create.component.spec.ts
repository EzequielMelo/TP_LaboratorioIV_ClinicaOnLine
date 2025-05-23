import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthRecordCreateComponent } from './health-record-create.component';

describe('HealthRecordCreateComponent', () => {
  let component: HealthRecordCreateComponent;
  let fixture: ComponentFixture<HealthRecordCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HealthRecordCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HealthRecordCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

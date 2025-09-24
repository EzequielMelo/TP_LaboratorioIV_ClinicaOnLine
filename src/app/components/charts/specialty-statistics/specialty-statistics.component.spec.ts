import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialtyStatisticsComponent } from './specialty-statistics.component';

describe('SpecialtyStatisticsComponent', () => {
  let component: SpecialtyStatisticsComponent;
  let fixture: ComponentFixture<SpecialtyStatisticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecialtyStatisticsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpecialtyStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

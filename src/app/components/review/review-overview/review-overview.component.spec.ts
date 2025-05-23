import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewOverviewComponent } from './review-overview.component';

describe('ReviewOverviewComponent', () => {
  let component: ReviewOverviewComponent;
  let fixture: ComponentFixture<ReviewOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

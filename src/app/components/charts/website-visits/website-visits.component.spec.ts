import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebsiteVisitsComponent } from './website-visits.component';

describe('WebsiteVisitsComponent', () => {
  let component: WebsiteVisitsComponent;
  let fixture: ComponentFixture<WebsiteVisitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebsiteVisitsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WebsiteVisitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

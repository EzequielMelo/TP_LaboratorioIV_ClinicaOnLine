import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialistListComponent } from './specialist-list.component';

describe('SpecialistListComponent', () => {
  let component: SpecialistListComponent;
  let fixture: ComponentFixture<SpecialistListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecialistListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpecialistListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

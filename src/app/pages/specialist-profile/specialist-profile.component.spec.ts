import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialistProfileComponent } from './specialist-profile.component';

describe('SpecialistProfileComponent', () => {
  let component: SpecialistProfileComponent;
  let fixture: ComponentFixture<SpecialistProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecialistProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpecialistProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

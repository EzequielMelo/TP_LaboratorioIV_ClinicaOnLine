import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialistSettingsComponent } from './specialist-settings.component';

describe('UserSettingsComponent', () => {
  let component: SpecialistSettingsComponent;
  let fixture: ComponentFixture<SpecialistSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecialistSettingsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SpecialistSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

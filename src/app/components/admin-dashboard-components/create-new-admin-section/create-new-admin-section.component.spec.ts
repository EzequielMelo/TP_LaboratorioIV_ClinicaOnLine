import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateNewAdminSectionComponent } from './create-new-admin-section.component';

describe('CreateNewAdminSectionComponent', () => {
  let component: CreateNewAdminSectionComponent;
  let fixture: ComponentFixture<CreateNewAdminSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateNewAdminSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateNewAdminSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

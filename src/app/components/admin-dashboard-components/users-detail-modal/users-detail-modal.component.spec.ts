import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersDetailModalComponent } from './users-detail-modal.component';

describe('UsersDetailModalComponent', () => {
  let component: UsersDetailModalComponent;
  let fixture: ComponentFixture<UsersDetailModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersDetailModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersDetailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateCategoryConfirmComponent } from './update-category-confirm.component';

describe('UpdateCategoryConfirmComponent', () => {
  let component: UpdateCategoryConfirmComponent;
  let fixture: ComponentFixture<UpdateCategoryConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateCategoryConfirmComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateCategoryConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

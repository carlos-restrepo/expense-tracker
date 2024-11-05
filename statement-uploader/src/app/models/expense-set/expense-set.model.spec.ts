import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseSetModel } from './expense-set.model';

describe('ExpenseSetModel', () => {
  let component: ExpenseSetModel;
  let fixture: ComponentFixture<ExpenseSetModel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseSetModel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseSetModel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

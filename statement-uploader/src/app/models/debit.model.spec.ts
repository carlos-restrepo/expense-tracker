import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebitModel } from './debit.model';

describe('DebitModel', () => {
  let component: DebitModel;
  let fixture: ComponentFixture<DebitModel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebitModel]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DebitModel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

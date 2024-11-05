import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmittedTransactionsComponent } from './submitted-transactions.component';

describe('SubmittedTransactionsComponent', () => {
  let component: SubmittedTransactionsComponent;
  let fixture: ComponentFixture<SubmittedTransactionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmittedTransactionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SubmittedTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthTableComponent } from './month-table.component';

describe('MonthTableComponent', () => {
  let component: MonthTableComponent;
  let fixture: ComponentFixture<MonthTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

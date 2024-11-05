import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckRowTableComponent } from './check-row-table.component';

describe('CheckRowTableComponent', () => {
  let component: CheckRowTableComponent;
  let fixture: ComponentFixture<CheckRowTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckRowTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckRowTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

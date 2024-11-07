import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentifyColumnsDialogComponent } from './identify-columns-dialog.component';

describe('IdentifyColumnsDialogComponent', () => {
  let component: IdentifyColumnsDialogComponent;
  let fixture: ComponentFixture<IdentifyColumnsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdentifyColumnsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IdentifyColumnsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

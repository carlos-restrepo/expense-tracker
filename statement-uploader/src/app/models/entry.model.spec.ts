import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntryModel } from './entry.model';

describe('EntryModel', () => {
  let component: EntryModel;
  let fixture: ComponentFixture<EntryModel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntryModel]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EntryModel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

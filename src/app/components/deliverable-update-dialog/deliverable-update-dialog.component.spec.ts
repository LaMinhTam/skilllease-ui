import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliverableUpdateDialogComponent } from './deliverable-update-dialog.component';

describe('DeliverableUpdateDialogComponent', () => {
  let component: DeliverableUpdateDialogComponent;
  let fixture: ComponentFixture<DeliverableUpdateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliverableUpdateDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliverableUpdateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChecklistRendererComponent } from './checklist-renderer.component';

describe('ChecklistRendererComponent', () => {
  let component: ChecklistRendererComponent;
  let fixture: ComponentFixture<ChecklistRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChecklistRendererComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChecklistRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

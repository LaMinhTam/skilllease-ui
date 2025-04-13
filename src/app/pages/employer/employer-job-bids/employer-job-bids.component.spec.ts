import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployerJobBidsComponent } from './employer-job-bids.component';

describe('EmployerJobBidsComponent', () => {
  let component: EmployerJobBidsComponent;
  let fixture: ComponentFixture<EmployerJobBidsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployerJobBidsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployerJobBidsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

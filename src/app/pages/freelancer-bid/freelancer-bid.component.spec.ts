import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FreelancerBidComponent } from './freelancer-bid.component';

describe('FreelancerBidComponent', () => {
  let component: FreelancerBidComponent;
  let fixture: ComponentFixture<FreelancerBidComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FreelancerBidComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FreelancerBidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

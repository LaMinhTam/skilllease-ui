import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MilestoneDashboardComponent } from './milestone-dashboard.component';

describe('MilestoneDashboardComponent', () => {
  let component: MilestoneDashboardComponent;
  let fixture: ComponentFixture<MilestoneDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MilestoneDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MilestoneDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

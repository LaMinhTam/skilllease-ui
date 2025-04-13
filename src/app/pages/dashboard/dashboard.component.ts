// src/app/pages/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { FreelancerDashboardComponent } from '../../components/freelancer/freelancer-dashboard/freelancer-dashboard.component';
import { EmployerDashboardComponent } from '../../components/employer/employer-dashboard/employer-dashboard.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FreelancerDashboardComponent,
    EmployerDashboardComponent
  ],
  template: `
    <div class="container">
      <ng-container *ngIf="userRole === 'FREELANCER'; else employerDashboard">
        <app-freelancer-dashboard></app-freelancer-dashboard>
      </ng-container>
      
      <ng-template #employerDashboard>
        <app-employer-dashboard></app-employer-dashboard>
      </ng-template>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 16px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  userRole: string | undefined = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.userRole = user?.role;
    });
  }
}
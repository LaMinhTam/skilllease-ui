// src/app/components/freelancer/freelancer-dashboard/freelancer-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Job } from '../../../models/job';
import { ToastService } from '../../../services/toast.service';
import { ApiService } from '../../../services/api.service';

// Material imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-freelancer-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatGridListModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="dashboard-container">
      <h2 class="page-title">Employer Job Posts</h2>
      
      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
      </div>
      
      <div *ngIf="!loading" class="jobs-grid">
        <ng-container *ngIf="jobs.length > 0; else noJobs">
          <div class="grid-container">
            <div class="job-card" *ngFor="let job of jobs">
              <mat-card>
                <mat-card-content>
                  <h3 class="job-title">{{ job.jobTitle }}</h3>
                  <p class="job-description">{{ job.jobDescription }}</p>
                  <p class="job-budget">Budget: {{ job.budget }}</p>
                </mat-card-content>
                <mat-divider></mat-divider>
                <mat-card-actions>
                  <button mat-button color="primary" (click)="viewJobDetails(job.id)">
                    View Details
                  </button>
                </mat-card-actions>
              </mat-card>
            </div>
          </div>
        </ng-container>
        
        <ng-template #noJobs>
          <div class="no-jobs">
            <p>No jobs available at the moment.</p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      margin-top: 2rem;
    }
    
    .page-title {
      font-size: 1.5rem;
      margin-bottom: 1.5rem;
      font-weight: 500;
    }
    
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 2rem;
    }
    
    .grid-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }
    
    .job-card {
      height: 100%;
    }
    
    .job-title {
      font-size: 1.2rem;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    
    .job-description {
      color: rgba(0, 0, 0, 0.7);
      margin-bottom: 1rem;
    }
    
    .job-budget {
      font-weight: 500;
      color: rgba(0, 0, 0, 0.8);
    }
    
    .no-jobs {
      text-align: center;
      padding: 2rem;
      color: rgba(0, 0, 0, 0.6);
    }
    
    mat-card-actions {
      padding: 8px;
    }
  `]
})
export class FreelancerDashboardComponent implements OnInit {
  jobs: Job[] = [];
  loading = true;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.fetchJobs();
  }

  fetchJobs(): void {
    this.loading = true;
    this.apiService.get<any>('/jobs')
      .subscribe({
        next: (response) => {
          this.jobs = response.data || [];
          this.loading = false;
        },
        error: (error) => {
          this.toastService.error('Error fetching jobs. Please try again later.');
          console.error('Error fetching jobs:', error);
          this.loading = false;
        }
      });
  }

  viewJobDetails(jobId: number): void {
    // Updated path to match the route defined in app-routing.module.ts
    this.router.navigate(['/bid', jobId]);
  }
}
// src/app/pages/employer/employer-jobs/employer-jobs.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Job } from '../../../models/job';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

// Material imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';

// Dialog component for confirmation
import { ConfirmDialogComponent } from '../../../components/shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-employer-jobs',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatGridListModule,
    MatDividerModule,
    MatIconModule,
    MatDialogModule
  ],
  template: `
    <div class="container">
      <h2 class="page-title">Your Posted Jobs</h2>
      
      <div class="jobs-grid" *ngIf="jobs.length > 0; else noJobs">
        <div class="grid-container">
          <div class="job-card" *ngFor="let job of jobs">
            <mat-card (click)="handleCardClick(job.id)">
              <mat-card-content>
                <h3 class="job-title">{{ job.jobTitle }}</h3>
                <p class="job-description">{{ job.jobDescription }}</p>
                <p class="job-budget">Budget: {{ job.budget }}</p>
                <p class="job-deadline" *ngIf="job.deadline">
                  Deadline: {{ formatDate(job.deadline) }}
                </p>
              </mat-card-content>
              <mat-divider></mat-divider>
              <mat-card-actions>
                <button mat-button color="primary" (click)="handleEdit($event, job.id)">
                  Edit
                </button>
                <button mat-button color="warn" (click)="handleDeleteClick($event, job.id)">
                  Delete
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
        </div>
      </div>
      
      <ng-template #noJobs>
        <div class="no-jobs">
          <p>No jobs posted yet.</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px 16px;
    }
    
    .page-title {
      font-size: 1.5rem;
      margin-bottom: 24px;
      font-weight: 500;
    }
    
    .grid-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }
    
    .job-card {
      height: 100%;
    }
    
    mat-card {
      border-radius: 8px;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    
    mat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 6px 12px rgba(0,0,0,0.15);
    }
    
    .job-title {
      font-size: 1.2rem;
      margin-bottom: 8px;
      font-weight: 500;
    }
    
    .job-description {
      color: rgba(0, 0, 0, 0.7);
      margin-bottom: 16px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
    }
    
    .job-budget {
      font-weight: 500;
      margin-bottom: 8px;
    }
    
    .job-deadline {
      font-size: 0.875rem;
      color: rgba(0, 0, 0, 0.6);
    }
    
    mat-card-actions {
      display: flex;
      justify-content: space-between;
      padding: 8px 16px;
      margin-top: auto;
    }
    
    .no-jobs {
      text-align: center;
      padding: 40px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }
  `]
})
export class EmployerJobsComponent implements OnInit {
  jobs: Job[] = [];

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.fetchJobs();
  }

  fetchJobs(): void {
    const user = this.authService.currentUserValue;
    if (user && user.id) {
      this.apiService.get<any>(`/jobs?employerId=${user.id}`)
        .subscribe({
          next: (response) => {
            this.jobs = response.data || [];
          },
          error: (error) => {
            this.toastService.error('Error fetching jobs. Please try again later.');
            console.error('Error fetching employer jobs:', error);
          }
        });
    }
  }

  handleCardClick(jobId: number): void {
    this.router.navigate(['/job-bids', jobId]);
  }

  handleEdit(event: Event, jobId: number): void {
    event.stopPropagation(); // Prevent card onClick
    this.router.navigate(['/edit-job', jobId]);
  }

  handleDeleteClick(event: Event, jobId: number): void {
    event.stopPropagation(); // Prevent card onClick
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Job',
        message: 'Are you sure you want to delete this job? This action cannot be undone.',
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.confirmDelete(jobId);
      }
    });
  }

  confirmDelete(jobId: number): void {
    this.apiService.delete<any>(`/jobs/${jobId}`)
      .subscribe({
        next: () => {
          this.jobs = this.jobs.filter(job => job.id !== jobId);
          this.toastService.success('Job deleted successfully.');
        },
        error: (error) => {
          console.error('Error deleting job:', error);
          this.toastService.error('Failed to delete job.');
        }
      });
  }

  formatDate(dateArray?: number[]): string {
    if (!dateArray || dateArray.length < 3) return 'Invalid date';
    const [year, month, day] = dateArray;
    return new Date(year, month - 1, day).toLocaleDateString();
  }
}
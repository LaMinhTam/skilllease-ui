// src/app/pages/employer/employer-job-bids/employer-job-bids.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Job } from '../../../models/job';
import { Bid } from '../../../models/bid';
import { Milestone } from '../../../models/milestone';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';

// Material imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-employer-job-bids',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatGridListModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatBadgeModule
  ],
  templateUrl: './employer-job-bids.component.html',
  styleUrls: ['./employer-job-bids.component.scss']
})
export class EmployerJobBidsComponent implements OnInit {
  job: Job | null = null;
  bids: Bid[] = [];
  contract: any | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.fetchJobDetails(id);
      }
    });
  }

  fetchJobDetails(jobId: string): void {
    this.apiService.get<any>(`/jobs/${jobId}`)
      .subscribe({
        next: (response) => {
          const { job, bids, contract } = response.data;
          this.job = job;
          this.bids = bids || [];
          this.contract = contract || null;
        },
        error: (error) => {
          console.error('Error fetching job details:', error);
          this.toastService.error('Failed to fetch job details.');
        }
      });
  }

  handleFreelancerClick(freelancerId: number): void {
    this.router.navigate(['/profile', freelancerId]);
  }

  updateBidStatus(event: Event, bidId: number, status: string): void {
    event.stopPropagation(); // Prevent card onClick
    
    if (status === 'rejected') {
      this.apiService.put<any>(`/job-bids/${bidId}/status`, { status })
        .subscribe({
          next: () => {
            this.toastService.success(`Bid ${status} successfully.`);
            this.bids = this.bids.map(bid => 
              bid.id === bidId ? { ...bid, status } : bid
            );
          },
          error: (error) => {
            console.error('Error updating bid status:', error);
            this.toastService.error('Failed to update bid status.');
          }
        });
    } else if (status === 'accepted') {
      // Navigate to create-contract with the bid id
      this.router.navigate(['/create-contract', bidId]);
    }
  }

  getMilestoneStatus(milestone: Milestone): string {
    if (milestone.reviewStatus === 'approved') return 'completed';
    if (milestone.deliverableUrl) return 'submitted';
    
    // Safely handle different possible types for dueDate
    let dueDate: Date;
    if (Array.isArray(milestone.dueDate)) {
      // Handle if it's an array of numbers [year, month, day]
      dueDate = new Date(
        milestone.dueDate[0],
        milestone.dueDate[1] - 1,
        milestone.dueDate[2]
      );
    } else if (typeof milestone.dueDate === 'string') {
      // Handle if it's a string date
      dueDate = new Date(milestone.dueDate);
    } else {
      // Fallback to current date if undefined or invalid
      dueDate = new Date();
    }
    
    if (dueDate < new Date()) return 'overdue';
    return 'pending';
  }

  getMilestoneStatusClass(milestone: Milestone): string {
    return `status-${this.getMilestoneStatus(milestone)}`;
  }

  getMilestoneStatusColor(milestone: Milestone): string {
    const status = this.getMilestoneStatus(milestone);
    switch (status) {
      case 'completed': return 'success';
      case 'submitted': return 'primary';
      case 'overdue': return 'warn';
      case 'pending': return 'accent';
      default: return 'default';
    }
  }

  getTotalEffort(): number {
    if (!this.job || !this.job.milestones || this.job.milestones.length === 0) {
      return 0;
    }
    return this.job.milestones.reduce((sum, ms) => sum + (ms.effort || 0), 0);
  }

  getTotalAmount(): number {
    if (!this.job || !this.job.milestones || this.job.milestones.length === 0) {
      return this.job?.budget || 0;
    }
    return this.job.milestones.reduce((sum, ms) => sum + (ms.amount || 0), 0);
  }

  getPaymentPercentage(milestone: Milestone): string {
    const totalAmount = this.getTotalAmount();
    if (totalAmount === 0) return '0';
    return (((milestone.amount || 0) / totalAmount) * 100).toFixed(1);
  }

  getBidStatusColor(status: string): string {
    switch (status) {
      case 'accepted': return 'success';
      case 'rejected': return 'warn';
      default: return 'default';
    }
  }

  formatDate(dateValue?: string | number[]): string {
    if (!dateValue) return 'Invalid date';
    
    let date: Date;
    
    if (Array.isArray(dateValue)) {
      // Handle array format [year, month, day]
      if (dateValue.length < 3) return 'Invalid date';
      date = new Date(dateValue[0], dateValue[1] - 1, dateValue[2]);
    } else if (typeof dateValue === 'string') {
      // Handle string date
      date = new Date(dateValue);
    } else {
      return 'Invalid date';
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return date.toLocaleDateString();
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('');
  }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, index) => index + 1);
  }
}
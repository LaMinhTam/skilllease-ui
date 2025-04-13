// src/app/pages/freelancer-bid/freelancer-bid.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { Job } from '../../models/job';
import { Milestone } from '../../models/milestone';
import { ChecklistRendererComponent } from '../../components/shared/checklist-renderer/checklist-renderer.component';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatStepperModule } from '@angular/material/stepper';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { provideNativeDateAdapter } from '@angular/material/core';
// Create an interface for Milestone with calculated amount
interface CalculatedMilestone extends Milestone {
  calculatedAmount?: number;
}

@Component({
  selector: 'app-freelancer-bid',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatExpansionModule,
    MatInputModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatStepperModule,
    MatGridListModule,
    MatListModule,
    MatCheckboxModule,
    MatProgressBarModule,
    MatBadgeModule,
    ChecklistRendererComponent
  ],
  providers: [
    provideNativeDateAdapter() 
  ],
  templateUrl: './freelancer-bid.component.html',
  styleUrls: ['./freelancer-bid.component.scss']
})
export class FreelancerBidComponent implements OnInit {
  job: Job | null = null;
  loading = true;
  calculatedMilestones: CalculatedMilestone[] = [];
  bidForm: FormGroup;
  // Make Math available in the template
  Math = Math;

  today: Date = new Date();
  maxDate: Date | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private toastService: ToastService,
    private fb: FormBuilder
  ) {
    // Initialize the form
    this.bidForm = this.fb.group({
      bidAmount: ['', [Validators.required, Validators.min(1)]],
      message: ['', [Validators.required]],
      proposedStartDate: [''],
      proposedEndDate: [''],
      additionalPolicy: ['']
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.fetchJobDetails(id);
      }
    });

    // Listen to bidAmount changes to update calculated milestones
    this.bidForm.get('bidAmount')?.valueChanges.subscribe(value => {
      this.updateCalculatedMilestones(value);
    });
  }

  fetchJobDetails(jobId: string): void {
    this.loading = true;
    this.apiService.get<any>(`/jobs/${jobId}`)
      .subscribe({
        next: (response) => {
          this.job = response.data.job;
          if (this.job?.milestones) {
            this.calculatedMilestones = [...this.job.milestones] as CalculatedMilestone[];
          }
          if (this.job?.deadline) {
            this.maxDate = new Date(this.job.deadline[0], this.job.deadline[1] - 1, this.job.deadline[2]);
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching job details:', error);
          this.toastService.error('Failed to load job details.');
          this.loading = false;
        }
      });
  }

  updateCalculatedMilestones(bidAmount: string): void {
    const bid = parseFloat(bidAmount);
    if (!isNaN(bid) && this.job?.milestones) {
      this.calculatedMilestones = this.job.milestones.map(milestone => {
        const originalProportion = milestone.effort / 100;
        const newAmount = bid * originalProportion;
        
        return {
          ...milestone,
          calculatedAmount: newAmount
        };
      });
    } else if (this.job?.milestones) {
      this.calculatedMilestones = [...this.job.milestones] as CalculatedMilestone[];
    }
  }

  onSubmit(): void {
    if (this.bidForm.invalid) {
      this.toastService.error('Please fill all required fields correctly.');
      return;
    }

    const jobId = this.route.snapshot.paramMap.get('id');
    if (!jobId) {
      this.toastService.error('Job ID is missing.');
      return;
    }

    const formValues = this.bidForm.value;
    
    // Build payload
    const payload = {
      jobId: jobId,
      bidAmount: formValues.bidAmount,
      message: formValues.message,
      proposedStartDate: formValues.proposedStartDate || null,
      proposedEndDate: formValues.proposedEndDate || null,
      additionalPolicy: formValues.additionalPolicy || null,
    };

    this.apiService.post('/job-bids', payload).subscribe({
      next: () => {
        this.toastService.success('Bid submitted successfully!');
        this.router.navigate(['/']); // or navigate to freelancer dashboard
      },
      error: (error) => {
        console.error('Error submitting bid:', error);
        this.toastService.error('Failed to submit bid.');
      }
    });
  }

  // Helper methods for template
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  }

  formatDate(dateArray?: number[]): string | null {
    if (!dateArray || dateArray.length < 3) return null;
    
    // Add leading zeros if needed
    const year = dateArray[0];
    const month = dateArray[1].toString().padStart(2, '0');
    const day = dateArray[2].toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T12:00`;
  }

  formatDisplayDate(dateArray?: number[] | string): string {
    if (!dateArray) return 'N/A';
    
    if (Array.isArray(dateArray) && dateArray.length >= 3) {
      const date = new Date(dateArray[0], dateArray[1] - 1, dateArray[2]);
      return date.toLocaleDateString();
    } else if (typeof dateArray === 'string') {
      const date = new Date(dateArray);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString();
      }
    }
    
    return 'N/A';
  }

  getBidDifference(): { amount: number, percent: number, isLower: boolean } | null {
    if (!this.job || !this.bidForm.get('bidAmount')?.value) return null;
    
    const originalBudget = parseFloat(this.job?.budget?.toString() || '0');
    const bid = parseFloat(this.bidForm.get('bidAmount')?.value);
    
    if (isNaN(bid) || isNaN(originalBudget)) return null;
    
    const difference = originalBudget - bid;
    const percentDifference = (difference / originalBudget) * 100;
    
    return {
      amount: difference,
      percent: percentDifference,
      isLower: difference > 0
    };
  }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, index) => index + 1);
  }
}
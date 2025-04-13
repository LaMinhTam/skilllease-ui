// src/app/pages/create-contract/create-contract.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { Bid } from '../../models/bid';
import { provideNativeDateAdapter } from '@angular/material/core';

// Material imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatChipsModule } from '@angular/material/chips';

// Interface for contract creation data
interface CreateContractDto {
  contractType: string; // "BID"
  serviceId: number | null; // for BID contracts, null
  jobBidId: number;
  contractStartDate: string; // ISO datetime string
  contractEndDate: string; // ISO datetime string
  additionalPolicy: string;
}

@Component({
  selector: 'app-create-contract',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatTooltipModule,
    MatGridListModule,
    MatChipsModule
  ],
  providers: [
    provideNativeDateAdapter()
  ],
  templateUrl: './create-contract.component.html',
  styleUrls: ['./create-contract.component.scss']
})
export class CreateContractComponent implements OnInit {
  bid: Bid | null = null;
  contractForm: FormGroup;
  loading = true;
  bidAmount = 0;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private toastService: ToastService
  ) {
    // Initialize form
    this.contractForm = this.fb.group({
      contractStartDate: ['', Validators.required],
      contractEndDate: ['', Validators.required],
      additionalPolicy: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Get bid ID from route params
    this.route.paramMap.subscribe(params => {
      const bidId = params.get('id');
      if (bidId) {
        this.fetchBidDetails(bidId);
        this.setDefaultDates();
      }
    });
  }

  fetchBidDetails(bidId: string): void {
    this.loading = true;
    this.apiService.get<any>(`/job-bids/${bidId}`)
      .subscribe({
        next: (response) => {
          this.bid = response.data;
          
          // Set additional policy if provided by freelancer
          if (this.bid?.additionalPolicy) {
            this.contractForm.get('additionalPolicy')?.setValue(this.bid.additionalPolicy);
          }
          
          // Set bid amount for display
          this.bidAmount = this.bid?.bidAmount || 0;
          
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching bid details:', error);
          this.toastService.error('Failed to load bid details.');
          this.loading = false;
        }
      });
  }

  setDefaultDates(): void {
    // Set default start and end dates (example: start in 7 days, end in 37 days)
    const now = new Date();
    const defaultStart = new Date(now);
    defaultStart.setDate(now.getDate() + 7);
    const defaultEnd = new Date(now);
    defaultEnd.setDate(now.getDate() + 37);
    
    this.contractForm.get('contractStartDate')?.setValue(defaultStart);
    this.contractForm.get('contractEndDate')?.setValue(defaultEnd);
  }

  onSubmit(): void {
    if (this.contractForm.invalid) {
      this.toastService.error('Please fill in all required fields correctly.');
      return;
    }

    const bidId = this.route.snapshot.paramMap.get('id');
    if (!bidId) {
      this.toastService.error('Bid ID is missing.');
      return;
    }

    // Validate dates
    const startDate = this.contractForm.get('contractStartDate')?.value;
    const endDate = this.contractForm.get('contractEndDate')?.value;
    
    if (startDate >= endDate) {
      this.toastService.error('Contract end date must be after start date.');
      return;
    }

    // Prepare payload
    const formValue = this.contractForm.value;
    const payload: CreateContractDto = {
      contractType: 'BID',
      serviceId: null,
      jobBidId: Number(bidId),
      contractStartDate: new Date(formValue.contractStartDate).toISOString(),
      contractEndDate: new Date(formValue.contractEndDate).toISOString(),
      additionalPolicy: formValue.additionalPolicy
    };

    // Submit contract
    this.apiService.post<any>('/contracts', payload)
      .subscribe({
        next: (response) => {
          const contractId = response.data.id;
          this.toastService.success('Contract created successfully!');
          this.router.navigate(['/contract', contractId]);
        },
        error: (error) => {
          console.error('Error creating contract:', error);
          this.toastService.error('Failed to create contract.');
        }
      });
  }

  // Helper methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  }

  formatDate(dateValue?: string | number[]): string {
    if (!dateValue) return 'N/A';
    
    let date: Date;
    
    if (Array.isArray(dateValue)) {
      // Handle array format [year, month, day]
      if (dateValue.length < 3) return 'N/A';
      date = new Date(dateValue[0], dateValue[1] - 1, dateValue[2]);
    } else if (typeof dateValue === 'string') {
      // Handle string date
      date = new Date(dateValue);
    } else {
      return 'N/A';
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'N/A';
    }
    
    return date.toLocaleDateString();
  }

  calculateDuration(): number {
    const start = this.contractForm.get('contractStartDate')?.value;
    const end = this.contractForm.get('contractEndDate')?.value;
    
    if (!start || !end) return 0;
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = endDate.getTime() - startDate.getTime();
    
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}
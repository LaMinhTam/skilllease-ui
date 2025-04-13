// src/app/pages/contract-detail/contract-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';
import { Contract } from '../../models/contract';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { provideNativeDateAdapter } from '@angular/material/core';

// Material imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatStepperModule } from '@angular/material/stepper';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-contract-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTooltipModule,
    MatStepperModule,
    MatGridListModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    MatSnackBarModule
  ],
  providers: [
    provideNativeDateAdapter()
  ],
  templateUrl: './contract-detail.component.html',
  styleUrls: ['./contract-detail.component.scss']
})
export class ContractDetailComponent implements OnInit {
  contract: any = null;
  loading = true;
  user: any;
  isMobile = false;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private toastService: ToastService,
    private authService: AuthService,
    private breakpointObserver: BreakpointObserver
  ) {
    this.user = this.authService.currentUserValue;
    this.breakpointObserver.observe([Breakpoints.HandsetPortrait])
      .subscribe(result => {
        this.isMobile = result.matches;
      });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const contractId = params.get('id');
      if (contractId) {
        this.fetchContractDetails(contractId);
      }
    });
  }

  fetchContractDetails(contractId: string): void {
    this.loading = true;
    this.apiService.get<any>(`/contracts/${contractId}`)
      .subscribe({
        next: (response) => {
          this.contract = response.data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching contract:', error);
          this.toastService.error('Failed to load contract.');
          this.loading = false;
        }
      });
  }

  updateContractStatus(isAccepted: boolean): void {
    const contractId = this.route.snapshot.paramMap.get('id');
    if (!contractId) return;

    this.apiService.put<any>(`/contracts/${contractId}/status?isAccepted=${isAccepted}`, {})
      .subscribe({
        next: (response) => {
          this.contract = response.data;
          this.toastService.success(isAccepted ? 'Contract Accepted!' : 'Contract Rejected!');

          if (isAccepted && this.isEmployer()) {
            this.processPayment(contractId);
          }
        },
        error: (error) => {
          console.error('Error updating contract status:', error);
          this.toastService.error('Something went wrong.');
        }
      });
  }

  processPayment(contractId: string): void {
    this.apiService.post<any>(`/payment/contract/${contractId}`, {})
      .subscribe({
        next: () => {
          this.toastService.success('Payment processed successfully!');
        },
        error: (error) => {
          console.error('Error processing payment:', error);
          this.toastService.error('Failed to process payment.');
        }
      });
  }

  // Helper functions for the template
  formatDate(dateArr: number[]): string {
    if (!dateArr || dateArr.length < 3) return 'Invalid date';
    
    return new Date(
      dateArr[0],
      dateArr[1] - 1,
      dateArr[2],
      dateArr[3] || 0,
      dateArr[4] || 0
    ).toLocaleString();
  }

  getDaysBetween(startDate: number[], endDate: number[]): number {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate[0], startDate[1] - 1, startDate[2]);
    const end = new Date(endDate[0], endDate[1] - 1, endDate[2]);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  calculateProgress(startDate: number[], endDate: number[]): number {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate[0], startDate[1] - 1, startDate[2]);
    const end = new Date(endDate[0], endDate[1] - 1, endDate[2]);
    const now = new Date();

    if (now < start) return 0;
    if (now > end) return 100;

    const totalDuration = end.getTime() - start.getTime();
    const elapsedDuration = now.getTime() - start.getTime();
    return Math.round((elapsedDuration / totalDuration) * 100);
  }

  getContractStatusInfo(status: string): { color: string, icon: string, step: number } {
    switch (status) {
      case 'ACTIVE':
        return { color: 'success', icon: 'check_circle', step: 2 };
      case 'NEGOTIATION':
        return { color: 'warn', icon: 'help_outline', step: 1 };
      case 'COMPLETED':
        return { color: 'primary', icon: 'assignment', step: 3 };
      case 'CANCELLED':
        return { color: 'error', icon: 'cancel', step: 1 };
      default:
        return { color: 'default', icon: 'info', step: 0 };
    }
  }

  getCurrentStep(): number {
    if (!this.contract) return 0;
    
    const { status, employerAccepted, freelancerAccepted } = this.contract;
    
    if (status === 'ACTIVE' || status === 'COMPLETED') return 3;
    if (employerAccepted && freelancerAccepted) return 2;
    if (employerAccepted) return 1;
    return 0;
  }

  isEmployer(): boolean {
    if (!this.contract || !this.user) return false;
    return this.user.id === this.contract.employer.id;
  }

  isFreelancer(): boolean {
    if (!this.contract || !this.user) return false;
    return this.user.id === this.contract.freelancer.id;
  }

  canEmployerAct(): boolean {
    if (!this.contract) return false;
    return this.isEmployer() && 
           this.contract.status === 'NEGOTIATION' && 
           !this.contract.employerAccepted;
  }

  canFreelancerAct(): boolean {
    if (!this.contract) return false;
    return this.isFreelancer() && 
           this.contract.status === 'NEGOTIATION' && 
           this.contract.employerAccepted && 
           !this.contract.freelancerAccepted;
  }

  navigateToContracts(): void {
    this.router.navigate(['/my-contracts']);
  }

  navigateToMilestones(): void {
    const contractId = this.route.snapshot.paramMap.get('id');
    if (contractId) {
      this.router.navigate(['/contract', contractId, 'milestones']);
    }
  }

  getInitials(name: string): string {
    if (!name) return '';
    
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase();
  }
}
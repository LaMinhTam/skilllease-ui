// src/app/pages/my-contracts/my-contracts.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';
import { Contract } from '../../models/contract';
import { Milestone } from '../../models/milestone';

// Material imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';

interface ContractWithRelations {
  job: any;
  contract: Contract;
}

@Component({
  selector: 'app-my-contracts',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTooltipModule,
    MatGridListModule,
    MatProgressSpinnerModule,
    MatBadgeModule
  ],
  templateUrl: './my-contracts.component.html',
  styleUrls: ['./my-contracts.component.scss']
})
export class MyContractsComponent implements OnInit {
  contracts: ContractWithRelations[] = [];
  loading = true;
  user: any;
  
  constructor(
    private router: Router,
    private apiService: ApiService,
    private toastService: ToastService,
    private authService: AuthService
  ) {
    this.user = this.authService.currentUserValue;
  }

  ngOnInit(): void {
    this.fetchContracts();
  }

  fetchContracts(): void {
    this.loading = true;
    this.apiService.get<any>('/contracts').subscribe({
      next: (response) => {
        // Assuming response.data is an array of contracts
        this.contracts = (response.data || []).map((contractItem: ContractWithRelations) => {
          // If contractStartDate and contractEndDate are arrays, convert them
          if (Array.isArray(contractItem.contract.contractStartDate)) {
            contractItem.contract.contractStartDate = new Date(
              contractItem.contract.contractStartDate[0],
              contractItem.contract.contractStartDate[1] - 1,
              contractItem.contract.contractStartDate[2]
            ).toISOString();
          }
          if (Array.isArray(contractItem.contract.contractEndDate)) {
            contractItem.contract.contractEndDate = new Date(
              contractItem.contract.contractEndDate[0],
              contractItem.contract.contractEndDate[1] - 1,
              contractItem.contract.contractEndDate[2]
            ).toISOString();
          }
          return contractItem;
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching contracts:', error);
        this.toastService.error('Failed to load contracts.');
        this.loading = false;
      }
    });
  }
  

  // Format date array to local date string
  formatDate(dateArr: number[]): string {
    if (!dateArr || dateArr.length < 3) return 'Invalid date';
    
    return new Date(
      dateArr[0],
      dateArr[1] - 1,
      dateArr[2],
      dateArr[3] || 0,
      dateArr[4] || 0
    ).toLocaleDateString();
  }

  // Get initials from name
  getInitials(name: string): string {
    if (!name) return '';
    
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase();
  }

  // Calculate progress based on milestones
  calculateMilestoneProgress(milestones: Milestone[]): number {
    if (!milestones || milestones.length === 0) return 0;

    const totalEffort = milestones.reduce((sum, ms) => sum + ms.effort, 0);
    
    // Calculate completed effort - only count APPROVED milestones as 100% complete
    const completedEffort = milestones.reduce((sum, ms) => {
      if (ms.reviewStatus === 'APPROVED') {
        return sum + ms.effort;
      } else if (ms.reviewStatus === 'PENDING' && ms.deliverableUrl) {
        // If milestone is submitted but not yet approved, count as 75% complete
        return sum + (ms.effort * 0.75);
      } else if (ms.deliverableUrl) {
        // If milestone has a deliverable but was rejected, count as 50% complete
        return sum + (ms.effort * 0.5);
      }
      return sum;
    }, 0);

    // Calculate the percentage
    return Math.round((completedEffort / totalEffort) * 100);
  }

  // Get milestone status breakdown for tooltips
  getMilestoneStatusBreakdown(milestones: Milestone[]): string {
    if (!milestones || milestones.length === 0) return 'No milestones';

    const approved = milestones.filter(m => m.reviewStatus === 'APPROVED').length;
    const pending = milestones.filter(m => m.reviewStatus === 'PENDING').length;
    const rejected = milestones.filter(m => m.reviewStatus === 'REJECTED').length;
    const notStarted = milestones.filter(m => !m.deliverableUrl && !m.reviewStatus).length;

    return `${approved} approved, ${pending} pending, ${rejected} rejected, ${notStarted} not started`;
  }

  // Get status color
  getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'NEGOTIATION': return 'warn';
      default: return 'primary';
    }
  }

  // Get milestone status color
  getMilestoneStatusColor(status: string | null, deliverableUrl: string | null): string {
    if (status === 'APPROVED') {
      return 'success';
    } else if (status === 'PENDING') {
      return 'warn';
    } else if (status === 'REJECTED') {
      return 'error';
    } else if (deliverableUrl) {
      return 'primary';
    } else {
      return 'disabled';
    }
  }

  // Navigate to contract details
  navigateToContractDetails(contractId: number): void {
    this.router.navigate(['/contract', contractId]);
  }

  // Navigate to contract milestones
  navigateToContractMilestones(contractId: number): void {
    this.router.navigate(['/contract', contractId, 'milestones']);
  }

  // Navigate to browse projects
  navigateToBrowseProjects(): void {
    this.router.navigate(['/']);
  }

  // Check if user is employer
  isEmployer(): boolean {
    return this.user?.role === 'EMPLOYER';
  }
}
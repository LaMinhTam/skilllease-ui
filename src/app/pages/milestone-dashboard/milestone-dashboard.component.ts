// src/app/pages/milestone-dashboard/milestone-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { provideNativeDateAdapter } from '@angular/material/core';

// Services
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';

// Components
import { DeliverableUpdateDialogComponent } from '../../components/deliverable-update-dialog/deliverable-update-dialog.component';

// Models
import { Milestone } from '../../models/milestone';
import { ChecklistGroup } from '../../models/milestone-dashboard/checklist-group';
import { ChecklistItem } from '../../models/milestone-dashboard/checklist-item';

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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PaymentConfirmationDialogComponent } from '../../components/payment-confirmation-dialog/payment-confirmation-dialog.component';

@Component({
  selector: 'app-milestone-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTooltipModule,
    MatGridListModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatSidenavModule,
    MatToolbarModule,
    MatBadgeModule,
    MatSnackBarModule
  ],
  providers: [
    provideNativeDateAdapter()
  ],
  templateUrl: './milestone-dashboard.component.html',
  styleUrls: ['./milestone-dashboard.component.scss']
})
export class MilestoneDashboardComponent implements OnInit {
  contractId: string | null = null;
  milestones: Milestone[] = [];
  loading = true;
  totalAmount = 0;
  totalEffort = 0;
  completedEffort = 0;
  completedAmount = 0;

  // Add state for the deliverable update dialog
  updateDialogOpen = false;
  updatingMilestone: Milestone | null = null;
  deliverableUrl = '';
  comment = '';
  submitting = false;

  // State for milestone detail drawer
  detailDrawerOpen = false;
  selectedMilestone: Milestone | null = null;
  checklists: ChecklistGroup[] = [];
  reviewFeedback = '';
  reviewLoading = false;
  updateChecklists: ChecklistGroup[] = [];

  user: any;
  isMobile = false;
  
  // Make Math available in the template
  Math = Math;

  paymentProcessing = false;
  paymentConfirmationDialogOpen = false;
  paymentMilestone: Milestone | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private toastService: ToastService,
    private authService: AuthService,
    private breakpointObserver: BreakpointObserver,
    private dialog: MatDialog
  ) {
    this.user = this.authService.currentUserValue;
    this.breakpointObserver.observe([Breakpoints.HandsetPortrait])
      .subscribe(result => {
        this.isMobile = result.matches;
      });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.contractId = params.get('id');
      if (this.contractId) {
        this.fetchMilestones();
      }
    });
  }

  fetchMilestones(): void {
    this.loading = true;
    this.apiService.get<any>(`/milestones/contract/${this.contractId}`)
      .subscribe({
        next: (response) => {
          const milestonesData = response.data || [];
          this.milestones = [...milestonesData].sort((a, b) => a.id! - b.id!);
          
          // Calculate totals
          this.totalAmount = this.milestones.reduce((sum, ms) => sum + (ms.amount || 0), 0);
          this.totalEffort = this.milestones.reduce((sum, ms) => sum + ms.effort, 0);
          
          // Calculate completed amounts
          this.completedAmount = this.milestones.reduce((sum, ms) => 
            ms.reviewStatus === 'APPROVED' ? sum + (ms.amount || 0) : sum, 0);
          this.completedEffort = this.milestones.reduce((sum, ms) => 
            ms.reviewStatus === 'APPROVED' ? sum + ms.effort : sum, 0);
          
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching milestones:', error);
          this.toastService.error('Failed to load milestones.');
          this.loading = false;
        }
      });
  }

  // Get counts for milestone statuses
  getApprovedCount(): number {
    return this.milestones.filter(m => m.reviewStatus === 'APPROVED').length;
  }
  
  getPendingCount(): number {
    return this.milestones.filter(m => m.reviewStatus === 'PENDING').length;
  }
  
  getRejectedCount(): number {
    return this.milestones.filter(m => m.reviewStatus === 'REJECTED').length;
  }
  
  getNotStartedCount(): number {
    return this.milestones.filter(m => !m.deliverableUrl && !m.reviewStatus).length;
  }

  handleUpdateDeliverable(milestone: Milestone): void {
    this.updatingMilestone = milestone;
    this.deliverableUrl = milestone.deliverableUrl || '';
    this.comment = milestone.fulfillmentComment || '';
    this.updateChecklists = this.parseChecklistMarkdown(milestone.checklist);
    
    // Use Material Dialog instead of custom dialog
    const dialogRef = this.dialog.open(DeliverableUpdateDialogComponent, {
      width: '600px',
      data: {
        milestone: milestone,
        deliverableUrl: this.deliverableUrl,
        comment: this.comment,
        checklists: this.updateChecklists,
        submitting: false
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deliverableUrl = result.deliverableUrl;
        this.comment = result.comment;
        this.updateChecklists = result.checklists;
        this.submitDeliverableUpdate();
      }
    });
  }

  submitDeliverableUpdate(): void {
    if (!this.updatingMilestone) return;
    
    if (!this.deliverableUrl.trim()) {
      this.toastService.error('Please provide a deliverable URL');
      return;
    }
    
    this.submitting = true;
    this.apiService.put<any>(`/milestones/${this.updatingMilestone.id}/fulfill`, {
      deliverableUrl: this.deliverableUrl,
      fulfillmentComment: this.comment
    }).subscribe({
      next: () => {
        this.toastService.success('Deliverable updated successfully');
        this.updateDialogOpen = false;
        this.fetchMilestones();
        this.submitting = false;
      },
      error: (error) => {
        console.error('Error updating deliverable:', error);
        this.toastService.error('Failed to update deliverable');
        this.submitting = false;
      }
    });
  }

  handleOpenMilestoneDetail(milestone: Milestone): void {
    this.selectedMilestone = milestone;
    this.reviewFeedback = milestone.feedback || '';
    this.checklists = this.parseChecklistMarkdown(milestone.checklist);
    this.detailDrawerOpen = true;
  }

  handleCloseMilestoneDetail(): void {
    this.detailDrawerOpen = false;
    this.selectedMilestone = null;
    this.checklists = [];
    this.reviewFeedback = '';
  }

  handleChecklistItemToggle(groupIndex: number, itemIndex: number): void {
    if (!this.isEmployer()) return; // Only employer can edit checklist

    const newChecklists = [...this.checklists];
    newChecklists[groupIndex].items[itemIndex].checked = 
      !newChecklists[groupIndex].items[itemIndex].checked;
    this.checklists = newChecklists;
  }

  handleReviewMilestone(approved: boolean): void {
    if (!this.selectedMilestone) return;
    
    this.reviewLoading = true;
    const payload = {
      reviewStatus: approved ? 'APPROVED' : 'REJECTED',
      feedback: this.reviewFeedback
    };
    
    this.apiService.put<any>(`/milestones/${this.selectedMilestone.id}/review`, payload)
      .subscribe({
        next: () => {
          this.toastService.success(`Milestone ${approved ? 'approved' : 'rejected'} successfully!`);
          this.handleCloseMilestoneDetail();
          this.fetchMilestones();
          this.reviewLoading = false;
        },
        error: (error) => {
          console.error('Error reviewing milestone:', error);
          this.toastService.error(`Failed to ${approved ? 'approve' : 'reject'} milestone.`);
          this.reviewLoading = false;
        }
      });
  }

  // Helper methods
  parseChecklistMarkdown(markdown: string): ChecklistGroup[] {
    if (!markdown) return [];
    
    // Split the markdown into groups by "### " at beginning of line
    const groupSplits = markdown.split(/(?=^### )/m);
    const groups: ChecklistGroup[] = [];

    groupSplits.forEach((groupText) => {
      const lines = groupText.split('\n').filter((line) => line.trim() !== '');
      if (lines.length === 0) return;
      // The first line is the group header
      const groupTitle = lines[0].replace(/^###\s*/, '').trim();
      const items: ChecklistItem[] = [];
      // Process each subsequent line for checklist items
      for (let i = 1; i < lines.length; i++) {
        const itemMatch = lines[i].match(/^- \[([ x])\]\s+(.*)$/);
        if (itemMatch) {
          const checked = itemMatch[1] === 'x';
          const text = itemMatch[2].trim();
          if (text.length > 0) {
            items.push({ text, checked });
          }
        }
      }
      groups.push({ title: groupTitle, items });
    });

    return groups;
  }

  formatDate(dateArr: string | number[]): string {
    if (!dateArr) return 'Invalid date';
    
    let dateValue: Date;
    
    // If dateArr is a string, parse it directly
    if (typeof dateArr === 'string') {
      dateValue = new Date(dateArr);
    } 
    // If it's an array with at least 3 elements, use it to construct the date
    else if (Array.isArray(dateArr) && dateArr.length >= 3) {
      dateValue = new Date(
        dateArr[0],
        dateArr[1] - 1,
        dateArr[2],
        dateArr[3] || 0,
        dateArr[4] || 0
      );
    } else {
      return 'Invalid date';
    }
    
    return dateValue.toLocaleDateString();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  }

  getStatusColor(status: string | null | undefined): string {
    if (!status) return 'default';
    
    const statusLower = status.toLowerCase();
    if (statusLower === 'approved') return 'success';
    if (statusLower === 'pending') return 'warning';
    if (statusLower === 'rejected') return 'error';
    if (statusLower === 'in_progress') return 'info';
    return 'default';
  }

  getStatusIcon(status: string | null | undefined, deliverableUrl: string | null | undefined): string {
    if (status === 'APPROVED') return 'task_alt';
    if (status === 'PENDING') return 'pending_actions';
    if (status === 'REJECTED') return 'error';
    if (deliverableUrl) return 'attach_file';
    return 'work_outline';
  }

  getMilestoneStatusText(milestone: Milestone): string {
    if (milestone.reviewStatus === 'APPROVED') return 'Approved';
    if (milestone.reviewStatus === 'PENDING') return 'Pending Review';
    if (milestone.reviewStatus === 'REJECTED') return 'Needs Updates';
    if (milestone.deliverableUrl) return 'Submitted';
    return 'Not Started';
  }

  isDueSoon(dueDate: string | number[]): boolean {
    if (!dueDate) return false;
  
    let due: Date;
  
    // If dueDate is a string, parse it directly.
    if (typeof dueDate === 'string') {
      due = new Date(dueDate);
    } else if (Array.isArray(dueDate) && dueDate.length >= 3) {
      // If dueDate is an array with at least three elements, construct the Date.
      due = new Date(dueDate[0], dueDate[1] - 1, dueDate[2]);
    } else {
      return false;
    }
  
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 3;
  }

  isOverdue(dueDate: string | number[]): boolean {
    if (!dueDate) return false;
  
    let due: Date;
  
    // If the dueDate is a string, attempt to parse it directly.
    if (typeof dueDate === 'string') {
      due = new Date(dueDate);
    } 
    // If it's an array and has at least three elements, use those values.
    else if (Array.isArray(dueDate) && dueDate.length >= 3) {
      due = new Date(dueDate[0], dueDate[1] - 1, dueDate[2]);
    } 
    else {
      return false;
    }
  
    const now = new Date();
    return due < now;
  }

  // User role checks
  isEmployer(): boolean {
    return this.user?.role === 'EMPLOYER';
  }

  isFreelancer(): boolean {
    return this.user?.role === 'FREELANCER';
  }

  canUpdate(milestone: Milestone): boolean {
    if (!milestone) return false;
    
    return this.isFreelancer() && (
      milestone.reviewStatus === 'REJECTED' || 
      !milestone.deliverableUrl || 
      (!milestone.reviewStatus && !!milestone.deliverableUrl)
    );
  }

  canReview(milestone: Milestone): boolean {
    if (!milestone) return false;
    
    return this.isEmployer() && milestone.reviewStatus === 'PENDING';
  }

  closeUpdateDialog(): void {
    if (!this.submitting) {
      this.updateDialogOpen = false;
    }
  }

  // Add this method to handle payment for deliverable
  handlePayForDeliverable(milestone: Milestone): void {
    // First, confirm with the user before proceeding with payment
    const dialogRef = this.dialog.open(PaymentConfirmationDialogComponent, {
      width: '450px',
      data: {
        milestone: milestone,
        processing: false
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.processPayment(milestone);
      }
    });
  }

  processPayment(milestone: Milestone): void {
    if (!milestone || !milestone.id) return;
    
    this.paymentProcessing = true;
    this.toastService.info('Processing payment...');
    
    this.apiService.post<any>(`/payment/milestone/${milestone.id}`, {})
      .subscribe({
        next: (response) => {
          this.toastService.success('Payment successful! Deliverable unlocked.');
          this.paymentProcessing = false;
          
          // Refresh the milestone data to reflect the updated hidden status
          this.fetchMilestones();
          
          // If payment was made from detail view, close the detail panel and reopen with refreshed data
          if (this.detailDrawerOpen && this.selectedMilestone?.id === milestone.id) {
            this.handleCloseMilestoneDetail();
            
            // Reopen the detail panel after data refresh with a slight delay
            setTimeout(() => {
              const refreshedMilestone = this.milestones.find(m => m.id === milestone.id);
              if (refreshedMilestone) {
                this.handleOpenMilestoneDetail(refreshedMilestone);
              }
            }, 500);
          }
        },
        error: (error) => {
          console.error('Payment failed:', error);
          const reason = error?.error?.message || 'Payment failed. Please try again later.';
          this.toastService.error(reason);
          this.paymentProcessing = false;
        }
      });
  }

}
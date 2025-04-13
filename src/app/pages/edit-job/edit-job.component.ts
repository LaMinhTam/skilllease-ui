// src/app/pages/edit-job/edit-job.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Category } from '../../models/category';
import { Milestone } from '../../models/milestone';
import { ChecklistGroup } from '../../models/checklist-group';
import { Job } from '../../models/job';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

// Angular Material Imports
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSliderModule } from '@angular/material/slider';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MilestonDialogComponent } from '../post-job/milestone-dialog/milestone-dialog.component';

@Component({
  selector: 'app-edit-job',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatSliderModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './edit-job.component.html',
  styles: [`
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 24px 16px;
    }
    
    .page-title {
      font-size: 1.75rem;
      margin-bottom: 24px;
      font-weight: 500;
    }
    
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 0;
    }
    
    .loading-container p {
      margin-top: 16px;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .job-form {
      display: flex;
      flex-direction: column;
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    
    .milestone-section {
      margin: 32px 0;
    }
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    
    .section-header h3 {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 500;
    }
    
    .no-milestones {
      padding: 16px;
      background-color: #e3f2fd;
      border-radius: 4px;
      color: rgba(0, 0, 0, 0.7);
      margin-bottom: 16px;
    }
    
    .milestone-list {
      margin-top: 16px;
    }
    
    .milestone-card {
      margin-bottom: 16px;
      padding: 16px;
      border-radius: 8px;
    }
    
    .existing-milestone {
      background-color: #f8f9fa;
    }
    
    .milestone-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }
    
    .milestone-header h4 {
      margin: 0;
      font-size: 1rem;
    }
    
    .milestone-actions {
      display: flex;
      gap: 4px;
    }
    
    .milestone-description {
      color: rgba(0, 0, 0, 0.7);
      margin-bottom: 8px;
    }
    
    .milestone-dates {
      font-size: 0.875rem;
      color: rgba(0, 0, 0, 0.6);
      margin-bottom: 12px;
    }
    
    .checklist-preview {
      background-color: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 12px;
    }
    
    .checklist-title {
      font-size: 0.9rem;
      font-weight: 500;
      margin-top: 0;
      margin-bottom: 8px;
      color: rgba(0, 0, 0, 0.7);
    }
    
    .checklist-content {
      font-family: monospace;
      font-size: 0.85rem;
      margin: 0;
      white-space: pre-wrap;
      max-height: 120px;
      overflow-y: auto;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .effort-slider {
      margin-top: 16px;
    }
    
    .milestone-budget {
      margin-top: 8px;
      font-size: 0.875rem;
      color: rgba(0, 0, 0, 0.7);
    }
    
    .total-effort {
      margin-top: 16px;
      font-weight: 500;
      font-size: 0.9rem;
    }
    
    .total-effort.error {
      color: #f44336;
    }
    
    mat-divider {
      margin: 16px 0;
    }
    
    .submit-button {
      margin-top: 24px;
      align-self: flex-start;
      font-size: 1rem;
      padding: 8px 24px;
    }
  `]
})
export class EditJobComponent implements OnInit {
  // Loading state
  loading = true;

  // Form state
  jobTitle = '';
  jobDescription = '';
  budget = '';
  deadline = '';
  categoryId: number | null = null;
  categories: Category[] = [];

  // Milestone state
  milestones: Milestone[] = [];
  
  // Original job data for comparison
  originalJob: Job | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private toastService: ToastService,
    private dialog: MatDialog
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
    this.loading = true;
    
    // Use forkJoin instead of Promise.all for observables
    forkJoin({
      jobResponse: this.apiService.get<any>(`/jobs/${jobId}`),
      categoriesResponse: this.apiService.get<any>('/categories')
    }).subscribe({
      next: (response) => {
        const job: Job = response.jobResponse.data.job;
        this.originalJob = job;
        
        // Set basic job info
        this.jobTitle = job.jobTitle;
        this.jobDescription = job.jobDescription;
        this.budget = String(job.budget);
        
        // Handle different date formats
        if (Array.isArray(job.deadline)) {
          this.deadline = this.formatDateForInput(job.deadline as number[]);
        } else if (job.deadline) {
          try {
            const formattedDate = new Date(job.deadline as string).toISOString().split('T')[0];
            this.deadline = formattedDate;
          } catch (e) {
            console.error('Error parsing date:', e);
            this.deadline = '';
          }
        }
        
        this.categoryId = job.category?.id || null;
        
        // Convert API milestones to component format
        if (job.milestones && job.milestones.length > 0) {
          this.milestones = job.milestones.map(milestone => this.convertApiMilestoneToComponentFormat(milestone));
        }
        
        // Set categories
        this.categories = response.categoriesResponse.data || [];
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error fetching job details:', error);
        this.toastService.error('Failed to load job details.');
        this.loading = false;
      }
    });
  }

  // Helper to format date from API response to YYYY-MM-DD
  formatDateForInput(dateArray: number[]): string {
    if (!dateArray || dateArray.length < 3) return '';
    
    const year = dateArray[0];
    const month = String(dateArray[1]).padStart(2, '0');
    const day = String(dateArray[2]).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  // Convert API milestone format to component format
  convertApiMilestoneToComponentFormat(apiMilestone: any): Milestone {
    // Parse the checklist to extract checklist groups
    const checklistGroups: ChecklistGroup[] = [];
    if (apiMilestone.checklist) {
      const sections = apiMilestone.checklist.split(/(?=### )/g);
      sections.forEach((section: string) => {
        if (!section.trim()) return;
        
        const lines = section.split('\n');
        const title = lines[0].replace('### ', '');
        const items = lines
          .slice(1)
          .filter((line: string) => line.trim().startsWith('- [ ]') || line.trim().startsWith('- [x]'))
          .map((line: string) => ({
            text: line.replace(/- \[[x ]\] /, '')
          }));
        
        if (title && items.length > 0) {
          checklistGroups.push({
            title,
            items
          });
        }
      });
    }

    return {
      id: apiMilestone.id,
      title: apiMilestone.title,
      description: apiMilestone.description,
      startDate: this.formatDateForInput(apiMilestone.startDate),
      dueDate: this.formatDateForInput(apiMilestone.dueDate),
      checklist: apiMilestone.checklist || '',
      effort: apiMilestone.effort,
      amount: apiMilestone.amount,
      checklistGroups
    };
  }

  handleOpenAddMilestoneModal(): void {
    const totalEffort = this.milestones.reduce((sum, ms) => sum + ms.effort, 0);
    const remainingEffort = 100 - totalEffort;
    
    const dialogRef = this.dialog.open(MilestonDialogComponent, {
      width: '600px',
      data: {
        milestone: {
          title: '',
          description: '',
          startDate: '',
          dueDate: '',
          checklist: '',
          effort: remainingEffort,
          checklistGroups: []
        },
        isEdit: false
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.milestones = [...this.milestones, result];
      }
    });
  }

  handleOpenEditMilestoneModal(index: number): void {
    const dialogRef = this.dialog.open(MilestonDialogComponent, {
      width: '600px',
      data: {
        milestone: {...this.milestones[index]},
        isEdit: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const updatedMilestones = [...this.milestones];
        updatedMilestones[index] = result;
        this.milestones = updatedMilestones;
      }
    });
  }

  removeMilestone(index: number): void {
    const updatedMilestones = [...this.milestones];
    updatedMilestones.splice(index, 1);
    this.milestones = updatedMilestones;
  }

  handleEffortChange(index: number, newEffort: number): void {
    // newEffort is the updated value for the milestone at index
    let updated = [...this.milestones];
    const currentEffort = updated[index].effort;
    updated[index].effort = newEffort;

    // Calculate total effort of other milestones
    const otherIndices = updated.map((_, i) => i).filter((i) => i !== index);
    const totalOther = otherIndices.reduce((sum, i) => sum + updated[i].effort, 0);

    if (totalOther === 0 && otherIndices.length > 0) {
      // Distribute the remaining equally
      const equalShare = (100 - newEffort) / otherIndices.length;
      otherIndices.forEach((i) => {
        updated[i].effort = equalShare;
      });
    } else if (otherIndices.length > 0) {
      // Scale down or up the efforts of others proportionally
      const factor = (100 - newEffort) / totalOther;
      otherIndices.forEach((i) => {
        updated[i].effort = Math.round(updated[i].effort * factor);
      });
      
      // Adjust rounding issues: Force sum of efforts = 100
      const sumEfforts = updated.reduce((sum, ms) => sum + ms.effort, 0);
      const correction = 100 - sumEfforts;
      if (otherIndices.length > 0) {
        updated[otherIndices[0]].effort += correction;
      }
    }
    
    this.milestones = updated;
  }

  getTotalEffort(): number {
    return this.milestones.reduce((sum, ms) => sum + ms.effort, 0);
  }

  onSubmit(): void {
    if (!this.jobTitle || !this.jobDescription || !this.budget || !this.deadline || !this.categoryId) {
      this.toastService.error('Please fill all required fields.');
      return;
    }
    
    if (this.milestones.length === 0) {
      this.toastService.error('Please add at least one milestone.');
      return;
    }
    
    const totalEffort = this.getTotalEffort();
    if (totalEffort !== 100) {
      this.toastService.error(`Total milestone effort must equal 100%. It is currently ${totalEffort}%.`);
      return;
    }

    // Get job ID from route
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.toastService.error('Job ID not found.');
      return;
    }

    // Prepare milestones for API submission (excluding UI-specific fields)
    const submitMilestones = this.milestones.map(({ checklistGroups, ...rest }) => rest);

    const payload = {
      jobTitle: this.jobTitle,
      jobDescription: this.jobDescription,
      budget: this.budget,
      deadline: this.deadline,
      categoryId: Number(this.categoryId),
      milestones: submitMilestones
    };

    this.apiService.put<any>(`/jobs/${id}`, payload)
      .subscribe({
        next: () => {
          this.toastService.success('Job updated successfully!');
          this.router.navigate(['/employer-jobs']);
        },
        error: (error) => {
          console.error('Error updating job:', error);
          this.toastService.error('Failed to update job.');
        }
      });
  }
}
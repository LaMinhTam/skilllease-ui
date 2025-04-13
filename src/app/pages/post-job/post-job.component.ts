// src/app/pages/post-job/post-job.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Category } from '../../models/category';
import { Milestone } from '../../models/milestone';
import { ChecklistGroup } from '../../models/checklist-group';
import { ChecklistItem } from '../../models/checklist-item';
import { PostJobDto } from '../../models/post-job-dto';
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
import { MilestonDialogComponent } from './milestone-dialog/milestone-dialog.component';

@Component({
  selector: 'app-post-job',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatSliderModule,
    MatDialogModule
  ],
  templateUrl: './post-job.component.html',
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
    
    .milestone-list {
      margin-top: 16px;
    }
    
    .milestone-card {
      margin-bottom: 16px;
      padding: 16px;
      border-radius: 8px;
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
      padding: 8px 12px;
      border-radius: 4px;
      margin-bottom: 12px;
    }
    
    .checklist-label {
      font-size: 0.875rem;
      color: rgba(0, 0, 0, 0.6);
      margin: 0;
      white-space: pre-line;
    }
    
    .effort-slider {
      margin-top: 16px;
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
    }
  `]
})
export class PostJobComponent implements OnInit {
  // Job fields
  jobTitle = '';
  jobDescription = '';
  budget = '';
  deadline = '';
  categories: Category[] = [];
  categoryId: number | null = null;

  // Milestone state
  milestones: Milestone[] = [];
  
  constructor(
    private apiService: ApiService,
    private router: Router,
    private toastService: ToastService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.fetchCategories();
  }

  fetchCategories(): void {
    this.apiService.get<any>('/categories')
      .subscribe({
        next: (response) => {
          this.categories = response.data || [];
        },
        error: (error) => {
          console.error('Error fetching categories:', error);
        }
      });
  }

  handleOpenMilestoneModal(): void {
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
        this.addMilestone(result);
      }
    });
  }

  addMilestone(milestone: Milestone): void {
    this.milestones = [...this.milestones, milestone];
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
      this.toastService.error('Please fill all required job fields.');
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

    // Prepare milestones for API submission (excluding checklistGroups)
    const submitMilestones = this.milestones.map(({ checklistGroups, ...rest }) => rest);

    const payload: PostJobDto = {
      jobTitle: this.jobTitle,
      jobDescription: this.jobDescription,
      budget: this.budget,
      deadline: this.deadline,
      categoryId: this.categoryId as number,
      milestones: submitMilestones
    };

    this.apiService.post<any>('/jobs', payload)
      .subscribe({
        next: () => {
          this.toastService.success('Job posted successfully!');
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Error posting job:', error);
          this.toastService.error('Failed to post job.');
        }
      });
  }
}
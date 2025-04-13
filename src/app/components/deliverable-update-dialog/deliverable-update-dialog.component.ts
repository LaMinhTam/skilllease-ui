// src/app/components/deliverable-update-dialog/deliverable-update-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Milestone } from '../../models/milestone';
import { ChecklistGroup } from '../../models/milestone-dashboard/checklist-group';

@Component({
  selector: 'app-deliverable-update-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>
      {{data.milestone.reviewStatus === 'REJECTED' ? 'Update Rejected Deliverable' : 'Submit Milestone Deliverable'}}
    </h2>
    
    <div mat-dialog-content>
      <div *ngIf="data.milestone.reviewStatus === 'REJECTED'" class="warning-alert">
        <mat-icon color="warn">warning</mat-icon>
        <div class="alert-content">
          <p>This deliverable needs updates before it can be approved.</p>
          <p *ngIf="data.milestone.feedback" class="feedback-text">
            <strong>Feedback:</strong> {{data.milestone.feedback}}
          </p>
        </div>
      </div>
      
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Deliverable URL</mat-label>
        <input 
          matInput 
          [(ngModel)]="data.deliverableUrl" 
          placeholder="https://..." 
          required>
        <mat-icon matPrefix>link</mat-icon>
        <mat-hint>Add a URL to your work (Google Drive, GitHub, etc.)</mat-hint>
      </mat-form-field>
      
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Comment (Optional)</mat-label>
        <textarea 
          matInput 
          [(ngModel)]="data.comment" 
          rows="3"
          placeholder="Add any additional notes or context about your submission..."></textarea>
      </mat-form-field>
      
      <!-- Checklist section -->
      <div *ngIf="data.checklists.length > 0" class="checklist-section">
        <h3 class="checklist-title">Update Checklist:</h3>
        
        <div *ngFor="let group of data.checklists; let groupIndex = index" class="checklist-group">
          <h4 class="group-title">{{group.title}}</h4>
          <div *ngFor="let item of group.items; let itemIndex = index" class="checklist-item">
            <mat-checkbox 
              [(ngModel)]="data.checklists[groupIndex].items[itemIndex].checked">
              {{item.text}}
            </mat-checkbox>
          </div>
        </div>
      </div>
    </div>
    
    <div mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false" [disabled]="data.submitting">
        Cancel
      </button>
      <button 
        mat-raised-button 
        color="primary" 
        [disabled]="data.submitting || !data.deliverableUrl.trim()"
        (click)="onSubmit()">
        <mat-icon *ngIf="!data.submitting">send</mat-icon>
        <mat-spinner *ngIf="data.submitting" diameter="20"></mat-spinner>
        {{data.submitting ? 'Submitting...' : 'Submit Deliverable'}}
      </button>
    </div>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 1rem;
    }
    
    .warning-alert {
      display: flex;
      padding: 1rem;
      background-color: rgba(255, 193, 7, 0.1);
      border-radius: 0.5rem;
      margin-bottom: 1.5rem;
      
      mat-icon {
        margin-right: 1rem;
      }
      
      .alert-content {
        flex-grow: 1;
        
        p {
          margin: 0;
          margin-bottom: 0.5rem;
          
          &:last-child {
            margin-bottom: 0;
          }
        }
        
        .feedback-text {
          font-style: italic;
        }
      }
    }
    
    .checklist-section {
      margin-top: 1rem;
      
      .checklist-title {
        font-size: 1rem;
        font-weight: 500;
        margin-bottom: 1rem;
      }
      
      .checklist-group {
        margin-bottom: 1.5rem;
        
        .group-title {
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }
        
        .checklist-item {
          padding-left: 1rem;
          margin-bottom: 0.25rem;
        }
      }
    }
  `]
})
export class DeliverableUpdateDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DeliverableUpdateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      milestone: Milestone;
      deliverableUrl: string;
      comment: string;
      checklists: ChecklistGroup[];
      submitting: boolean;
    }
  ) {}

  onSubmit(): void {
    this.dialogRef.close({
      deliverableUrl: this.data.deliverableUrl,
      comment: this.data.comment,
      checklists: this.data.checklists
    });
  }
}
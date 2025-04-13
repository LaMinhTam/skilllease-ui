// src/app/pages/post-job/milestone-dialog/milestone-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { ToastService } from '../../../services/toast.service';

import { Milestone } from '../../../models/milestone';
import { ChecklistGroup } from '../../../models/checklist-group';

@Component({
  selector: 'app-milestone-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatCardModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEdit ? 'Edit Milestone' : 'Add Milestone' }}</h2>

    <mat-dialog-content>
      <div class="dialog-content">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Milestone Title</mat-label>
          <input matInput [(ngModel)]="milestone.title" required>
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Milestone Description</mat-label>
          <textarea matInput [(ngModel)]="milestone.description" rows="3" required></textarea>
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Start Date</mat-label>
          <input matInput type="date" [(ngModel)]="milestone.startDate" required>
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Due Date</mat-label>
          <input matInput type="date" [(ngModel)]="milestone.dueDate" required>
        </mat-form-field>
        
        <!-- Checklist Section -->
        <div class="checklist-section">
          <h3>Milestone Checklist</h3>
          <button mat-outlined-button (click)="addChecklistGroup()" class="add-group-btn">
            <mat-icon>add</mat-icon> Add Checklist Group
          </button>
          
          <div *ngFor="let group of milestone.checklistGroups; let groupIndex = index" class="checklist-group">
            <div class="group-header">
              <h4>Group {{ groupIndex + 1 }}</h4>
              <button mat-icon-button color="warn" (click)="removeChecklistGroup(groupIndex)">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Group Title</mat-label>
              <input matInput [(ngModel)]="group.title" (ngModelChange)="updateGroupTitle(groupIndex, $event)">
            </mat-form-field>
            
            <div class="checklist-items">
              <div *ngFor="let item of group.items; let itemIndex = index" class="checklist-item">
                <mat-form-field appearance="outline" class="item-input">
                  <mat-label>Item {{ itemIndex + 1 }}</mat-label>
                  <input matInput [(ngModel)]="item.text" (ngModelChange)="updateChecklistItem(groupIndex, itemIndex, $event)">
                </mat-form-field>
                
                <button mat-icon-button color="warn" (click)="removeChecklistItem(groupIndex, itemIndex)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
            
            <button mat-button (click)="addChecklistItem(groupIndex)" class="add-item-btn">
              + Add Item
            </button>
          </div>
        </div>
        
        <!-- Effort Display (Read-only) -->
        <div class="effort-display">
          <p>Effort Percentage: {{ milestone.effort }}%</p>
        </div>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()">
        {{ isEdit ? 'Update Milestone' : 'Add Milestone' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-content {
      display: flex;
      flex-direction: column;
      padding: 8px 0;
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    
    .checklist-section {
      margin-top: 16px;
    }
    
    .checklist-section h3 {
      font-size: 1.1rem;
      font-weight: 500;
      margin-bottom: 12px;
    }
    
    .add-group-btn {
      margin-bottom: 16px;
    }
    
    .checklist-group {
      background-color: #f5faff;
      border-left: 4px solid #1976d2;
      padding: 16px;
      margin-bottom: 16px;
      border-radius: 4px;
    }
    
    .group-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    
    .group-header h4 {
      margin: 0;
      font-size: 1rem;
      font-weight: 500;
    }
    
    .checklist-items {
      padding-left: 16px;
      margin: 8px 0;
    }
    
    .checklist-item {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
    }
    
    .item-input {
      flex: 1;
      margin-right: 8px;
      margin-bottom: 0;
    }
    
    .add-item-btn {
      margin-top: 8px;
      font-size: 0.9rem;
    }
    
    .effort-display {
      margin-top: 16px;
      font-weight: 500;
    }
  `]
})
export class MilestonDialogComponent {
  milestone: Milestone;
  isEdit: boolean;

  constructor(
    public dialogRef: MatDialogRef<MilestonDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { milestone: Milestone, isEdit: boolean },
    private toastService: ToastService
  ) {
    this.milestone = { ...data.milestone };
    this.isEdit = data.isEdit;
  }

  addChecklistGroup(): void {
    this.milestone.checklistGroups = [
      ...this.milestone.checklistGroups, 
      { title: 'Checklist', items: [] }
    ];
  }

  updateGroupTitle(index: number, newTitle: string): void {
    const updated = [...this.milestone.checklistGroups];
    updated[index].title = newTitle;
    this.milestone.checklistGroups = updated;
  }

  addChecklistItem(groupIndex: number): void {
    const updated = [...this.milestone.checklistGroups];
    updated[groupIndex].items.push({ text: '' });
    this.milestone.checklistGroups = updated;
  }

  updateChecklistItem(groupIndex: number, itemIndex: number, text: string): void {
    const updated = [...this.milestone.checklistGroups];
    updated[groupIndex].items[itemIndex].text = text;
    this.milestone.checklistGroups = updated;
  }

  removeChecklistItem(groupIndex: number, itemIndex: number): void {
    const updated = [...this.milestone.checklistGroups];
    updated[groupIndex].items.splice(itemIndex, 1);
    this.milestone.checklistGroups = updated;
  }

  removeChecklistGroup(groupIndex: number): void {
    const updated = [...this.milestone.checklistGroups];
    updated.splice(groupIndex, 1);
    this.milestone.checklistGroups = updated;
  }

  convertChecklistToMarkdown(groups: ChecklistGroup[]): string {
    return groups
      .map(
        (group) =>
          `### ${group.title.trim()}\n` +
          group.items.map((item) => `- [ ] ${item.text.trim()}`).join('\n')
      )
      .join('\n\n');
  }

  onSave(): void {
    if (
      !this.milestone.title.trim() ||
      !this.milestone.description.trim() ||
      !this.milestone.startDate ||
      !this.milestone.dueDate
    ) {
      this.toastService.error('Please fill all milestone fields.');
      return;
    }

    // Validate checklist groups if any
    if (this.milestone.checklistGroups.length > 0) {
      const hasEmptyGroupTitle = this.milestone.checklistGroups.some(
        (group) => group.title.trim() === ''
      );
      const hasEmptyItems = this.milestone.checklistGroups.some((group) =>
        group.items.some((item) => item.text.trim() === '')
      );
      const hasEmptyGroups = this.milestone.checklistGroups.some((group) => group.items.length === 0);

      if (hasEmptyGroupTitle || hasEmptyItems) {
        this.toastService.error('Please fill in all checklist titles and items, or remove empty ones.');
        return;
      }

      if (hasEmptyGroups) {
        this.toastService.error('Checklist groups must contain at least one item.');
        return;
      }
    }

    // Convert checklist groups to markdown
    const checklistMarkdown = this.convertChecklistToMarkdown(this.milestone.checklistGroups);

    // Return the completed milestone
    this.dialogRef.close({
      ...this.milestone,
      checklist: checklistMarkdown
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
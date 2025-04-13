// src/app/components/custom-snackbar/custom-snackbar.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-custom-snackbar',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="custom-snackbar">
      <mat-icon class="snackbar-icon">{{ data.icon }}</mat-icon>
      <span class="snackbar-message">{{ data.message }}</span>
      <button mat-button class="snackbar-action" (click)="snackBarRef.dismiss()">
        {{ data.action }}
      </button>
    </div>
  `,
  styles: [`
    .custom-snackbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }
    
    .snackbar-icon {
      margin-right: 16px;
    }
    
    .snackbar-message {
      flex-grow: 1;
    }
    
    .snackbar-action {
      text-transform: uppercase;
      font-weight: 500;
    }
  `]
})
export class CustomSnackbarComponent {
  constructor(
    public snackBarRef: MatSnackBarRef<CustomSnackbarComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: {
      message: string;
      action: string;
      icon: string;
    }
  ) {}
}
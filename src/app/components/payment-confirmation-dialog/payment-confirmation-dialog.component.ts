// src/app/components/payment-confirmation-dialog/payment-confirmation-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Milestone } from '../../models/milestone';

// Interface for dialog data
export interface PaymentConfirmationDialogData {
  milestone: Milestone;
  processing: boolean;
}

@Component({
  selector: 'app-payment-confirmation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './payment-confirmation-dialog.component.html',
  styleUrls: ['./payment-confirmation-dialog.component.scss']
})
export class PaymentConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<PaymentConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PaymentConfirmationDialogData
  ) {}

  confirmPayment(): void {
    this.dialogRef.close(true);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  }
}
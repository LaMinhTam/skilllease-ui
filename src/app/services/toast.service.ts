// src/app/services/toast.service.ts
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomSnackbarComponent } from '../components/custom-snackbar/custom-snackbar.component';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  constructor(private snackBar: MatSnackBar) { }

  success(message: string): void {
    this.snackBar.openFromComponent(CustomSnackbarComponent, {
      data: {
        message: message,
        action: 'Close',
        icon: 'check_circle'
      },
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  error(message: string): void {
    this.snackBar.openFromComponent(CustomSnackbarComponent, {
      data: {
        message: message,
        action: 'Close',
        icon: 'error'
      },
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  info(message: string): void {
    this.snackBar.openFromComponent(CustomSnackbarComponent, {
      data: {
        message: message,
        action: 'Close',
        icon: 'info'
      },
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['info-snackbar']
    });
  }

  warning(message: string): void {
    this.snackBar.openFromComponent(CustomSnackbarComponent, {
      data: {
        message: message,
        action: 'Close',
        icon: 'warning'
      },
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['warning-snackbar']
    });
  }
}
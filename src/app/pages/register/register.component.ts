// src/app/pages/register/register.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    ReactiveFormsModule, 
    MatCardModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule,
    MatSelectModule
  ],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Register</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Full Name</mat-label>
              <input matInput formControlName="fullName" required>
              <mat-error *ngIf="registerForm.controls['fullName'].hasError('required')">
                Full Name is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" required>
              <mat-error *ngIf="registerForm.controls['email'].hasError('required')">
                Email is required
              </mat-error>
              <mat-error *ngIf="registerForm.controls['email'].hasError('email')">
                Please enter a valid email address
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password" required>
              <mat-error *ngIf="registerForm.controls['password'].hasError('required')">
                Password is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Confirm Password</mat-label>
              <input matInput type="password" formControlName="confirmPassword" required>
              <mat-error *ngIf="registerForm.controls['confirmPassword'].hasError('required')">
                Confirm Password is required
              </mat-error>
              <mat-error *ngIf="registerForm.controls['confirmPassword'].hasError('passwordMismatch')">
                Passwords do not match
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Role</mat-label>
              <mat-select formControlName="role" required>
                <mat-option *ngFor="let role of roles" [value]="role.value">
                  {{role.viewValue}}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" class="full-width">
              Register
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      display: flex;
      justify-content: center;
      padding: 20px;
    }

    mat-card {
      max-width: 400px;
      width: 100%;
    }

    .full-width {
      width: 100%;
      margin-bottom: 15px;
    }

    mat-card-title {
      margin-bottom: 20px;
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  roles = [
    { value: 'EMPLOYER', viewValue: 'Employer' },
    { value: 'FREELANCER', viewValue: 'Freelancer' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.registerForm = this.formBuilder.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      role: ['EMPLOYER', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    const { fullName, email, password, role } = this.registerForm.value;

    this.authService.register({ fullName, email, password, role })
      .subscribe({
        next: () => {
          this.toastService.success('Registration successful! Please upload your profile picture.');
          this.router.navigate(['/upload-profile-picture']);
        },
        error: () => {
          this.toastService.error('Registration failed!');
        }
      });
  }
}
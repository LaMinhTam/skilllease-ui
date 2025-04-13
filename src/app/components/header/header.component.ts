// src/app/components/header/header.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  template: `
    <mat-toolbar class="header-toolbar">
      <img src="assets/images/skilllease-logo.png" alt="Skilllease Logo" class="logo" (click)="navigateTo('/')" />
      
      <span class="spacer"></span>
      
      <!-- Desktop Menu -->
      <div class="desktop-menu">
        <ng-container *ngIf="user">
          <!-- Dashboard link for all logged in users -->
          <button mat-button (click)="navigateTo('/dashboard')">
            <mat-icon>dashboard</mat-icon>
            Dashboard
          </button>
          
          <!-- Employer Menu Items -->
          <ng-container *ngIf="user.role === 'EMPLOYER'">
            <button mat-button (click)="navigateTo('/post-job')">
              <mat-icon>add_circle</mat-icon>
              Post Job
            </button>
            <button mat-button (click)="navigateTo('/employer-jobs')">
              <mat-icon>work</mat-icon>
              My Jobs
            </button>
            <button mat-button (click)="navigateTo('/my-contracts')">
              <mat-icon>description</mat-icon>
              My Contracts
            </button>
          </ng-container>
          
          <!-- Freelancer Menu Items -->
          <ng-container *ngIf="user.role === 'FREELANCER'">
            <button mat-button (click)="navigateTo('/post-service')">
              <mat-icon>build</mat-icon>
              Post Service
            </button>
            <button mat-button (click)="navigateTo('/my-services')">
              <mat-icon>build</mat-icon>
              My Services
            </button>
            <button mat-button (click)="navigateTo('/my-contracts')">
              <mat-icon>work</mat-icon>
              My Contracts
            </button>
          </ng-container>
          
          <!-- Wallet Button -->
          <button mat-button (click)="navigateTo('/recharge')">
            <mat-icon>account_balance_wallet</mat-icon>
            {{ walletBalance ? (walletBalance | number) + '₫' : 'Loading...' }}
          </button>
          
          <!-- User Menu -->
          <button mat-button [matMenuTriggerFor]="userMenu">
            <div *ngIf="user.profilePictureUrl; else initialAvatar">
              <img [src]="user.profilePictureUrl" alt="{{user.fullName}}" class="user-avatar" />
            </div>
            <ng-template #initialAvatar>
              <div class="initial-avatar">{{ getUserInitials() }}</div>
            </ng-template>
            {{ user.fullName }}
          </button>
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              Logout
            </button>
          </mat-menu>
        </ng-container>

        <!-- Login/Register when not logged in -->
        <ng-container *ngIf="!user">
          <button mat-button (click)="navigateTo('/login')">
            <mat-icon>login</mat-icon>
            Login
          </button>
          <button mat-button (click)="navigateTo('/register')">
            <mat-icon>person_add</mat-icon>
            Register
          </button>
        </ng-container>
      </div>
      
      <!-- Mobile Menu Button -->
      <button mat-icon-button [matMenuTriggerFor]="mobileMenu" class="mobile-menu-button">
        <mat-icon>menu</mat-icon>
      </button>
      
      <!-- Mobile Menu -->
      <mat-menu #mobileMenu="matMenu">
        <ng-container *ngIf="user">
          <!-- Dashboard link for mobile -->
          <button mat-menu-item (click)="navigateTo('/dashboard')">Dashboard</button>
          
          <!-- Employer Menu Items -->
          <ng-container *ngIf="user.role === 'EMPLOYER'">
            <button mat-menu-item (click)="navigateTo('/post-job')">Post Job</button>
            <button mat-menu-item (click)="navigateTo('/employer-jobs')">My Jobs</button>
          </ng-container>
          
          <!-- Freelancer Menu Items -->
          <ng-container *ngIf="user.role === 'FREELANCER'">
            <button mat-menu-item (click)="navigateTo('/post-service')">Post Service</button>
            <button mat-menu-item (click)="navigateTo('/my-services')">My Services</button>
          </ng-container>
          
          <button mat-menu-item (click)="navigateTo('/recharge')">Recharge</button>
          <button mat-menu-item (click)="logout()">Logout</button>
        </ng-container>

        <!-- Login/Register when not logged in (Mobile) -->
        <ng-container *ngIf="!user">
          <button mat-menu-item (click)="navigateTo('/login')">Login</button>
          <button mat-menu-item (click)="navigateTo('/register')">Register</button>
        </ng-container>
      </mat-menu>
    </mat-toolbar>
  `,
  styles: [`
    .header-toolbar {
      background: linear-gradient(45deg, #2196F3 30%, #21CBF3 90%);
      box-shadow: 0 3px 5px -1px rgba(0,0,0,.2), 0 6px 10px 0 rgba(0,0,0,.14), 0 1px 18px 0 rgba(0,0,0,.12);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .logo {
      height: 80px;
      cursor: pointer;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .user-avatar {
      width: 35px;
      height: 35px;
      border-radius: 50%;
      margin-right: 8px;
      vertical-align: middle;
    }

    .initial-avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 35px;
      height: 35px;
      border-radius: 50%;
      background-color: #3f51b5;
      color: white;
      margin-right: 8px;
      vertical-align: middle;
    }

    .desktop-menu {
      display: flex;
      align-items: center;
    }
    
    .desktop-menu button {
      margin: 0 4px;
    }
    
    .desktop-menu button mat-icon {
      margin-right: 4px;
    }

    .mobile-menu-button {
      display: none;
    }

    /* Media query for mobile devices */
    @media (max-width: 768px) {
      .desktop-menu {
        display: none;
      }
      
      .mobile-menu-button {
        display: block;
      }
    }
  `]
})
export class HeaderComponent implements OnInit {
  user: User | null = null;
  walletBalance: number | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.user = user;
      // For now, we'll just set a placeholder wallet balance
      // In reality, you'd fetch this from a wallet service
      this.walletBalance = 1000;
    });
  }

  logout(): void {
    this.authService.logout();
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  // Returns user initials for the avatar
  getUserInitials(): string {
    if (this.user?.fullName) {
      return this.user.fullName
        .split(' ')
        .map(name => name.charAt(0))
        .join('');
    }
    return '';
  }
}
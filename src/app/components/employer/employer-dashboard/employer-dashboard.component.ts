// src/app/components/employer/employer-dashboard/employer-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Service } from '../../../models/service';
import { ToastService } from '../../../services/toast.service';
import { ApiService } from '../../../services/api.service';

// Material imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-employer-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatGridListModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="dashboard-container">
      <h2 class="page-title">Freelancer Services</h2>
      
      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
      </div>
      
      <div *ngIf="!loading" class="services-grid">
        <ng-container *ngIf="services.length > 0; else noServices">
          <div class="grid-container">
            <div class="service-card" *ngFor="let service of services">
              <mat-card>
                <mat-card-content>
                  <h3 class="service-title">{{ service.title }}</h3>
                  <p class="service-description">{{ service.description }}</p>
                  <p class="service-price">Price: {{ service.price }}</p>
                  
                  <div class="freelancer-info">
                    <div class="freelancer-avatar">
                      <ng-container *ngIf="service.freelancer.profilePictureUrl; else defaultAvatar">
                        <img [src]="service.freelancer.profilePictureUrl" [alt]="service.freelancer.fullName" class="avatar-img">
                      </ng-container>
                      <ng-template #defaultAvatar>
                        <div class="default-avatar">
                          {{ getInitials(service.freelancer.fullName || '') }}
                        </div>
                      </ng-template>
                    </div>
                    <span class="freelancer-name">{{ service.freelancer.fullName }}</span>
                  </div>
                  
                  <div class="rating-container">
                    <ng-container *ngIf="service.freelancer.rating !== null; else noRating">
                      <div class="star-rating">
                        <span *ngFor="let star of getStars(service.freelancer.rating || 0)" 
                              class="star" 
                              [ngClass]="{'filled': star <= (service.freelancer.rating || 0)}">
                          ★
                        </span>
                        <span class="rating-value">{{ service.freelancer.rating }}</span>
                      </div>
                    </ng-container>
                    <ng-template #noRating>
                      <span class="no-rating">No rating</span>
                    </ng-template>
                  </div>
                </mat-card-content>
                
                <mat-divider></mat-divider>
                
                <mat-card-actions>
                  <button mat-button color="primary" (click)="viewFreelancerProfile(service.freelancer.id || 0)">
                    View Profile
                  </button>
                </mat-card-actions>
              </mat-card>
            </div>
          </div>
        </ng-container>
        
        <ng-template #noServices>
          <div class="no-services">
            <p>No freelancer services available.</p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      margin-top: 2rem;
    }
    
    .page-title {
      font-size: 1.5rem;
      margin-bottom: 1.5rem;
      font-weight: 500;
    }
    
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 2rem;
    }
    
    .grid-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }
    
    .service-card {
      height: 100%;
    }
    
    .service-title {
      font-size: 1.2rem;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    
    .service-description {
      color: rgba(0, 0, 0, 0.7);
      margin-bottom: 1rem;
    }
    
    .service-price {
      font-weight: 500;
      color: rgba(0, 0, 0, 0.8);
      margin-bottom: 1rem;
    }
    
    .freelancer-info {
      display: flex;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    
    .freelancer-avatar {
      margin-right: 0.5rem;
    }
    
    .avatar-img, .default-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: hidden;
    }
    
    .default-avatar {
      background-color: #3f51b5;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }
    
    .freelancer-name {
      font-weight: 500;
    }
    
    .rating-container {
      display: flex;
      align-items: center;
      margin-top: 0.5rem;
    }
    
    .star-rating {
      display: flex;
      align-items: center;
    }
    
    .star {
      color: #d3d3d3;
      font-size: 1.2rem;
    }
    
    .star.filled {
      color: #ffd700;
    }
    
    .rating-value {
      margin-left: 0.5rem;
      font-weight: 500;
    }
    
    .no-rating, .no-services {
      color: rgba(0, 0, 0, 0.6);
    }
    
    .no-services {
      text-align: center;
      padding: 2rem;
    }
    
    mat-card-actions {
      padding: 8px;
    }
  `]
})
export class EmployerDashboardComponent implements OnInit {
  services: Service[] = [];
  loading = true;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.fetchServices();
  }

  fetchServices(): void {
    this.loading = true;
    this.apiService.get<any>('/services')
      .subscribe({
        next: (response) => {
          this.services = response.data || [];
          this.loading = false;
        },
        error: (error) => {
          this.toastService.error('Error fetching services. Please try again later.');
          console.error('Error fetching services:', error);
          this.loading = false;
        }
      });
  }

  viewFreelancerProfile(freelancerId: number): void {
    this.router.navigate(['/profile', freelancerId]);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('');
  }
  
  // Helper method to generate an array for star rating
  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, index) => index + 1);
  }
}
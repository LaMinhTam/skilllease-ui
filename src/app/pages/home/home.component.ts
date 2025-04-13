// src/app/pages/home/home.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="home-container">
      <div class="welcome-section">
        <h1>Welcome to SkillLease</h1>
        <p>Connect with top freelancers and find amazing job opportunities.</p>
      </div>
      
      <div class="features-section">
        <mat-card>
          <mat-card-header>
            <mat-icon>work</mat-icon>
            <mat-card-title>Find Work</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>Browse through our extensive job listings and find opportunities that match your skills.</p>
          </mat-card-content>
        </mat-card>
        
        <mat-card>
          <mat-card-header>
            <mat-icon>person</mat-icon>
            <mat-card-title>Hire Talent</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>Find skilled freelancers for your projects quickly and easily.</p>
          </mat-card-content>
        </mat-card>
        
        <mat-card>
          <mat-card-header>
            <mat-icon>payments</mat-icon>
            <mat-card-title>Secure Payments</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>Our secure payment system ensures that all transactions are safe and reliable.</p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      padding: 20px;
    }

    .welcome-section {
      text-align: center;
      margin-bottom: 40px;
      padding: 60px 20px;
      background: linear-gradient(45deg, #2196F3 30%, #21CBF3 90%);
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .welcome-section h1 {
      font-size: 2.5rem;
      margin-bottom: 16px;
    }
    
    .welcome-section p {
      font-size: 1.2rem;
      max-width: 600px;
      margin: 0 auto;
    }

    .features-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }
    
    .features-section mat-card {
      height: 100%;
      transition: transform 0.3s, box-shadow 0.3s;
    }
    
    .features-section mat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    }
    
    .features-section mat-card-header {
      align-items: center;
      margin-bottom: 16px;
    }
    
    .features-section mat-card-header mat-icon {
      margin-right: 8px;
      color: #2196F3;
    }

    @media (max-width: 768px) {
      .welcome-section {
        padding: 40px 20px;
      }
      
      .welcome-section h1 {
        font-size: 2rem;
      }
      
      .welcome-section p {
        font-size: 1rem;
      }
    }
  `]
})
export class HomeComponent {
  // Basic component to serve as a landing page
}
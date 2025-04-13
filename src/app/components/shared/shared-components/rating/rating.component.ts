// src/app/components/shared/rating/rating.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rating',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="star-rating">
      <span *ngFor="let star of getStars()" 
            class="star" 
            [ngClass]="{'filled': star <= rating}">
        ★
      </span>
      <span *ngIf="showValue" class="rating-value">{{ rating }}</span>
    </div>
  `,
  styles: [`
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
  `]
})
export class RatingComponent {
  @Input() rating: number = 0;
  @Input() maxRating: number = 5;
  @Input() showValue: boolean = true;

  // Generate an array for star rating
  getStars(): number[] {
    return Array(this.maxRating).fill(0).map((_, index) => index + 1);
  }
}
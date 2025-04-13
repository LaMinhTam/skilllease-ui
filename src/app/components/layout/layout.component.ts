// src/app/components/layout/layout.component.ts
import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  template: `
    <div class="app-container">
      <app-header></app-header>
      <main class="content">
        <ng-content></ng-content>
      </main>
      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .content {
      flex: 1;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }
  `]
})
export class LayoutComponent {
  // No specific logic needed for this component
}
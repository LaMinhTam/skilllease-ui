// src/app/components/footer/footer.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="footer">
      <div class="footer-content">
        <p>© {{ currentYear }} SkillLease App</p>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background-color: #f5f5f5;
      padding: 16px;
      margin-top: 32px;
      text-align: center;
    }

    .footer-content p {
      margin: 0;
      color: #757575;
      font-size: 14px;
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
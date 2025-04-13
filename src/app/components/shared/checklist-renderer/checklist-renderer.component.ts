// src/app/components/checklist-renderer/checklist-renderer.component.ts
import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

interface ChecklistItem {
  text: string;
  checked: boolean;
}

interface ChecklistSection {
  title: string;
  items: ChecklistItem[];
}

@Component({
  selector: 'app-checklist-renderer',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatCheckboxModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './checklist-renderer.component.html',
  styleUrls: ['./checklist-renderer.component.scss']
})
export class ChecklistRendererComponent implements OnChanges {
  @Input() markdown: string = '';
  
  sections: ChecklistSection[] = [];

  ngOnChanges(): void {
    this.parseMarkdown();
  }

  parseMarkdown(): void {
    if (!this.markdown || !this.markdown.trim()) {
      this.sections = [];
      return;
    }

    const rawSections = this.markdown.split(/(?=### )/g);
    
    this.sections = rawSections
      .filter(section => section.trim())
      .map(section => {
        const lines = section.split('\n');
        const title = lines[0].replace('### ', '');
        const items = lines
          .slice(1)
          .filter(line => line.trim().startsWith('- [ ]') || line.trim().startsWith('- [x]'))
          .map(line => ({
            text: line.replace(/- \[[x ]\] /, ''),
            checked: line.includes('- [x]')
          }));
        
        return { title, items };
      });
  }
}
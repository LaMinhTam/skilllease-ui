// src/app/models/checklist-group.ts
import { ChecklistItem } from './checklist-item';

export interface ChecklistGroup {
  title: string;
  items: ChecklistItem[];
}
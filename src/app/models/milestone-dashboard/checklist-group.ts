// src/app/models/milestone-dashboard/checklist-group.ts
import { ChecklistItem } from './checklist-item';

export interface ChecklistGroup {
  title: string;
  items: ChecklistItem[];
}
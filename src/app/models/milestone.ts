// src/app/models/milestone.ts
import { ChecklistGroup } from './checklist-group';

export interface Milestone {
  id?: number;
  title: string;
  description: string;
  startDate: string | number[]; // Allow both formats
  dueDate: string | number[]; // Allow both formats
  deliverableUrl?: string | null;
  submissionType?: string | null;
  reviewStatus?: string | null;
  feedback?: string | null;
  hidden?: boolean | null;
  fulfillmentComment?: string | null;
  checklist: string;
  amount?: number;
  effort: number;
  checklistGroups: ChecklistGroup[];
}
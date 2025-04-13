// src/app/models/post-job-dto.ts
import { Milestone } from './milestone';

export interface PostJobDto {
  jobTitle: string;
  categoryId: number;
  jobDescription: string;
  budget: string;
  deadline: string;
  milestones: Omit<Milestone, 'checklistGroups'>[];
}
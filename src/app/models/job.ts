// src/app/models/job.ts
import { Category } from './category';
import { User } from './user';
import { Milestone } from './milestone';

export interface Job {
  id: number;
  jobTitle: string;
  jobDescription: string;
  budget?: number;
  createdAt?: number[];
  deadline?: number[];
  employer: User;
  category: Category;
  milestones?: Milestone[];
  status?: string;
  skillsRequired?: string[];
  updatedAt?: string;
}
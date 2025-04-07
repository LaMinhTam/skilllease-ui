import { Category } from "./category";
import { User } from "./user";

export interface Job {
  id: number;
  jobTitle: string;
  jobDescription: string;
  budget?: number;
  createdAt?: number[];
  deadline?: number[];
  employer: User;
  category: Category;
}

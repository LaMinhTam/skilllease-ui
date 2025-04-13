// src/app/models/bid.ts
import { User } from './user';

export interface Bid {
  id: number;
  freelancer: User;
  bidAmount?: number;
  message: string;
  status: string;
  proposedStartDate?: number[];
  proposedEndDate?: number[];
  supportAvailability?: string;
  additionalPolicy?: string;
}
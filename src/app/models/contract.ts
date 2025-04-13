// src/app/models/contract.ts
import { User } from './user';
import { Job } from './job';
import { Bid } from './bid';

export interface Contract {
  id?: number;
  contractType: string; // "BID" | "SERVICE"
  serviceId?: number | null;
  jobBidId?: number | null;
  contractStartDate: string;
  contractEndDate: string;
  additionalPolicy: string;
  status?: string;
  employer?: User;
  freelancer?: User;
  job?: Job;
  bid?: Bid;
  createdAt?: string;
  updatedAt?: string;
}
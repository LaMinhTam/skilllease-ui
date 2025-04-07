import { User } from "./user";

export interface Bid {
  id: number;
  bidAmount: number;
  message: string;
  createdAt: string;
  status: string;
  freelancer: User;
  proposedStartDate?: [number, number, number] | null;
  proposedEndDate?: [number, number, number] | null;
  supportAvailability?: string | null;
  additionalPolicy?: string | null;
  depositAmount?: number | null;
  finalPaymentAmount?: number | null;
}

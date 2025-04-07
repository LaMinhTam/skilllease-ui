export interface User {
    id?: number;
    fullName?: string;
    email?: string;
    accessToken?: string;
    refreshToken?: string;
    role?: string; // e.g., "EMPLOYER" or "FREELANCER"
    cvUrl?: string | null;
    profilePictureUrl?: string | null;
    rating?: number | null;
  }
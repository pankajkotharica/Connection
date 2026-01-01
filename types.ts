
export interface Contact {
  id: string;
  // Basic Info
  memberId?: string;
  regDate?: string;
  firstName: string;
  lastName: string;
  gender?: string;
  
  // Contact Info
  email?: string;
  phone: string;
  age?: number;
  
  // Location
  address?: string;
  city: string;
  bhagCode?: string;
  nagarCode?: string;
  bastiCode?: string;
  
  // Professional
  occupation: string;
  
  // Status
  activation?: string;
  activationDt?: string;
  
  // Additional
  remark?: string;
  referredBy?: string;
  notes?: string;
  
  // Metadata
  createdAt: number;
  
  // Legacy fields for backward compatibility
  name?: string; // Computed from firstName + lastName
  profession?: string; // Alias for occupation
  contactNumber?: string; // Alias for phone
  area?: string; // Alias for city
}

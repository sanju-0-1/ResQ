export type UserRole = 'normal' | 'resq' | 'homegirl' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'banned';
export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'suspended' | 'not_applied';
export type EmergencyStatus =
  | 'active'
  | 'responder_found'
  | 'assistance_in_progress'
  | 'resolved'
  | 'cancelled'
  | 'expired';

export interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: UserRole;
  profilePhoto?: string;
  isVerifiedResponder: boolean;
  status: UserStatus;
  createdAt: string;
}

export interface ResponderProfile {
  _id: string;
  userId: string | User;
  verificationStatus: VerificationStatus;
  isAvailable: boolean;
  currentLocation: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  emergencyRadiusMeters: number;
  totalAssists: number;
  rating: number;
}

export interface Emergency {
  _id: string;
  requesterId: User;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  addressDescription?: string;
  status: EmergencyStatus;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
  responderId?: User;
  respondersAccepted?: User[];
  approximateDistance?: string;
  distanceMeters?: number;
  createdAt: string;
  resolvedAt?: string;
  cancelledAt?: string;
}

export interface EmergencyMessage {
  _id: string;
  incidentId: string;
  senderId: User;
  type: 'text' | 'system' | 'location_share' | 'deescalation_warning';
  content: string;
  readBy: string[];
  createdAt: string;
}

export interface TrustedContact {
  _id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
  notifyOnEmergency: boolean;
}

export interface Report {
  _id: string;
  reporterId: User;
  reportedUserId: User;
  incidentId?: string;
  reason: string;
  description: string;
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
  createdAt: string;
}

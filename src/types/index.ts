export type UserRole = 'admin' | 'hospital' | 'individual' | 'ambulance';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export type AmbulanceStatus = 'available' | 'unavailable' | 'on-mission';
export type AmbulanceType = 'ALS' | 'BLS' | 'MICU'; // Advanced Life Support, Basic Life Support, Mobile ICU

export interface Ambulance {
  id: string;
  name: string;
  type: AmbulanceType;
  status: AmbulanceStatus;
  latitude: number;
  longitude: number;
  currentPatients: number;
  capacity: number;
  equipment: string[]; 
}

export type RequestStatus = 'pending' | 'dispatched' | 'on-scene' | 'transporting' | 'completed' | 'cancelled';

export interface EmergencyRequest {
  id: string;
  requesterId: string; 
  patientDetails: string;
  location: { latitude: number; longitude: number; address: string };
  status: RequestStatus;
  assignedAmbulanceId?: string;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
  notes?: string;
  priority: 'high' | 'medium' | 'low';
}

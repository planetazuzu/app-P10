export type UserRole = 'admin' | 'hospital' | 'individual' | 'ambulance';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export type AmbulanceStatus = 'available' | 'unavailable' | 'on-mission';

// Tipos de ambulancia españoles
export type AmbulanceType =
  | "SVB"          // Soporte Vital Básico
  | "SVA"          // Soporte Vital Avanzado
  | "Convencional" // Ambulancia convencional
  | "UVI_Movil"    // Unidad de Vigilancia Intensiva móvil
  | "A1"           // Ambulancia A1 (transporte sanitario programado)
  | "Programado"   // Transporte sanitario programado
  | "Otros";       // Cualquier otro tipo

export interface Ambulance {
  id: string;
  name: string;
  type: AmbulanceType; // Actualizado para usar los nuevos tipos
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


export type UserRole = 'admin' | 'hospital' | 'individual' | 'ambulance';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export type AmbulanceType =
  | "SVB"          // Soporte Vital Básico
  | "SVA"          // Soporte Vital Avanzado
  | "Convencional" // Ambulancia convencional
  | "UVI_Movil"    // Unidad de Vigilancia Intensiva móvil
  | "A1"           // Ambulancia A1 (transporte sanitario programado individual)
  | "Programado"   // Transporte sanitario programado colectivo
  | "Otros";       // Cualquier otro tipo
export const ALL_AMBULANCE_TYPES: AmbulanceType[] = ["SVB", "SVA", "Convencional", "UVI_Movil", "A1", "Programado", "Otros"];


export type AmbulanceStatus =
  | 'available'    // Disponible
  | 'busy'         // Ocupada / En misión
  | 'maintenance'  // En mantenimiento
  | 'unavailable'; // No disponible (general)
export const ALL_AMBULANCE_STATUSES: AmbulanceStatus[] = ['available', 'busy', 'maintenance', 'unavailable'];


export interface Ambulance {
  id: string; // Unique identifier, e.g., "amb-001"
  name: string; // Descriptive name, e.g., "Movil Alfa 1" or "SVB Logroño 2"
  licensePlate: string; // e.g., "1234ABC"
  model: string; // e.g., "Mercedes Sprinter"
  type: AmbulanceType;
  baseLocation: string; // e.g., "Hospital San Pedro, Logroño" or "Base Norte"
  zone?: string; // Operational zone, e.g., "Rioja Alta"
  status: AmbulanceStatus;

  // Capacity and direct equipment features
  hasMedicalBed: boolean; // Tiene camilla
  hasWheelchair: boolean; // Puede transportar silla de ruedas (espacio dedicado)
  allowsWalking: boolean; // Permite transporte de pacientes que pueden ir sentados/andando

  stretcherSeats: number; // Número de plazas para pacientes en camilla
  wheelchairSeats: number; // Número de plazas para pacientes en silla de ruedas
  walkingSeats: number; // Número de plazas para pacientes sentados/andando

  specialEquipment: string[]; // Array of IDs from equipmentOptions (e.g., ["oxygen", "defibrillator"])

  // Real-time/Operational data (optional for static definition, more for tracking)
  latitude?: number; // Current geographic latitude
  longitude?: number; // Current geographic longitude
  currentPatients?: number; // Number of patients currently on board

  notes?: string; // Internal administrative notes
}


export type RequestStatus = 'pending' | 'dispatched' | 'on-scene' | 'transporting' | 'completed' | 'cancelled';

export interface AmbulanceRequest {
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

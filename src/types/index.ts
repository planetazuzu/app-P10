
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

export interface AmbulanceEquipment {
  seats: number;            // número total de asientos
  wheelchairSlots: number;  // plazas para sillas de ruedas
  stretcher: boolean;       // si dispone de camilla
  chairs: number;           // número de sillas portátiles
  oxygenUnits: number;      // unidades de oxígeno disponibles
  // Aquí se podrían añadir más campos como:
  // defibrillator: boolean;
  // ventilator: boolean;
  // basicFirstAidKit: boolean;
  // advancedMedicalKit: boolean;
}

// Mapeo por tipo de ambulancia:
export const defaultEquipmentByType: Record<AmbulanceType, AmbulanceEquipment> = {
  SVB:         { seats: 4, wheelchairSlots: 0, stretcher: true,  chairs: 2, oxygenUnits: 2 },
  SVA:         { seats: 3, wheelchairSlots: 0, stretcher: true,  chairs: 1, oxygenUnits: 4 }, // Ajustado seats para SVA
  Convencional:{ seats: 4, wheelchairSlots: 1, stretcher: false, chairs: 0, oxygenUnits: 1 },
  UVI_Movil:   { seats: 2, wheelchairSlots: 0, stretcher: true,  chairs: 0, oxygenUnits: 6 }, // Ajustado seats para UVI
  A1:          { seats: 4, wheelchairSlots: 1, stretcher: false, chairs: 0, oxygenUnits: 1 },
  Programado:  { seats: 6, wheelchairSlots: 2, stretcher: false, chairs: 0, oxygenUnits: 0 }, // Ajustado seats para Programado
  Otros:       { seats: 2, wheelchairSlots: 0, stretcher: false, chairs: 0, oxygenUnits: 0 },
};

export interface Ambulance {
  id: string;
  name: string;
  type: AmbulanceType;
  status: AmbulanceStatus;
  latitude: number;
  longitude: number;
  currentPatients: number;
  capacity: number; // La capacidad general de pacientes podría ser diferente al número de asientos
  equipment: AmbulanceEquipment; // Actualizado de string[] a AmbulanceEquipment
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

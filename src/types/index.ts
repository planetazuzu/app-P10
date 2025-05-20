
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

export interface AmbulanceEquipment {
  seats: number;            // número total de asientos
  wheelchairSlots: number;  // plazas para sillas de ruedas
  stretcher: boolean;       // si dispone de camilla
  chairs: number;           // número de sillas portátiles
  oxygenUnits: number;      // unidades de oxígeno disponibles
  defibrillator?: boolean;  // si dispone de desfibrilador
  monitor?: boolean;        // si dispone de monitor de constantes
}

export const defaultEquipmentByType: Record<AmbulanceType, AmbulanceEquipment> = {
  SVB:         { seats: 3, wheelchairSlots: 0, stretcher: true,  chairs: 1, oxygenUnits: 1, monitor: true },
  SVA:         { seats: 3, wheelchairSlots: 0, stretcher: true,  chairs: 1, oxygenUnits: 2, monitor: true, defibrillator: true },
  Convencional:{ seats: 2, wheelchairSlots: 1, stretcher: false, chairs: 0, oxygenUnits: 0 },
  UVI_Movil:   { seats: 4, wheelchairSlots: 0, stretcher: true,  chairs: 0, oxygenUnits: 3, monitor: true, defibrillator: true },
  A1:          { seats: 2, wheelchairSlots: 1, stretcher: false, chairs: 1, oxygenUnits: 0 },
  Programado:  { seats: 8, wheelchairSlots: 2, stretcher: false, chairs: 0, oxygenUnits: 0 },
  Otros:       { seats: 2, wheelchairSlots: 0, stretcher: false, chairs: 0, oxygenUnits: 0 },
};


export interface Ambulance {
  id: string;
  name: string;
  licensePlate: string;
  model: string;
  type: AmbulanceType;
  baseLocation: string;
  zone?: string;
  status: AmbulanceStatus;

  // Campos de capacidad que coinciden con el formulario
  hasMedicalBed: boolean;
  stretcherSeats: number; // Plazas si hasMedicalBed es true
  hasWheelchair: boolean;
  wheelchairSeats: number; // Plazas si hasWheelchair es true
  allowsWalking: boolean;
  walkingSeats: number; // Plazas si allowsWalking es true

  specialEquipment: string[]; // Array de IDs de equipmentOptions

  latitude?: number;
  longitude?: number;
  currentPatients?: number;
  notes?: string;
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

export type TipoServicioProgramado = 'consulta' | 'alta' | 'ingreso' | 'trasladoEntreCentros';
export const ALL_TIPOS_SERVICIO_PROGRAMADO: TipoServicioProgramado[] = ['consulta', 'alta', 'ingreso', 'trasladoEntreCentros'];

export type TipoTrasladoProgramado = 'soloIda' | 'idaYVuelta';
export const ALL_TIPOS_TRASLADO_PROGRAMADO: TipoTrasladoProgramado[] = ['soloIda', 'idaYVuelta'];

export type MedioRequeridoProgramado = 'camilla' | 'sillaDeRuedas' | 'andando';
export const ALL_MEDIOS_REQUERIDOS_PROGRAMADO: MedioRequeridoProgramado[] = ['camilla', 'sillaDeRuedas', 'andando'];

export const EQUIPAMIENTO_ESPECIAL_PROGRAMADO_OPTIONS = [
  { id: 'oxigeno', label: 'Oxígeno' },
  { id: 'sillaOruga', label: 'Silla oruga para escaleras' },
  { id: 'monitorConstantes', label: 'Monitor de constantes' },
  { id: 'desfibrilador', label: 'Desfibrilador' },
];
export type EquipamientoEspecialProgramadoId = typeof EQUIPAMIENTO_ESPECIAL_PROGRAMADO_OPTIONS[number]['id'];


export interface ProgrammedTransportRequest {
  id: string;
  requesterId: string; 
  status: RequestStatus;
  createdAt: string; 
  updatedAt: string; 
  
  nombrePaciente: string;
  dniNieSsPaciente: string;
  servicioPersonaResponsable?: string;
  tipoServicio: TipoServicioProgramado;
  tipoTraslado: TipoTrasladoProgramado;
  centroOrigen: string;
  destino: string;
  fechaIda: string; 
  horaIda: string; 
  medioRequerido: MedioRequeridoProgramado;
  equipamientoEspecialRequerido?: EquipamientoEspecialProgramadoId[];
  barrerasArquitectonicas?: string;
  necesidadesEspeciales?: string;
  observacionesMedicasAdicionales?: string;
  autorizacionMedicaPdf?: string; 
  assignedAmbulanceId?: string;
  priority: 'low' | 'medium'; 
}

// Basic type for advanced multi-step transport request data
export interface AdvancedTransportData {
  // Step 1: Patient Info
  patientName?: string;
  patientId?: string;
  serviceType?: string; // Example, will be more detailed
  // Step 2: Scheduling
  recurrence?: string; // daily, weekly, specificDates
  dates?: Date[];
  // Step 3: Locations
  originAddress?: string;
  destinationAddress?: string;
  // Step 4: Configuration
  transportType?: AmbulanceType; // e.g., 'A1', 'Programado'
  additionalOptions?: string[];
  // Step 5: Confirmation (no data, just action)
  
  // Add more fields as each step is defined
  [key: string]: any; // Allow other fields for now
}

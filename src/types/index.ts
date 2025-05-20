
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
  // añadir más según necesidades (botiquín, etc.)
}

// Mapeo por tipo de ambulancia:
export const defaultEquipmentByType: Record<AmbulanceType, AmbulanceEquipment> = {
  SVB:         { seats: 3, wheelchairSlots: 0, stretcher: true,  chairs: 1, oxygenUnits: 1, monitor: true }, // 1 conductor + 1 tecnico + 1 paciente
  SVA:         { seats: 3, wheelchairSlots: 0, stretcher: true,  chairs: 1, oxygenUnits: 2, monitor: true, defibrillator: true }, // 1 conductor + 1 medico/enfermero + 1 paciente
  Convencional:{ seats: 2, wheelchairSlots: 1, stretcher: false, chairs: 0, oxygenUnits: 0 }, // 1 conductor + 1 paciente / acompañante
  UVI_Movil:   { seats: 4, wheelchairSlots: 0, stretcher: true,  chairs: 0, oxygenUnits: 3, monitor: true, defibrillator: true }, // 1 conductor + 1 medico + 1 enfermero + 1 paciente
  A1:          { seats: 2, wheelchairSlots: 1, stretcher: false, chairs: 1, oxygenUnits: 0 }, // 1 conductor + 1 paciente
  Programado:  { seats: 8, wheelchairSlots: 2, stretcher: false, chairs: 0, oxygenUnits: 0 }, // 1 conductor + hasta 7 pacientes
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

  // Unified equipment object
  equipment: AmbulanceEquipment;
  
  // Specific additional equipment not covered by the general type definition
  specialEquipment: string[]; // Array of IDs from equipmentOptions (e.g., ["stair-chair", "bariatric-stretcher"])

  latitude?: number; 
  longitude?: number; 
  currentPatients?: number; 

  notes?: string; 
}


export type RequestStatus = 'pending' | 'dispatched' | 'on-scene' | 'transporting' | 'completed' | 'cancelled';

// For simple/urgent requests
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

// For detailed programmed transport requests
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
  requesterId: string; // User ID of the person making the request
  status: RequestStatus;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
  
  nombrePaciente: string;
  dniNieSsPaciente: string;
  servicioPersonaResponsable?: string;
  tipoServicio: TipoServicioProgramado;
  tipoTraslado: TipoTrasladoProgramado;
  centroOrigen: string;
  destino: string;
  fechaIda: string; // ISO string for date part
  horaIda: string; // HH:mm
  medioRequerido: MedioRequeridoProgramado;
  equipamientoEspecialRequerido?: EquipamientoEspecialProgramadoId[];
  barrerasArquitectonicas?: string;
  necesidadesEspeciales?: string;
  observacionesMedicasAdicionales?: string;
  autorizacionMedicaPdf?: string; // Placeholder for file path/URL or name
  assignedAmbulanceId?: string;
  priority: 'low' | 'medium'; // Programmed usually not high
}

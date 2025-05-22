
import { z } from 'zod';

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
  seats: number;
  wheelchairSlots: number;
  stretcher: boolean;
  chairs: number;
  oxygenUnits: number;
  defibrillator?: boolean;
  monitor?: boolean;
}

export const defaultEquipmentByType: Record<AmbulanceType, AmbulanceEquipment> = {
  SVB:         { seats: 3, wheelchairSlots: 0, stretcher: true,  chairs: 1, oxygenUnits: 1, monitor: true, defibrillator: true }, // SVB can have DEA
  SVA:         { seats: 3, wheelchairSlots: 0, stretcher: true,  chairs: 1, oxygenUnits: 2, monitor: true, defibrillator: true },
  Convencional:{ seats: 2, wheelchairSlots: 1, stretcher: false, chairs: 0, oxygenUnits: 0 },
  UVI_Movil:   { seats: 4, wheelchairSlots: 0, stretcher: true,  chairs: 0, oxygenUnits: 3, monitor: true, defibrillator: true },
  A1:          { seats: 2, wheelchairSlots: 1, stretcher: false, chairs: 1, oxygenUnits: 0 }, // Typically for individual non-urgent
  Programado:  { seats: 8, wheelchairSlots: 2, stretcher: false, chairs: 0, oxygenUnits: 0 }, // Colectivo
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

  specialEquipment: string[]; // Array de IDs de equipmentOptions (src/components/ambulance/constants.ts)
  // equipment: AmbulanceEquipment; // This was the previous structured equipment based on type. Now using flat fields + specialEquipment.

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

// Zod Schemas for AdvancedTransportData Steps

export const AdvancedTransportPatientInfoSchema = z.object({
  patientName: z.string().min(3, "El nombre del paciente debe tener al menos 3 caracteres."),
  patientId: z.string().min(5, "El identificador del paciente es obligatorio (DNI, SS, etc.)."),
  serviceType: z.string().min(3, "El tipo de servicio o motivo es obligatorio."),
  patientContact: z.string().regex(/^(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{3,4}$/, "Número de teléfono inválido.").optional().or(z.literal('')),
  patientObservations: z.string().optional(),
});

export const AdvancedTransportSchedulingSchema = z.object({
  recurrenceType: z.enum(['specificDates', 'daily', 'weekly', 'monthly'], { required_error: "El tipo de recurrencia es obligatorio."}),
  startDate: z.string().refine(val => val && !isNaN(Date.parse(val)), { message: "La fecha de inicio es obligatoria y debe ser válida."}),
  specificDatesNotes: z.string().optional(), // Could be more specific if recurrenceType is 'specificDates'
  pickupTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Formato de hora de recogida inválido (HH:MM)." }),
  returnTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Formato de hora de retorno inválido (HH:MM)." }).optional().or(z.literal('')),
  durationEstimate: z.string().optional(),
});

export const AdvancedTransportLocationsSchema = z.object({
  originAddress: z.string().min(10, "La dirección de origen debe tener al menos 10 caracteres."),
  originDetails: z.string().optional(),
  destinationAddress: z.string().min(10, "La dirección de destino debe tener al menos 10 caracteres."),
  destinationDetails: z.string().optional(),
});

export const AdvancedTransportConfigurationSchema = z.object({
  transportType: z.enum(ALL_AMBULANCE_TYPES, { required_error: "El tipo de ambulancia es obligatorio."}).or(z.literal("Otros")),
  transportTypeOther: z.string().optional(),
  mobilityNeeds: z.enum(ALL_MEDIOS_REQUERIDOS_PROGRAMADO, { required_error: "Las necesidades de movilidad son obligatorias."}),
  advancedEquipment: z.array(z.string()).optional(),
  additionalNotes: z.string().optional(),
}).refine(data => {
    if (data.transportType === 'Otros') {
        return data.transportTypeOther && data.transportTypeOther.trim().length >= 3;
    }
    return true;
}, {
    message: "Debe especificar el tipo de ambulancia (mín. 3 caracteres) si selecciona 'Otros'.",
    path: ["transportTypeOther"], // field that will receive the error
});


// Type for advanced multi-step transport request data
export interface AdvancedTransportData {
  // Step 1: Patient Info
  patientName?: string;
  patientId?: string;
  serviceType?: string;
  patientContact?: string;
  patientObservations?: string;

  // Step 2: Scheduling
  recurrenceType?: 'specificDates' | 'daily' | 'weekly' | 'monthly';
  startDate?: string; // YYYY-MM-DD
  specificDatesNotes?: string; // For listing specific dates or complex patterns
  pickupTime?: string; // HH:MM
  returnTime?: string; // HH:MM
  durationEstimate?: string;


  // Step 3: Locations
  originAddress?: string;
  originDetails?: string;
  destinationAddress?: string;
  destinationDetails?: string;

  // Step 4: Configuration
  transportType?: AmbulanceType | 'Otros';
  transportTypeOther?: string; // If transportType is 'Otros'
  mobilityNeeds?: MedioRequeridoProgramado;
  advancedEquipment?: string[]; // IDs from ADVANCED_EQUIPMENT_OPTIONS
  additionalNotes?: string;

  [key: string]: any; // Allow other fields for now
}

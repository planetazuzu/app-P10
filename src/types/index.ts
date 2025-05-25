
import { z } from 'zod';

export type UserRole = 'admin' | 'hospital' | 'individual' | 'centroCoordinador' | 'equipoMovil';
export const ALL_USER_ROLES: UserRole[] = ['admin', 'hospital', 'individual', 'centroCoordinador', 'equipoMovil'];

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password?: string;
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

// Default equipment configuration based on ambulance type
export const defaultEquipmentByType: Record<AmbulanceType, AmbulanceEquipment> = {
  SVB:         { seats: 3, wheelchairSlots: 0, stretcher: true,  chairs: 1, oxygenUnits: 1, defibrillator: true, monitor: true },
  SVA:         { seats: 3, wheelchairSlots: 0, stretcher: true,  chairs: 1, oxygenUnits: 2, defibrillator: true, monitor: true },
  Convencional:{ seats: 2, wheelchairSlots: 1, stretcher: false, chairs: 0, oxygenUnits: 0 },
  UVI_Movil:   { seats: 4, wheelchairSlots: 0, stretcher: true,  chairs: 0, oxygenUnits: 3, defibrillator: true, monitor: true },
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

  hasMedicalBed: boolean;
  stretcherSeats: number;
  hasWheelchair: boolean;
  wheelchairSeats: number;
  allowsWalking: boolean;
  walkingSeats: number;

  specialEquipment: string[];
  // equipment?: AmbulanceEquipment; // Este campo se podría calcular o resolver al obtener la ambulancia

  latitude?: number;
  longitude?: number;
  currentPatients?: number;
  notes?: string;
  equipoMovilUserId?: string;
}


export type RequestStatus = 'pending' | 'dispatched' | 'on-scene' | 'transporting' | 'completed' | 'cancelled' | 'batched';

export interface AmbulanceRequest {
  id: string;
  requesterId: string;
  patientDetails: string;
  location: { latitude: number; longitude: number; address: string };
  status: RequestStatus;
  assignedAmbulanceId?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  priority: 'high' | 'medium' | 'low';
}

export type TipoServicioProgramado = 'consulta' | 'alta' | 'ingreso' | 'trasladoEntreCentros' | 'tratamientoContinuado' | 'rehabilitacion';
export const ALL_TIPOS_SERVICIO_PROGRAMADO: TipoServicioProgramado[] = ['consulta', 'alta', 'ingreso', 'trasladoEntreCentros', 'tratamientoContinuado', 'rehabilitacion'];

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
  patientId?: string; // Could be used if there's a separate patient management system
  servicioPersonaResponsable?: string; // Doctor, nurse, etc.
  tipoServicio: TipoServicioProgramado;
  tipoTraslado: TipoTrasladoProgramado;
  centroOrigen: string; // Name of the origin center/hospital or "Domicilio"
  origenDireccion?: string; // Full address if Domicilio or specific
  destino: string; // Name of the destination center/hospital
  destinoId?: string; // Optional ID for the destination if it's a known entity
  destinoDireccion?: string; // Full address of destination if specific
  fechaIda: string; // YYYY-MM-DD
  fechaServicio?: string; // Legacy or alternative, prefer fechaIda
  horaIda: string; // HH:MM, pickup time from origin
  horaConsultaMedica?: string; // HH:MM, appointment time at destination
  // fechaVuelta and horaVuelta could be added if tipoTraslado is 'idaYVuelta' and needs separate scheduling
  medioRequerido: MedioRequeridoProgramado;
  equipamientoEspecialRequerido?: EquipamientoEspecialProgramadoId[];
  barrerasArquitectonicas?: string; // Architectural barriers
  necesidadesEspeciales?: string; // Special needs of the patient
  observacionesMedicasAdicionales?: string;
  autorizacionMedicaPdf?: string; // Path or ID to the PDF file
  assignedAmbulanceId?: string;
  priority: 'low' | 'medium'; // Programmed are typically low or medium
  loteId?: string; // ID of the LoteProgramado it belongs to
}

// Zod Schemas for AdvancedTransportData Steps

export const AdvancedTransportPatientInfoSchema = z.object({
  patientName: z.string().min(3, "El nombre del paciente debe tener al menos 3 caracteres."),
  patientId: z.string().min(5, "El identificador del paciente es obligatorio (DNI, SS, etc.)."),
  serviceType: z.string().min(3, "El tipo de servicio o motivo es obligatorio."),
  patientContact: z.string().regex(/^(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{3,4}$/, "Número de teléfono inválido.").optional().or(z.literal('')),
  patientObservations: z.string().max(500, "Máximo 500 caracteres.").optional(),
});

export const AdvancedTransportSchedulingSchema = z.object({
  recurrenceType: z.enum(['specificDates', 'daily', 'weekly', 'monthly'], { required_error: "El tipo de recurrencia es obligatorio."}),
  startDate: z.string().refine(val => val && !isNaN(Date.parse(val)), { message: "La fecha de inicio es obligatoria y debe ser válida."}),
  specificDatesNotes: z.string().max(500, "Máximo 500 caracteres.").optional(),
  pickupTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Formato de hora de recogida inválido (HH:MM)." }),
  returnTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Formato de hora de retorno inválido (HH:MM)." }).optional().or(z.literal('')),
  durationEstimate: z.string().max(100, "Máximo 100 caracteres.").optional(),
});

export const AdvancedTransportLocationsSchema = z.object({
  originAddress: z.string().min(10, "La dirección de origen debe tener al menos 10 caracteres.").max(200, "Máximo 200 caracteres."),
  originDetails: z.string().max(300, "Máximo 300 caracteres.").optional(),
  destinationAddress: z.string().min(10, "La dirección de destino debe tener al menos 10 caracteres.").max(200, "Máximo 200 caracteres."),
  destinationDetails: z.string().max(300, "Máximo 300 caracteres.").optional(),
});

export const AdvancedTransportConfigurationSchema = z.object({
  transportType: z.enum(ALL_AMBULANCE_TYPES, { required_error: "El tipo de ambulancia es obligatorio."}).or(z.literal("Otros")),
  transportTypeOther: z.string().max(100, "Máximo 100 caracteres.").optional(),
  mobilityNeeds: z.enum(ALL_MEDIOS_REQUERIDOS_PROGRAMADO, { required_error: "Las necesidades de movilidad son obligatorias."}),
  advancedEquipment: z.array(z.string()).optional(),
  additionalNotes: z.string().max(500, "Máximo 500 caracteres.").optional(),
}).refine(data => {
    if (data.transportType === 'Otros') {
        return data.transportTypeOther && data.transportTypeOther.trim().length >= 3;
    }
    return true;
}, {
    message: "Debe especificar el tipo de ambulancia (mín. 3 caracteres) si selecciona 'Otros'.",
    path: ["transportTypeOther"],
});


export interface AdvancedTransportData {
  // Step 1
  patientName?: string;
  patientId?: string;
  serviceType?: string;
  patientContact?: string;
  patientObservations?: string;
  // Step 2
  recurrenceType?: 'specificDates' | 'daily' | 'weekly' | 'monthly';
  startDate?: string; // YYYY-MM-DD from date input
  specificDatesNotes?: string; // For complex patterns or list of dates
  pickupTime?: string; // HH:MM
  returnTime?: string; // HH:MM, optional
  durationEstimate?: string; // e.g., "2 hours", "45 minutes"
  // Step 3
  originAddress?: string;
  originDetails?: string;
  destinationAddress?: string;
  destinationDetails?: string;
  // Step 4
  transportType?: AmbulanceType | 'Otros';
  transportTypeOther?: string;
  mobilityNeeds?: MedioRequeridoProgramado;
  advancedEquipment?: string[]; // Array of equipment IDs
  additionalNotes?: string;
  [key: string]: any; // To allow other properties if needed temporarily
}


// Tipos para la funcionalidad de "lotes" del Equipo Móvil
export interface PacienteLote {
  id: string;
  nombre: string;
  direccionOrigen: string;
  contacto?: string;
  observaciones?: string;
  medioRequerido: MedioRequeridoProgramado;
}

export interface DestinoLote {
  id: string;
  nombre: string;
  direccion: string;
  detalles?: string;
}

export type ParadaEstado = 'pendiente' | 'enRutaRecogida' | 'pacienteRecogido' | 'enDestino' | 'finalizado' | 'cancelado' | 'noPresentado';

export interface ParadaRuta {
  servicioId: string; // Corresponds to ProgrammedTransportRequest.id
  paciente: PacienteLote; // Denormalized patient info for the route
  horaConsultaMedica: string; // Appointment time
  horaRecogidaEstimada: string;
  horaLlegadaDestinoEstimada: string;
  tiempoTrasladoDesdeAnteriorMin: number;
  orden: number;
  estado: ParadaEstado;
  horaRealLlegadaRecogida?: string;
  horaRealSalidaRecogida?: string;
  horaRealLlegadaDestino?: string;
  notasParada?: string; // Specific notes for this stop during execution
}

export interface RutaCalculada {
  id: string;
  loteId: string;
  paradas: ParadaRuta[];
  horaSalidaBaseEstimada: string;
  duracionTotalEstimadaMin: number;
  distanciaTotalEstimadaKm?: number;
  optimizadaEn?: string; // ISO Date string
}

export interface LoteProgramado {
  id: string;
  fechaServicio: string; // YYYY-MM-DD
  destinoPrincipal: DestinoLote; // Main destination this batch is for
  serviciosIds: string[]; // Array of ProgrammedTransportRequest IDs
  estadoLote: 'pendienteCalculo' | 'calculado' | 'asignado' | 'enCurso' | 'completado' | 'modificado' | 'cancelado';
  equipoMovilUserIdAsignado?: string; // User ID of the 'equipoMovil'
  ambulanciaIdAsignada?: string; // Ambulance ID
  rutaCalculadaId?: string; // ID of the associated RutaCalculada
  notasLote?: string;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
}

export const LoteCreateFormSchema = z.object({
  fechaServicio: z.date({ 
    required_error: "La fecha del servicio es obligatoria.",
    invalid_type_error: "Fecha inválida.",
  }),
  destinoPrincipalNombre: z.string().min(3, "El nombre del destino principal es obligatorio (mín. 3 caracteres)."),
  destinoPrincipalDireccion: z.string().min(5, "La dirección del destino principal es obligatoria (mín. 5 caracteres)."),
  notasLote: z.string().max(500, "Las notas no pueden exceder los 500 caracteres.").optional(),
});
export type LoteCreateFormValues = z.infer<typeof LoteCreateFormSchema>;


export type MotivoModificacionHorario = 'trafico' | 'pacienteNoLocalizable' | 'retrasoPaciente' | 'incidenciaVehiculo' | 'otro';
export const ALL_MOTIVOS_MODIFICACION_HORARIO: MotivoModificacionHorario[] = ['trafico', 'pacienteNoLocalizable', 'retrasoPaciente', 'incidenciaVehiculo', 'otro'];

export interface SolicitudModificacionHorario {
  id: string;
  loteId: string;
  servicioIdAfectado: string; // ParadaRuta.servicioId
  equipoMovilIdSolicitante: string; // User.id of 'equipoMovil'
  fechaSolicitud: string; // ISO Date string
  minutosRetrasoEstimado: number;
  motivo: MotivoModificacionHorario;
  descripcionMotivo?: string;
  estadoSolicitud: 'pendiente' | 'aprobada' | 'rechazada';
  fechaResolucion?: string; // ISO Date string
  notasResolucion?: string;
}

// Zod schema for user creation
export const UserCreateFormSchema = z.object({
  name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  email: z.string().email({ message: "Correo electrónico inválido." }),
  role: z.enum(ALL_USER_ROLES, { required_error: "El rol es obligatorio." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
  confirmPassword: z.string().min(6, { message: "La confirmación de contraseña debe tener al menos 6 caracteres." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});
export type UserCreateFormValues = z.infer<typeof UserCreateFormSchema>;


// Zod schema for user editing
export const UserEditFormSchema = z.object({
  name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  email: z.string().email({ message: "Correo electrónico inválido." }), 
  role: z.enum(ALL_USER_ROLES, { required_error: "El rol es obligatorio." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }).optional().or(z.literal('')),
  confirmPassword: z.string().min(6, { message: "La confirmación de contraseña debe tener al menos 6 caracteres." }).optional().or(z.literal('')),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});
export type UserEditFormValues = z.infer<typeof UserEditFormSchema>;

// Combined type for form values if needed, or use discriminated union
export type UserFormValues = UserCreateFormValues | UserEditFormValues;

// Default equipment is no longer string[], it's a structured object. This type might be unused or refactored.
// export type SpecialEquipmentId = typeof equipmentOptions[number]['id'];

// Keep equipmentOptions for ambulance form (special checkboxes)
// These IDs should align with what might be stored in Ambulance.specialEquipment (array of strings)
export const equipmentOptions = [
  { id: "stair-chair", label: "Silla oruga" },
  { id: "bariatric-stretcher", label: "Camilla bariátrica" },
  { id: "bariatric-equipment", label: "Equipamiento para pacientes bariátricos" },
  { id: "vital-signs-monitor", label: "Monitorización de constantes vitales" },
  { id: "oxygen-supply", label: "Suministro de Oxígeno" },
  { id: "defibrillator", label: "Desfibrilador" },
  { id: "ventilator", label: "Ventilador mecánico" },
  { id: "incubator", label: "Incubadora neonatal" },
  { id: "gps-navigation", label: "Navegación GPS avanzada" },
];

// System Configuration Types
export interface SystemConfig {
  id?: string; // NocoDB might assign an ID if it's a record
  organizationName: string;
  defaultTimezone: string;
  emailNotificationsEnabled: boolean;
  requestHistoryDays: number;
}

export const SystemConfigSchema = z.object({
  organizationName: z.string().min(3, "El nombre de la organización es obligatorio (mín. 3 caracteres)."),
  defaultTimezone: z.string().min(1, "La zona horaria es obligatoria."),
  emailNotificationsEnabled: z.boolean(),
  requestHistoryDays: z.number().int().min(0, "Los días deben ser un número positivo.").max(3650, "Máximo 10 años (3650 días)."),
});

export type SystemConfigFormValues = z.infer<typeof SystemConfigSchema>;

// Schema for the modal to manage services in a lot
export const ManageLotServicesSchema = z.object({
    servicesToAssign: z.array(z.string()).optional(), // IDs of ProgrammedTransportRequest to add
    servicesToRemove: z.array(z.string()).optional(), // IDs of ProgrammedTransportRequest to remove
});
export type ManageLotServicesFormValues = z.infer<typeof ManageLotServicesSchema>;

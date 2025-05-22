
import { z } from 'zod';

export type UserRole = 'admin' | 'hospital' | 'individual' | 'equipoTraslado' | 'equipoMovil';

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
  SVB:         { seats: 3, wheelchairSlots: 0, stretcher: true,  chairs: 1, oxygenUnits: 1, defibrillator: true, monitor: true },
  SVA:         { seats: 3, wheelchairSlots: 0, stretcher: true,  chairs: 1, oxygenUnits: 2, defibrillator: true, monitor: true },
  Convencional:{ seats: 2, wheelchairSlots: 1, stretcher: false, chairs: 0, oxygenUnits: 0 },
  UVI_Movil:   { seats: 4, wheelchairSlots: 0, stretcher: true,  chairs: 0, oxygenUnits: 3, defibrillator: true, monitor: true },
  A1:          { seats: 2, wheelchairSlots: 1, stretcher: false, chairs: 1, oxygenUnits: 0 },
  Programado:  { seats: 8, wheelchairSlots: 2, stretcher: false, chairs: 0, oxygenUnits: 0 },
  Otros:       { seats: 2, wheelchairSlots: 0, stretcher: false, chairs: 0, oxygenUnits: 0 },
};


export interface Ambulance {
  id: string; // Should correspond to a vehicle ID that an 'equipoMovil' user might be associated with
  name: string;
  licensePlate: string;
  model: string;
  type: AmbulanceType;
  baseLocation: string;
  zone?: string;
  status: AmbulanceStatus;
  equipment: AmbulanceEquipment; // Using the structured equipment

  // Campos de capacidad que coinciden con el formulario (podrían derivarse de 'equipment' o ser específicos)
  hasMedicalBed: boolean;
  stretcherSeats: number;
  hasWheelchair: boolean;
  wheelchairSeats: number;
  allowsWalking: boolean;
  walkingSeats: number;

  specialEquipment: string[]; // IDs de equipmentOptions (complementario a 'equipment' o para detalles adicionales)

  latitude?: number;
  longitude?: number;
  currentPatients?: number;
  notes?: string;
  equipoMovilUserId?: string; // Links this ambulance to an 'equipoMovil' user account
}


export type RequestStatus = 'pending' | 'dispatched' | 'on-scene' | 'transporting' | 'completed' | 'cancelled' | 'batched';

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
  status: RequestStatus; // Can use the same status as AmbulanceRequest or have its own
  createdAt: string;
  updatedAt: string;

  nombrePaciente: string;
  dniNieSsPaciente: string;
  patientId?: string;
  servicioPersonaResponsable?: string;
  tipoServicio: TipoServicioProgramado;
  tipoTraslado: TipoTrasladoProgramado;
  centroOrigen: string;
  origenDireccion?: string;
  destino: string;
  destinoId?: string;
  fechaIda: string; // YYYY-MM-DD
  fechaServicio?: string;
  horaIda: string;
  horaConsultaMedica?: string;
  medioRequerido: MedioRequeridoProgramado;
  equipamientoEspecialRequerido?: EquipamientoEspecialProgramadoId[];
  barrerasArquitectonicas?: string;
  necesidadesEspeciales?: string;
  observacionesMedicasAdicionales?: string;
  autorizacionMedicaPdf?: string;
  assignedAmbulanceId?: string; // ID de la ambulancia asignada (vehículo)
  priority: 'low' | 'medium'; // Programmed usually low, but can be medium
  loteId?: string; // Link to LoteProgramado
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
  specificDatesNotes: z.string().optional(),
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
    path: ["transportTypeOther"],
});


export interface AdvancedTransportData {
  patientName?: string;
  patientId?: string;
  serviceType?: string;
  patientContact?: string;
  patientObservations?: string;
  recurrenceType?: 'specificDates' | 'daily' | 'weekly' | 'monthly';
  startDate?: string;
  specificDatesNotes?: string;
  pickupTime?: string;
  returnTime?: string;
  durationEstimate?: string;
  originAddress?: string;
  originDetails?: string;
  destinationAddress?: string;
  destinationDetails?: string;
  transportType?: AmbulanceType | 'Otros';
  transportTypeOther?: string;
  mobilityNeeds?: MedioRequeridoProgramado;
  advancedEquipment?: string[];
  additionalNotes?: string;
  [key: string]: any;
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
  nombre: string; // Ej: "Hospital San Pedro - Consultas Externas"
  direccion: string;
  detalles?: string; // Ej: "Planta 2, Consulta de Traumatología"
}

export type ParadaEstado = 'pendiente' | 'enRutaRecogida' | 'pacienteRecogido' | 'enDestino' | 'finalizado' | 'cancelado' | 'noPresentado';

export interface ParadaRuta {
  servicioId: string; // ID de ProgrammedTransportRequest original
  paciente: PacienteLote;
  horaConsultaMedica: string; // HH:MM (Hora de la cita)
  horaRecogidaEstimada: string; // HH:MM
  horaLlegadaDestinoEstimada: string; // HH:MM
  tiempoTrasladoDesdeAnteriorMin: number; // en minutos
  orden: number;
  estado: ParadaEstado;
  horaRealLlegadaRecogida?: string;
  horaRealSalidaRecogida?: string;
  horaRealLlegadaDestino?: string;
  notasParada?: string;
}

export interface RutaCalculada {
  id: string;
  loteId: string;
  paradas: ParadaRuta[];
  horaSalidaBaseEstimada: string; // HH:MM
  duracionTotalEstimadaMin: number; // en minutos
  distanciaTotalEstimadaKm?: number; // en km
  optimizadaEn?: string; // ISO Date
}

export interface LoteProgramado {
  id: string; // Identificador único del lote, ej: "lote-20240727-AMB101"
  fechaServicio: string; // YYYY-MM-DD
  destinoPrincipal: DestinoLote; // El destino común o más relevante del lote
  serviciosIds: string[]; // IDs de ProgrammedTransportRequest incluidas
  estadoLote: 'pendienteCalculo' | 'calculado' | 'asignado' | 'enCurso' | 'completado' | 'modificado' | 'cancelado';
  equipoMovilUserIdAsignado?: string; // ID del User con rol 'equipoMovil'
  ambulanciaIdAsignada?: string; // ID de la Ambulance asignada
  rutaCalculadaId?: string; // ID de la RutaCalculada asociada
  notasLote?: string;
  createdAt: string;
  updatedAt: string;
}

// Para el formulario de modificación de horario
export type MotivoModificacionHorario = 'trafico' | 'pacienteNoLocalizable' | 'retrasoPaciente' | 'incidenciaVehiculo' | 'otro';
export const ALL_MOTIVOS_MODIFICACION_HORARIO: MotivoModificacionHorario[] = ['trafico', 'pacienteNoLocalizable', 'retrasoPaciente', 'incidenciaVehiculo', 'otro'];

export interface SolicitudModificacionHorario {
  id: string;
  loteId: string;
  servicioIdAfectado: string;
  equipoMovilIdSolicitante: string;
  fechaSolicitud: string; // ISO Date
  minutosRetrasoEstimado: number;
  motivo: MotivoModificacionHorario;
  descripcionMotivo?: string;
  estadoSolicitud: 'pendiente' | 'aprobada' | 'rechazada';
  fechaResolucion?: string;
  notasResolucion?: string;
}

    
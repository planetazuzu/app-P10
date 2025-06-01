
import type { AmbulanceRequest, RequestStatus, UserRole, ProgrammedTransportRequest, TipoServicioProgramado, TipoTrasladoProgramado, MedioRequeridoProgramado, EquipamientoEspecialProgramadoId, ParadaRuta, LoteProgramado, PacienteLote, DestinoLote, ParadaEstado } from '@/types';
import { MOCK_USERS } from './auth';
import { ALL_TIPOS_SERVICIO_PROGRAMADO, ALL_TIPOS_TRASLADO_PROGRAMADO, ALL_MEDIOS_REQUERIDOS_PROGRAMADO, EQUIPAMIENTO_ESPECIAL_PROGRAMADO_OPTIONS } from '@/types';
// import { mockLotes, mockRutas, mapProgrammedRequestToParada } from './driver-data'; // Removed to break circular dependency


const patientDetailsSamples = [
  "Varón 65 años, dolor torácico, HTA.",
  "Mujer 23 años, posible fractura tobillo postcaída.",
  "Niño, dificultad respiratoria, posible crisis asmática.",
  "Adulto desconocido, hallado inconsciente en vía pública.",
  "Mujer 70 años, síntomas de ictus, desviación comisura bucal, debilidad brazo.",
  "Traslado programado interhospitalario.",
  "Alta hospitalaria, traslado a domicilio.",
  "Paciente para consulta de rehabilitación, movilidad reducida.",
  "Traslado para prueba diagnóstica (TAC), no requiere urgencia.",
  "Paciente para sesión de diálisis, recurrente.",
  "Seguimiento post-operatorio, cita con especialista.",
];

const addresses = [
    "Gran Vía 12, Logroño", "Calle Laurel 5, Logroño", "Av. de la Paz 34, Calahorra",
    "Plaza Mayor 1, Haro", "Paseo del Mercadal 8, Arnedo", "Calle Falsa 123, Logroño",
    "Calle San Millán 22, Nájera", "Av. de Numancia 5, Arnedo", "Paseo de la Constitución 1, Alfaro",
    "Calle Portales 50, Logroño", "Urbanización Las Palmeras 7, Villamediana de Iregua"
];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomCoords(baseLat: number, baseLng: number, range: number) {
  return {
    latitude: baseLat + (Math.random() - 0.5) * range,
    longitude: baseLng + (Math.random() - 0.5) * range,
  };
}

const mockUserValues = Object.values(MOCK_USERS);
const individualUser = mockUserValues.find(u => u.role === 'individual');
const hospitalUser = mockUserValues.find(u => u.role === 'hospital');
const adminUser = mockUserValues.find(u => u.role === 'admin');
const centroCoordinadorUser = mockUserValues.find(u => u.role === 'centroCoordinador');

const otherSpecificUsers = [
  hospitalUser,
  adminUser,
  centroCoordinadorUser
].filter(Boolean);


export let mockRequests: AmbulanceRequest[] = Array.from({ length: 15 }, (_, i) => {
  const baseLocation = { lat: 42.4659, lng: -2.4487 };
  const coords = getRandomCoords(baseLocation.lat, baseLocation.lng, 0.2);
  const createdAt = new Date(Date.now() - Math.floor(Math.random() * 24 * 3 * 60 * 60 * 1000));
  const statusOptions: RequestStatus[] = ['pending', 'dispatched', 'on-scene', 'transporting', 'completed', 'cancelled'];
  const status = getRandomElement<RequestStatus>(statusOptions);
  let assignedAmbulanceId: string | undefined = undefined;

  let assignedRequesterId: string;

  if (individualUser && i < 3) {
    assignedRequesterId = individualUser.id;
  } else if (otherSpecificUsers.length > 0 && i < 3 + otherSpecificUsers.length) {
    assignedRequesterId = otherSpecificUsers[(i - 3) % otherSpecificUsers.length]!.id;
  } else {
    let randomOtherUser = getRandomElement(mockUserValues.filter(u => u.id !== individualUser?.id && otherSpecificUsers.every(su => su!.id !== u.id) ));
    if (!randomOtherUser && otherSpecificUsers.length > 0) {
        randomOtherUser = getRandomElement(otherSpecificUsers)!;
    } else if (!randomOtherUser) {
        randomOtherUser = adminUser || hospitalUser || centroCoordinadorUser || mockUserValues[0];
    }
    assignedRequesterId = randomOtherUser.id;
  }

  return {
    id: `req-${101 + i}-${Math.random().toString(36).substring(2, 7)}`,
    requesterId: assignedRequesterId,
    patientDetails: getRandomElement(patientDetailsSamples),
    location: {
        latitude: coords.latitude,
        longitude: coords.longitude,
        address: getRandomElement(addresses)
    },
    status,
    assignedAmbulanceId,
    createdAt: createdAt.toISOString(),
    updatedAt: new Date(createdAt.getTime() + Math.floor(Math.random() * 60 * 60 * 1000)).toISOString(),
    notes: Math.random() > 0.7 ? `Información adicional para la solicitud ${101+i}. Contactar antes de llegar.` : undefined,
    priority: getRandomElement<'high' | 'medium' | 'low'>(['high', 'medium', 'low']),
  };
});


export function getRequests(userId: string, userRole: UserRole): Promise<AmbulanceRequest[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let userRequestsToReturn: AmbulanceRequest[];

      if (userRole === 'individual') {
        userRequestsToReturn = mockRequests.filter(req => req.requesterId === userId);
      } else if (userRole === 'admin' || userRole === 'hospital' || userRole === 'centroCoordinador') {
        userRequestsToReturn = [...mockRequests];
      } else if (userRole === 'equipoMovil') {
        userRequestsToReturn = [];
      } else {
        console.warn(`Rol de usuario no manejado en getRequests: ${userRole}`);
        userRequestsToReturn = [];
      }
      resolve(userRequestsToReturn.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }, 300);
  });
}

export function getRequestById(id: string): Promise<AmbulanceRequest | undefined> {
   return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockRequests.find(req => req.id === id));
    }, 200);
  });
}

export function createRequest(requestData: Omit<AmbulanceRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<AmbulanceRequest> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newRequest: AmbulanceRequest = {
        ...requestData,
        id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockRequests.unshift(newRequest);
      resolve(newRequest);
    }, 300);
  });
}

export function updateSimpleRequest(
  id: string,
  dataToUpdate: Partial<Omit<AmbulanceRequest, 'id' | 'createdAt' | 'requesterId' | 'assignedAmbulanceId'>>
): Promise<AmbulanceRequest | undefined> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const requestIndex = mockRequests.findIndex(req => req.id === id);
      if (requestIndex > -1) {
        const existingRequest = mockRequests[requestIndex];
        const { status, ...restOfDataToUpdate } = dataToUpdate as any;

        mockRequests[requestIndex] = {
          ...existingRequest,
          ...restOfDataToUpdate,
          location: dataToUpdate.location ? { ...existingRequest.location, ...dataToUpdate.location } : existingRequest.location,
          updatedAt: new Date().toISOString(),
        };
        resolve(mockRequests[requestIndex]);
      } else {
        resolve(undefined);
      }
    }, 300);
  });
}

export function updateRequestStatus(id: string, status: RequestStatus, ambulanceId?: string): Promise<AmbulanceRequest | undefined> {
    return new Promise((resolve) => {
        setTimeout(() => {
            const requestIndex = mockRequests.findIndex(req => req.id === id);
            if (requestIndex > -1) {
                mockRequests[requestIndex].status = status;
                mockRequests[requestIndex].updatedAt = new Date().toISOString();
                if (ambulanceId) {
                    mockRequests[requestIndex].assignedAmbulanceId = ambulanceId;
                } else if (status === 'pending' || status === 'cancelled') {
                    mockRequests[requestIndex].assignedAmbulanceId = undefined;
                }
                resolve(mockRequests[requestIndex]);
            } else {
                resolve(undefined);
            }
        }, 300);
    });
}


// --- Programmed Transport Requests ---

// Moved from driver-data.ts
const mockPacientes: Record<string, PacienteLote> = {
  "pac-001": { id: "pac-001", nombre: "Ana Pérez García", direccionOrigen: "Calle Falsa 123, Logroño", contacto: "600111222", observaciones: "Requiere ayuda para subir escalón.", medioRequerido: "andando" },
  "pac-002": { id: "pac-002", nombre: "Juan Rodríguez López", direccionOrigen: "Avenida de la Paz 50, Calahorra", medioRequerido: "sillaDeRuedas" },
  "pac-003": { id: "pac-003", nombre: "María Sánchez Martín", direccionOrigen: "Plaza del Ayuntamiento 1, Haro", contacto: "600333444", observaciones: "Paciente con movilidad reducida.", medioRequerido: "camilla" },
  "pac-004": { id: "pac-004", nombre: "Carlos Gómez Ruiz", direccionOrigen: "Paseo del Espolón 2, Logroño", medioRequerido: "andando"},
  "pac-005": { id: "pac-005", nombre: "Laura Martínez Soler", direccionOrigen: "Calle San Agustín 22, Logroño", contacto: "600555666", observaciones: "Alérgica a AINES.", medioRequerido: "andando" },
  "pac-006": { id: "pac-006", nombre: "Pedro Jiménez Vega", direccionOrigen: "Avenida de Colón 10, Logroño", observaciones: "Traslado post-operatorio, delicado.", medioRequerido: "camilla" },
  "pac-007": { id: "pac-007", nombre: "Elena Navarro Sanz", direccionOrigen: "Calle del Sol 7, Villamediana de Iregua", contacto: "600777888", medioRequerido: "andando" },
  "pac-008": { id: "pac-008", nombre: "Roberto Sanz Gil", direccionOrigen: "Avenida Madrid 101, Logroño", observaciones: "Entrada por rampa lateral.", medioRequerido: "sillaDeRuedas"},
  "pac-009": { id: "pac-009", nombre: "Isabel Torres Pazos", direccionOrigen: "Camino Viejo 4, Alberite", observaciones: "Paciente encamado, requiere 2 técnicos.", medioRequerido: "camilla" },
  "pac-010": { id: "pac-010", nombre: "David Alonso Marco", direccionOrigen: "Plaza de la Iglesia 1, Lardero", medioRequerido: "andando" },
};

// Moved from driver-data.ts
const mockDestinos: Record<string, DestinoLote> = {
  "dest-hsp": { id: "dest-hsp", nombre: "Hospital San Pedro", direccion: "Calle Piqueras 98, Logroño", detalles: "Consultas Externas" },
  "dest-hcal": { id: "dest-hcal", nombre: "Hospital de Calahorra", direccion: "Carretera de Logroño s/n, Calahorra", detalles: "Rehabilitación" },
  "dest-carpa": {id: "dest-carpa", nombre: "CARPA (Centro de Alta Resolución)", direccion: "Av. de la República Argentina, 55, Logroño", detalles: "Consultas varias"},
};

// Moved from driver-data.ts and adapted
export const mapProgrammedRequestToParada = (req: ProgrammedTransportRequest, orden: number): ParadaRuta => {
  const pacienteInfo = mockPacientes[req.patientId!] || {
    id: req.patientId || req.dniNieSsPaciente,
    nombre: req.nombrePaciente,
    direccionOrigen: req.centroOrigen,
    contacto: undefined,
    observaciones: req.observacionesMedicasAdicionales,
    medioRequerido: req.medioRequerido,
  };

  return {
    servicioId: req.id,
    paciente: pacienteInfo,
    horaConsultaMedica: req.horaConsultaMedica || req.horaIda,
    horaRecogidaEstimada: `${String(parseInt((req.horaConsultaMedica || req.horaIda).split(':')[0]) -1).padStart(2,'0')}:${(req.horaConsultaMedica || req.horaIda).split(':')[1]}`,
    horaLlegadaDestinoEstimada: req.horaConsultaMedica || req.horaIda,
    tiempoTrasladoDesdeAnteriorMin: orden === 1 ? 30 : 15 + Math.floor(Math.random() * 10),
    orden,
    estado: (req.status === 'completed' || req.status === 'cancelled') ? req.status : 'pendiente' as ParadaEstado,
    notasParada: `Destino: ${req.destino}. Necesidades: ${req.necesidadesEspeciales || 'Ninguna'}`
  };
};


export let mockProgrammedTransportRequests: ProgrammedTransportRequest[] = [];

// Initialize mockProgrammedTransportRequests with some data if it's empty
// This logic now fully resides in request-data.ts
(() => {
    if (mockProgrammedTransportRequests.length > 0) return;

    const today = new Date();
    const createDate = (daysOffset: number) => {
        const date = new Date(today);
        date.setDate(today.getDate() + daysOffset);
        return date.toISOString().split('T')[0];
    };

    const programmedRequesters = [
        MOCK_USERS['hospital@gmr.com']?.id || 'user-hospital-fallback',
        individualUser?.id || 'user-individual-fallback',
        MOCK_USERS['coordinador@gmr.com']?.id || 'user-coordinador-fallback',
    ];

    const sampleProgrammedRequestsBase: Omit<ProgrammedTransportRequest, 'id' | 'requesterId' | 'createdAt' | 'updatedAt' | 'status' | 'priority' >[] = [
        { nombrePaciente: 'Elena Navarro (Prog)', dniNieSsPaciente: '12345678A', tipoServicio: 'consulta', tipoTraslado: 'idaYVuelta', centroOrigen: 'Domicilio: Calle Falsa 123, Logroño', destino: 'Hospital San Pedro', fechaIda: createDate(1), horaIda: '10:00', horaConsultaMedica: '10:30', medioRequerido: 'sillaDeRuedas' },
        { nombrePaciente: 'Roberto Sanz (Prog)', dniNieSsPaciente: '87654321B', tipoServicio: 'rehabilitacion', tipoTraslado: 'soloIda', centroOrigen: 'Centro de Día Sol', destino: 'Domicilio: Avenida de la Paz 50, Calahorra', fechaIda: createDate(1), horaIda: '14:00', medioRequerido: 'andando', observacionesMedicasAdicionales: 'Necesita ayuda para bajar escalón.' },
        { nombrePaciente: 'Carlos Gómez Ruiz (Prog)', dniNieSsPaciente: '55667788D', tipoServicio: 'tratamientoContinuado', tipoTraslado: 'idaYVuelta', centroOrigen: 'Hospital de Calahorra', destino: 'Hospital San Pedro - Oncología', fechaIda: createDate(2), horaIda: '11:00', horaConsultaMedica: '11:45', medioRequerido: 'sillaDeRuedas', equipamientoEspecialRequerido: ['oxigeno']},
        { nombrePaciente: 'Laura Martínez Soler (Prog)', dniNieSsPaciente: '99001122E', tipoServicio: 'alta', tipoTraslado: 'soloIda', centroOrigen: 'Hospital San Pedro - Planta 3', destino: 'Residencia Los Tulipanes', fechaIda: createDate(3), horaIda: '13:00', medioRequerido: 'andando', observacionesMedicasAdicionales: 'Entregar informe de alta.'},
    ];

    mockProgrammedTransportRequests = sampleProgrammedRequestsBase.map((reqBase, index) => ({
        ...reqBase,
        id: `prog-req-${String(index + 1).padStart(3, '0')}`,
        requesterId: programmedRequesters[index % programmedRequesters.length],
        status: 'pending',
        priority: 'low',
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 72 * 60 * 60 * 1000)).toISOString(),
        updatedAt: new Date().toISOString(),
    }));

    // Specifically create/assign services for 'lote-demo-123'
    const pacienteIdsForLoteDemo = Object.keys(mockPacientes).slice(0, 6); // Take first 6 mock patients
    pacienteIdsForLoteDemo.forEach((pId, index) => {
        const serviceForLote: ProgrammedTransportRequest = {
            id: `prog-req-lote-demo-123-${pId.split('-')[1]}`,
            requesterId: MOCK_USERS['coordinador@gmr.com']?.id || 'user-coordinador-fallback',
            status: 'batched',
            loteId: "lote-demo-123", // Assign to this specific lot
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 72 * 60 * 60 * 1000)).toISOString(),
            updatedAt: new Date().toISOString(),
            nombrePaciente: mockPacientes[pId].nombre,
            dniNieSsPaciente: `Y0${1234560+index}${String.fromCharCode(65+index)}`, // Example DNI
            patientId: pId,
            tipoServicio: 'consulta',
            tipoTraslado: 'idaYVuelta',
            centroOrigen: mockPacientes[pId].direccionOrigen,
            destino: mockDestinos[index % 2 === 0 ? "dest-hsp" : "dest-carpa"].nombre,
            destinoId: mockDestinos[index % 2 === 0 ? "dest-hsp" : "dest-carpa"].id,
            fechaIda: today.toISOString().split('T')[0],
            horaIda: `${String(9 + Math.floor(index / 2)).padStart(2,'0')}:${String((index % 2) * 30).padStart(2,'0')}`,
            horaConsultaMedica: `${String(9 + Math.floor(index / 2)).padStart(2,'0')}:${String((index % 2) * 30).padStart(2,'0')}`,
            medioRequerido: mockPacientes[pId].medioRequerido,
            priority: 'low',
            observacionesMedicasAdicionales: mockPacientes[pId].observaciones,
        };
        // Add if not already present (e.g. if mockProgrammedTransportRequests was already populated by other means)
        if (!mockProgrammedTransportRequests.find(r => r.id === serviceForLote.id)) {
            mockProgrammedTransportRequests.push(serviceForLote);
        }
    });
})();


export function createProgrammedTransportRequest(
  requestDataWithRequester: Omit<ProgrammedTransportRequest, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ProgrammedTransportRequest> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newProgrammedRequest: ProgrammedTransportRequest = {
        ...requestDataWithRequester,
        id: `prog-req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockProgrammedTransportRequests.unshift(newProgrammedRequest);
      resolve(newProgrammedRequest);
    }, 300);
  });
}

export function getProgrammedTransportRequests(userId: string, userRole: UserRole): Promise<ProgrammedTransportRequest[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let userRequests: ProgrammedTransportRequest[];
      if (userRole === 'individual') {
        userRequests = mockProgrammedTransportRequests.filter(req => req.requesterId === userId);
      } else if (userRole === 'admin' || userRole === 'hospital' || userRole === 'centroCoordinador') {
        userRequests = [...mockProgrammedTransportRequests];
      } else {
        userRequests = [];
      }
      resolve(userRequests.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }, 300);
  });
}

export function getProgrammedRequestById(id: string): Promise<ProgrammedTransportRequest | undefined> {
   return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockProgrammedTransportRequests.find(req => req.id === id));
    }, 200);
  });
}

export function updateProgrammedRequest(
  id: string,
  dataToUpdate: Partial<Omit<ProgrammedTransportRequest, 'id' | 'createdAt' | 'requesterId'>>
): Promise<ProgrammedTransportRequest | undefined> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const requestIndex = mockProgrammedTransportRequests.findIndex(req => req.id === id);
      if (requestIndex > -1) {
        mockProgrammedTransportRequests[requestIndex] = {
          ...mockProgrammedTransportRequests[requestIndex],
          ...dataToUpdate,
          updatedAt: new Date().toISOString(),
        };
        resolve(mockProgrammedTransportRequests[requestIndex]);
      } else {
        resolve(undefined);
      }
    }, 300);
  });
}

export function getProgrammedTransportRequestsForPlanning(): Promise<ProgrammedTransportRequest[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const plannableRequests = mockProgrammedTransportRequests.filter(
        req => (!req.loteId && req.status === 'pending') || req.status === 'cancelled'
      );
      resolve(plannableRequests.sort((a,b) => new Date(a.fechaIda + 'T' + (a.horaConsultaMedica || a.horaIda)).getTime() - new Date(b.fechaIda + 'T' + (b.horaConsultaMedica || b.horaIda)).getTime()));
    }, 300);
  });
}

export function getProgrammedRequestsByLoteId(loteId: string): Promise<ProgrammedTransportRequest[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const requestsInLote = mockProgrammedTransportRequests.filter(req => req.loteId === loteId);
      resolve(requestsInLote);
    }, 200);
  });
}


export function updateProgrammedRequestLoteAssignment(serviceId: string, newLoteId: string | null, newStatus: RequestStatus): Promise<ProgrammedTransportRequest | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const serviceIndex = mockProgrammedTransportRequests.findIndex(s => s.id === serviceId);
      if (serviceIndex > -1) {
        mockProgrammedTransportRequests[serviceIndex].loteId = newLoteId ?? undefined;
        mockProgrammedTransportRequests[serviceIndex].status = newStatus;
        mockProgrammedTransportRequests[serviceIndex].updatedAt = new Date().toISOString();
        resolve({...mockProgrammedTransportRequests[serviceIndex]});
      } else {
        resolve(null);
      }
    }, 100);
  });
}

export interface AmbulanceAssignmentDetails {
  type: 'direct_request' | 'programmed_request' | 'batch';
  id: string;
  description: string;
  status: string;
  createdAt?: string;
  patientName?: string;
  destination?: string;
  pickupTime?: string;
  services?: Array<{
    serviceId: string;
    patientName: string;
    pickupAddress: string;
    destinationAddress: string;
    pickupTime: string;
    appointmentTime?: string;
    stopStatus: ParadaRuta['estado'];
    order: number;
  }>;
}

export async function getAssignmentsForAmbulance(
    ambulanceId: string,
    allLotes: LoteProgramado[],
    allRutas: RutaCalculada[]
): Promise<AmbulanceAssignmentDetails[]> {
  const assignments: AmbulanceAssignmentDetails[] = [];

  const directRequests = mockRequests.filter(
    req => req.assignedAmbulanceId === ambulanceId && req.status !== 'completed' && req.status !== 'cancelled'
  );
  directRequests.forEach(req => {
    assignments.push({
      type: 'direct_request',
      id: req.id,
      description: `Solicitud Urgente: ${req.patientDetails.substring(0,30)}...`,
      status: req.status,
      patientName: req.patientDetails.substring(0, 20) + (req.patientDetails.length > 20 ? '...' : ''),
      destination: req.location.address,
      createdAt: req.createdAt,
    });
  });

  const programmedDirectRequests = mockProgrammedTransportRequests.filter(
    req => req.assignedAmbulanceId === ambulanceId && !req.loteId && req.status !== 'completed' && req.status !== 'cancelled'
  );
  programmedDirectRequests.forEach(req => {
    assignments.push({
      type: 'programmed_request',
      id: req.id,
      description: `Prog: ${req.nombrePaciente} a ${req.destino}`,
      status: req.status,
      patientName: req.nombrePaciente,
      destination: req.destino,
      pickupTime: req.horaIda,
      createdAt: req.createdAt,
    });
  });

  const assignedLotes = allLotes.filter(
    lote => lote.ambulanciaIdAsignada === ambulanceId && lote.estadoLote !== 'completado' && lote.estadoLote !== 'cancelado'
  );

  for (const lote of assignedLotes) {
    const ruta = allRutas.find(r => r.id === lote.rutaCalculadaId);
    let servicesForBatch: AmbulanceAssignmentDetails['services'] = [];

    if (ruta && ruta.paradas.length > 0) {
      servicesForBatch = ruta.paradas
        .sort((a,b) => a.orden - b.orden)
        .map(parada => ({
          serviceId: parada.servicioId,
          patientName: parada.paciente.nombre,
          pickupAddress: parada.paciente.direccionOrigen,
          destinationAddress: mockProgrammedTransportRequests.find(pr => pr.id === parada.servicioId)?.destino || 'Desconocido',
          pickupTime: parada.horaRecogidaEstimada,
          appointmentTime: parada.horaConsultaMedica,
          stopStatus: parada.estado,
          order: parada.orden,
      }));
    } else {
        const serviciosDelLote = mockProgrammedTransportRequests.filter(req => lote.serviciosIds.includes(req.id));
        serviciosDelLote.sort((a, b) => (a.horaConsultaMedica || a.horaIda).localeCompare(b.horaConsultaMedica || b.horaIda));
        servicesForBatch = serviciosDelLote.map((req, index) => {
            const paradaSimulada = mapProgrammedRequestToParada(req, index + 1); // mapProgrammedRequestToParada is now local or imported from request-data
            return {
                serviceId: req.id,
                patientName: req.nombrePaciente,
                pickupAddress: req.centroOrigen,
                destinationAddress: req.destino,
                pickupTime: paradaSimulada.horaRecogidaEstimada,
                appointmentTime: req.horaConsultaMedica || req.horaIda,
                stopStatus: paradaSimulada.estado,
                order: index + 1,
            };
        });
    }

    assignments.push({
      type: 'batch',
      id: lote.id,
      description: `Lote para: ${lote.destinoPrincipal.nombre}`,
      status: lote.estadoLote,
      destination: lote.destinoPrincipal.nombre,
      services: servicesForBatch,
      createdAt: lote.createdAt,
    });
  }

   assignments.sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA;
  });

  return assignments;
}

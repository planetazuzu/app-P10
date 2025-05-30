
import type { AmbulanceRequest, RequestStatus, UserRole, ProgrammedTransportRequest, TipoServicioProgramado, TipoTrasladoProgramado, MedioRequeridoProgramado, EquipamientoEspecialProgramadoId } from '@/types';
import { MOCK_USERS } from './auth'; // Asegúrate de que MOCK_USERS se exporta y está disponible
import { ALL_TIPOS_SERVICIO_PROGRAMADO, ALL_TIPOS_TRASLADO_PROGRAMADO, ALL_MEDIOS_REQUERIDOS_PROGRAMADO, EQUIPAMIENTO_ESPECIAL_PROGRAMADO_OPTIONS } from '@/types';


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
].filter(Boolean); // Filtra undefined si alguno no existiera


export let mockRequests: AmbulanceRequest[] = Array.from({ length: 15 }, (_, i) => {
  const baseLocation = { lat: 42.4659, lng: -2.4487 };
  const coords = getRandomCoords(baseLocation.lat, baseLocation.lng, 0.2);
  const createdAt = new Date(Date.now() - Math.floor(Math.random() * 24 * 3 * 60 * 60 * 1000));
  const statusOptions: RequestStatus[] = ['pending', 'dispatched', 'on-scene', 'transporting', 'completed', 'cancelled'];
  const status = getRandomElement<RequestStatus>(statusOptions);
  let assignedAmbulanceId: string | undefined = undefined;

  let assignedRequesterId: string;

  if (individualUser && i < 3) { // Primeras 3 solicitudes para el usuario individual
    assignedRequesterId = individualUser.id;
  } else if (otherSpecificUsers.length > 0 && i < 3 + otherSpecificUsers.length) {
    // Siguientes N solicitudes para otros usuarios específicos (admin, hospital, coordinador)
    assignedRequesterId = otherSpecificUsers[(i - 3) % otherSpecificUsers.length]!.id;
  } else {
    // El resto para usuarios aleatorios, asegurando que no sea el individual
    let randomOtherUser = getRandomElement(mockUserValues.filter(u => u.id !== individualUser?.id && otherSpecificUsers.every(su => su!.id !== u.id) ));
    if (!randomOtherUser && otherSpecificUsers.length > 0) { // Fallback si el filtro deja array vacío
        randomOtherUser = getRandomElement(otherSpecificUsers)!;
    } else if (!randomOtherUser) { // Fallback si no hay otros usuarios definidos
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
        userRequestsToReturn = [...mockRequests]; // Devuelve una copia para evitar mutaciones directas
      } else if (userRole === 'equipoMovil') {
        userRequestsToReturn = []; // El equipo móvil no ve estas solicitudes directamente
      } else {
        // Esto no debería suceder con UserRole bien tipado, pero es un fallback
        console.warn(`Rol de usuario no manejado en getRequests: ${userRole}`);
        userRequestsToReturn = [];
      }
      // Ordenar por fecha de creación descendente
      resolve(userRequestsToReturn.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }, 300); // Simular retardo de red
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
      mockRequests.unshift(newRequest); // Añade al principio para verla primero si se ordena por fecha
      resolve(newRequest);
    }, 300);
  });
}

export function updateSimpleRequest(
  id: string,
  dataToUpdate: Partial<Omit<AmbulanceRequest, 'id' | 'createdAt' | 'requesterId' | 'assignedAmbulanceId'>> // 'status' puede ser actualizado por otra función
): Promise<AmbulanceRequest | undefined> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const requestIndex = mockRequests.findIndex(req => req.id === id);
      if (requestIndex > -1) {
        const existingRequest = mockRequests[requestIndex];
        // Evitar cambiar el status aquí si hay una función dedicada para ello
        const { status, ...restOfDataToUpdate } = dataToUpdate as any; // any para evitar error de tipo con status

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
                } else if (status === 'pending' || status === 'cancelled') { // Opcionalmente limpiar ambulancia asignada
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
export let mockProgrammedTransportRequests: ProgrammedTransportRequest[] = [];

// Initialize mockProgrammedTransportRequests with some data if it's empty
if (mockProgrammedTransportRequests.length === 0 && individualUser) {
    const today = new Date();
    const createDate = (daysOffset: number) => {
        const date = new Date(today);
        date.setDate(today.getDate() + daysOffset);
        return date.toISOString().split('T')[0];
    };

    const programmedRequesters = [
        MOCK_USERS['hospital@gmr.com']?.id || 'user-hospital-fallback',
        individualUser.id, // Asegurar que el usuario individual tenga solicitudes programadas
        MOCK_USERS['coordinador@gmr.com']?.id || 'user-coordinador-fallback',
    ];

    const sampleProgrammedRequests: Omit<ProgrammedTransportRequest, 'id' | 'requesterId' | 'createdAt' | 'updatedAt'>[] = [
        { status: 'pending', nombrePaciente: 'Elena Navarro (Prog)', dniNieSsPaciente: '12345678A', tipoServicio: 'consulta', tipoTraslado: 'idaYVuelta', centroOrigen: 'Domicilio: Calle Falsa 123, Logroño', destino: 'Hospital San Pedro', fechaIda: createDate(1), horaIda: '10:00', horaConsultaMedica: '10:30', medioRequerido: 'sillaDeRuedas', priority: 'low', requesterId: individualUser.id },
        { status: 'pending', nombrePaciente: 'Roberto Sanz (Prog)', dniNieSsPaciente: '87654321B', tipoServicio: 'rehabilitacion', tipoTraslado: 'soloIda', centroOrigen: 'Centro de Día Sol', destino: 'Domicilio: Avenida de la Paz 50, Calahorra', fechaIda: createDate(1), horaIda: '14:00', medioRequerido: 'andando', priority: 'low', observacionesMedicasAdicionales: 'Necesita ayuda para bajar escalón.', requesterId: programmedRequesters[0] },
        { status: 'batched', loteId: 'lote-demo-123', nombrePaciente: 'Ana Pérez García (Prog)', dniNieSsPaciente: '11223344C', tipoServicio: 'consulta', tipoTraslado: 'idaYVuelta', centroOrigen: 'Plaza del Ayuntamiento 1, Haro', destino: 'CARPA', fechaIda: createDate(0), horaIda: '09:00', horaConsultaMedica: '09:30', medioRequerido: 'camilla', priority: 'low', requesterId: programmedRequesters[2] },
        { status: 'pending', nombrePaciente: 'Carlos Gómez Ruiz (Prog)', dniNieSsPaciente: '55667788D', tipoServicio: 'tratamientoContinuado', tipoTraslado: 'idaYVuelta', centroOrigen: 'Hospital de Calahorra', destino: 'Hospital San Pedro - Oncología', fechaIda: createDate(2), horaIda: '11:00', horaConsultaMedica: '11:45', medioRequerido: 'sillaDeRuedas', priority: 'low', equipamientoEspecialRequerido: ['oxigeno'], requesterId: individualUser.id  },
        { status: 'pending', nombrePaciente: 'Laura Martínez Soler (Prog)', dniNieSsPaciente: '99001122E', tipoServicio: 'alta', tipoTraslado: 'soloIda', centroOrigen: 'Hospital San Pedro - Planta 3', destino: 'Residencia Los Tulipanes', fechaIda: createDate(3), horaIda: '13:00', medioRequerido: 'andando', priority: 'low', observacionesMedicasAdicionales: 'Entregar informe de alta.', requesterId: programmedRequesters[0] },
    ];

    mockProgrammedTransportRequests = sampleProgrammedRequests.map((reqBase, index) => ({
        ...reqBase,
        id: `prog-req-${String(index + 1).padStart(3, '0')}`,
        // requesterId is now part of reqBase
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 72 * 60 * 60 * 1000)).toISOString(),
        updatedAt: new Date().toISOString(),
    }));
}


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
        resolve({...mockProgrammedTransportRequests[serviceIndex]}); // Return a copy
      } else {
        resolve(null);
      }
    }, 100);
  });
}

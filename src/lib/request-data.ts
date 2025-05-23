
import type { AmbulanceRequest, RequestStatus, UserRole, ProgrammedTransportRequest, TipoServicioProgramado, TipoTrasladoProgramado, MedioRequeridoProgramado, EquipamientoEspecialProgramadoId } from '@/types';
import { mockAmbulances } from './ambulance-data';
import { MOCK_USERS } from './auth';
import { ALL_TIPOS_SERVICIO_PROGRAMADO, ALL_TIPOS_TRASLADO_PROGRAMADO, ALL_MEDIOS_REQUERIDOS_PROGRAMADO, EQUIPAMIENTO_ESPECIAL_PROGRAMADO_OPTIONS } from '@/types';


const patientDetailsSamples = [
  "Varón 65 años, dolor torácico, HTA.",
  "Mujer 23 años, posible fractura tobillo postcaída.",
  "Niño, dificultad respiratoria, posible crisis asmática.",
  "Adulto desconocido, hallado inconsciente en vía pública.",
  "Mujer 70 años, síntomas de ictus, desviación comisura bucal, debilidad brazo.",
  "Traslado programado interhospitalario.",
  "Alta hospitalaria, traslado a domicilio.",
];

const addresses = [
    "Gran Vía 12, Logroño", "Calle Laurel 5, Logroño", "Av. de la Paz 34, Calahorra",
    "Plaza Mayor 1, Haro", "Paseo del Mercadal 8, Arnedo", "Calle Falsa 123, Logroño"
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


export let mockRequests: AmbulanceRequest[] = Array.from({ length: 15 }, (_, i) => {
  const baseLocation = { lat: 42.4659, lng: -2.4487 }; // Logroño
  const coords = getRandomCoords(baseLocation.lat, baseLocation.lng, 0.2); // Around La Rioja
  const createdAt = new Date(Date.now() - Math.floor(Math.random() * 24 * 3 * 60 * 60 * 1000)); // Up to 3 days ago
  const statusOptions: RequestStatus[] = ['pending', 'dispatched', 'on-scene', 'transporting', 'completed', 'cancelled'];
  const status = getRandomElement<RequestStatus>(statusOptions);
  
  let assignedAmbulanceId: string | undefined = undefined;
  if (status !== 'pending' && status !== 'cancelled' && status !== 'batched' && mockAmbulances.length > 0) {
    const availableAmbulances = mockAmbulances.filter(a => a.status === 'busy' || a.status === 'available');
    if (availableAmbulances.length > 0) {
        assignedAmbulanceId = getRandomElement(availableAmbulances).id;
    }
  }
  
  let requesterUser = getRandomElement(mockUserValues); 
  if (i < 2 && individualUser) requesterUser = individualUser; // Asegura algunas para el usuario individual
  else if (i >= 2 && i < 4 && hospitalUser) requesterUser = hospitalUser;
  else if (i >= 4 && i < 6 && centroCoordinadorUser) requesterUser = centroCoordinadorUser;
  else if (i >= 6 && i < 8 && adminUser) requesterUser = adminUser;
 
  return {
    id: `req-${101 + i}-${Math.random().toString(36).substring(2, 7)}`, 
    requesterId: requesterUser.id,
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
      let userRequests: AmbulanceRequest[] = [];
      switch (userRole) {
        case 'admin':
        case 'hospital':
        case 'centroCoordinador': 
          userRequests = [...mockRequests]; 
          break;
        case 'individual':
          userRequests = mockRequests.filter(req => req.requesterId === userId); 
          break;
        case 'equipoMovil': 
             userRequests = []; 
             break;
        default:
          // This ensures that all cases are handled, or TypeScript will complain.
          const _exhaustiveCheck: never = userRole; 
          console.warn(`Rol de usuario no manejado en getRequests: ${_exhaustiveCheck}`);
          break;
      }
      resolve(userRequests.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }, 500);
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
  dataToUpdate: Partial<Omit<AmbulanceRequest, 'id' | 'createdAt' | 'requesterId' | 'status' | 'assignedAmbulanceId'>> // More specific type
): Promise<AmbulanceRequest | undefined> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const requestIndex = mockRequests.findIndex(req => req.id === id);
      if (requestIndex > -1) {
        // Merge existing data with updates, ensuring location is handled correctly
        const existingRequest = mockRequests[requestIndex];
        mockRequests[requestIndex] = {
          ...existingRequest,
          ...dataToUpdate,
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

// Initialize mockProgrammedTransportRequests with some data if it's empty, ensuring some are not batched
if (mockProgrammedTransportRequests.length === 0) {
    const today = new Date();
    const createDate = (daysOffset: number) => {
        const date = new Date(today);
        date.setDate(today.getDate() + daysOffset);
        return date.toISOString().split('T')[0];
    };

    mockProgrammedTransportRequests.push(
        { id: 'prog-req-001', requesterId: 'user-hospital', status: 'pending', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), nombrePaciente: 'Elena Navarro', dniNieSsPaciente: '12345678A', tipoServicio: 'consulta', tipoTraslado: 'idaYVuelta', centroOrigen: 'Domicilio: Calle Falsa 123, Logroño', destino: 'Hospital San Pedro', fechaIda: createDate(1), horaIda: '10:00', horaConsultaMedica: '10:30', medioRequerido: 'sillaDeRuedas', priority: 'low' },
        { id: 'prog-req-002', requesterId: 'user-hospital', status: 'pending', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), nombrePaciente: 'Roberto Sanz', dniNieSsPaciente: '87654321B', tipoServicio: 'rehabilitacion', tipoTraslado: 'soloIda', centroOrigen: 'Centro de Día Sol', destino: 'Domicilio: Avenida de la Paz 50, Calahorra', fechaIda: createDate(1), horaIda: '14:00', medioRequerido: 'andando', priority: 'low', observacionesMedicasAdicionales: 'Necesita ayuda para bajar escalón.' },
        { id: 'prog-req-003', requesterId: 'user-individual', status: 'batched', loteId: 'lote-demo-123', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), nombrePaciente: 'Ana Pérez García', dniNieSsPaciente: '11223344C', tipoServicio: 'consulta', tipoTraslado: 'idaYVuelta', centroOrigen: 'Plaza del Ayuntamiento 1, Haro', destino: 'CARPA', fechaIda: createDate(0), horaIda: '09:00', horaConsultaMedica: '09:30', medioRequerido: 'camilla', priority: 'low' },
        { id: 'prog-req-004', requesterId: 'user-hospital', status: 'pending', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), nombrePaciente: 'Carlos Gómez Ruiz', dniNieSsPaciente: '55667788D', tipoServicio: 'tratamientoContinuado', tipoTraslado: 'idaYVuelta', centroOrigen: 'Hospital de Calahorra', destino: 'Hospital San Pedro - Oncología', fechaIda: createDate(2), horaIda: '11:00', horaConsultaMedica: '11:45', medioRequerido: 'sillaDeRuedas', priority: 'low', equipamientoEspecialRequerido: ['oxigeno'] },
        { id: 'prog-req-005', requesterId: 'user-centroCoordinador', status: 'pending', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), nombrePaciente: 'Laura Martínez Soler', dniNieSsPaciente: '99001122E', tipoServicio: 'alta', tipoTraslado: 'soloIda', centroOrigen: 'Hospital San Pedro - Planta 3', destino: 'Residencia Los Tulipanes', fechaIda: createDate(3), horaIda: '13:00', medioRequerido: 'andando', priority: 'low', observacionesMedicasAdicionales: 'Entregar informe de alta.' }
    );
}


export function createProgrammedTransportRequest(
  requestData: Omit<ProgrammedTransportRequest, 'id'>
): Promise<ProgrammedTransportRequest> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newProgrammedRequest: ProgrammedTransportRequest = {
        ...requestData,
        id: `prog-req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      };
      mockProgrammedTransportRequests.unshift(newProgrammedRequest);
      resolve(newProgrammedRequest);
    }, 300);
  });
}

export function getProgrammedTransportRequests(userId: string, userRole: UserRole): Promise<ProgrammedTransportRequest[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let userRequests: ProgrammedTransportRequest[] = [];
      switch (userRole) {
        case 'admin':
        case 'hospital':
        case 'centroCoordinador': 
          userRequests = [...mockProgrammedTransportRequests];
          break;
        case 'individual':
          userRequests = mockProgrammedTransportRequests.filter(req => req.requesterId === userId);
          break;
        case 'equipoMovil':
            userRequests = []; 
            break;
        default:
          const _exhaustiveCheck: never = userRole;
          console.warn(`Rol de usuario no manejado en getProgrammedTransportRequests: ${_exhaustiveCheck}`);
          break;
      }
      resolve(userRequests.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }, 500);
  });
}

export function getProgrammedTransportRequestsForPlanning(): Promise<ProgrammedTransportRequest[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const plannableRequests = mockProgrammedTransportRequests.filter(
        req => (!req.loteId && req.status === 'pending') || req.status === 'cancelled' // Allow re-planning of cancelled
      );
      resolve(plannableRequests.sort((a,b) => new Date(a.fechaIda + 'T' + (a.horaConsultaMedica || a.horaIda)).getTime() - new Date(b.fechaIda + 'T' + (b.horaConsultaMedica || b.horaIda)).getTime()));
    }, 300);
  });
}

export function assignLoteToProgrammedRequests(serviceIds: string[], loteId: string): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      mockProgrammedTransportRequests = mockProgrammedTransportRequests.map(req => {
        if (serviceIds.includes(req.id)) {
          return { ...req, loteId: loteId, status: 'batched' };
        }
        return req;
      });
      resolve();
    }, 100);
  });
}
    

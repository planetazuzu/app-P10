
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
const mockRequesterIds = mockUserValues.map(user => user.id);


export const mockRequests: AmbulanceRequest[] = Array.from({ length: 15 }, (_, i) => {
  const baseLocation = { lat: 42.4659, lng: -2.4487 }; // Logroño
  const coords = getRandomCoords(baseLocation.lat, baseLocation.lng, 0.2); // Around La Rioja
  const createdAt = new Date(Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000)); 
  const statusOptions: RequestStatus[] = ['pending', 'dispatched', 'on-scene', 'transporting', 'completed', 'cancelled'];
  const status = getRandomElement<RequestStatus>(statusOptions);
  
  let assignedAmbulanceId: string | undefined = undefined;
  if (status !== 'pending' && status !== 'cancelled' && status !== 'batched' && mockAmbulances.length > 0) {
    const availableAmbulances = mockAmbulances.filter(a => a.status === 'busy' || a.status === 'available');
    if (availableAmbulances.length > 0) {
        assignedAmbulanceId = getRandomElement(availableAmbulances).id;
    }
  }
  
  let requesterId = getRandomElement(mockRequesterIds);
  const individualUser = mockUserValues.find(u => u.role === 'individual');
  if (i < 3 && individualUser) { // Ensure the first few requests are for the individual user for testing
    requesterId = individualUser.id;
  }


  return {
    id: `req-${i + 101}`,
    requesterId: requesterId,
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
    notes: Math.random() > 0.7 ? "Información adicional proporcionada." : undefined,
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
          userRequests = [...mockRequests]; 
          break;
        case 'individual':
          userRequests = mockRequests.filter(req => req.requesterId === userId);
          break;
        case 'equipoTraslado':
          userRequests = mockRequests.filter(req => 
            (req.assignedAmbulanceId && mockAmbulances.some(a => a.id === req.assignedAmbulanceId)) ||
            (['pending', 'dispatched', 'on-scene'].includes(req.status)) 
          );
          break;
        case 'equipoMovil': // Equipo Móvil no ve estas solicitudes de emergencia directamente
             userRequests = [];
             break;
        default:
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
        id: `req-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockRequests.unshift(newRequest);
      resolve(newRequest);
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
export const mockProgrammedTransportRequests: ProgrammedTransportRequest[] = [];

export function createProgrammedTransportRequest(
  requestData: Omit<ProgrammedTransportRequest, 'id'>
): Promise<ProgrammedTransportRequest> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newProgrammedRequest: ProgrammedTransportRequest = {
        ...requestData,
        id: `prog-req-${Date.now()}`,
      };
      mockProgrammedTransportRequests.unshift(newProgrammedRequest);
      console.log('Created programmed request:', newProgrammedRequest);
      console.log('All programmed requests:', mockProgrammedTransportRequests);
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
          userRequests = [...mockProgrammedTransportRequests];
          break;
        case 'individual':
          userRequests = mockProgrammedTransportRequests.filter(req => req.requesterId === userId);
          break;
        case 'equipoTraslado':
           userRequests = mockProgrammedTransportRequests.filter(req => 
            (req.assignedAmbulanceId && mockAmbulances.some(a => a.id === req.assignedAmbulanceId)) || 
            (req.loteId && req.status !== 'completed' && req.status !== 'cancelled') 
          );
          break;
        case 'equipoMovil':
            // Equipo Móvil obtiene sus servicios a través de Lotes, no directamente de aquí.
            userRequests = []; // Or, if they *can* see individual assigned ones:
            // userRequests = mockProgrammedTransportRequests.filter(req => req.assignedAmbulanceId && mockAmbulances.some(a => a.id === req.assignedAmbulanceId && a.equipoMovilUserId === userId));
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

     
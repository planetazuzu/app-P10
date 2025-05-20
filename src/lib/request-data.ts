
import type { AmbulanceRequest, RequestStatus, UserRole } from '@/types'; // Actualizado a AmbulanceRequest
import { mockAmbulances } from './ambulance-data';
import { MOCK_USERS } from './auth';

const patientDetailsSamples = [
  "65y/o male, chest pain, history of hypertension.",
  "23y/o female, suspected ankle fracture after fall.",
  "Child, difficulty breathing, possible asthma attack.",
  "Unknown adult, found unconscious on street.",
  "70y/o female, stroke symptoms, facial droop, arm weakness.",
  "Traslado programado interhospitalario.",
  "Alta hospitalaria, traslado a domicilio.",
];

const addresses = [
    "123 Main St, Los Angeles, CA", "456 Oak Ave, Pasadena, CA", "789 Pine Ln, Santa Monica, CA",
    "101 Elm Rd, Beverly Hills, CA", "202 Maple Dr, Long Beach, CA", "Calle Falsa 123, Madrid", "Avenida Siempreviva 742, Springfield"
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

const mockRequesterIds = Object.values(MOCK_USERS).map(user => user.id);


export const mockRequests: AmbulanceRequest[] = Array.from({ length: 15 }, (_, i) => { // Actualizado a AmbulanceRequest
  const baseLocation = { lat: 34.0522, lng: -118.2437 }; 
  const coords = getRandomCoords(baseLocation.lat, baseLocation.lng, 0.2);
  const createdAt = new Date(Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000)); 
  const status = getRandomElement<RequestStatus>(['pending', 'dispatched', 'on-scene', 'transporting', 'completed', 'cancelled']);
  
  let assignedAmbulanceId: string | undefined = undefined;
  if (status !== 'pending' && status !== 'cancelled' && mockAmbulances.length > 0) {
    const availableAmbulances = mockAmbulances.filter(a => a.status === 'on-mission' || a.status === 'available');
    if (availableAmbulances.length > 0) {
        assignedAmbulanceId = getRandomElement(availableAmbulances).id;
    }
  }
  
  const requesterId = getRandomElement(mockRequesterIds);
  const isProgrammed = Math.random() > 0.6; // Some requests are programmed

  return {
    id: `req-${i + 101}`,
    requesterId: requesterId,
    patientDetails: isProgrammed ? `Traslado programado: ${getRandomElement(patientDetailsSamples)}` : getRandomElement(patientDetailsSamples),
    location: { 
        latitude: coords.latitude, 
        longitude: coords.longitude,
        address: getRandomElement(addresses)
    },
    status,
    assignedAmbulanceId,
    createdAt: createdAt.toISOString(),
    updatedAt: new Date(createdAt.getTime() + Math.floor(Math.random() * 60 * 60 * 1000)).toISOString(),
    notes: Math.random() > 0.7 ? "Información adicional proporcionada." : (isProgrammed ? "Servicio programado, confirmar horario." : undefined),
    priority: isProgrammed ? 'low' : getRandomElement<'high' | 'medium' | 'low'>(['high', 'medium', 'low']),
  };
});

export function getRequests(userId: string, userRole: UserRole): Promise<AmbulanceRequest[]> { // Actualizado a AmbulanceRequest
  return new Promise((resolve) => {
    setTimeout(() => {
      let userRequests: AmbulanceRequest[] = []; // Actualizado a AmbulanceRequest
      switch (userRole) {
        case 'admin':
        case 'hospital':
          userRequests = [...mockRequests];
          break;
        case 'individual':
          userRequests = mockRequests.filter(req => req.requesterId === userId);
          break;
        case 'ambulance':
          userRequests = mockRequests.filter(req => req.assignedAmbulanceId && mockAmbulances.some(a => a.id === req.assignedAmbulanceId));
          break;
        default:
          console.warn(`Rol de usuario no manejado en getRequests: ${userRole}`);
          userRequests = []; 
          break;
      }
      resolve(userRequests.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }, 500);
  });
}

export function getRequestById(id: string): Promise<AmbulanceRequest | undefined> { // Actualizado a AmbulanceRequest
   return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockRequests.find(req => req.id === id));
    }, 200);
  });
}

export function createRequest(requestData: Omit<AmbulanceRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<AmbulanceRequest> { // Actualizado a AmbulanceRequest
  return new Promise((resolve) => {
    setTimeout(() => {
      const newRequest: AmbulanceRequest = { // Actualizado a AmbulanceRequest
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

export function updateRequestStatus(id: string, status: RequestStatus, ambulanceId?: string): Promise<AmbulanceRequest | undefined> { // Actualizado a AmbulanceRequest
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

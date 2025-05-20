
import type { EmergencyRequest, RequestStatus, UserRole } from '@/types';
import { mockAmbulances } from './ambulance-data';
import { MOCK_USERS } from './auth'; // Importar MOCK_USERS para obtener IDs de usuario válidos

const patientDetailsSamples = [
  "65y/o male, chest pain, history of hypertension.",
  "23y/o female, suspected ankle fracture after fall.",
  "Child, difficulty breathing, possible asthma attack.",
  "Unknown adult, found unconscious on street.",
  "70y/o female, stroke symptoms, facial droop, arm weakness.",
];

const addresses = [
    "123 Main St, Los Angeles, CA", "456 Oak Ave, Pasadena, CA", "789 Pine Ln, Santa Monica, CA",
    "101 Elm Rd, Beverly Hills, CA", "202 Maple Dr, Long Beach, CA"
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

// Obtener IDs de usuario reales que pueden ser solicitantes
const mockRequesterIds = [
  MOCK_USERS['admin@gmr.com'].id,
  MOCK_USERS['hospital@gmr.com'].id,
  MOCK_USERS['individual@gmr.com'].id,
  // Podemos añadir algunos IDs genéricos si aún queremos solicitudes sin un "dueño" de demo específico
  // 'user-generic-1', 'user-generic-2' 
];


export const mockRequests: EmergencyRequest[] = Array.from({ length: 15 }, (_, i) => {
  const baseLocation = { lat: 34.0522, lng: -118.2437 }; // Los Angeles
  const coords = getRandomCoords(baseLocation.lat, baseLocation.lng, 0.2);
  const createdAt = new Date(Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000)); // within last 24 hours
  const status = getRandomElement<RequestStatus>(['pending', 'dispatched', 'on-scene', 'transporting', 'completed', 'cancelled']);
  
  let assignedAmbulanceId: string | undefined = undefined;
  if (status !== 'pending' && status !== 'cancelled' && mockAmbulances.length > 0) {
    const availableAmbulances = mockAmbulances.filter(a => a.status === 'on-mission' || a.status === 'available');
    if (availableAmbulances.length > 0) {
        assignedAmbulanceId = getRandomElement(availableAmbulances).id;
    }
  }
  
  const requesterId = getRandomElement(mockRequesterIds);

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
    updatedAt: new Date(createdAt.getTime() + Math.floor(Math.random() * 60 * 60 * 1000)).toISOString(), // updated within an hour of creation
    notes: Math.random() > 0.7 ? "Additional information provided by caller." : undefined,
    priority: getRandomElement<'high' | 'medium' | 'low'>(['high', 'medium', 'low']),
  };
});

export function getRequests(userId: string, userRole: UserRole): Promise<EmergencyRequest[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let userRequests: EmergencyRequest[] = [];
      switch (userRole) {
        case 'admin':
        case 'hospital':
          userRequests = [...mockRequests];
          break;
        case 'individual':
          userRequests = mockRequests.filter(req => req.requesterId === userId);
          break;
        case 'ambulance':
          // Asegurarse de que mockAmbulances se usa correctamente si puede cambiar
          // Esta lógica asume que el ID de ambulancia en la solicitud corresponde a una ambulancia real
          // En un sistema real, la ambulancia tendría un ID de usuario o similar para filtrar las asignadas.
          // Por ahora, se muestran las solicitudes que tienen *alguna* ambulancia asignada.
          // Para un equipo de ambulancia específico, filtraríamos por req.assignedAmbulanceId === IdDeLaAmbulanciaDelUsuarioActual
          userRequests = mockRequests.filter(req => req.assignedAmbulanceId && mockAmbulances.some(a => a.id === req.assignedAmbulanceId));
          break;
        default:
          // Esto no debería ocurrir si userRole está correctamente tipado
          console.warn(`Rol de usuario no manejado en getRequests: ${userRole}`);
          userRequests = []; 
          break;
      }
      // Ordenar siempre por fecha de creación descendente
      resolve(userRequests.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }, 500);
  });
}

export function getRequestById(id: string): Promise<EmergencyRequest | undefined> {
   return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockRequests.find(req => req.id === id));
    }, 200);
  });
}

export function createRequest(requestData: Omit<EmergencyRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmergencyRequest> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newRequest: EmergencyRequest = {
        ...requestData,
        id: `req-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockRequests.unshift(newRequest); // Add to the beginning of the array
      resolve(newRequest);
    }, 300);
  });
}

export function updateRequestStatus(id: string, status: RequestStatus, ambulanceId?: string): Promise<EmergencyRequest | undefined> {
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

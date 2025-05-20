import type { EmergencyRequest, RequestStatus } from '@/types';
import { mockAmbulances } from './ambulance-data';

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

export const mockRequests: EmergencyRequest[] = Array.from({ length: 15 }, (_, i) => {
  const baseLocation = { lat: 34.0522, lng: -118.2437 }; // Los Angeles
  const coords = getRandomCoords(baseLocation.lat, baseLocation.lng, 0.2);
  const createdAt = new Date(Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000)); // within last 24 hours
  const status = getRandomElement<RequestStatus>(['pending', 'dispatched', 'on-scene', 'transporting', 'completed', 'cancelled']);
  
  let assignedAmbulanceId: string | undefined = undefined;
  if (status !== 'pending' && status !== 'cancelled' && mockAmbulances.length > 0) {
    assignedAmbulanceId = getRandomElement(mockAmbulances.filter(a => a.status === 'on-mission' || a.status === 'available')).id;
  }

  return {
    id: `req-${i + 101}`,
    requesterId: `user-${Math.floor(Math.random() * 3) + 1}`, // mock user IDs
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

export function getRequests(userId: string, userRole: string): Promise<EmergencyRequest[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (userRole === 'admin' || userRole === 'hospital') {
        resolve([...mockRequests].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } else if (userRole === 'individual') {
        resolve(mockRequests.filter(req => req.requesterId === userId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } else if (userRole === 'ambulance') {
         resolve(mockRequests.filter(req => req.assignedAmbulanceId && mockAmbulances.find(a => a.id === req.assignedAmbulanceId)).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())); // Simplified: show if any ambulance assigned
      }
      resolve([]);
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

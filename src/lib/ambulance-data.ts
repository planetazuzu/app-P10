import type { Ambulance, AmbulanceStatus, AmbulanceType } from '@/types';

const ambulanceNames = [
  "City Rover", "Metro Medic", "County Cruiser", "Rapid Response Unit", "Life Line Express",
  "Emergency One", "First Aid Flyer", "Rescue Runner", "Trauma Transporter", "Care Carrier"
];

const equipmentSets: string[][] = [
  ['defibrillator', 'ventilator', 'IV kit', 'oxygen tank'],
  ['basic first aid', 'oxygen mask', 'splints'],
  ['advanced cardiac monitor', 'ventilator', 'infusion pump', 'portable lab'],
  ['defibrillator', 'EKG machine', 'suction unit'],
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

export const mockAmbulances: Ambulance[] = Array.from({ length: 20 }, (_, i) => {
  const baseLocation = { lat: 34.0522, lng: -118.2437 }; // Los Angeles
  const coords = getRandomCoords(baseLocation.lat, baseLocation.lng, 0.5);
  const type = getRandomElement<AmbulanceType>(['ALS', 'BLS', 'MICU']);
  return {
    id: `amb-${i + 1}`,
    name: `${getRandomElement(ambulanceNames)} #${i + 1}`,
    type,
    status: getRandomElement<AmbulanceStatus>(['available', 'unavailable', 'on-mission']),
    latitude: coords.latitude,
    longitude: coords.longitude,
    currentPatients: Math.random() > 0.7 ? Math.floor(Math.random() * 2) + 1 : 0,
    capacity: type === 'MICU' ? 1 : 2,
    equipment: getRandomElement(equipmentSets),
  };
});

export function getAmbulances(): Promise<Ambulance[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate real-time location updates slightly
      const updatedAmbulances = mockAmbulances.map(amb => ({
        ...amb,
        ...getRandomCoords(amb.latitude, amb.longitude, 0.005), // smaller jitter
        status: Math.random() > 0.95 ? getRandomElement<AmbulanceStatus>(['available', 'unavailable', 'on-mission']) : amb.status, // occasional status change
      }));
      resolve(updatedAmbulances);
    }, 500); 
  });
}

export function getAmbulanceById(id: string): Promise<Ambulance | undefined> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockAmbulances.find(amb => amb.id === id));
    }, 200);
  });
}

export function getAmbulanceLocationsForAI(): string {
 return mockAmbulances
    .filter(a => a.status === 'available')
    .map(a => `ID: ${a.id}, Type: ${a.type}, Lat: ${a.latitude.toFixed(4)}, Lng: ${a.longitude.toFixed(4)}`)
    .join('; ');
}

export function getVehicleAvailabilityForAI(): string {
  const available = mockAmbulances.filter(a => a.status === 'available');
  const counts = available.reduce((acc, amb) => {
    acc[amb.type] = (acc[amb.type] || 0) + 1;
    return acc;
  }, {} as Record<AmbulanceType, number>);
  
  let availabilityString = available.length > 0 ? `${available.length} ambulances available. ` : "No ambulances currently available. ";
  availabilityString += Object.entries(counts).map(([type, count]) => `${count} ${type}`).join(', ');
  return availabilityString;
}

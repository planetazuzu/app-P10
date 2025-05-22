
import type { Ambulance, AmbulanceStatus, AmbulanceType } from '@/types';
import { ALL_AMBULANCE_TYPES, ALL_AMBULANCE_STATUSES, defaultEquipmentByType } from '@/types'; // Import defaultEquipmentByType
import { equipmentOptions } from '@/components/ambulance/constants';

const ambulanceNamesPool = [
  "Águila Sanitaria", "Soporte Veloz", "Unidad Médica Avanzada", "Respuesta Delta", "Cronos Asistencia",
  "Fénix Emergencias", "Gacela Auxilio", "Protector Vital", "Servicio Gamma", "Estrella de Vida",
  "Medical Express Rioja", "Ambulancias Najerilla", "Soporte Arnedo", "Urgencias Calahorra", "Auxilio Ebro"
];

const ambulanceModelsPool = [
  "Mercedes-Benz Sprinter", "Volkswagen Crafter", "Ford Transit Custom", "Renault Master",
  "Fiat Ducato", "Peugeot Boxer", "Citroën Jumper", "Iveco Daily"
];

const baseLocationsPool = [
  "Hospital San Pedro, Logroño", "Base Central Logroño", "Centro Salud Calahorra", "Base Haro",
  "Centro Salud Arnedo", "Base Santo Domingo de la Calzada", "Hospital de Calahorra", "Base Nájera"
];

const zonesPool = [
  "Logroño Ciudad", "Rioja Alta", "Rioja Baja", "Sierra de Cameros", "Valle del Ebro", "Comarca de Nájera",
  "Zona Metropolitana de Logroño", "Rioja Alavesa (Servicios fronterizos)"
];

// License plate generation (simple mock)
function generateLicensePlate(): string {
  const nums = Math.floor(1000 + Math.random() * 9000);
  const letters = Array.from({ length: 3 }, () => String.fromCharCode(66 + Math.floor(Math.random() * 20))).join(''); // B-Z, no vowels
  return `${nums}${letters}`;
}

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomCoords(baseLat: number, baseLng: number, range: number) {
  return {
    latitude: baseLat + (Math.random() - 0.5) * range,
    longitude: baseLng + (Math.random() - 0.5) * range,
  };
}

// Helper to get some random special equipment
function getRandomSpecialEquipment(count: number = 2): string[] {
    const shuffled = [...equipmentOptions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map(eq => eq.id);
}

// Function to determine capacities based on type
function getCapacitiesForType(type: AmbulanceType): Pick<Ambulance, 'hasMedicalBed' | 'stretcherSeats' | 'hasWheelchair' | 'wheelchairSeats' | 'allowsWalking' | 'walkingSeats'> {
  const equipmentConfig = defaultEquipmentByType[type];
  let hasMedicalBed = equipmentConfig.stretcher;
  let stretcherSeats = hasMedicalBed ? 1 : 0; // Assuming 1 main stretcher if present
  
  // For wheelchairSeats, we use wheelchairSlots from defaultEquipmentByType
  let hasWheelchair = equipmentConfig.wheelchairSlots > 0;
  let wheelchairSeats = equipmentConfig.wheelchairSlots;

  let allowsWalking = true; // Most types allow some walking/seated capacity
  let walkingSeats = 0;

  // Specific logic for walkingSeats based on type, similar to previous mock generation
  // This can be adjusted to better reflect `equipmentConfig.seats`
  switch (type) {
    case "SVB":
      walkingSeats = 2; // Example: 1 tech + 1 companion/lightly injured
      break;
    case "SVA":
    case "UVI_Movil":
      walkingSeats = 1; // Example: More space for medical team/equipment
      break;
    case "A1":
    case "Convencional":
      // equipmentConfig.seats for these is 2 and 4 respectively.
      // This could represent total seats including driver, or just patient area.
      // Let's assume patient area companion seats.
      walkingSeats = equipmentConfig.seats - (stretcherSeats * 2) - (wheelchairSeats * 2); // Rough estimation
      if (walkingSeats < 0) walkingSeats = 0;
      if (type === "Convencional" && !hasMedicalBed && !hasWheelchair) walkingSeats = equipmentConfig.seats; // if only for walking
      else if (type === "Convencional") walkingSeats = 2; // a common configuration for conventional if it also has wheelchair
      else if (type === "A1") walkingSeats = 1;

      break;
    case "Programado":
      // equipmentConfig.seats is 8. This usually means multiple seated patients.
      walkingSeats = equipmentConfig.seats - (wheelchairSeats * 2); // Subtract space for wheelchairs
      if (walkingSeats < 0) walkingSeats = 0;
      break;
    case "Otros":
      walkingSeats = equipmentConfig.seats;
      break;
  }
  
  // Ensure consistency: if no medical bed, no stretcher seats, etc.
  if (!hasMedicalBed) stretcherSeats = 0;
  if (!hasWheelchair) wheelchairSeats = 0;
  if (!allowsWalking) walkingSeats = 0;

  return {
    hasMedicalBed,
    stretcherSeats,
    hasWheelchair,
    wheelchairSeats,
    allowsWalking,
    walkingSeats,
  };
}


const specificAmbulancesData = [
  { name: "Alfa 101", type: "Convencional" as AmbulanceType },
  { name: "Alfa 202", type: "Programado" as AmbulanceType },
  { name: "Charlie 1", type: "SVA" as AmbulanceType },
  { name: "Bravo 1", type: "SVB" as AmbulanceType },
];

export const mockAmbulances: Ambulance[] = [];

specificAmbulancesData.forEach((spec, index) => {
  const baseCoords = { lat: 42.4659, lng: -2.4487 }; // Logroño, La Rioja
  const coords = getRandomCoords(baseCoords.lat, baseCoords.lng, 0.3);
  const status = getRandomElement<AmbulanceStatus>(ALL_AMBULANCE_STATUSES);
  const capacities = getCapacitiesForType(spec.type);

  mockAmbulances.push({
    id: `amb-${1001 + index}`, // Consistent IDs for the first few
    name: spec.name,
    licensePlate: generateLicensePlate(),
    model: getRandomElement(ambulanceModelsPool),
    type: spec.type,
    baseLocation: getRandomElement(baseLocationsPool),
    zone: getRandomElement(zonesPool),
    status,
    ...capacities,
    specialEquipment: getRandomSpecialEquipment(Math.floor(Math.random()*4)),
    latitude: (status === 'busy' || status === 'available') ? coords.latitude : undefined,
    longitude: (status === 'busy' || status === 'available') ? coords.longitude : undefined,
    currentPatients: status === 'busy' ? Math.floor(Math.random() * (capacities.stretcherSeats + capacities.wheelchairSeats + capacities.walkingSeats)) : 0,
    notes: Math.random() > 0.8 ? `Revisión técnica programada. ${spec.name}` : undefined,
  });
});

// Generate remaining ambulances randomly
Array.from({ length: 25 - specificAmbulancesData.length }, (_, i) => {
  const baseCoords = { lat: 42.4659, lng: -2.4487 }; // Logroño, La Rioja
  const coords = getRandomCoords(baseCoords.lat, baseCoords.lng, 0.3);
  const type = getRandomElement<AmbulanceType>(ALL_AMBULANCE_TYPES);
  const status = getRandomElement<AmbulanceStatus>(ALL_AMBULANCE_STATUSES);
  const capacities = getCapacitiesForType(type);
  
  mockAmbulances.push({
    id: `amb-${1001 + specificAmbulancesData.length + i}`,
    name: `${getRandomElement(ambulanceNamesPool)} #${specificAmbulancesData.length + i + 1}`,
    licensePlate: generateLicensePlate(),
    model: getRandomElement(ambulanceModelsPool),
    type,
    baseLocation: getRandomElement(baseLocationsPool),
    zone: getRandomElement(zonesPool),
    status,
    ...capacities,
    specialEquipment: getRandomSpecialEquipment(Math.floor(Math.random()*4)),
    latitude: status === 'busy' || status === 'available' ? coords.latitude : undefined,
    longitude: status === 'busy' || status === 'available' ? coords.longitude : undefined,
    currentPatients: status === 'busy' ? Math.floor(Math.random() * (capacities.stretcherSeats + capacities.wheelchairSeats + capacities.walkingSeats)) : 0,
    notes: Math.random() > 0.8 ? `Mantenimiento de rutina pendiente.` : undefined,
  });
});


export function getAmbulances(): Promise<Ambulance[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate dynamic updates for some ambulances
      const updatedAmbulances = mockAmbulances.map(amb => {
        // Randomly change status of a few ambulances
        if (Math.random() < 0.1) {
          amb.status = getRandomElement<AmbulanceStatus>(ALL_AMBULANCE_STATUSES);
        }

        // If busy or available, slightly move their coordinates
        if ((amb.status === 'busy' || amb.status === 'available') && amb.latitude && amb.longitude) {
          const newCoords = getRandomCoords(amb.latitude, amb.longitude, 0.005); // smaller range for movement
          return {
            ...amb,
            latitude: newCoords.latitude,
            longitude: newCoords.longitude,
            currentPatients: amb.status === 'busy' ? Math.max(0, amb.currentPatients ?? 0 + (Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0) ) : 0, // Fluctuate patients if busy
          };
        }
        // If not busy/available or no coords, clear them if status is not busy/available
        if (amb.status !== 'busy' && amb.status !== 'available') {
            return { ...amb, latitude: undefined, longitude: undefined, currentPatients: 0 };
        }
        return amb;
      });
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
    .filter(a => a.status === 'available' && a.latitude && a.longitude)
    .map(a => `ID: ${a.id} (${a.name}), Tipo: ${a.type}, Lat: ${a.latitude!.toFixed(4)}, Lng: ${a.longitude!.toFixed(4)}`)
    .join('; ');
}

export function getVehicleAvailabilityForAI(): string {
  const available = mockAmbulances.filter(a => a.status === 'available');
  const counts = available.reduce((acc, amb) => {
    acc[amb.type] = (acc[amb.type] || 0) + 1;
    return acc;
  }, {} as Record<AmbulanceType, number>);

  let availabilityString = available.length > 0 ? `${available.length} ambulancias disponibles. ` : "Ninguna ambulancia disponible actualmente. ";
  availabilityString += Object.entries(counts).map(([type, count]) => `${count} de tipo ${type}`).join(', ');
  if (available.length === 0 && mockAmbulances.length > 0) {
    const busyCount = mockAmbulances.filter(a => a.status === 'busy').length;
    if (busyCount > 0) {
        availabilityString += ` Hay ${busyCount} ambulancias actualmente ocupadas.`;
    }
  }
  return availabilityString;
}


import type { Ambulance, AmbulanceStatus, AmbulanceType } from '@/types';
import { ALL_AMBULANCE_TYPES, ALL_AMBULANCE_STATUSES } from '@/types';
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

export const mockAmbulances: Ambulance[] = Array.from({ length: 25 }, (_, i) => {
  const baseCoords = { lat: 42.4659, lng: -2.4487 }; // Logroño, La Rioja
  const coords = getRandomCoords(baseCoords.lat, baseCoords.lng, 0.3); // Spread within ~La Rioja
  const type = getRandomElement<AmbulanceType>(ALL_AMBULANCE_TYPES);
  const status = getRandomElement<AmbulanceStatus>(ALL_AMBULANCE_STATUSES);
  
  let hasMedicalBed = false;
  let stretcherSeats = 0;
  let hasWheelchair = false;
  let wheelchairSeats = 0;
  let allowsWalking = true;
  let walkingSeats = 0;

  switch (type) {
    case "SVB":
    case "SVA":
    case "UVI_Movil":
      hasMedicalBed = true;
      stretcherSeats = 1;
      walkingSeats = type === "SVB" ? 2 : 1;
      break;
    case "A1":
    case "Convencional":
      hasWheelchair = true;
      wheelchairSeats = 1;
      walkingSeats = 2;
      break;
    case "Programado":
      hasWheelchair = Math.random() > 0.3; // Some programmed might have wheelchair
      wheelchairSeats = hasWheelchair ? (Math.random() > 0.5 ? 2 : 1) : 0;
      walkingSeats = 4 + Math.floor(Math.random() * 3); // 4-6
      break;
    case "Otros":
      allowsWalking = true;
      walkingSeats = 1 + Math.floor(Math.random() * 2);
      break;
  }
  if (!hasMedicalBed) stretcherSeats = 0;
  if (!hasWheelchair) wheelchairSeats = 0;
  if (!allowsWalking) walkingSeats = 0;


  return {
    id: `amb-${1001 + i}`,
    name: `${getRandomElement(ambulanceNamesPool)} #${i + 1}`,
    licensePlate: generateLicensePlate(),
    model: getRandomElement(ambulanceModelsPool),
    type,
    baseLocation: getRandomElement(baseLocationsPool),
    zone: getRandomElement(zonesPool),
    status,
    hasMedicalBed,
    hasWheelchair,
    allowsWalking,
    stretcherSeats,
    wheelchairSeats,
    walkingSeats,
    specialEquipment: getRandomSpecialEquipment(Math.floor(Math.random()*4)), // 0 to 3 special items
    latitude: status === 'busy' || status === 'available' ? coords.latitude : undefined,
    longitude: status === 'busy' || status === 'available' ? coords.longitude : undefined,
    currentPatients: status === 'busy' ? Math.floor(Math.random() * (stretcherSeats + wheelchairSeats + walkingSeats)) : 0,
    notes: Math.random() > 0.8 ? `Revisión técnica programada para el próximo mes.` : undefined,
  };
});

export function getAmbulances(): Promise<Ambulance[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const updatedAmbulances = mockAmbulances.map(amb => {
        if (amb.status === 'busy' || amb.status === 'available') {
          const newCoords = getRandomCoords(amb.latitude || 42.4659, amb.longitude || -2.4487, 0.005);
          return {
            ...amb,
            latitude: newCoords.latitude,
            longitude: newCoords.longitude,
            status: Math.random() > 0.97 ? getRandomElement<AmbulanceStatus>(['available', 'busy', 'maintenance', 'unavailable']) : amb.status,
          };
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
  return availabilityString;
}

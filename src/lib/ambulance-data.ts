import type { Ambulance, AmbulanceStatus, AmbulanceType } from '@/types';

const ambulanceNames = [
  "Movil Rápida", "Asistencia Express", "Unidad Vital", "Respuesta Inmediata", "Soporte Médico Móvil",
  "Emergencia Sur", "Auxilio Norte", "Transporte Sanitario Veloz", "Protección Ciudadana", "Servicio Urgente"
];

const equipmentSets: string[][] = [
  ['desfibrilador', 'ventilador', 'kit IV', 'tanque de oxígeno', 'monitor multiparamétrico'],
  ['material de cura básico', 'oxígeno medicinal', 'férulas'],
  ['monitor cardíaco avanzado', 'ventilador mecánico', 'bomba de infusión', 'material de intubación'],
  ['desfibrilador DEA', 'equipo de EKG', 'unidad de succión'],
  ['camilla', 'botiquín primeros auxilios'],
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

// Definición de los nuevos tipos de ambulancia españoles
const spanishAmbulanceTypes: AmbulanceType[] = ["SVB", "SVA", "Convencional", "UVI_Movil", "A1", "Programado", "Otros"];

export const mockAmbulances: Ambulance[] = Array.from({ length: 20 }, (_, i) => {
  const baseLocation = { lat: 40.416775, lng: -3.703790 }; // Madrid, Spain for example
  const coords = getRandomCoords(baseLocation.lat, baseLocation.lng, 0.5);
  const type = getRandomElement<AmbulanceType>(spanishAmbulanceTypes);
  
  let capacity = 2;
  if (type === 'UVI_Movil') capacity = 1;
  if (type === 'Convencional' || type === 'A1' || type === 'Programado') capacity = 1; // Typically for non-critical transport

  return {
    id: `amb-${i + 1}`,
    name: `${getRandomElement(ambulanceNames)} #${i + 1}`,
    type,
    status: getRandomElement<AmbulanceStatus>(['available', 'unavailable', 'on-mission']),
    latitude: coords.latitude,
    longitude: coords.longitude,
    currentPatients: Math.random() > 0.8 ? 1 : 0, // Usually one patient for UVI/A1/Programado
    capacity,
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
    .map(a => `ID: ${a.id}, Tipo: ${a.type}, Lat: ${a.latitude.toFixed(4)}, Lng: ${a.longitude.toFixed(4)}`)
    .join('; ');
}

export function getVehicleAvailabilityForAI(): string {
  const available = mockAmbulances.filter(a => a.status === 'available');
  const counts = available.reduce((acc, amb) => {
    acc[amb.type] = (acc[amb.type] || 0) + 1;
    return acc;
  }, {} as Record<AmbulanceType, number>);
  
  let availabilityString = available.length > 0 ? `${available.length} ambulancias disponibles. ` : "Ninguna ambulancia disponible actualmente. ";
  availabilityString += Object.entries(counts).map(([type, count]) => `${count} ${type}`).join(', ');
  return availabilityString;
}

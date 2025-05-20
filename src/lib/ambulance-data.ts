
import type { Ambulance, AmbulanceStatus, AmbulanceType, AmbulanceEquipment } from '@/types';
import { defaultEquipmentByType } from '@/types'; // Importar el mapeo

const ambulanceNames = [
  "Movil Rápida", "Asistencia Express", "Unidad Vital", "Respuesta Inmediata", "Soporte Médico Móvil",
  "Emergencia Sur", "Auxilio Norte", "Transporte Sanitario Veloz", "Protección Ciudadana", "Servicio Urgente"
];

// Ya no necesitamos equipmentSets, ya que el equipamiento se define por tipo
// const equipmentSets: string[][] = [ ... ];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomCoords(baseLat: number, baseLng: number, range: number) {
  return {
    latitude: baseLat + (Math.random() - 0.5) * range,
    longitude: baseLng + (Math.random() - 0.5) * range,
  };
}

const spanishAmbulanceTypes: AmbulanceType[] = ["SVB", "SVA", "Convencional", "UVI_Movil", "A1", "Programado", "Otros"];

export const mockAmbulances: Ambulance[] = Array.from({ length: 20 }, (_, i) => {
  const baseLocation = { lat: 40.416775, lng: -3.703790 }; // Madrid, Spain for example
  const coords = getRandomCoords(baseLocation.lat, baseLocation.lng, 0.5);
  const type = getRandomElement<AmbulanceType>(spanishAmbulanceTypes);
  const equipment = defaultEquipmentByType[type]; // Obtener equipamiento por defecto

  // La capacidad total podría depender de si lleva camilla o solo asientos
  // Por ahora, una lógica simple, pero podría ser más compleja
  let capacity = equipment.stretcher ? 1 : equipment.seats + equipment.wheelchairSlots;
  if (type === 'UVI_Movil' || type === 'SVA') capacity = 1; // Suelen llevar un paciente crítico

  return {
    id: `amb-${i + 1}`,
    name: `${getRandomElement(ambulanceNames)} #${i + 1}`,
    type,
    status: getRandomElement<AmbulanceStatus>(['available', 'unavailable', 'on-mission']),
    latitude: coords.latitude,
    longitude: coords.longitude,
    currentPatients: Math.random() > 0.8 ? 1 : 0,
    capacity,
    equipment, // Usar el objeto de equipamiento estructurado
  };
});

export function getAmbulances(): Promise<Ambulance[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const updatedAmbulances = mockAmbulances.map(amb => ({
        ...amb,
        ...getRandomCoords(amb.latitude, amb.longitude, 0.005),
        status: Math.random() > 0.95 ? getRandomElement<AmbulanceStatus>(['available', 'unavailable', 'on-mission']) : amb.status,
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

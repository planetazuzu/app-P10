
import type { Ambulance, AmbulanceStatus, AmbulanceType } from '@/types';
import { ALL_AMBULANCE_TYPES, ALL_AMBULANCE_STATUSES, defaultEquipmentByType } from '@/types';
import { equipmentOptions } from '@/components/ambulance/constants';

// --- Configuración de API (Placeholder - Reemplazar con tus valores reales) ---
const NOCODB_API_BASE_URL = process.env.NEXT_PUBLIC_NOCODB_API_URL;
const NOCODB_PROJECT_ID = process.env.NOCODB_PROJECT_ID;
const NOCODB_AMBULANCES_TABLE_ID = process.env.NOCODB_AMBULANCES_TABLE_ID;
const NOCODB_API_TOKEN = process.env.NOCODB_API_TOKEN; // Este token debe manejarse con cuidado, especialmente si se usa desde el cliente.

const API_ENDPOINT_AMBULANCES = `${NOCODB_API_BASE_URL}/${NOCODB_PROJECT_ID}/${NOCODB_AMBULANCES_TABLE_ID}/records`;

// Helper para simular la generación de datos si es necesario para la creación
function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function generateLicensePlate(): string {
  const nums = Math.floor(1000 + Math.random() * 9000);
  const letters = Array.from({ length: 3 }, () => String.fromCharCode(66 + Math.floor(Math.random() * 20))).join('');
  return `${nums}${letters}`;
}
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
function getRandomSpecialEquipment(count: number = 2): string[] {
    const shuffled = [...equipmentOptions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map(eq => eq.id);
}
function getCapacitiesForType(type: AmbulanceType): Pick<Ambulance, 'hasMedicalBed' | 'stretcherSeats' | 'hasWheelchair' | 'wheelchairSeats' | 'allowsWalking' | 'walkingSeats'> {
  const equipmentConfig = defaultEquipmentByType[type];
  let hasMedicalBed = equipmentConfig.stretcher;
  let stretcherSeats = hasMedicalBed ? 1 : 0;
  let hasWheelchair = equipmentConfig.wheelchairSlots > 0;
  let wheelchairSeats = equipmentConfig.wheelchairSlots;
  let allowsWalking = true;
  let walkingSeats = 0;
  switch (type) {
    case "SVB": walkingSeats = 2; break;
    case "SVA": case "UVI_Movil": walkingSeats = 1; break;
    case "A1": walkingSeats = 1; break;
    case "Convencional": walkingSeats = 2; break;
    case "Programado": walkingSeats = equipmentConfig.seats - (wheelchairSeats * 2); if (walkingSeats < 0) walkingSeats = 0; break;
    case "Otros": walkingSeats = equipmentConfig.seats; break;
  }
  if (!hasMedicalBed) stretcherSeats = 0;
  if (!hasWheelchair) wheelchairSeats = 0;
  if (!allowsWalking) walkingSeats = 0;
  return { hasMedicalBed, stretcherSeats, hasWheelchair, wheelchairSeats, allowsWalking, walkingSeats };
}


// --- Funciones de API para Ambulancias ---

// Helper para mapear la respuesta de NocoDB a nuestra interfaz Ambulance
// NOTA: Esto es una suposición de la estructura de NocoDB. Necesitarás ajustarlo.
// NocoDB usualmente devuelve los campos directamente, pero puede que haya un objeto `list` o similar.
// También, los campos booleanos y JSON (como specialEquipment) pueden necesitar parsing.
const mapNocoDBToAmbulance = (nocoRecord: any): Ambulance => {
  return {
    id: nocoRecord.Id || nocoRecord.id, // NocoDB puede usar 'Id' o 'id'
    name: nocoRecord.nombre,
    licensePlate: nocoRecord.matricula,
    model: nocoRecord.modelo,
    type: nocoRecord.tipo as AmbulanceType,
    baseLocation: nocoRecord.ubicacionBase,
    zone: nocoRecord.zonaOperacion,
    status: nocoRecord.estado as AmbulanceStatus,
    hasMedicalBed: Boolean(nocoRecord.tieneCamilla),
    stretcherSeats: parseInt(String(nocoRecord.plazasCamilla), 10) || 0,
    hasWheelchair: Boolean(nocoRecord.permiteSillaRuedas),
    wheelchairSeats: parseInt(String(nocoRecord.plazasSillaRuedas), 10) || 0,
    allowsWalking: Boolean(nocoRecord.permiteSentadosAndando),
    walkingSeats: parseInt(String(nocoRecord.plazasSentadosAndando), 10) || 0,
    specialEquipment: typeof nocoRecord.equipamientoEspecial === 'string' 
                      ? JSON.parse(nocoRecord.equipamientoEspecial) 
                      : (Array.isArray(nocoRecord.equipamientoEspecial) ? nocoRecord.equipamientoEspecial : []),
    latitude: nocoRecord.latitud ? parseFloat(String(nocoRecord.latitud)) : undefined,
    longitude: nocoRecord.longitud ? parseFloat(String(nocoRecord.longitud)) : undefined,
    currentPatients: nocoRecord.pacientesActuales ? parseInt(String(nocoRecord.pacientesActuales), 10) : undefined,
    notes: nocoRecord.notasInternas,
    equipoMovilUserId: nocoRecord.equipoMovilUserId,
    // NocoDB puede incluir createdAt y updatedAt, pero nuestra interfaz Ambulance no los tiene directamente
    // Si los necesitas, añádelos a la interfaz Ambulance.
  };
};

// Helper para mapear nuestra interfaz Ambulance a lo que NocoDB espera para crear/actualizar
// NOTA: Ajusta los nombres de campo para que coincidan con tus columnas de NocoDB.
const mapAmbulanceToNocoDBPayload = (ambulance: Partial<Ambulance>): any => {
  const payload: any = {};
  if (ambulance.name !== undefined) payload.nombre = ambulance.name;
  if (ambulance.licensePlate !== undefined) payload.matricula = ambulance.licensePlate;
  if (ambulance.model !== undefined) payload.modelo = ambulance.model;
  if (ambulance.type !== undefined) payload.tipo = ambulance.type;
  if (ambulance.baseLocation !== undefined) payload.ubicacionBase = ambulance.baseLocation;
  if (ambulance.zone !== undefined) payload.zonaOperacion = ambulance.zone;
  if (ambulance.status !== undefined) payload.estado = ambulance.status;
  if (ambulance.hasMedicalBed !== undefined) payload.tieneCamilla = ambulance.hasMedicalBed;
  if (ambulance.stretcherSeats !== undefined) payload.plazasCamilla = ambulance.stretcherSeats;
  if (ambulance.hasWheelchair !== undefined) payload.permiteSillaRuedas = ambulance.hasWheelchair;
  if (ambulance.wheelchairSeats !== undefined) payload.plazasSillaRuedas = ambulance.wheelchairSeats;
  if (ambulance.allowsWalking !== undefined) payload.permiteSentadosAndando = ambulance.allowsWalking;
  if (ambulance.walkingSeats !== undefined) payload.plazasSentadosAndando = ambulance.walkingSeats;
  if (ambulance.specialEquipment !== undefined) payload.equipamientoEspecial = JSON.stringify(ambulance.specialEquipment); // NocoDB podría preferir JSON string
  if (ambulance.latitude !== undefined) payload.latitud = ambulance.latitude;
  if (ambulance.longitude !== undefined) payload.longitud = ambulance.longitude;
  if (ambulance.currentPatients !== undefined) payload.pacientesActuales = ambulance.currentPatients;
  if (ambulance.notes !== undefined) payload.notasInternas = ambulance.notes;
  if (ambulance.equipoMovilUserId !== undefined) payload.equipoMovilUserId = ambulance.equipoMovilUserId;
  // No incluyas 'id' en el payload para la creación. Para la actualización, NocoDB lo usa en la URL.
  return payload;
};


export async function getAmbulances(): Promise<Ambulance[]> {
  if (!NOCODB_API_BASE_URL || !NOCODB_PROJECT_ID || !NOCODB_AMBULANCES_TABLE_ID || !NOCODB_API_TOKEN) {
    console.warn("Configuración de API para NocoDB incompleta. Devolviendo array vacío para ambulancias.");
    return [];
  }
  try {
    const response = await fetch(API_ENDPOINT_AMBULANCES, {
      method: 'GET',
      headers: {
        'xc-token': NOCODB_API_TOKEN,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      console.error(`Error fetching ambulances: ${response.status} ${response.statusText}`, await response.text());
      return [];
    }
    const data = await response.json();
    // NocoDB envuelve la lista en una propiedad 'list' y también proporciona 'pageInfo'.
    // Si tu API devuelve directamente un array, ajusta esto.
    if (data && Array.isArray(data.list)) {
      return data.list.map(mapNocoDBToAmbulance);
    }
    console.warn('Respuesta inesperada de la API de ambulancias:', data);
    return [];
  } catch (error) {
    console.error("Fallo al obtener ambulancias desde la API:", error);
    return [];
  }
}

export async function getAmbulanceById(id: string): Promise<Ambulance | undefined> {
   if (!NOCODB_API_BASE_URL || !NOCODB_PROJECT_ID || !NOCODB_AMBULANCES_TABLE_ID || !NOCODB_API_TOKEN) {
    console.warn("Configuración de API para NocoDB incompleta. No se puede obtener ambulancia por ID.");
    return undefined;
  }
  try {
    const response = await fetch(`${API_ENDPOINT_AMBULANCES}/${id}`, { // Asumiendo que NocoDB usa /records/{id}
      method: 'GET',
      headers: {
        'xc-token': NOCODB_API_TOKEN,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      if (response.status === 404) return undefined; // No encontrada
      console.error(`Error fetching ambulance ${id}: ${response.status} ${response.statusText}`, await response.text());
      return undefined;
    }
    const nocoRecord = await response.json();
    return mapNocoDBToAmbulance(nocoRecord);
  } catch (error) {
    console.error(`Fallo al obtener ambulancia ${id} desde la API:`, error);
    return undefined;
  }
}

// Esta función ahora es para el frontend, para crear la ambulancia vía API.
// El objeto que recibe es Partial<Ambulance> porque el ID lo genera la BBDD.
export async function createAmbulanceAPI(ambulanceData: Omit<Ambulance, 'id'>): Promise<Ambulance | null> {
  if (!NOCODB_API_BASE_URL || !NOCODB_PROJECT_ID || !NOCODB_AMBULANCES_TABLE_ID || !NOCODB_API_TOKEN) {
    console.error("Configuración de API para NocoDB incompleta. No se puede crear la ambulancia.");
    return null;
  }
  
  const payload = mapAmbulanceToNocoDBPayload(ambulanceData);

  try {
    const response = await fetch(API_ENDPOINT_AMBULANCES, {
      method: 'POST',
      headers: {
        'xc-token': NOCODB_API_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Error creando ambulancia: ${response.status} ${response.statusText}`, errorBody);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    const newNocoRecord = await response.json();
    return mapNocoDBToAmbulance(newNocoRecord); // NocoDB devuelve el registro creado, incluyendo su ID.
  } catch (error) {
    console.error("Fallo al crear la ambulancia vía API:", error);
    return null;
  }
}

// Actualizar ambulancia vía API
export async function updateAmbulanceAPI(id: string, ambulanceData: Partial<Omit<Ambulance, 'id'>>): Promise<Ambulance | null> {
  if (!NOCODB_API_BASE_URL || !NOCODB_PROJECT_ID || !NOCODB_AMBULANCES_TABLE_ID || !NOCODB_API_TOKEN) {
    console.error("Configuración de API para NocoDB incompleta. No se puede actualizar la ambulancia.");
    return null;
  }

  const payload = mapAmbulanceToNocoDBPayload(ambulanceData);
  
  try {
    const response = await fetch(`${API_ENDPOINT_AMBULANCES}/${id}`, { // NocoDB suele usar PATCH para actualizaciones parciales
      method: 'PATCH',
      headers: {
        'xc-token': NOCODB_API_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Error actualizando ambulancia ${id}: ${response.status} ${response.statusText}`, errorBody);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    const updatedNocoRecord = await response.json();
    return mapNocoDBToAmbulance(updatedNocoRecord);
  } catch (error) {
    console.error(`Fallo al actualizar la ambulancia ${id} vía API:`, error);
    return null;
  }
}

// Eliminar ambulancia vía API
export async function deleteAmbulanceAPI(id: string): Promise<boolean> {
  if (!NOCODB_API_BASE_URL || !NOCODB_PROJECT_ID || !NOCODB_AMBULANCES_TABLE_ID || !NOCODB_API_TOKEN) {
    console.error("Configuración de API para NocoDB incompleta. No se puede eliminar la ambulancia.");
    return false;
  }

  try {
    // NocoDB para DELETE puede requerir un array de IDs en el body o usar /records?ids=id1,id2
    // Para un solo registro, la ruta /records/{id} es más común, pero su API específica puede variar.
    // Consultar documentación de NocoDB: DELETE /api/v1/db/data/noco/{projectId}/{tableId}/records (con body {ids: [id]})
    // o si es /records/{id}
    const response = await fetch(`${API_ENDPOINT_AMBULANCES}/${id}`, {
    // O si NocoDB usa la API de borrado en lote para un solo ítem:
    // const response = await fetch(API_ENDPOINT_AMBULANCES, {
      method: 'DELETE',
      headers: {
        'xc-token': NOCODB_API_TOKEN,
        // 'Content-Type': 'application/json', // Podría ser necesario si se envía body
      },
      // body: JSON.stringify({ ids: [id] }), // Si es la API de borrado en lote
    });

    if (!response.ok) {
      // NocoDB devuelve un número (1 para éxito, 0 para fallo) o un booleano en algunos casos,
      // o un 200/204 vacío.
      const errorBody = await response.text();
      console.error(`Error eliminando ambulancia ${id}: ${response.status} ${response.statusText}`, errorBody);
      return false;
    }
    // Comprobar si la respuesta es un JSON con un resultado o un status 200/204.
    // Por simplicidad, asumimos que un status OK significa éxito.
    return true; 
  } catch (error) {
    console.error(`Fallo al eliminar la ambulancia ${id} vía API:`, error);
    return false;
  }
}


// Las siguientes funciones son para obtener cadenas de texto para la IA,
// podrían obtener los datos de la API si fuera necesario en un escenario real.
// Por ahora, simularán con datos generados o un subconjunto.
export function getAmbulanceLocationsForAI(): string {
  // En un escenario real, esto debería llamar a getAmbulances() y filtrar.
  // Por ahora, simulación rápida:
  const someAmbulances: Partial<Ambulance>[] = [
    { id: 'amb-1001', name: "Alfa 101", type: "Convencional", latitude: 42.46, longitude: -2.45, status: 'available'},
    { id: 'amb-1003', name: "Charlie 1", type: "SVA", latitude: 42.47, longitude: -2.43, status: 'available'},
  ];
  return someAmbulances
    .filter(a => a.status === 'available' && a.latitude && a.longitude)
    .map(a => `ID: ${a.id} (${a.name}), Tipo: ${a.type}, Lat: ${a.latitude!.toFixed(4)}, Lng: ${a.longitude!.toFixed(4)}`)
    .join('; ');
}

export function getVehicleAvailabilityForAI(): string {
  // Similar a arriba, debería usar getAmbulances()
  const numAvailable = 2; // Simulado
  const typesAvailable = "1 de tipo Convencional, 1 de tipo SVA"; // Simulado
  return `${numAvailable} ambulancias disponibles. ${typesAvailable}.`;
}

// Mock Data original (la eliminaremos o comentaremos una vez que la API esté funcional)
/*
export let mockAmbulances: Ambulance[] = [];
// ... (resto de la lógica de mockAmbulances) ...
// Esta lógica se moverá a la base de datos o se usará solo si la API falla como fallback.
*/
// Para mantener la app funcionando mientras se configura NocoDB,
// podemos tener un fallback a datos mock si la API no está configurada o falla.
// Sin embargo, para una transición real, este array mock se eliminaría.
// Por ahora, lo dejamos para que la app no se rompa completamente si no hay API.

const specificAmbulancesData = [
  { name: "Alfa 101", type: "Convencional" as AmbulanceType, idOverride: 'amb-1001' },
  { name: "Alfa 202", type: "Programado" as AmbulanceType, idOverride: 'amb-1002' },
  { name: "Charlie 1", type: "SVA" as AmbulanceType, idOverride: 'amb-1003' },
  { name: "Bravo 1", type: "SVB" as AmbulanceType, idOverride: 'amb-1004' },
];

export const fallbackMockAmbulances: Ambulance[] = specificAmbulancesData.map((spec, index) => {
  const baseCoords = { lat: 42.4659, lng: -2.4487 };
  const coords = { latitude: baseCoords.lat + (Math.random() - 0.5) * 0.3, longitude: baseCoords.lng + (Math.random() - 0.5) * 0.3 };
  const status = getRandomElement<AmbulanceStatus>(ALL_AMBULANCE_STATUSES);
  const capacities = getCapacitiesForType(spec.type);
  return {
    id: spec.idOverride,
    name: spec.name,
    licensePlate: generateLicensePlate(),
    model: getRandomElement(ambulanceModelsPool),
    type: spec.type,
    baseLocation: getRandomElement(baseLocationsPool),
    zone: getRandomElement(zonesPool),
    status,
    ...capacities,
    specialEquipment: getRandomSpecialEquipment(Math.floor(Math.random() * 4)),
    latitude: (status === 'busy' || status === 'available') ? coords.latitude : undefined,
    longitude: (status === 'busy' || status === 'available') ? coords.longitude : undefined,
    currentPatients: status === 'busy' ? Math.floor(Math.random() * (capacities.stretcherSeats + capacities.wheelchairSeats + capacities.walkingSeats)) : 0,
    notes: Math.random() > 0.8 ? `Revisión técnica programada. ${spec.name}` : undefined,
  };
});

// Añadir más ambulancias aleatorias al fallback
Array.from({ length: 5 }, (_, i) => {
  const baseCoords = { lat: 42.4659, lng: -2.4487 };
  const coords = { latitude: baseCoords.lat + (Math.random() - 0.5) * 0.3, longitude: baseCoords.lng + (Math.random() - 0.5) * 0.3 };
  const type = getRandomElement<AmbulanceType>(ALL_AMBULANCE_TYPES);
  const status = getRandomElement<AmbulanceStatus>(ALL_AMBULANCE_STATUSES);
  const capacities = getCapacitiesForType(type);
  fallbackMockAmbulances.push({
    id: `amb-fallback-${1005 + i}`,
    name: `${getRandomElement(["Omega", "Sigma", "Delta", "Gamma"])} ${10 + i}`,
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
// FIN DE DATOS DE FALLBACK

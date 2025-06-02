
import type { Ambulance, AmbulanceStatus, AmbulanceType } from '@/types';
import { db } from './firebase-config'; // Import Firestore instance
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, Timestamp } from 'firebase/firestore';

// --- Firestore Collection Reference ---
const ambulancesCollectionRef = collection(db, "ambulances");

// Helper para mapear un documento de Firestore a nuestra interfaz Ambulance
const mapFirestoreDocToAmbulance = (docSnapshot: any): Ambulance => {
  const data = docSnapshot.data();
  return {
    id: docSnapshot.id,
    name: data.name || 'Nombre Desconocido',
    licensePlate: data.licensePlate || 'Matrícula Desconocida',
    model: data.model || 'Modelo Desconocido',
    type: data.type as AmbulanceType || 'Otros',
    baseLocation: data.baseLocation || 'Base Desconocida',
    zone: data.zone || '',
    status: data.status as AmbulanceStatus || 'unavailable',
    hasMedicalBed: data.hasMedicalBed === undefined ? false : Boolean(data.hasMedicalBed),
    stretcherSeats: data.stretcherSeats === undefined ? 0 : Number(data.stretcherSeats),
    hasWheelchair: data.hasWheelchair === undefined ? false : Boolean(data.hasWheelchair),
    wheelchairSeats: data.wheelchairSeats === undefined ? 0 : Number(data.wheelchairSeats),
    allowsWalking: data.allowsWalking === undefined ? true : Boolean(data.allowsWalking),
    walkingSeats: data.walkingSeats === undefined ? 0 : Number(data.walkingSeats),
    specialEquipment: Array.isArray(data.specialEquipment) ? data.specialEquipment : [],
    personnel: Array.isArray(data.personnel) ? data.personnel : [], // Mapear nuevo campo
    latitude: data.latitude ? parseFloat(String(data.latitude)) : undefined,
    longitude: data.longitude ? parseFloat(String(data.longitude)) : undefined,
    currentPatients: data.currentPatients ? parseInt(String(data.currentPatients), 10) : 0,
    notes: data.notes || '',
    equipoMovilUserId: data.equipoMovilUserId,
  };
};

// Helper para mapear nuestra interfaz Ambulance a lo que Firestore espera para crear/actualizar
const mapAmbulanceToFirestorePayload = (ambulanceData: Partial<Omit<Ambulance, 'id'>>): any => {
  const payload: any = { ...ambulanceData };
  
  // Asegurarse de que los campos numéricos son números
  if (payload.stretcherSeats !== undefined) payload.stretcherSeats = Number(payload.stretcherSeats);
  if (payload.wheelchairSeats !== undefined) payload.wheelchairSeats = Number(payload.wheelchairSeats);
  if (payload.walkingSeats !== undefined) payload.walkingSeats = Number(payload.walkingSeats);
  if (payload.currentPatients !== undefined) payload.currentPatients = Number(payload.currentPatients);
  if (payload.latitude !== undefined) payload.latitude = Number(payload.latitude);
  if (payload.longitude !== undefined) payload.longitude = Number(payload.longitude);

  // Asegurarse de que los booleanos son booleanos
  if (payload.hasMedicalBed !== undefined) payload.hasMedicalBed = Boolean(payload.hasMedicalBed);
  if (payload.hasWheelchair !== undefined) payload.hasWheelchair = Boolean(payload.hasWheelchair);
  if (payload.allowsWalking !== undefined) payload.allowsWalking = Boolean(payload.allowsWalking);

  // Asegurar que personnel es un array, incluso si es vacío
  if (payload.personnel === undefined) {
    payload.personnel = [];
  } else if (!Array.isArray(payload.personnel)) {
    // Si no es un array (ej. null), convertirlo a array vacío
    payload.personnel = [];
  }


  // Eliminar campos undefined para no sobrescribir innecesariamente en Firestore con 'undefined'
  Object.keys(payload).forEach(key => {
    if (payload[key] === undefined) {
      delete payload[key];
    }
  });
  
  return payload;
};


export async function getAmbulances(): Promise<Ambulance[]> {
  // console.log("Attempting to fetch ambulances from Firestore...");
  try {
    if (!db) { // Simple check, db should be initialized if firebase-config is correct
        console.error("Firestore DB instance is not available. Check firebase-config.ts.");
        return [];
    }
    const querySnapshot = await getDocs(ambulancesCollectionRef);
    // console.log(`Found ${querySnapshot.docs.length} ambulance documents.`);
    return querySnapshot.docs.map(mapFirestoreDocToAmbulance);
  } catch (error) {
    console.error("Error fetching ambulances from Firestore:", error);
    return [];
  }
}

export async function getAmbulanceById(id: string): Promise<Ambulance | undefined> {
  // console.log(`Attempting to fetch ambulance with ID: ${id} from Firestore...`);
  try {
    if (!db) {
        console.error("Firestore DB instance is not available.");
        return undefined;
    }
    const docRef = doc(db, "ambulances", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      // console.log("Ambulance document found:", docSnap.data());
      return mapFirestoreDocToAmbulance(docSnap);
    } else {
      console.warn(`No ambulance found with ID: ${id}`);
      return undefined;
    }
  } catch (error) {
    console.error(`Error fetching ambulance ${id} from Firestore:`, error);
    return undefined;
  }
}

export async function createAmbulanceAPI(ambulanceData: Omit<Ambulance, 'id'>): Promise<Ambulance | null> {
  // console.log("Attempting to create ambulance in Firestore:", ambulanceData);
  try {
    if (!db) {
        console.error("Firestore DB instance is not available.");
        return null;
    }
    const payload = mapAmbulanceToFirestorePayload(ambulanceData);
    // payload.createdAt = Timestamp.now(); // Example if you add createdAt
    // payload.updatedAt = Timestamp.now(); // Example if you add updatedAt
    const docRef = await addDoc(ambulancesCollectionRef, payload);
    // console.log("Ambulance created with ID:", docRef.id);
    return { id: docRef.id, ...ambulanceData };
  } catch (error) {
    console.error("Error creating ambulance in Firestore:", error);
    return null;
  }
}

export async function updateAmbulanceAPI(id: string, ambulanceData: Partial<Omit<Ambulance, 'id'>>): Promise<Ambulance | null> {
  // console.log(`Attempting to update ambulance ${id} in Firestore:`, ambulanceData);
  try {
    if (!db) {
        console.error("Firestore DB instance is not available.");
        return null;
    }
    const docRef = doc(db, "ambulances", id);
    const payload = mapAmbulanceToFirestorePayload(ambulanceData);
    // payload.updatedAt = Timestamp.now(); // Example if you add updatedAt
    await updateDoc(docRef, payload);
    const updatedDocSnap = await getDoc(docRef);
    if (updatedDocSnap.exists()) {
      // console.log("Ambulance updated successfully.");
      return mapFirestoreDocToAmbulance(updatedDocSnap);
    }
    console.warn(`Ambulance ${id} not found after update attempt.`);
    return null;
  } catch (error) {
    console.error(`Error updating ambulance ${id} in Firestore:`, error);
    return null;
  }
}

export async function deleteAmbulanceAPI(id: string): Promise<boolean> {
  // console.log(`Attempting to delete ambulance ${id} from Firestore...`);
  try {
    if (!db) {
        console.error("Firestore DB instance is not available.");
        return false;
    }
    const docRef = doc(db, "ambulances", id);
    await deleteDoc(docRef);
    // console.log(`Ambulance ${id} deleted successfully.`);
    return true;
  } catch (error) {
    console.error(`Error deleting ambulance ${id} from Firestore:`, error);
    return false;
  }
}


// Las siguientes funciones son para obtener cadenas de texto para la IA,
// deberían obtener los datos de la API (Firestore) en un escenario real.
export async function getAmbulanceLocationsForAI(): Promise<string> {
  // TODO: En un escenario real, esto debería usar getAmbulances() de Firestore
  // y manejar el caso de que la base de datos esté vacía o haya errores.
  const ambulances = await getAmbulances();
  if (!ambulances || ambulances.length === 0) {
    return "No hay información de ubicación de ambulancias disponible en este momento.";
  }
  return ambulances
    .filter(a => a.status === 'available' && a.latitude && a.longitude)
    .map(a => `ID: ${a.id.substring(0,5)}... (${a.name}), Tipo: ${a.type}, Lat: ${a.latitude!.toFixed(4)}, Lng: ${a.longitude!.toFixed(4)}`)
    .join('; ') || "No hay ambulancias disponibles con ubicación conocida.";
}

export async function getVehicleAvailabilityForAI(): Promise<string> {
  // TODO: En un escenario real, esto debería usar getAmbulances() de Firestore
  const ambulances = await getAmbulances();
  if (!ambulances || ambulances.length === 0) {
    return "No hay información de disponibilidad de vehículos en este momento.";
  }
  const availableAmbulances = ambulances.filter(a => a.status === 'available');
  const numAvailable = availableAmbulances.length;
  
  if (numAvailable === 0) {
    return "No hay ambulancias disponibles en este momento.";
  }

  const typesCount: Record<string, number> = {};
  availableAmbulances.forEach(a => {
    typesCount[a.type] = (typesCount[a.type] || 0) + 1;
  });
  const typesAvailable = Object.entries(typesCount).map(([type, count]) => `${count} de tipo ${type}`).join(', ');
  
  return `${numAvailable} ambulancia(s) disponible(s). Tipos: ${typesAvailable}.`;
}


import type { Ambulance, AmbulanceStatus, AmbulanceType } from '@/types';
import { ALL_AMBULANCE_TYPES, ALL_AMBULANCE_STATUSES, defaultEquipmentByType } from '@/types';
import { equipmentOptions } from '@/components/ambulance/constants';
import { db } from './firebase-config'; // Import Firestore instance
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, Timestamp } from 'firebase/firestore';

// --- Firestore Collection Reference ---
const ambulancesCollectionRef = collection(db, "ambulances");

// Helper para mapear un documento de Firestore a nuestra interfaz Ambulance
const mapFirestoreDocToAmbulance = (docSnapshot: any): Ambulance => {
  const data = docSnapshot.data();
  return {
    id: docSnapshot.id,
    name: data.name || '',
    licensePlate: data.licensePlate || '',
    model: data.model || '',
    type: data.type as AmbulanceType || 'Otros',
    baseLocation: data.baseLocation || '',
    zone: data.zone || '',
    status: data.status as AmbulanceStatus || 'unavailable',
    hasMedicalBed: Boolean(data.hasMedicalBed),
    stretcherSeats: data.stretcherSeats || 0,
    hasWheelchair: Boolean(data.hasWheelchair),
    wheelchairSeats: data.wheelchairSeats || 0,
    allowsWalking: data.allowsWalking === undefined ? true : Boolean(data.allowsWalking),
    walkingSeats: data.walkingSeats || 0,
    specialEquipment: Array.isArray(data.specialEquipment) ? data.specialEquipment : [],
    latitude: data.latitude ? parseFloat(String(data.latitude)) : undefined,
    longitude: data.longitude ? parseFloat(String(data.longitude)) : undefined,
    currentPatients: data.currentPatients ? parseInt(String(data.currentPatients), 10) : undefined,
    notes: data.notes || '',
    equipoMovilUserId: data.equipoMovilUserId,
    // createdAt y updatedAt podrían ser Timestamps de Firestore, convertir si es necesario
    // Por ahora, asumimos que se guardan/leen como strings o se manejan en la UI si son Timestamps
  };
};

// Helper para mapear nuestra interfaz Ambulance a lo que Firestore espera para crear/actualizar
const mapAmbulanceToFirestorePayload = (ambulanceData: Partial<Omit<Ambulance, 'id'>>): any => {
  const payload: any = { ...ambulanceData };

  // Firestore maneja bien los undefined, así que no es estrictamente necesario eliminarlos
  // pero es buena práctica enviar solo lo que se quiere guardar/actualizar.
  Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
  
  // Si tuvieras campos de fecha que quieres guardar como Timestamps de Firestore:
  // if (payload.someDate) {
  //   payload.someDate = Timestamp.fromDate(new Date(payload.someDate));
  // }

  return payload;
};


export async function getAmbulances(): Promise<Ambulance[]> {
  try {
    const querySnapshot = await getDocs(ambulancesCollectionRef);
    return querySnapshot.docs.map(mapFirestoreDocToAmbulance);
  } catch (error) {
    console.error("Error fetching ambulances from Firestore:", error);
    // En un entorno de producción, podrías querer re-lanzar el error o manejarlo de forma más específica.
    // Por ahora, devolvemos un array vacío para que la UI no se rompa.
    return [];
  }
}

export async function getAmbulanceById(id: string): Promise<Ambulance | undefined> {
  try {
    const docRef = doc(db, "ambulances", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return mapFirestoreDocToAmbulance(docSnap);
    } else {
      console.log(`No ambulance found with ID: ${id}`);
      return undefined;
    }
  } catch (error) {
    console.error(`Error fetching ambulance ${id} from Firestore:`, error);
    return undefined;
  }
}

export async function createAmbulanceAPI(ambulanceData: Omit<Ambulance, 'id'>): Promise<Ambulance | null> {
  try {
    const payload = mapAmbulanceToFirestorePayload(ambulanceData);
    // Añadir timestamps de creación/actualización si los manejas en el cliente
    // payload.createdAt = Timestamp.now();
    // payload.updatedAt = Timestamp.now();
    const docRef = await addDoc(ambulancesCollectionRef, payload);
    // Para obtener el objeto completo guardado, podríamos hacer un getDoc,
    // o si addDoc devuelve el objeto completo (revisar documentación de Firebase)
    // Por ahora, asumimos que necesitamos construirlo con el nuevo ID.
    return { id: docRef.id, ...ambulanceData };
  } catch (error) {
    console.error("Error creating ambulance in Firestore:", error);
    return null;
  }
}

export async function updateAmbulanceAPI(id: string, ambulanceData: Partial<Omit<Ambulance, 'id'>>): Promise<Ambulance | null> {
  try {
    const docRef = doc(db, "ambulances", id);
    const payload = mapAmbulanceToFirestorePayload(ambulanceData);
    // payload.updatedAt = Timestamp.now(); // Actualizar timestamp
    await updateDoc(docRef, payload);
    // Para devolver el objeto actualizado, hacemos un getDoc
    const updatedDocSnap = await getDoc(docRef);
    if (updatedDocSnap.exists()) {
        return mapFirestoreDocToAmbulance(updatedDocSnap);
    }
    return null; // O el objeto parcial enviado si prefieres no hacer otra lectura
  } catch (error) {
    console.error(`Error updating ambulance ${id} in Firestore:`, error);
    return null;
  }
}

export async function deleteAmbulanceAPI(id: string): Promise<boolean> {
  try {
    const docRef = doc(db, "ambulances", id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error(`Error deleting ambulance ${id} from Firestore:`, error);
    return false;
  }
}


// Las siguientes funciones son para obtener cadenas de texto para la IA,
// deberían obtener los datos de la API (Firestore) en un escenario real.
export async function getAmbulanceLocationsForAI(): Promise<string> {
  // TODO: Implementar con getAmbulances() de Firestore
  const ambulances = await getAmbulances(); // Esto ahora llama a Firestore
  return ambulances
    .filter(a => a.status === 'available' && a.latitude && a.longitude)
    .map(a => `ID: ${a.id.substring(0,5)}... (${a.name}), Tipo: ${a.type}, Lat: ${a.latitude!.toFixed(4)}, Lng: ${a.longitude!.toFixed(4)}`)
    .join('; ') || "No hay ambulancias disponibles con ubicación conocida.";
}

export async function getVehicleAvailabilityForAI(): Promise<string> {
  // TODO: Implementar con getAmbulances() de Firestore
  const ambulances = await getAmbulances(); // Esto ahora llama a Firestore
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

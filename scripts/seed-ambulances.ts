
import admin from 'firebase-admin';
import type { Ambulance, AmbulanceType, AmbulanceStatus } from '../src/types'; // Ajusta la ruta según tu estructura

// IMPORTANTE: Configuración de credenciales
// OPCIÓN A (Recomendada): Asegúrate de que la variable de entorno GOOGLE_APPLICATION_CREDENTIALS
// esté configurada para apuntar a tu archivo JSON de clave de cuenta de servicio.
// Ejemplo: export GOOGLE_APPLICATION_CREDENTIALS="/ruta/a/tu/serviceAccountKey.json"

// OPCIÓN B: O descomenta la siguiente línea y reemplaza con la ruta a tu archivo de clave de servicio
// const serviceAccount = require('/ruta/absoluta/a/tu/serviceAccountKey.json');

try {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
    console.log("Firebase Admin SDK inicializado con credenciales por defecto (GOOGLE_APPLICATION_CREDENTIALS).");
  } else {
    // Descomenta y ajusta si usas la OPCIÓN B:
    // admin.initializeApp({
    //   credential: admin.credential.cert(serviceAccount),
    // });
    // console.log("Firebase Admin SDK inicializado con archivo de clave de servicio local.");
    throw new Error("Credenciales de Firebase Admin no configuradas. Define GOOGLE_APPLICATION_CREDENTIALS o configura 'serviceAccount' en el script.");
  }
} catch (error: any) {
  console.error("Error inicializando Firebase Admin SDK:", error.message);
  console.log("Por favor, asegúrate de tener un archivo de clave de cuenta de servicio válido y de haber configurado las credenciales correctamente.");
  process.exit(1);
}

const db = admin.firestore();

const sampleAmbulances: Omit<Ambulance, 'id'>[] = [
  {
    name: "Alfa 101",
    licensePlate: "RIO-0101",
    model: "Mercedes Sprinter",
    type: "Convencional" as AmbulanceType,
    baseLocation: "Hospital San Pedro, Logroño",
    zone: "Logroño Centro",
    status: "available" as AmbulanceStatus,
    hasMedicalBed: true,
    stretcherSeats: 1,
    hasWheelchair: false,
    wheelchairSeats: 0,
    allowsWalking: true,
    walkingSeats: 3,
    specialEquipment: ["gps-navigation"],
    latitude: 42.4612,
    longitude: -2.4495,
    currentPatients: 0,
    notes: "Unidad para traslados convencionales programados.",
  },
  {
    name: "Alfa 202",
    licensePlate: "RIO-0202",
    model: "Ford Transit Custom",
    type: "Programado" as AmbulanceType,
    baseLocation: "Base Logroño Sur",
    zone: "Rioja Baja",
    status: "available" as AmbulanceStatus,
    hasMedicalBed: false,
    stretcherSeats: 0,
    hasWheelchair: true,
    wheelchairSeats: 2,
    allowsWalking: true,
    walkingSeats: 4,
    specialEquipment: ["stair-chair"],
    latitude: 42.4530,
    longitude: -2.4310,
    currentPatients: 0,
    notes: "Especializada en transporte colectivo programado.",
  },
  {
    name: "Charlie 1",
    licensePlate: "RIO-0001",
    model: "Volkswagen Crafter",
    type: "SVA" as AmbulanceType,
    baseLocation: "Hospital San Pedro, Logroño",
    zone: "Urgencias Capital",
    status: "busy" as AmbulanceStatus,
    hasMedicalBed: true,
    stretcherSeats: 1,
    hasWheelchair: false,
    wheelchairSeats: 0,
    allowsWalking: true,
    walkingSeats: 1,
    specialEquipment: ["vital-signs-monitor", "defibrillator", "ventilator", "oxygen-supply"],
    latitude: 42.4650,
    longitude: -2.4500,
    currentPatients: 1,
    notes: "Unidad de Soporte Vital Avanzado.",
  },
  {
    name: "Bravo 1",
    licensePlate: "RIO-0002",
    model: "Renault Master",
    type: "SVB" as AmbulanceType,
    baseLocation: "Centro Salud Calahorra",
    zone: "Calahorra y Comarca",
    status: "maintenance" as AmbulanceStatus,
    hasMedicalBed: true,
    stretcherSeats: 1,
    hasWheelchair: true,
    wheelchairSeats: 1,
    allowsWalking: true,
    walkingSeats: 2,
    specialEquipment: ["oxygen-supply", "defibrillator"],
    currentPatients: 0,
    notes: "En revisión. Disponible próximamente.",
  },
  {
    name: "Delta 5",
    licensePlate: "RIO-0005",
    model: "Peugeot Boxer",
    type: "SVB" as AmbulanceType,
    baseLocation: "Base Haro",
    zone: "Rioja Alta",
    status: "available" as AmbulanceStatus,
    hasMedicalBed: true,
    stretcherSeats: 1,
    hasWheelchair: false,
    wheelchairSeats: 0,
    allowsWalking: true,
    walkingSeats: 2,
    specialEquipment: ["oxygen-supply"],
    latitude: 42.5760,
    longitude: -2.8550,
    currentPatients: 0,
  },
  {
    name: "UVI Móvil 1",
    licensePlate: "RIO-0007",
    model: "Mercedes Sprinter UVI",
    type: "UVI_Movil" as AmbulanceType,
    baseLocation: "Hospital San Pedro, Logroño",
    status: "available" as AmbulanceStatus,
    hasMedicalBed: true,
    stretcherSeats: 1,
    hasWheelchair: false,
    wheelchairSeats: 0,
    allowsWalking: false,
    walkingSeats: 0,
    specialEquipment: ["vital-signs-monitor", "defibrillator", "ventilator", "incubator", "oxygen-supply"],
    latitude: 42.4600,
    longitude: -2.4480,
  },
];

async function seedAmbulances() {
  const ambulancesCollection = db.collection('ambulances');
  let successfulWrites = 0;
  let failedWrites = 0;

  console.log(`Iniciando siembra de ${sampleAmbulances.length} ambulancias...`);

  for (const ambulanceData of sampleAmbulances) {
    try {
      // Comprobar si ya existe una ambulancia con la misma matrícula para evitar duplicados
      const existingAmbulanceQuery = await ambulancesCollection.where('licensePlate', '==', ambulanceData.licensePlate).limit(1).get();
      if (existingAmbulanceQuery.empty) {
        const docRef = await ambulancesCollection.add(ambulanceData);
        console.log(` -> Ambulancia "${ambulanceData.name}" añadida con ID: ${docRef.id}`);
        successfulWrites++;
      } else {
        console.log(` -> Ambulancia "${ambulanceData.name}" (Matrícula: ${ambulanceData.licensePlate}) ya existe. Omitiendo.`);
      }
    } catch (error) {
      console.error(`Error añadiendo ambulancia "${ambulanceData.name}":`, error);
      failedWrites++;
    }
  }

  console.log("\n--- Resumen de Siembra de Ambulancias ---");
  console.log(`Total de ambulancias procesadas: ${sampleAmbulances.length}`);
  console.log(`Ambulancias añadidas exitosamente: ${successfulWrites}`);
  console.log(`Ambulancias omitidas (ya existían o error): ${sampleAmbulances.length - successfulWrites}`);
  if (failedWrites > 0) {
    console.error(`Escrituras fallidas: ${failedWrites}`);
  }
  console.log("--------------------------------------");
}

seedAmbulances()
  .then(() => {
    console.log("Proceso de siembra de ambulancias completado.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error general en el script de siembra:", error);
    process.exit(1);
  });

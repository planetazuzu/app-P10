
import type { Ambulance, AmbulanceType } from "@/types";

export const equipmentOptions = [
  { id: "stair-chair", label: "Silla oruga" },
  { id: "bariatric-stretcher", label: "Camilla bariátrica" }, // Corrected from bariatric-bed
  { id: "bariatric-equipment", label: "Equipamiento para pacientes bariátricos" },
  { id: "vital-signs-monitor", label: "Monitorización de constantes vitales" }, // Corrected from vital-signs
  { id: "oxygen-supply", label: "Suministro de Oxígeno" }, // Corrected from oxygen
  { id: "defibrillator", label: "Desfibrilador" },
  { id: "ventilator", label: "Ventilador mecánico" },
  { id: "incubator", label: "Incubadora neonatal" },
  { id: "gps-navigation", label: "Navegación GPS avanzada" },
];

export const emptyAmbulance: Omit<Ambulance, "id"> = {
  name: "",
  licensePlate: "",
  model: "",
  type: "SVB", // Default to a common type
  baseLocation: "",
  zone: "",
  status: "available",
  
  hasMedicalBed: false,
  hasWheelchair: false,
  allowsWalking: true, // Default to allowing walking patients
  
  stretcherSeats: 0,
  wheelchairSeats: 0,
  walkingSeats: 0,
  
  specialEquipment: [],
  personnel: [], // Initialize new field
  
  latitude: undefined, // Initially undefined for a new ambulance template
  longitude: undefined,
  currentPatients: 0,
  notes: "",
};

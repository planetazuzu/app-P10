
import type { LoteProgramado, RutaCalculada, ParadaRuta, PacienteLote, DestinoLote, ProgrammedTransportRequest, ParadaEstado, MedioRequeridoProgramado, LoteCreateFormValues } from '@/types';
import { mockProgrammedTransportRequests, getProgrammedRequestsByLoteId } from './request-data'; 
import { fallbackMockAmbulances } from './ambulance-data'; 

// Mock Data - Expandiendo a 10+ pacientes
const mockPacientes: Record<string, PacienteLote> = {
  "pac-001": { id: "pac-001", nombre: "Ana Pérez García", direccionOrigen: "Calle Falsa 123, Logroño", contacto: "600111222", observaciones: "Requiere ayuda para subir escalón.", medioRequerido: "andando" },
  "pac-002": { id: "pac-002", nombre: "Juan Rodríguez López", direccionOrigen: "Avenida de la Paz 50, Calahorra", medioRequerido: "sillaDeRuedas" },
  "pac-003": { id: "pac-003", nombre: "María Sánchez Martín", direccionOrigen: "Plaza del Ayuntamiento 1, Haro", contacto: "600333444", observaciones: "Paciente con movilidad reducida.", medioRequerido: "camilla" },
  "pac-004": { id: "pac-004", nombre: "Carlos Gómez Ruiz", direccionOrigen: "Paseo del Espolón 2, Logroño", medioRequerido: "andando"},
  "pac-005": { id: "pac-005", nombre: "Laura Martínez Soler", direccionOrigen: "Calle San Agustín 22, Logroño", contacto: "600555666", observaciones: "Alérgica a AINES.", medioRequerido: "andando" },
  "pac-006": { id: "pac-006", nombre: "Pedro Jiménez Vega", direccionOrigen: "Avenida de Colón 10, Logroño", observaciones: "Traslado post-operatorio, delicado.", medioRequerido: "camilla" },
  "pac-007": { id: "pac-007", nombre: "Elena Navarro Sanz", direccionOrigen: "Calle del Sol 7, Villamediana de Iregua", contacto: "600777888", medioRequerido: "andando" },
  "pac-008": { id: "pac-008", nombre: "Roberto Sanz Gil", direccionOrigen: "Avenida Madrid 101, Logroño", observaciones: "Entrada por rampa lateral.", medioRequerido: "sillaDeRuedas"},
  "pac-009": { id: "pac-009", nombre: "Isabel Torres Pazos", direccionOrigen: "Camino Viejo 4, Alberite", observaciones: "Paciente encamado, requiere 2 técnicos.", medioRequerido: "camilla" },
  "pac-010": { id: "pac-010", nombre: "David Alonso Marco", direccionOrigen: "Plaza de la Iglesia 1, Lardero", medioRequerido: "andando" },
};

const mockDestinos: Record<string, DestinoLote> = {
  "dest-hsp": { id: "dest-hsp", nombre: "Hospital San Pedro", direccion: "Calle Piqueras 98, Logroño", detalles: "Consultas Externas" },
  "dest-hcal": { id: "dest-hcal", nombre: "Hospital de Calahorra", direccion: "Carretera de Logroño s/n, Calahorra", detalles: "Rehabilitación" },
  "dest-carpa": {id: "dest-carpa", nombre: "CARPA (Centro de Alta Resolución)", direccion: "Av. de la República Argentina, 55, Logroño", detalles: "Consultas varias"},
};

// This function ensures mockProgrammedTransportRequests is populated if empty
// This is called from request-data.ts now.
// We will ensure the lote-demo-123 has its services correctly referenced here.

let initialLoteDemo123ServiceIds: string[] = [];

if (mockProgrammedTransportRequests.length > 0) {
    // Filter services that are initially meant for lote-demo-123
    // (This assumes some services in mockProgrammedTransportRequests are pre-assigned to 'lote-demo-123')
    initialLoteDemo123ServiceIds = mockProgrammedTransportRequests
        .filter(r => r.loteId === "lote-demo-123")
        .map(r => r.id);
    
    // If no services are pre-assigned to lote-demo-123, but we have at least 10 patients,
    // assign the first few to it for demonstration purposes.
    if (initialLoteDemo123ServiceIds.length === 0 && Object.keys(mockPacientes).length >= 10) {
        const pacienteIds = Object.keys(mockPacientes);
        const today = new Date().toISOString().split('T')[0];
        
        const createMockRequestForLote = (pId: string, index: number): ProgrammedTransportRequest => ({
            id: `prog-req-lote-demo-123-${pId.split('-')[1]}`,
            requesterId: 'user-centro-coordinador-01',
            status: 'batched',
            loteId: "lote-demo-123",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            nombrePaciente: mockPacientes[pId].nombre,
            dniNieSsPaciente: `Y0${1234560+index}${String.fromCharCode(65+index)}`, 
            patientId: pId,
            tipoServicio: 'consulta',
            tipoTraslado: 'idaYVuelta', 
            centroOrigen: mockPacientes[pId].direccionOrigen,
            destino: mockDestinos[index % 2 === 0 ? "dest-hsp" : "dest-carpa"].nombre,
            destinoId: mockDestinos[index % 2 === 0 ? "dest-hsp" : "dest-carpa"].id,
            fechaIda: today,
            horaIda: `${String(9 + Math.floor(index / 2)).padStart(2,'0')}:${String((index % 2) * 30).padStart(2,'0')}`, 
            horaConsultaMedica: `${String(9 + Math.floor(index / 2)).padStart(2,'0')}:${String((index % 2) * 30).padStart(2,'0')}`,
            medioRequerido: mockPacientes[pId].medioRequerido,
            priority: 'low',
            observacionesMedicasAdicionales: mockPacientes[pId].observaciones,
        });

        // Ensure at least a few services are part of lote-demo-123 initially
        const servicesToAssign = pacienteIds.slice(0, 6); // Example: assign first 6 patients
        servicesToAssign.forEach((pId, index) => {
            const existingReqIndex = mockProgrammedTransportRequests.findIndex(r => r.patientId === pId && r.fechaIda === today);
            if (existingReqIndex === -1) { // Only add if not already present for today for this patient
                const newReq = createMockRequestForLote(pId, index);
                mockProgrammedTransportRequests.push(newReq);
                initialLoteDemo123ServiceIds.push(newReq.id);
            } else { // If exists, ensure it's part of this lot
                mockProgrammedTransportRequests[existingReqIndex].loteId = "lote-demo-123";
                mockProgrammedTransportRequests[existingReqIndex].status = "batched";
                if(!initialLoteDemo123ServiceIds.includes(mockProgrammedTransportRequests[existingReqIndex].id)){
                    initialLoteDemo123ServiceIds.push(mockProgrammedTransportRequests[existingReqIndex].id);
                }
            }
        });
    }
}

// Helper function to map ProgrammedTransportRequest to ParadaRuta
export const mapProgrammedRequestToParada = (req: ProgrammedTransportRequest, orden: number): ParadaRuta => {
  const pacienteInfo = mockPacientes[req.patientId!] || {
    id: req.patientId || req.dniNieSsPaciente,
    nombre: req.nombrePaciente,
    direccionOrigen: req.centroOrigen,
    contacto: undefined, // Populate if available
    observaciones: req.observacionesMedicasAdicionales,
    medioRequerido: req.medioRequerido,
  };

  return {
    servicioId: req.id,
    paciente: pacienteInfo,
    horaConsultaMedica: req.horaConsultaMedica || req.horaIda,
    // Estimations would be part of a more complex route optimization logic
    horaRecogidaEstimada: `${String(parseInt((req.horaConsultaMedica || req.horaIda).split(':')[0]) -1).padStart(2,'0')}:${(req.horaConsultaMedica || req.horaIda).split(':')[1]}`, // Simplistic estimation
    horaLlegadaDestinoEstimada: req.horaConsultaMedica || req.horaIda, // Simplistic estimation
    tiempoTrasladoDesdeAnteriorMin: orden === 1 ? 30 : 15 + Math.floor(Math.random() * 10), // Simplistic estimation
    orden,
    estado: (req.status === 'completed' || req.status === 'cancelled') ? req.status : 'pendiente' as ParadaEstado,
    notasParada: `Destino: ${req.destino}. Necesidades: ${req.necesidadesEspeciales || 'Ninguna'}`
  };
};

export let mockRutas: RutaCalculada[] = [
  {
    id: "ruta-lote-demo-123",
    loteId: "lote-demo-123",
    horaSalidaBaseEstimada: "07:30", // Adjusted
    duracionTotalEstimadaMin: 0, // Will be calculated
    distanciaTotalEstimadaKm: 0, // Will be calculated
    optimizadaEn: new Date(Date.now() - 3600000 * 2).toISOString(), 
    paradas: [] // Will be populated by getRutaCalculadaByLoteIdMock based on lote's services
  },
  // ... other mock routes if needed
];

// Function to build/rebuild paradas for a route based on lote.serviciosIds
const buildParadasForRoute = (lote: LoteProgramado): ParadaRuta[] => {
    const serviciosDelLote = mockProgrammedTransportRequests.filter(req => lote.serviciosIds.includes(req.id));
    serviciosDelLote.sort((a, b) => (a.horaConsultaMedica || a.horaIda).localeCompare(b.horaConsultaMedica || b.horaIda));
    return serviciosDelLote.map((req, index) => mapProgrammedRequestToParada(req, index + 1));
};


export let mockLotes: LoteProgramado[] = [
  {
    id: "lote-demo-123",
    fechaServicio: new Date().toISOString().split('T')[0], 
    destinoPrincipal: mockDestinos["dest-hsp"], 
    serviciosIds: initialLoteDemo123ServiceIds, // Use the dynamically generated IDs
    estadoLote: 'asignado',
    equipoMovilUserIdAsignado: 'user-vehiculo-AMB101', 
    ambulanciaIdAsignada: fallbackMockAmbulances.find(a => a.name.includes("Alfa 101"))?.id || "amb-1001", 
    rutaCalculadaId: "ruta-lote-demo-123",
    createdAt: new Date(Date.now() - 86400000).toISOString(), 
    updatedAt: new Date().toISOString(),
    notasLote: "Ruta optimizada para múltiples consultas en Hospital San Pedro y CARPA a lo largo del día."
  },
  {
    id: "lote-empty-789",
    fechaServicio: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // Two days from now
    destinoPrincipal: mockDestinos["dest-hcal"],
    serviciosIds: [], // Initially empty
    estadoLote: 'pendienteCalculo',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date().toISOString(),
    notasLote: "Lote nuevo, pendiente de asignación de servicios."
  }
];

export const getLotesMock = (): Promise<LoteProgramado[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockLotes]); // Return a copy
    }, 300);
  });
};


export const getLoteByIdMock = (loteId: string): Promise<LoteProgramado | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lote = mockLotes.find(l => l.id === loteId);
      resolve(lote ? {...lote} : null); // Return a copy
    }, 300);
  });
};

export const getRutaCalculadaByLoteIdMock = (loteId: string, rutaId?: string): Promise<RutaCalculada | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lote = mockLotes.find(l => l.id === loteId);
      if (!lote) {
        resolve(null);
        return;
      }

      let ruta = mockRutas.find(r => r.loteId === loteId && (!rutaId || r.id === rutaId));
      
      if (ruta) {
        // Rebuild paradas based on current lote.serviciosIds
        ruta.paradas = buildParadasForRoute(lote);
        // Recalculate total duration and distance (simplified)
        ruta.duracionTotalEstimadaMin = ruta.paradas.reduce((sum, parada) => sum + parada.tiempoTrasladoDesdeAnteriorMin + 20, 0); // 20 min per stop + travel
        ruta.distanciaTotalEstimadaKm = ruta.paradas.length * 15; // 15km per stop average
        resolve({...ruta}); // Return a copy
      } else if (lote.rutaCalculadaId) { // If lote has a rutaCalculadaId but it's not in mockRutas, try to create one
        const newRoute: RutaCalculada = {
            id: lote.rutaCalculadaId,
            loteId: lote.id,
            paradas: buildParadasForRoute(lote),
            horaSalidaBaseEstimada: "08:00", // Default
            duracionTotalEstimadaMin: 0,
            distanciaTotalEstimadaKm: 0,
            optimizadaEn: new Date().toISOString(),
        };
        newRoute.duracionTotalEstimadaMin = newRoute.paradas.reduce((sum, parada) => sum + parada.tiempoTrasladoDesdeAnteriorMin + 20, 0);
        newRoute.distanciaTotalEstimadaKm = newRoute.paradas.length * 15;
        mockRutas.push(newRoute);
        resolve({...newRoute});
      }
       else {
        resolve(null);
      }
    }, 300);
  });
};

export const updateParadaEstadoMock = (loteId: string, servicioId: string, newStatus: ParadaEstado): Promise<ParadaRuta | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const ruta = mockRutas.find(r => r.loteId === loteId);
        if (ruta) {
          const paradaIndex = ruta.paradas.findIndex(p => p.servicioId === servicioId);
          if (paradaIndex !== -1) {
            ruta.paradas[paradaIndex].estado = newStatus;
            const now = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            if (newStatus === 'enRutaRecogida') ruta.paradas[paradaIndex].horaRealLlegadaRecogida = undefined; 
            if (newStatus === 'pacienteRecogido') ruta.paradas[paradaIndex].horaRealSalidaRecogida = now;
            if (newStatus === 'enDestino') ruta.paradas[paradaIndex].horaRealLlegadaDestino = now;
            
            resolve({...ruta.paradas[paradaIndex]}); // Return a copy
            return;
          }
        }
        resolve(null);
      }, 200);
    });
  };


export const createLoteMock = (
  loteData: Omit<LoteProgramado, 'id' | 'createdAt' | 'updatedAt' | 'serviciosIds' | 'estadoLote' | 'fechaServicio'> & { fechaServicio: Date }
): Promise<LoteProgramado> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newLote: LoteProgramado = {
        id: `lote-${Date.now()}`,
        fechaServicio: loteData.fechaServicio.toISOString().split('T')[0], 
        destinoPrincipal: loteData.destinoPrincipal,
        serviciosIds: [], 
        estadoLote: 'pendienteCalculo',
        notasLote: loteData.notasLote,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockLotes.push(newLote);
      resolve({...newLote}); // Return a copy
    }, 500);
  });
};


export const createLoteWithServicesMock = (
  serviceIds: string[], 
  ambulanceId: string,
  loteDetails: { fechaServicio: Date, destinoPrincipalNombre: string, destinoPrincipalDireccion: string, notasLote?: string }
): Promise<LoteProgramado> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newLote: LoteProgramado = {
        id: `lote-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
        fechaServicio: loteDetails.fechaServicio.toISOString().split('T')[0],
        destinoPrincipal: {
            id: `dest-${Date.now()}`,
            nombre: loteDetails.destinoPrincipalNombre,
            direccion: loteDetails.destinoPrincipalDireccion,
        },
        serviciosIds: serviceIds,
        estadoLote: 'calculado', // Start as calculated, then assign ambulance will make it 'asignado'
        // ambulanciaIdAsignada: ambulanceId, // This should be set in a separate step or by a different logic
        notasLote: loteDetails.notasLote,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Create a basic route for this new lot
      const newRoute: RutaCalculada = {
        id: `ruta-${newLote.id}`,
        loteId: newLote.id,
        paradas: buildParadasForRoute(newLote), // Build paradas from the serviceIds
        horaSalidaBaseEstimada: "08:00", // Default
        duracionTotalEstimadaMin: 0,
        distanciaTotalEstimadaKm: 0,
        optimizadaEn: new Date().toISOString(),
      };
      newRoute.duracionTotalEstimadaMin = newRoute.paradas.reduce((sum, parada) => sum + parada.tiempoTrasladoDesdeAnteriorMin + 20, 0);
      newRoute.distanciaTotalEstimadaKm = newRoute.paradas.length * 15;
      
      newLote.rutaCalculadaId = newRoute.id;
      mockLotes.push(newLote);
      mockRutas.push(newRoute);

      // Update the assigned services
      mockProgrammedTransportRequests.forEach(req => {
        if (serviceIds.includes(req.id)) {
          req.loteId = newLote.id;
          req.status = 'batched';
        }
      });
      resolve({...newLote}); // Return a copy
    }, 500);
  });
};

export const updateLoteServiciosMock = (loteId: string, newServiceIds: string[]): Promise<LoteProgramado | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const loteIndex = mockLotes.findIndex(l => l.id === loteId);
      if (loteIndex > -1) {
        mockLotes[loteIndex].serviciosIds = [...newServiceIds]; // Ensure it's a new array
        mockLotes[loteIndex].updatedAt = new Date().toISOString();
        mockLotes[loteIndex].estadoLote = 'modificado'; // Mark as modified, needs re-optimization/re-assignment

        // Invalidate or update route: for simplicity, we'll assume re-optimization is needed
        const rutaIndex = mockRutas.findIndex(r => r.loteId === loteId);
        if (rutaIndex > -1) {
            mockRutas[rutaIndex].paradas = buildParadasForRoute(mockLotes[loteIndex]);
            mockRutas[rutaIndex].optimizadaEn = new Date().toISOString();
            mockRutas[rutaIndex].duracionTotalEstimadaMin = mockRutas[rutaIndex].paradas.reduce((sum, p) => sum + p.tiempoTrasladoDesdeAnteriorMin + 20,0);
            mockRutas[rutaIndex].distanciaTotalEstimadaKm = mockRutas[rutaIndex].paradas.length * 15;
        }
        
        resolve({...mockLotes[loteIndex]});
      } else {
        resolve(null);
      }
    }, 250);
  });
};

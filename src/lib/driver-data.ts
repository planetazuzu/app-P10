
import type { AmbulanceType, AmbulanceStatus } from '@/types'; // Added AmbulanceType, AmbulanceStatus
import type { LoteProgramado, RutaCalculada, ParadaRuta, PacienteLote, DestinoLote, ProgrammedTransportRequest, ParadaEstado, MedioRequeridoProgramado, LoteCreateFormValues } from '@/types';
import { mockProgrammedTransportRequests, getProgrammedRequestsByLoteId, mapProgrammedRequestToParada as mapReqToParadaUtil } from './request-data'; // Import mapProgrammedRequestToParada

// Local fallback for mock data
const localSimpleMockAmbulances: {
  id: string;
  name: string;
  type: AmbulanceType;
  status: AmbulanceStatus;
  baseLocation: string;
  licensePlate: string;
  model: string;
  hasMedicalBed:boolean;
  stretcherSeats:number;
  hasWheelchair:boolean;
  wheelchairSeats:number;
  allowsWalking:boolean;
  walkingSeats:number;
  specialEquipment:string[];
}[] = [
  {
    id: 'mock-alfa-101',
    name: 'Alfa 101',
    type: "Convencional",
    status: "available",
    baseLocation: "Hospital San Pedro, Logroño",
    licensePlate: "RIO-0101",
    model: "Mercedes Sprinter",
    hasMedicalBed: true,
    stretcherSeats: 1,
    hasWheelchair: false,
    wheelchairSeats: 0,
    allowsWalking: true,
    walkingSeats: 3,
    specialEquipment: ["gps-navigation"],
  }
];

// mockPacientes and mockDestinos are now defined in request-data.ts
// mapProgrammedRequestToParada is now imported from request-data.ts


// Use the imported (and now correctly located) mapProgrammedRequestToParada
const buildParadasForRoute = (lote: LoteProgramado): ParadaRuta[] => {
    const serviciosDelLote = mockProgrammedTransportRequests.filter(req => lote.serviciosIds.includes(req.id));
    serviciosDelLote.sort((a, b) => (a.horaConsultaMedica || a.horaIda).localeCompare(b.horaConsultaMedica || b.horaIda));
    return serviciosDelLote.map((req, index) => mapReqToParadaUtil(req, index + 1)); // Use imported mapper
};

// Derive initialLoteDemo123ServiceIds from the already populated mockProgrammedTransportRequests
const initialLoteDemo123ServiceIds = mockProgrammedTransportRequests
    .filter(r => r.loteId === "lote-demo-123")
    .map(r => r.id);


export let mockRutas: RutaCalculada[] = [
  {
    id: "ruta-lote-demo-123",
    loteId: "lote-demo-123",
    horaSalidaBaseEstimada: "07:30",
    duracionTotalEstimadaMin: 0,
    distanciaTotalEstimadaKm: 0,
    optimizadaEn: new Date(Date.now() - 3600000 * 2).toISOString(),
    paradas: []
  },
];

export let mockLotes: LoteProgramado[] = [
  {
    id: "lote-demo-123",
    fechaServicio: new Date().toISOString().split('T')[0],
    // Use mockDestinos from request-data.ts if needed, or ensure it's defined locally or not needed for this part.
    // For simplicity, if mockDestinos was used here, it might need to be imported if it remains in request-data.ts,
    // or this part of mockLotes might need to be initialized after request-data.ts is fully loaded.
    // Let's assume mockDestinos is available via import or this part is simplified.
    // For now, this mock lote only needs `initialLoteDemo123ServiceIds`.
    // The `destinoPrincipal` should be derived from data now in `request-data.ts`.
    // To fully break the cycle, `mockDestinos` should be passed or defined in a common place.
    // For now, this will likely cause a new error if `mockDestinos` isn't available.
    // Let's hardcode for now to ensure this file initializes.
    destinoPrincipal: { id: "dest-hsp", nombre: "Hospital San Pedro", direccion: "Calle Piqueras 98, Logroño", detalles: "Consultas Externas" }, // Hardcoded for now
    serviciosIds: initialLoteDemo123ServiceIds,
    estadoLote: 'asignado',
    equipoMovilUserIdAsignado: 'user-vehiculo-AMB101',
    ambulanciaIdAsignada: localSimpleMockAmbulances.find(a => a.name.includes("Alfa 101"))?.id || "amb-1001",
    rutaCalculadaId: "ruta-lote-demo-123",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    notasLote: "Ruta optimizada para múltiples consultas en Hospital San Pedro y CARPA a lo largo del día."
  },
  {
    id: "lote-empty-789",
    fechaServicio: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    destinoPrincipal: { id: "dest-hcal", nombre: "Hospital de Calahorra", direccion: "Carretera de Logroño s/n, Calahorra", detalles: "Rehabilitación" }, // Hardcoded
    serviciosIds: [],
    estadoLote: 'pendienteCalculo',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date().toISOString(),
    notasLote: "Lote nuevo, pendiente de asignación de servicios."
  }
];
// Populate paradas for mockRutas after mockLotes is defined
mockRutas.forEach(ruta => {
    const lote = mockLotes.find(l => l.id === ruta.loteId);
    if (lote) {
        ruta.paradas = buildParadasForRoute(lote);
        ruta.duracionTotalEstimadaMin = ruta.paradas.reduce((sum, parada) => sum + parada.tiempoTrasladoDesdeAnteriorMin + 20, 0);
        ruta.distanciaTotalEstimadaKm = ruta.paradas.length * 15;
    }
});


export const getLotesMock = (): Promise<LoteProgramado[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockLotes]);
    }, 300);
  });
};


export const getLoteByIdMock = (loteId: string): Promise<LoteProgramado | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lote = mockLotes.find(l => l.id === loteId);
      resolve(lote ? {...lote} : null);
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
        ruta.paradas = buildParadasForRoute(lote);
        ruta.duracionTotalEstimadaMin = ruta.paradas.reduce((sum, parada) => sum + parada.tiempoTrasladoDesdeAnteriorMin + 20, 0);
        ruta.distanciaTotalEstimadaKm = ruta.paradas.length * 15;
        resolve({...ruta});
      } else if (lote.rutaCalculadaId) {
        const newRoute: RutaCalculada = {
            id: lote.rutaCalculadaId,
            loteId: lote.id,
            paradas: buildParadasForRoute(lote),
            horaSalidaBaseEstimada: "08:00",
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

            resolve({...ruta.paradas[paradaIndex]});
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
      resolve({...newLote});
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
        estadoLote: 'calculado',
        notasLote: loteDetails.notasLote,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const newRoute: RutaCalculada = {
        id: `ruta-${newLote.id}`,
        loteId: newLote.id,
        paradas: buildParadasForRoute(newLote),
        horaSalidaBaseEstimada: "08:00",
        duracionTotalEstimadaMin: 0,
        distanciaTotalEstimadaKm: 0,
        optimizadaEn: new Date().toISOString(),
      };
      newRoute.duracionTotalEstimadaMin = newRoute.paradas.reduce((sum, parada) => sum + parada.tiempoTrasladoDesdeAnteriorMin + 20, 0);
      newRoute.distanciaTotalEstimadaKm = newRoute.paradas.length * 15;

      newLote.rutaCalculadaId = newRoute.id;
      mockLotes.push(newLote);
      mockRutas.push(newRoute);

      mockProgrammedTransportRequests.forEach(req => {
        if (serviceIds.includes(req.id)) {
          req.loteId = newLote.id;
          req.status = 'batched';
        }
      });
      resolve({...newLote});
    }, 500);
  });
};

export const updateLoteServiciosMock = (loteId: string, newServiceIds: string[]): Promise<LoteProgramado | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const loteIndex = mockLotes.findIndex(l => l.id === loteId);
      if (loteIndex > -1) {
        mockLotes[loteIndex].serviciosIds = [...newServiceIds];
        mockLotes[loteIndex].updatedAt = new Date().toISOString();
        mockLotes[loteIndex].estadoLote = 'modificado';

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

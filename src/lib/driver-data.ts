
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


const buildParadasForRoute = (lote: LoteProgramado): ParadaRuta[] => {
    const serviciosDelLote = mockProgrammedTransportRequests.filter(req => lote.serviciosIds.includes(req.id));
    serviciosDelLote.sort((a, b) => (a.horaConsultaMedica || a.horaIda).localeCompare(b.horaConsultaMedica || b.horaIda));
    return serviciosDelLote.map((req, index) => mapReqToParadaUtil(req, index + 1));
};

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
    destinoPrincipal: { id: "dest-hsp", nombre: "Hospital San Pedro", direccion: "Calle Piqueras 98, Logroño", detalles: "Consultas Externas" },
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
    destinoPrincipal: { id: "dest-hcal", nombre: "Hospital de Calahorra", direccion: "Carretera de Logroño s/n, Calahorra", detalles: "Rehabilitación" },
    serviciosIds: [],
    estadoLote: 'pendienteCalculo',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date().toISOString(),
    notasLote: "Lote nuevo, pendiente de asignación de servicios."
  }
];

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


export const getLoteByIdMock = (loteId: string, equipoMovilUserId?: string): Promise<LoteProgramado | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lote = mockLotes.find(l => l.id === loteId);
      if (lote) {
        if (equipoMovilUserId && lote.equipoMovilUserIdAsignado !== equipoMovilUserId) {
          console.warn(`Lote ${loteId} no está asignado al equipo móvil ${equipoMovilUserId}. Asignado a: ${lote.equipoMovilUserIdAsignado}`);
          resolve(null);
        } else {
          resolve({...lote});
        }
      } else {
        console.warn(`Lote con ID ${loteId} no encontrado en getLoteByIdMock.`);
        resolve(null);
      }
    }, 300);
  });
};

export const getRutaCalculadaByLoteIdMock = (loteId: string, rutaId?: string): Promise<RutaCalculada | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lote = mockLotes.find(l => l.id === loteId);
      if (!lote) {
        console.warn(`Lote con ID ${loteId} no encontrado al intentar obtener ruta calculada.`);
        resolve(null);
        return;
      }

      let ruta = mockRutas.find(r => r.loteId === loteId && (!rutaId || r.id === rutaId));

      if (ruta) {
        // Siempre reconstruir paradas para reflejar el estado actual de los ProgrammedTransportRequest
        ruta.paradas = buildParadasForRoute(lote);
        ruta.duracionTotalEstimadaMin = ruta.paradas.reduce((sum, parada) => sum + parada.tiempoTrasladoDesdeAnteriorMin + 20, 0);
        ruta.distanciaTotalEstimadaKm = ruta.paradas.length * 15; // Simplificación
        resolve({...ruta});
      } else if (lote.rutaCalculadaId) {
        console.log(`No se encontró ruta existente para lote ${loteId} con rutaCalculadaId ${lote.rutaCalculadaId}. Creando una nueva ruta simulada.`);
        const newRoute: RutaCalculada = {
            id: lote.rutaCalculadaId,
            loteId: lote.id,
            paradas: buildParadasForRoute(lote),
            horaSalidaBaseEstimada: "08:00", // Valor por defecto
            duracionTotalEstimadaMin: 0, // Se calculará
            distanciaTotalEstimadaKm: 0, // Se calculará
            optimizadaEn: new Date().toISOString(),
        };
        newRoute.duracionTotalEstimadaMin = newRoute.paradas.reduce((sum, parada) => sum + parada.tiempoTrasladoDesdeAnteriorMin + 20, 0);
        newRoute.distanciaTotalEstimadaKm = newRoute.paradas.length * 15; // Simplificación
        mockRutas.push(newRoute);
        resolve({...newRoute});
      }
       else {
        console.warn(`Lote ${loteId} no tiene rutaCalculadaId y no se encontró ruta existente.`);
        resolve(null);
      }
    }, 300);
  });
};

export const updateParadaEstadoMock = (loteId: string, servicioId: string, newStatus: ParadaEstado): Promise<ParadaRuta | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const rutaIndex = mockRutas.findIndex(r => r.loteId === loteId);
        if (rutaIndex === -1) {
          console.error(`No se encontró ruta para el lote ID: ${loteId} en updateParadaEstadoMock.`);
          resolve(null);
          return;
        }
        const ruta = mockRutas[rutaIndex];
        const paradaIndex = ruta.paradas.findIndex(p => p.servicioId === servicioId);

        if (paradaIndex === -1) {
          console.error(`No se encontró parada con servicio ID: ${servicioId} en la ruta del lote ${loteId}.`);
          resolve(null);
          return;
        }

        // Actualizar estado de la parada en mockRutas
        ruta.paradas[paradaIndex].estado = newStatus;
        const now = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        if (newStatus === 'enRutaRecogida') ruta.paradas[paradaIndex].horaRealLlegadaRecogida = undefined; // Reset
        if (newStatus === 'pacienteRecogido') ruta.paradas[paradaIndex].horaRealSalidaRecogida = now;
        if (newStatus === 'enDestino') ruta.paradas[paradaIndex].horaRealLlegadaDestino = now;


        // Actualizar estado del ProgrammedTransportRequest correspondiente
        const serviceReqIndex = mockProgrammedTransportRequests.findIndex(req => req.id === servicioId);
        if (serviceReqIndex !== -1) {
            if (newStatus === 'finalizado') mockProgrammedTransportRequests[serviceReqIndex].status = 'completed';
            else if (newStatus === 'cancelado') mockProgrammedTransportRequests[serviceReqIndex].status = 'cancelled';
            // Podríamos mapear otros estados de ParadaEstado a RequestStatus si fuera necesario.
            // Por ahora, 'transporting', 'on-scene', etc., se mantienen como 'batched' o el estado que tuviera el lote.
        } else {
            console.warn(`No se encontró ProgrammedTransportRequest con ID: ${servicioId} para actualizar su estado general.`);
        }

        // Verificar si todas las paradas del lote están finalizadas para completar el lote
        const allStopsFinalized = ruta.paradas.every(p => ['finalizado', 'cancelado', 'noPresentado'].includes(p.estado));
        if (allStopsFinalized) {
            const loteIndex = mockLotes.findIndex(l => l.id === loteId);
            if (loteIndex !== -1 && mockLotes[loteIndex].estadoLote !== 'completado') {
                mockLotes[loteIndex].estadoLote = 'completado';
                mockLotes[loteIndex].updatedAt = new Date().toISOString();
                console.log(`Lote ${loteId} marcado como completado.`);
            }
        }
        
        resolve({...ruta.paradas[paradaIndex]});
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
        estadoLote: 'calculado', // Estado inicial podría ser 'calculado' o 'pendienteCalculo'
        notasLote: loteDetails.notasLote,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Crear y asociar una ruta para este nuevo lote
      const newRoute: RutaCalculada = {
        id: `ruta-${newLote.id}`,
        loteId: newLote.id,
        paradas: buildParadasForRoute(newLote),
        horaSalidaBaseEstimada: "08:00", // Default
        duracionTotalEstimadaMin: 0, // Placeholder, se calcula abajo
        distanciaTotalEstimadaKm: 0, // Placeholder, se calcula abajo
        optimizadaEn: new Date().toISOString(),
      };
      newRoute.duracionTotalEstimadaMin = newRoute.paradas.reduce((sum, parada) => sum + parada.tiempoTrasladoDesdeAnteriorMin + 20, 0);
      newRoute.distanciaTotalEstimadaKm = newRoute.paradas.length * 15; // Simple mock calculation

      newLote.rutaCalculadaId = newRoute.id;
      mockLotes.push(newLote);
      mockRutas.push(newRoute);

      // Actualizar el estado de los servicios programados a 'batched' y asignarles el loteId
      mockProgrammedTransportRequests.forEach(req => {
        if (serviceIds.includes(req.id)) {
          req.loteId = newLote.id;
          req.status = 'batched'; // Marcar como parte de un lote
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
        // Actualizar IDs de servicios en el lote
        mockLotes[loteIndex].serviciosIds = [...newServiceIds];
        mockLotes[loteIndex].updatedAt = new Date().toISOString();
        mockLotes[loteIndex].estadoLote = 'modificado'; // Marcar como modificado

        // Reconstruir y actualizar las paradas de la ruta asociada
        const rutaIndex = mockRutas.findIndex(r => r.loteId === loteId);
        if (rutaIndex > -1) {
            mockRutas[rutaIndex].paradas = buildParadasForRoute(mockLotes[loteIndex]);
            mockRutas[rutaIndex].optimizadaEn = new Date().toISOString(); // Marcar como re-optimizada (simulado)
            // Recalcular duración y distancia
            mockRutas[rutaIndex].duracionTotalEstimadaMin = mockRutas[rutaIndex].paradas.reduce((sum, p) => sum + p.tiempoTrasladoDesdeAnteriorMin + 20,0);
            mockRutas[rutaIndex].distanciaTotalEstimadaKm = mockRutas[rutaIndex].paradas.length * 15; // Simple mock
        } else {
            // Si no hay ruta, y ahora hay servicios, se podría crear una nueva (más complejo)
            // Por ahora, asumimos que la ruta existe si el lote existía.
            console.warn(`Ruta no encontrada para lote ${loteId} al actualizar servicios, pero debería existir si el lote existe.`);
        }

        resolve({...mockLotes[loteIndex]});
      } else {
        resolve(null);
      }
    }, 250);
  });
};

    
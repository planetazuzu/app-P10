
import type { LoteProgramado, RutaCalculada, ParadaRuta, PacienteLote, DestinoLote, ProgrammedTransportRequest, ParadaEstado, MedioRequeridoProgramado, LoteCreateFormValues } from '@/types';
import { mockProgrammedTransportRequests } from './request-data'; 
import { fallbackMockAmbulances } from './ambulance-data'; // Usar fallback para los nombres

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

// Generate some ProgrammedTransportRequests if mockProgrammedTransportRequests is empty
if (mockProgrammedTransportRequests.length === 0) {
    const today = new Date().toISOString().split('T')[0];
    const pacienteIds = Object.keys(mockPacientes);
    
    const createMockRequest = (pId: string, loteId: string, index: number, destinoKey: keyof typeof mockDestinos, horaCita: string, observaciones?: string): ProgrammedTransportRequest => ({
        id: `prog-req-${loteId}-${pId.split('-')[1]}`, // Use patient number for consistency
        requesterId: 'user-centro-coordinador-01', // Example requester (coordinador)
        status: 'batched', // Initially batched
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        nombrePaciente: mockPacientes[pId].nombre,
        dniNieSsPaciente: `Y0${1234560+index}${String.fromCharCode(65+index)}`, 
        patientId: pId,
        tipoServicio: 'consulta',
        tipoTraslado: 'idaYVuelta', 
        centroOrigen: mockPacientes[pId].direccionOrigen,
        destino: mockDestinos[destinoKey].nombre,
        destinoId: mockDestinos[destinoKey].id,
        fechaIda: today,
        horaIda: `${String(parseInt(horaCita.split(':')[0]) - 1).padStart(2,'0')}:${horaCita.split(':')[1]}`, 
        horaConsultaMedica: horaCita,
        medioRequerido: mockPacientes[pId].medioRequerido,
        priority: 'low',
        loteId: loteId,
        observacionesMedicasAdicionales: observaciones || mockPacientes[pId].observaciones,
    });
    
    pacienteIds.forEach((pId, index) => {
        const destino = index % 2 === 0 ? "dest-hsp" : "dest-carpa";
        const hora = 9 + Math.floor(index / 2); // 9:00, 9:00, 10:00, 10:00 etc.
        const minutos = (index % 2) * 30; // 00 or 30
        mockProgrammedTransportRequests.push(createMockRequest(pId, "lote-demo-123", index + 1, destino as keyof typeof mockDestinos, `${String(hora).padStart(2,'0')}:${String(minutos).padStart(2,'0')}`));
    });
}


const mockRutas: RutaCalculada[] = [
  {
    id: "ruta-lote-demo-123",
    loteId: "lote-demo-123",
    horaSalidaBaseEstimada: "07:45",
    duracionTotalEstimadaMin: 480, 
    distanciaTotalEstimadaKm: 115,
    optimizadaEn: new Date(Date.now() - 3600000 * 2).toISOString(), 
    paradas: mockProgrammedTransportRequests
                .filter(r => r.loteId === "lote-demo-123")
                .sort((a,b) => (a.horaConsultaMedica || a.horaIda).localeCompare(b.horaConsultaMedica || b.horaIda))
                .map((req, index) => ({
                    servicioId: req.id,
                    paciente: mockPacientes[req.patientId!] || {id: req.patientId!, nombre: req.nombrePaciente, direccionOrigen: req.centroOrigen, medioRequerido: req.medioRequerido},
                    horaConsultaMedica: req.horaConsultaMedica || req.horaIda,
                    horaRecogidaEstimada: `${String(parseInt((req.horaConsultaMedica || req.horaIda).split(':')[0]) -1).padStart(2,'0')}:${(req.horaConsultaMedica || req.horaIda).split(':')[1]}`,
                    horaLlegadaDestinoEstimada: req.horaConsultaMedica || req.horaIda,
                    tiempoTrasladoDesdeAnteriorMin: index === 0 ? 45 : 20 + Math.floor(Math.random() * 15),
                    orden: index + 1,
                    estado: 'pendiente' as ParadaEstado,
                    notasParada: `Notas para ${req.nombrePaciente}. Destino ${req.destino}.`
                }))
  },
  {
    id: "ruta-lote-secondary-456",
    loteId: "lote-secondary-456",
    horaSalidaBaseEstimada: "09:00",
    duracionTotalEstimadaMin: 180,
    distanciaTotalEstimadaKm: 60,
    optimizadaEn: new Date(Date.now() - 3600000 * 5).toISOString(), 
    paradas: [
        { servicioId: "prog-req-lote-secondary-456-001", paciente: {id: "pac-temp-001", nombre: "Paciente Temporal 1", direccionOrigen: "Calle Rio Oja 1, Logroño", medioRequerido: "andando"}, horaConsultaMedica: "10:00", horaRecogidaEstimada: "09:15", horaLlegadaDestinoEstimada: "09:45", tiempoTrasladoDesdeAnteriorMin: 15, orden: 1, estado: 'pendiente'},
        { servicioId: "prog-req-lote-secondary-456-002", paciente: {id: "pac-temp-002", nombre: "Paciente Temporal 2", direccionOrigen: "Calle Chile 30, Logroño", medioRequerido: "sillaDeRuedas"}, horaConsultaMedica: "11:00", horaRecogidaEstimada: "10:00", horaLlegadaDestinoEstimada: "10:45", tiempoTrasladoDesdeAnteriorMin: 20, orden: 2, estado: 'pendiente'},
    ]
  }
];

export let mockLotes: LoteProgramado[] = [
  {
    id: "lote-demo-123",
    fechaServicio: new Date().toISOString().split('T')[0], 
    destinoPrincipal: mockDestinos["dest-hsp"], 
    serviciosIds: mockProgrammedTransportRequests.filter(r => r.loteId === "lote-demo-123").map(r => r.id),
    estadoLote: 'asignado',
    equipoMovilUserIdAsignado: 'user-vehiculo-AMB101', 
    ambulanciaIdAsignada: fallbackMockAmbulances.find(a => a.name.includes("Alfa 101") && a.status === 'available')?.id || fallbackMockAmbulances.find(a=> a.status === 'available')?.id || "amb-1001", 
    rutaCalculadaId: "ruta-lote-demo-123",
    createdAt: new Date(Date.now() - 86400000).toISOString(), 
    updatedAt: new Date().toISOString(),
    notasLote: "Ruta optimizada para múltiples consultas en Hospital San Pedro y CARPA a lo largo del día."
  },
  {
    id: "lote-secondary-456",
    fechaServicio: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    destinoPrincipal: mockDestinos["dest-carpa"],
    serviciosIds: mockProgrammedTransportRequests.filter(r => r.loteId === "lote-secondary-456").map(r => r.id),
    estadoLote: 'pendienteCalculo',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    notasLote: "Lote para mañana, pendiente de asignación y optimización de ruta."
  }
];

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
      resolve(lote || null);
    }, 300);
  });
};

export const getRutaCalculadaByLoteIdMock = (loteId: string, rutaId?: string): Promise<RutaCalculada | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const ruta = mockRutas.find(r => r.loteId === loteId && (!rutaId || r.id === rutaId));
      resolve(ruta || null);
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
            if (newStatus === 'enRutaRecogida') ruta.paradas[paradaIndex].horaRealLlegadaRecogida = undefined; // Clear previous times if restarting
            if (newStatus === 'pacienteRecogido') ruta.paradas[paradaIndex].horaRealSalidaRecogida = now;
            if (newStatus === 'enDestino') ruta.paradas[paradaIndex].horaRealLlegadaDestino = now;
            
            resolve(ruta.paradas[paradaIndex]);
            return;
          }
        }
        resolve(null);
      }, 200);
    });
  };

// Tipo para los datos que vienen del formulario, que solo tiene fecha
interface LoteCreateDataFromForm {
  fechaServicio: Date; // Viene como objeto Date del formulario
  destinoPrincipalNombre: string;
  destinoPrincipalDireccion: string;
  notasLote?: string;
}


// Modificada para que coincida con la llamada desde NewLotePage
export const createLoteMock = (
  loteData: Omit<LoteProgramado, 'id' | 'createdAt' | 'updatedAt' | 'serviciosIds' | 'estadoLote' | 'fechaServicio'> & { fechaServicio: Date }
): Promise<LoteProgramado> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newLote: LoteProgramado = {
        id: `lote-${Date.now()}`,
        fechaServicio: loteData.fechaServicio.toISOString().split('T')[0], // Convertir Date a string YYYY-MM-DD
        destinoPrincipal: loteData.destinoPrincipal,
        serviciosIds: [], 
        estadoLote: 'pendienteCalculo',
        notasLote: loteData.notasLote,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockLotes.push(newLote);
      resolve(newLote);
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
        estadoLote: 'asignado', 
        ambulanciaIdAsignada: ambulanceId,
        notasLote: loteDetails.notasLote,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockLotes.push(newLote);

      mockProgrammedTransportRequests.forEach(req => {
        if (serviceIds.includes(req.id)) {
          req.loteId = newLote.id;
          req.status = 'batched';
        }
      });
      resolve(newLote);
    }, 500);
  });
};

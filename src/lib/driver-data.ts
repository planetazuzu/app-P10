
import type { LoteProgramado, RutaCalculada, ParadaRuta, PacienteLote, DestinoLote, ProgrammedTransportRequest, ParadaEstado } from '@/types';
import { mockProgrammedTransportRequests } from './request-data'; // Assuming this is where they are
import { mockAmbulances } from './ambulance-data';

// Mock Data
const mockPacientes: Record<string, PacienteLote> = {
  "pac-001": { id: "pac-001", nombre: "Ana Pérez García", direccionOrigen: "Calle Falsa 123, Logroño", contacto: "600111222", observaciones: "Requiere ayuda para subir escalón.", medioRequerido: "andando" },
  "pac-002": { id: "pac-002", nombre: "Juan Rodríguez López", direccionOrigen: "Avenida de la Paz 50, Calahorra", medioRequerido: "sillaDeRuedas" },
  "pac-003": { id: "pac-003", nombre: "María Sánchez Martín", direccionOrigen: "Plaza del Ayuntamiento 1, Haro", contacto: "600333444", observaciones: "Paciente con movilidad reducida.", medioRequerido: "camilla" },
  "pac-004": { id: "pac-004", nombre: "Carlos Gómez Ruiz", direccionOrigen: "Paseo del Espolón 2, Logroño", medioRequerido: "andando"},
};

const mockDestinos: Record<string, DestinoLote> = {
  "dest-hsp": { id: "dest-hsp", nombre: "Hospital San Pedro", direccion: "Calle Piqueras 98, Logroño", detalles: "Consultas Externas, Planta 2" },
  "dest-hcal": { id: "dest-hcal", nombre: "Hospital de Calahorra", direccion: "Carretera de Logroño s/n, Calahorra", detalles: "Rehabilitación" },
  "dest-carpa": {id: "dest-carpa", nombre: "CARPA (Centro de Alta Resolución)", direccion: "Av. de la República Argentina, 55, Logroño", detalles: "Consultas varias"},
};

// Generate some ProgrammedTransportRequests if mockProgrammedTransportRequests is empty
if (mockProgrammedTransportRequests.length === 0) {
    const today = new Date().toISOString().split('T')[0];
    const pacienteIds = Object.keys(mockPacientes);
    
    const createMockRequest = (pId: string, loteId: string, index: number, destinoKey: keyof typeof mockDestinos): ProgrammedTransportRequest => ({
        id: `prog-req-${loteId}-${index}`,
        requesterId: 'user-hospital', // Example requester
        status: 'batched', // Initially batched
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        nombrePaciente: mockPacientes[pId].nombre,
        dniNieSsPaciente: `Y${1234560+index}${String.fromCharCode(65+index)}`,
        patientId: pId,
        tipoServicio: 'consulta',
        tipoTraslado: 'idaYVuelta', // For simplicity, all are idaYVuelta
        centroOrigen: mockPacientes[pId].direccionOrigen,
        destino: mockDestinos[destinoKey].nombre,
        destinoId: mockDestinos[destinoKey].id,
        fechaIda: today,
        horaIda: `${10+index}:00`, // Staggered times
        horaConsultaMedica: `${11+index}:00`,
        medioRequerido: mockPacientes[pId].medioRequerido,
        priority: 'low',
        loteId: loteId,
    });

    mockProgrammedTransportRequests.push(createMockRequest(pacienteIds[0], "lote-demo-123", 1, "dest-hsp"));
    mockProgrammedTransportRequests.push(createMockRequest(pacienteIds[1], "lote-demo-123", 2, "dest-hsp"));
    mockProgrammedTransportRequests.push(createMockRequest(pacienteIds[2], "lote-demo-123", 3, "dest-carpa"));
     mockProgrammedTransportRequests.push(createMockRequest(pacienteIds[3], "lote-demo-123", 4, "dest-hsp"));
}


const mockRutas: RutaCalculada[] = [
  {
    id: "ruta-lote-demo-123",
    loteId: "lote-demo-123",
    horaSalidaBaseEstimada: "09:30",
    duracionTotalEstimadaMin: 240, // 4 hours
    optimizadaEn: new Date().toISOString(),
    paradas: [
      { servicioId: mockProgrammedTransportRequests.find(r=>r.loteId === "lote-demo-123" && r.patientId === "pac-001")?.id || "prog-req-error-1", paciente: mockPacientes["pac-001"], horaConsultaMedica: "11:00", horaRecogidaEstimada: "10:00", horaLlegadaDestinoEstimada: "10:45", tiempoTrasladoDesdeAnteriorMin: 30, orden: 1, estado: 'pendiente' },
      { servicioId: mockProgrammedTransportRequests.find(r=>r.loteId === "lote-demo-123" && r.patientId === "pac-002")?.id || "prog-req-error-2", paciente: mockPacientes["pac-002"], horaConsultaMedica: "12:00", horaRecogidaEstimada: "10:50", horaLlegadaDestinoEstimada: "11:35", tiempoTrasladoDesdeAnteriorMin: 15, orden: 2, estado: 'pendiente' },
      { servicioId: mockProgrammedTransportRequests.find(r=>r.loteId === "lote-demo-123" && r.patientId === "pac-004")?.id || "prog-req-error-4", paciente: mockPacientes["pac-004"], horaConsultaMedica: "13:00", horaRecogidaEstimada: "11:45", horaLlegadaDestinoEstimada: "12:30", tiempoTrasladoDesdeAnteriorMin: 20, orden: 3, estado: 'pendiente' },
      { servicioId: mockProgrammedTransportRequests.find(r=>r.loteId === "lote-demo-123" && r.patientId === "pac-003")?.id || "prog-req-error-3", paciente: mockPacientes["pac-003"], horaConsultaMedica: "14:00", horaRecogidaEstimada: "12:40", horaLlegadaDestinoEstimada: "13:35", tiempoTrasladoDesdeAnteriorMin: 25, orden: 4, estado: 'pendiente', notasParada: "Precaución: Acceso con escalones, usar silla oruga si es necesario." },
    ]
  }
];

const mockLotes: LoteProgramado[] = [
  {
    id: "lote-demo-123",
    fechaServicio: new Date().toISOString().split('T')[0], // Today
    destinoPrincipal: mockDestinos["dest-hsp"],
    serviciosIds: mockProgrammedTransportRequests.filter(r => r.loteId === "lote-demo-123").map(r => r.id),
    estadoLote: 'asignado',
    equipoMovilUserIdAsignado: 'user-vehiculo-AMB101', // Matches the mock Equipo Móvil user
    ambulanciaIdAsignada: mockAmbulances.find(a => a.name.includes("Águila Sanitaria"))?.id || "amb-1001", // Example ambulance ID
    rutaCalculadaId: "ruta-lote-demo-123",
    createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    updatedAt: new Date().toISOString(),
    notasLote: "Ruta optimizada para consultas matutinas en Hospital San Pedro y CARPA."
  }
];


// Mock API functions
export const getLoteByIdMock = (loteId: string, equipoMovilUserId: string): Promise<LoteProgramado | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lote = mockLotes.find(l => l.id === loteId && l.equipoMovilUserIdAsignado === equipoMovilUserId);
      resolve(lote || null);
    }, 300);
  });
};

export const getRutaCalculadaByLoteIdMock = (loteId: string, rutaId: string): Promise<RutaCalculada | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const ruta = mockRutas.find(r => r.loteId === loteId && r.id === rutaId);
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
            // Simulate adding timestamps based on status
            const now = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            if (newStatus === 'enRutaRecogida') ruta.paradas[paradaIndex].horaRealLlegadaRecogida = undefined; // Clear previous if re-starting
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

    
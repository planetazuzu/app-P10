
import type { LoteProgramado, RutaCalculada, ParadaRuta, PacienteLote, DestinoLote, ProgrammedTransportRequest, ParadaEstado, MedioRequeridoProgramado } from '@/types';
import { mockProgrammedTransportRequests } from './request-data'; // Assuming this is where they are
import { mockAmbulances } from './ambulance-data';

// Mock Data
const mockPacientes: Record<string, PacienteLote> = {
  "pac-001": { id: "pac-001", nombre: "Ana Pérez García", direccionOrigen: "Calle Falsa 123, Logroño", contacto: "600111222", observaciones: "Requiere ayuda para subir escalón.", medioRequerido: "andando" },
  "pac-002": { id: "pac-002", nombre: "Juan Rodríguez López", direccionOrigen: "Avenida de la Paz 50, Calahorra", medioRequerido: "sillaDeRuedas" },
  "pac-003": { id: "pac-003", nombre: "María Sánchez Martín", direccionOrigen: "Plaza del Ayuntamiento 1, Haro", contacto: "600333444", observaciones: "Paciente con movilidad reducida.", medioRequerido: "camilla" },
  "pac-004": { id: "pac-004", nombre: "Carlos Gómez Ruiz", direccionOrigen: "Paseo del Espolón 2, Logroño", medioRequerido: "andando"},
  "pac-005": { id: "pac-005", nombre: "Laura Martínez Soler", direccionOrigen: "Calle San Agustín 22, Logroño", contacto: "600555666", observaciones: "Alérgica a AINES.", medioRequerido: "andando" },
  "pac-006": { id: "pac-006", nombre: "Pedro Jiménez Vega", direccionOrigen: "Avenida de Colón 10, Logroño", observaciones: "Traslado post-operatorio, delicado.", medioRequerido: "camilla" },
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
    
    const createMockRequest = (pId: string, loteId: string, index: number, destinoKey: keyof typeof mockDestinos, horaCita: string, observaciones?: string): ProgrammedTransportRequest => ({
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
        horaIda: `${parseInt(horaCita.split(':')[0]) - 1}:${horaCita.split(':')[1]}`, // Recogida 1h antes
        horaConsultaMedica: horaCita,
        medioRequerido: mockPacientes[pId].medioRequerido,
        priority: 'low',
        loteId: loteId,
        observacionesMedicasAdicionales: observaciones || mockPacientes[pId].observaciones,
    });

    mockProgrammedTransportRequests.push(createMockRequest(pacienteIds[0], "lote-demo-123", 1, "dest-hsp", "11:00"));
    mockProgrammedTransportRequests.push(createMockRequest(pacienteIds[1], "lote-demo-123", 2, "dest-hsp", "12:00"));
    mockProgrammedTransportRequests.push(createMockRequest(pacienteIds[3], "lote-demo-123", 4, "dest-hsp", "13:00")); // Carlos
    mockProgrammedTransportRequests.push(createMockRequest(pacienteIds[2], "lote-demo-123", 3, "dest-carpa", "14:00")); // Maria
    mockProgrammedTransportRequests.push(createMockRequest(pacienteIds[4], "lote-demo-123", 5, "dest-hsp", "10:30")); // Laura
    mockProgrammedTransportRequests.push(createMockRequest(pacienteIds[5], "lote-demo-123", 6, "dest-carpa", "15:00")); // Pedro
}


const mockRutas: RutaCalculada[] = [
  {
    id: "ruta-lote-demo-123",
    loteId: "lote-demo-123",
    horaSalidaBaseEstimada: "08:30",
    duracionTotalEstimadaMin: 330, // 5.5 hours
    distanciaTotalEstimadaKm: 68,
    optimizadaEn: new Date(Date.now() - 3600000 * 3).toISOString(), // Hace 3 horas
    paradas: [
      { servicioId: mockProgrammedTransportRequests.find(r=>r.loteId === "lote-demo-123" && r.patientId === "pac-005")?.id || "prog-req-error-5", paciente: mockPacientes["pac-005"], horaConsultaMedica: "10:30", horaRecogidaEstimada: "09:30", horaLlegadaDestinoEstimada: "10:15", tiempoTrasladoDesdeAnteriorMin: 60, orden: 1, estado: 'pendiente', notasParada: "Recoger primero, cita más temprana." },
      { servicioId: mockProgrammedTransportRequests.find(r=>r.loteId === "lote-demo-123" && r.patientId === "pac-001")?.id || "prog-req-error-1", paciente: mockPacientes["pac-001"], horaConsultaMedica: "11:00", horaRecogidaEstimada: "10:20", horaLlegadaDestinoEstimada: "10:50", tiempoTrasladoDesdeAnteriorMin: 25, orden: 2, estado: 'pendiente', notasParada: "Asegurar que el paciente ha tomado su medicación matutina." },
      { servicioId: mockProgrammedTransportRequests.find(r=>r.loteId === "lote-demo-123" && r.patientId === "pac-002")?.id || "prog-req-error-2", paciente: mockPacientes["pac-002"], horaConsultaMedica: "12:00", horaRecogidaEstimada: "11:00", horaLlegadaDestinoEstimada: "11:45", tiempoTrasladoDesdeAnteriorMin: 20, orden: 3, estado: 'pendiente' },
      { servicioId: mockProgrammedTransportRequests.find(r=>r.loteId === "lote-demo-123" && r.patientId === "pac-004")?.id || "prog-req-error-4", paciente: mockPacientes["pac-004"], horaConsultaMedica: "13:00", horaRecogidaEstimada: "12:00", horaLlegadaDestinoEstimada: "12:40", tiempoTrasladoDesdeAnteriorMin: 20, orden: 4, estado: 'pendiente' },
      { servicioId: mockProgrammedTransportRequests.find(r=>r.loteId === "lote-demo-123" && r.patientId === "pac-003")?.id || "prog-req-error-3", paciente: mockPacientes["pac-003"], horaConsultaMedica: "14:00", horaRecogidaEstimada: "12:50", horaLlegadaDestinoEstimada: "13:45", tiempoTrasladoDesdeAnteriorMin: 25, orden: 5, estado: 'pendiente', notasParada: "Precaución: Acceso con escalones, usar silla oruga si es necesario. Destino CARPA." },
      { servicioId: mockProgrammedTransportRequests.find(r=>r.loteId === "lote-demo-123" && r.patientId === "pac-006")?.id || "prog-req-error-6", paciente: mockPacientes["pac-006"], horaConsultaMedica: "15:00", horaRecogidaEstimada: "14:00", horaLlegadaDestinoEstimada: "14:45", tiempoTrasladoDesdeAnteriorMin: 30, orden: 6, estado: 'pendiente', notasParada: "Paciente muy sensible al movimiento. Conducir con suavidad. Destino CARPA." },
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

    

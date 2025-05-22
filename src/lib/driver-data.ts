
import type { LoteProgramado, RutaCalculada, ParadaRuta, PacienteLote, DestinoLote, ProgrammedTransportRequest, ParadaEstado, MedioRequeridoProgramado } from '@/types';
import { mockProgrammedTransportRequests } from './request-data'; 
import { mockAmbulances } from './ambulance-data';

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
        requesterId: 'user-hospital', // Example requester
        status: 'batched', // Initially batched
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        nombrePaciente: mockPacientes[pId].nombre,
        dniNieSsPaciente: `Y0${1234560+index}${String.fromCharCode(65+index)}`, // ensure DNI is unique enough
        patientId: pId,
        tipoServicio: 'consulta',
        tipoTraslado: 'idaYVuelta', 
        centroOrigen: mockPacientes[pId].direccionOrigen,
        destino: mockDestinos[destinoKey].nombre,
        destinoId: mockDestinos[destinoKey].id,
        fechaIda: today,
        horaIda: `${String(parseInt(horaCita.split(':')[0]) - 1).padStart(2,'0')}:${horaCita.split(':')[1]}`, // Recogida 1h antes
        horaConsultaMedica: horaCita,
        medioRequerido: mockPacientes[pId].medioRequerido,
        priority: 'low',
        loteId: loteId,
        observacionesMedicasAdicionales: observaciones || mockPacientes[pId].observaciones,
    });
    
    // Ensure all 10 patients get a request for lote-demo-123
    mockProgrammedTransportRequests.push(createMockRequest(pacienteIds[0], "lote-demo-123", 1, "dest-hsp", "11:00")); // Ana Perez
    mockProgrammedTransportRequests.push(createMockRequest(pacienteIds[1], "lote-demo-123", 2, "dest-hsp", "12:00")); // Juan Rodriguez
    mockProgrammedTransportRequests.push(createMockRequest(pacienteIds[2], "lote-demo-123", 3, "dest-carpa", "14:00")); // Maria Sanchez
    mockProgrammedTransportRequests.push(createMockRequest(pacienteIds[3], "lote-demo-123", 4, "dest-hsp", "13:00")); // Carlos Gomez
    mockProgrammedTransportRequests.push(createMockRequest(pacienteIds[4], "lote-demo-123", 5, "dest-hsp", "10:30")); // Laura Martinez
    mockProgrammedTransportRequests.push(createMockRequest(pacienteIds[5], "lote-demo-123", 6, "dest-carpa", "15:00")); // Pedro Jimenez
    mockProgrammedTransportRequests.push(createMockRequest(pacienteIds[6], "lote-demo-123", 7, "dest-hsp", "09:30")); // Elena Navarro
    mockProgrammedTransportRequests.push(createMockRequest(pacienteIds[7], "lote-demo-123", 8, "dest-carpa", "11:30")); // Roberto Sanz
    mockProgrammedTransportRequests.push(createMockRequest(pacienteIds[8], "lote-demo-123", 9, "dest-hsp", "16:00")); // Isabel Torres
    mockProgrammedTransportRequests.push(createMockRequest(pacienteIds[9], "lote-demo-123", 10, "dest-carpa", "10:00")); // David Alonso
}


const mockRutas: RutaCalculada[] = [
  {
    id: "ruta-lote-demo-123",
    loteId: "lote-demo-123",
    horaSalidaBaseEstimada: "07:45",
    duracionTotalEstimadaMin: 480, // 8 hours
    distanciaTotalEstimadaKm: 115,
    optimizadaEn: new Date(Date.now() - 3600000 * 2).toISOString(), // Hace 2 horas
    paradas: [ // Reordenado y con tiempos ajustados para 10 pacientes
      { servicioId: mockProgrammedTransportRequests.find(r=>r.loteId === "lote-demo-123" && r.patientId === "pac-007")!.id, paciente: mockPacientes["pac-007"], horaConsultaMedica: "09:30", horaRecogidaEstimada: "08:30", horaLlegadaDestinoEstimada: "09:15", tiempoTrasladoDesdeAnteriorMin: 45, orden: 1, estado: 'pendiente', notasParada: "Primera recogida, destino HSP." },
      { servicioId: mockProgrammedTransportRequests.find(r=>r.loteId === "lote-demo-123" && r.patientId === "pac-010")!.id, paciente: mockPacientes["pac-010"], horaConsultaMedica: "10:00", horaRecogidaEstimada: "09:20", horaLlegadaDestinoEstimada: "09:50", tiempoTrasladoDesdeAnteriorMin: 20, orden: 2, estado: 'pendiente', notasParada: "Destino CARPA." },
      { servicioId: mockProgrammedTransportRequests.find(r=>r.loteId === "lote-demo-123" && r.patientId === "pac-005")!.id, paciente: mockPacientes["pac-005"], horaConsultaMedica: "10:30", horaRecogidaEstimada: "09:55", horaLlegadaDestinoEstimada: "10:20", tiempoTrasladoDesdeAnteriorMin: 25, orden: 3, estado: 'pendiente', notasParada: "Destino HSP. Alérgica a AINES." },
      { servicioId: mockProgrammedTransportRequests.find(r=>r.loteId === "lote-demo-123" && r.patientId === "pac-001")!.id, paciente: mockPacientes["pac-001"], horaConsultaMedica: "11:00", horaRecogidaEstimada: "10:25", horaLlegadaDestinoEstimada: "10:50", tiempoTrasladoDesdeAnteriorMin: 20, orden: 4, estado: 'pendiente', notasParada: "Asegurar medicación. Destino HSP." },
      { servicioId: mockProgrammedTransportRequests.find(r=>r.loteId === "lote-demo-123" && r.patientId === "pac-008")!.id, paciente: mockPacientes["pac-008"], horaConsultaMedica: "11:30", horaRecogidaEstimada: "10:55", horaLlegadaDestinoEstimada: "11:20", tiempoTrasladoDesdeAnteriorMin: 25, orden: 5, estado: 'pendiente', notasParada: "Silla de ruedas. Rampa lateral. Destino CARPA." },
      { servicioId: mockProgrammedTransportRequests.find(r=>r.loteId === "lote-demo-123" && r.patientId === "pac-002")!.id, paciente: mockPacientes["pac-002"], horaConsultaMedica: "12:00", horaRecogidaEstimada: "11:25", horaLlegadaDestinoEstimada: "11:50", tiempoTrasladoDesdeAnteriorMin: 20, orden: 6, estado: 'pendiente', notasParada: "Desde Calahorra. Destino HSP." },
      { servicioId: mockProgrammedTransportRequests.find(r=>r.loteId === "lote-demo-123" && r.patientId === "pac-004")!.id, paciente: mockPacientes["pac-004"], horaConsultaMedica: "13:00", horaRecogidaEstimada: "12:20", horaLlegadaDestinoEstimada: "12:50", tiempoTrasladoDesdeAnteriorMin: 30, orden: 7, estado: 'pendiente', notasParada: "Destino HSP." },
      { servicioId: mockProgrammedTransportRequests.find(r=>r.loteId === "lote-demo-123" && r.patientId === "pac-003")!.id, paciente: mockPacientes["pac-003"], horaConsultaMedica: "14:00", horaRecogidaEstimada: "13:10", horaLlegadaDestinoEstimada: "13:50", tiempoTrasladoDesdeAnteriorMin: 30, orden: 8, estado: 'pendiente', notasParada: "Desde Haro. Camilla. Destino CARPA." },
      { servicioId: mockProgrammedTransportRequests.find(r=>r.loteId === "lote-demo-123" && r.patientId === "pac-006")!.id, paciente: mockPacientes["pac-006"], horaConsultaMedica: "15:00", horaRecogidaEstimada: "14:15", horaLlegadaDestinoEstimada: "14:50", tiempoTrasladoDesdeAnteriorMin: 35, orden: 9, estado: 'pendiente', notasParada: "Post-operatorio. Camilla. Destino CARPA." },
      { servicioId: mockProgrammedTransportRequests.find(r=>r.loteId === "lote-demo-123" && r.patientId === "pac-009")!.id, paciente: mockPacientes["pac-009"], horaConsultaMedica: "16:00", horaRecogidaEstimada: "15:05", horaLlegadaDestinoEstimada: "15:50", tiempoTrasladoDesdeAnteriorMin: 35, orden: 10, estado: 'pendiente', notasParada: "Desde Alberite. Camilla. Requiere 2 técnicos. Destino HSP." },
    ]
  }
];

const mockLotes: LoteProgramado[] = [
  {
    id: "lote-demo-123",
    fechaServicio: new Date().toISOString().split('T')[0], // Today
    destinoPrincipal: mockDestinos["dest-hsp"], // Sigue siendo HSP como principal, aunque hay varios destinos
    serviciosIds: mockProgrammedTransportRequests.filter(r => r.loteId === "lote-demo-123").map(r => r.id),
    estadoLote: 'asignado',
    equipoMovilUserIdAsignado: 'user-vehiculo-AMB101', // Matches the mock Equipo Móvil user
    ambulanciaIdAsignada: mockAmbulances.find(a => a.name.includes("Águila Sanitaria"))?.id || "amb-1001", 
    rutaCalculadaId: "ruta-lote-demo-123",
    createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    updatedAt: new Date().toISOString(),
    notasLote: "Ruta optimizada para múltiples consultas en Hospital San Pedro y CARPA a lo largo del día."
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
            const now = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            if (newStatus === 'enRutaRecogida') ruta.paradas[paradaIndex].horaRealLlegadaRecogida = undefined;
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

    
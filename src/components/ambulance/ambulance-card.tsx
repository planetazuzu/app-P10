
'use client';

import type { Ambulance, AmbulanceType, AmbulanceStatus, ParadaRuta, LoteProgramado, RutaCalculada } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons'; 
import {
    Users, Package, MapPin, Layers, ShieldAlert, Thermometer, CheckCircle, Tool, Info,
    Clock as StopClock, PlayCircle, User as StopUser, MapPin as StopMapPin, ArrowRight,
    AlertTriangle as StopAlert, UserMinus, Loader2
} from 'lucide-react';
import Image from 'next/image';
import { equipmentOptions } from './constants';
import { getAssignmentsForAmbulance, type AmbulanceAssignmentDetails } from '@/lib/request-data';
import { getLotesMock, getRutaCalculadaByLoteIdMock } from '@/lib/driver-data';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface AmbulanceCardProps {
  ambulance: Ambulance | null;
  onClose: () => void;
}

const getAmbulanceTypeLabel = (type: AmbulanceType): string => {
  switch (type) {
    case "SVB": return "Soporte Vital Básico";
    case "SVA": return "Soporte Vital Avanzado";
    case "Convencional": return "Transporte convencional";
    case "UVI_Movil": return "UVI Móvil";
    case "A1": return "Transporte programado individual";
    case "Programado": return "Transporte programado colectivo";
    case "Otros": return "Otro tipo";
    default: return type;
  }
}

const getAmbulanceStatusLabel = (status: AmbulanceStatus): string => {
    switch (status) {
      case "available": return "Disponible";
      case "busy": return "Ocupada / En Misión";
      case "maintenance": return "En Mantenimiento";
      case "unavailable": return "No Disponible";
      default: return status;
    }
};

// Updated status badge classes according to new visual guidelines
const getStatusBadgeVariant = (status: AmbulanceStatus) => {
    switch (status) {
        case 'available': return 'bg-green-100 text-green-700 border-green-300'; // Verde claro (como "En destino")
        case 'busy': return 'bg-blue-100 text-blue-700 border-blue-300'; // Azul (como "En ruta")
        case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-300'; // Amarillo alerta
        case 'unavailable': return 'bg-red-100 text-red-800 border-red-300'; // Rojo suave
        default: return 'bg-gray-300 text-gray-800 border-gray-400'; // Gris (como "Pendiente")
    }
}

const DetailItem = ({ icon: IconComponent, label, value, highlight = false }: { icon: React.ElementType, label: string, value: string | number | React.ReactNode, highlight?: boolean }) => (
  <div className="flex items-start text-sm py-1">
    <IconComponent className={`h-4 w-4 mr-2 mt-0.5 ${highlight ? 'text-primary' : 'text-muted-foreground'}`} />
    <span className={`font-medium ${highlight ? 'text-secondary' : 'text-muted-foreground'}`}>{label}:</span>
    <span className={`ml-1 ${highlight ? 'font-semibold text-foreground' : 'text-foreground'}`}>{value}</span>
  </div>
);

const BooleanDetailItem = ({ icon: IconComponent, label, value }: { icon: React.ElementType, label: string, value: boolean }) => (
    <div className="flex items-center text-sm py-0.5">
      {value ? <CheckCircle className="h-4 w-4 mr-2 text-green-600" /> : <Icons.UserX className="h-4 w-4 mr-2 text-red-600" />}
      <span className="text-muted-foreground">{label}:</span>
      <span className="ml-1 font-semibold">{value ? 'Sí' : 'No'}</span>
    </div>
  );

const translateParadaStatusCard = (status: ParadaRuta['estado']): string => {
  switch (status) {
    case 'pendiente': return 'Pendiente';
    case 'enRutaRecogida': return 'En ruta (Recogida)';
    case 'pacienteRecogido': return 'Paciente Recogido';
    case 'enDestino': return 'En Destino';
    case 'finalizado': return 'Finalizado';
    case 'cancelado': return 'Cancelado';
    case 'noPresentado': return 'No Presentado';
    default: return status;
  }
};
const paradaStatusIcons: Record<ParadaRuta['estado'], React.ElementType> = {
  pendiente: StopClock,
  enRutaRecogida: PlayCircle,
  pacienteRecogido: StopUser,
  enDestino: StopMapPin,
  finalizado: CheckCircle,
  cancelado: Icons.UserX,
  noPresentado: UserMinus,
};

// Updated badge classes for ParadaRuta statuses
const paradaStatusBadgeClasses: Record<ParadaRuta['estado'], string> = {
  pendiente: 'bg-gray-300 text-gray-800',
  enRutaRecogida: 'bg-blue-100 text-blue-700',
  pacienteRecogido: 'bg-yellow-100 text-yellow-800',
  enDestino: 'bg-green-100 text-green-700',
  finalizado: 'bg-green-700 text-white',
  cancelado: 'bg-red-100 text-red-800',
  noPresentado: 'bg-red-100 text-red-800', // Using same as cancelled for this example
};


const NavigateButton = ({ address }: { address: string | undefined }) => {
  if (!address) return null;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  return (
    <Link href={mapsUrl} target="_blank" rel="noopener noreferrer" passHref>
      <Button variant="ghost" size="icon" className="h-6 w-6 text-primary hover:bg-primary/10" title={`Navegar a ${address}`}>
        <Icons.MapPinned className="h-4 w-4" />
      </Button>
    </Link>
  );
};


export function AmbulanceCard({ ambulance, onClose }: AmbulanceCardProps) {
  const [assignments, setAssignments] = useState<AmbulanceAssignmentDetails[]>([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);

  useEffect(() => {
    if (ambulance && ambulance.id) {
      setIsLoadingAssignments(true);
      Promise.all([getLotesMock(), Promise.all(mockLotes.map(l => getRutaCalculadaByLoteIdMock(l.id, l.rutaCalculadaId)))])
        .then(([allLotes, allRutas]) => {
          const validRutas = allRutas.filter(r => r !== null) as RutaCalculada[];
          return getAssignmentsForAmbulance(ambulance.id, allLotes, validRutas);
        })
        .then(data => {
          setAssignments(data);
        })
        .catch(error => {
          console.error("Error fetching assignments for ambulance:", error);
          setAssignments([]);
        })
        .finally(() => {
          setIsLoadingAssignments(false);
        });
    } else {
      setAssignments([]);
    }
  }, [ambulance]);

  if (!ambulance) {
    return null;
  }

  const specialEquipmentLabels = ambulance.specialEquipment
    .map(id => equipmentOptions.find(opt => opt.id === id)?.label)
    .filter(Boolean)
    .join(', ');

  return (
    <Card className="shadow-lg max-h-[calc(100vh-10rem)] overflow-y-auto rioja-card">
      <CardHeader className="relative bg-muted/30">
        <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={onClose}>
          <Icons.UserX className="h-4 w-4" />
          <span className="sr-only">Cerrar</span>
        </Button>
        <CardTitle className="text-xl text-secondary">{ambulance.name}</CardTitle>
        <CardDescription>ID: {ambulance.id} - Matrícula: {ambulance.licensePlate}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="w-full h-32 md:h-40 bg-muted rounded-lg overflow-hidden relative mb-3">
            <Image
                src={`https://placehold.co/600x400.png?text=${ambulance.model}`}
                alt={`${ambulance.model} - ${getAmbulanceTypeLabel(ambulance.type)}`}
                layout="fill"
                objectFit="cover"
                data-ai-hint="ambulance vehicle"
             />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
            <DetailItem icon={Info} label="Modelo" value={ambulance.model} highlight />
            <DetailItem icon={Layers} label="Tipo" value={getAmbulanceTypeLabel(ambulance.type)} highlight />
            <div className="col-span-1 sm:col-span-2">
                <p className="font-medium text-muted-foreground flex items-center text-sm mt-1">
                    <ShieldAlert className="h-4 w-4 mr-2 text-primary" />Estado:
                    <Badge
                    className={`ml-2 text-xs ${getStatusBadgeVariant(ambulance.status)} border`}
                    >
                    {getAmbulanceStatusLabel(ambulance.status)}
                    </Badge>
                </p>
            </div>
        </div>

        <div className="border-t my-3"></div>

        <h4 className="font-semibold text-md text-secondary mb-1">Ubicación y Operativa</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
            <DetailItem icon={MapPin} label="Base" value={ambulance.baseLocation} />
            {ambulance.zone && <DetailItem icon={MapPin} label="Zona" value={ambulance.zone} />}
            {(ambulance.latitude && ambulance.longitude) && (
                <DetailItem icon={Thermometer} label="Coord." value={`${ambulance.latitude.toFixed(4)}, ${ambulance.longitude.toFixed(4)}`} />
            )}
            {ambulance.currentPatients !== undefined && <DetailItem icon={Users} label="Pacientes Actuales" value={ambulance.currentPatients} />}
        </div>

        <div className="border-t my-3"></div>
        
        <h4 className="font-semibold text-md text-secondary mb-1">Capacidad y Dotación</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5">
            <BooleanDetailItem icon={CheckCircle} label="Camilla" value={ambulance.hasMedicalBed} />
            <DetailItem icon={Users} label="Plazas Camilla" value={ambulance.stretcherSeats} />
            <BooleanDetailItem icon={CheckCircle} label="Silla Ruedas" value={ambulance.hasWheelchair} />
            <DetailItem icon={Users} label="Plazas Silla R." value={ambulance.wheelchairSeats} />
            <BooleanDetailItem icon={CheckCircle} label="Sentados/Andando" value={ambulance.allowsWalking} />
            <DetailItem icon={Users} label="Plazas Sentados" value={ambulance.walkingSeats} />
        </div>

        {ambulance.specialEquipment && ambulance.specialEquipment.length > 0 && (
            <>
                <div className="border-t my-3"></div>
                <h4 className="font-semibold text-md text-secondary mb-1">Equipamiento Especial</h4>
                <DetailItem icon={Package} label="Dotación" value={specialEquipmentLabels || 'Ninguno especificado'} />
            </>
        )}

        {ambulance.notes && (
             <>
                <div className="border-t my-3"></div>
                <h4 className="font-semibold text-md text-secondary mb-1">Notas Internas</h4>
                <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-lg">{ambulance.notes}</p>
            </>
        )}
        
        <Button className="w-full mt-4 btn-primary" disabled={ambulance.status !== 'available'}>
          {ambulance.status === 'available' ? 'Despachar esta unidad (simulado)' : `Unidad ${getAmbulanceStatusLabel(ambulance.status).toLowerCase()}`}
        </Button>

        <div className="border-t my-3 pt-3">
          <h4 className="font-semibold text-md text-secondary mb-2">Servicios Asignados Actualmente</h4>
          {isLoadingAssignments ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span>Cargando asignaciones...</span>
            </div>
          ) : assignments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-3">Esta ambulancia no tiene servicios activos asignados.</p>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {assignments.map((assignment, index) => (
                <AccordionItem value={`assignment-${index}`} key={`${assignment.type}-${assignment.id}`}>
                  <AccordionTrigger className="text-sm hover:no-underline">
                    <div className="flex flex-col text-left w-full">
                      <span className="font-medium truncate">
                        {assignment.type === 'direct_request' ? 'Solicitud Urgente' :
                         assignment.type === 'programmed_request' ? `Solicitud Programada` :
                         'Lote de Servicios'}
                        : {assignment.id.substring(0,12)}...
                      </span>
                      <span className="text-xs text-muted-foreground truncate">{assignment.description}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-2 py-1 text-xs">
                    <div className="flex justify-between items-center">
                        <p><strong>Estado General:</strong> {assignment.status}</p>
                        {assignment.type !== 'batch' && assignment.destination && <NavigateButton address={assignment.destination} />}
                    </div>
                    {assignment.patientName && <p><strong>Paciente:</strong> {assignment.patientName}</p>}
                    {assignment.destination && assignment.type !== 'batch' && <p><strong>Destino:</strong> {assignment.destination}</p>}
                    {assignment.pickupTime && <p><strong>Hora Recogida:</strong> {assignment.pickupTime}</p>}

                    {assignment.type === 'batch' && assignment.services && assignment.services.length > 0 && (
                      <div className="mt-2">
                        <h5 className="text-xs font-semibold mb-1 text-muted-foreground">Traslados del Lote ({assignment.services.length}):</h5>
                        <ScrollArea className="h-[150px] pr-3">
                          <ul className="space-y-1.5">
                            {assignment.services.map(service => {
                              const Icon = paradaStatusIcons[service.stopStatus] || StopAlert;
                              return (
                                <li key={service.serviceId} className="p-1.5 border-l-2 pl-2 text-[11px] leading-tight border-primary/30 bg-muted/30 rounded-r-lg">
                                  <div className="flex items-center justify-between">
                                      <span className="font-medium text-secondary-foreground truncate pr-1">
                                        ID Traslado: {service.serviceId.substring(0,8)}... ({service.patientName})
                                      </span>
                                      <Badge className={`${paradaStatusBadgeClasses[service.stopStatus]} text-xs font-semibold border`}>
                                          <Icon className={`h-2.5 w-2.5 mr-1`} />
                                          {translateParadaStatusCard(service.stopStatus)}
                                      </Badge>
                                  </div>
                                  <div className="text-muted-foreground flex items-center gap-1 truncate mt-0.5">
                                      <StopMapPin className="h-3 w-3 shrink-0"/> 
                                      <span className="truncate flex-grow">Origen: {service.pickupAddress}</span>
                                      <NavigateButton address={service.pickupAddress} />
                                  </div>
                                  <div className="text-muted-foreground flex items-center gap-1 truncate">
                                      <ArrowRight className="h-3 w-3 shrink-0 ml-0.5"/> 
                                      <span className="truncate flex-grow">Destino: {service.destinationAddress}</span>
                                      <NavigateButton address={service.destinationAddress} />
                                  </div>
                                  <div className="text-muted-foreground flex items-center gap-1">
                                     <StopClock className="h-2.5 w-2.5 shrink-0"/> 
                                     Recogida: {service.pickupTime} {service.appointmentTime && `| Cita: ${service.appointmentTime}`}
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </ScrollArea>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
